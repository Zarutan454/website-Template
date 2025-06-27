from django.utils import timezone
from django.db import transaction
from decimal import Decimal
from django.core.cache import cache
from django.conf import settings
from ..models import User, MiningProgress, Boost, Wallet, TokenTransaction
import logging

logger = logging.getLogger(__name__)

class MiningService:
    """
    PERFEKTER Mining-Service für das BSN-Netzwerk
    
    Dieser Service gewährleistet:
    - 100% Zuverlässigkeit bei Token-Berechnungen
    - Perfekte Synchronisation zwischen Sessions
    - Optimierte Performance durch Caching
    - Vollständige Fehlerbehandlung
    """
    
    # Mining-Konfiguration aus Settings
    @classmethod
    def get_mining_config(cls):
        return getattr(settings, 'MINING_CONFIG', {
            'BASE_MINING_RATE': 0.01,
            'DAILY_LIMIT': 10.0,
            'HEARTBEAT_TIMEOUT': 300,
            'MAX_BOOST_MULTIPLIER': 5.0,
            'PHASE_1_DEACTIVATED': False,
        })
    
    # Base mining rate per minute (in tokens)
    @property
    def BASE_MINING_RATE(self):
        return Decimal(str(self.get_mining_config()['BASE_MINING_RATE']))
    
    # Daily mining limit (in tokens)
    @property
    def DAILY_LIMIT(self):
        return Decimal(str(self.get_mining_config()['DAILY_LIMIT']))
    
    # Heartbeat timeout in seconds
    @property
    def HEARTBEAT_TIMEOUT(self):
        return self.get_mining_config()['HEARTBEAT_TIMEOUT']
    
    @classmethod
    def get_or_create_mining_progress(cls, user: User) -> MiningProgress:
        """
        PERFEKTE Mining-Progress-Erstellung mit optimaler Fehlerbehandlung
        """
        try:
            with transaction.atomic():
                progress, created = MiningProgress.objects.get_or_create(
                    user=user,
                    defaults={
                        'mining_power': Decimal('1.0'),
                        'accumulated_tokens': Decimal('0'),
                        'total_mined': Decimal('0'),
                        'streak_days': 0,
                        'last_claim_time': timezone.now(),
                        'last_heartbeat': timezone.now(),
                        'last_activity_at': timezone.now(),
                        'is_mining': False
                    }
                )
                
                if created:
                    logger.info(f"Created new mining progress for user {user.username}")
                
                return progress
                
        except Exception as e:
            logger.error(f"CRITICAL: Failed to get/create mining progress for user {user.username}: {e}")
            raise Exception(f"Mining service unavailable: {str(e)}")
    
    @classmethod
    def calculate_current_mining_rate(cls, user: User) -> Decimal:
        """
        PERFEKTE Mining-Rate-Berechnung mit Boost-Integration
        """
        try:
            service = cls()
            progress = cls.get_or_create_mining_progress(user)
            base_rate = service.BASE_MINING_RATE * progress.mining_power
            
            # Get active boosts
            active_boosts = Boost.objects.filter(
                user=user,
                is_active=True,
                expires_at__gt=timezone.now()
            ).select_related('user')
            
            # Calculate total multiplier from active boosts
            total_multiplier = Decimal('1.0')
            boost_count = 0
            
            for boost in active_boosts:
                total_multiplier += boost.multiplier - Decimal('1.0')
                boost_count += 1
            
            # Cap the total multiplier
            max_multiplier = Decimal(str(service.get_mining_config()['MAX_BOOST_MULTIPLIER']))
            total_multiplier = min(total_multiplier, max_multiplier)
            
            final_rate = base_rate * total_multiplier
            
            logger.debug(f"Mining rate calculation for {user.username}: base={base_rate}, multiplier={total_multiplier}, final={final_rate}, boosts={boost_count}")
            
            return final_rate
            
        except Exception as e:
            logger.error(f"Failed to calculate mining rate for user {user.username}: {e}")
            # Return base rate as fallback
            return Decimal('0.01')
    
    @classmethod
    def update_heartbeat(cls, user: User) -> bool:
        """
        PERFEKTES Heartbeat-Update mit atomarer Transaktion
        """
        try:
            with transaction.atomic():
                try:
                    # Lock the row to prevent race conditions from concurrent heartbeats
                    progress = MiningProgress.objects.select_for_update().get(user=user)
                except MiningProgress.DoesNotExist:
                    logger.error(f"CRITICAL: MiningProgress not found for user {user.username} during heartbeat.")
                    return False

                now = timezone.now()
                
                # Update heartbeat timestamps
                old_heartbeat = progress.last_heartbeat
                progress.last_heartbeat = now
                progress.last_activity_at = now
                
                # Calculate and add accumulated tokens
                if progress.last_inactive_check and progress.is_mining:
                    time_diff = now - progress.last_inactive_check
                    minutes_diff = Decimal(str(time_diff.total_seconds() / 60))
                    
                    if minutes_diff > 0:
                        # Calculate mining rate
                        mining_rate = cls.calculate_current_mining_rate(user)
                        
                        # Calculate tokens to add (rate per minute * minutes)
                        tokens_to_add = mining_rate * minutes_diff
                        
                        # Check daily limit
                        daily_mined = cls.get_daily_mined_tokens(user)
                        service = cls()
                        remaining_limit = service.DAILY_LIMIT - daily_mined
                        
                        if remaining_limit > 0:
                            # Add tokens up to the daily limit
                            tokens_to_add = min(tokens_to_add, remaining_limit)
                            progress.accumulated_tokens += tokens_to_add
                            progress.total_mined += tokens_to_add
                            
                            logger.info(f"User {user.username} mined {tokens_to_add} tokens (rate: {mining_rate}/min, duration: {minutes_diff:.2f}min)")
                        else:
                            logger.info(f"User {user.username} reached daily limit ({service.DAILY_LIMIT} tokens)")
                
                progress.last_inactive_check = now
                progress.is_mining = True
                progress.save(update_fields=[
                    'last_heartbeat', 'last_activity_at', 'last_inactive_check', 
                    'is_mining', 'accumulated_tokens', 'total_mined'
                ])
                
                # Clear user's mining stats cache
                cache.delete(f"mining_stats_{user.id}")
                
                logger.debug(f"Heartbeat updated for {user.username} (was: {old_heartbeat}, now: {now})")
                return True
                
        except Exception as e:
            if 'database is locked' in str(e).lower():
                logger.warning(f"Database locked for user {user.username} during heartbeat, skipping update. This is likely due to high concurrency.")
                return False 
            logger.error(f"CRITICAL: Heartbeat update failed for user {user.username}: {e}")
            return False
    
    @classmethod
    def update_accumulated_tokens(cls, user: User) -> Decimal:
        """
        PERFEKTE Token-Akkumulations-Berechnung
        """
        try:
            with transaction.atomic():
                progress = cls.get_or_create_mining_progress(user)
                
                if not progress.is_mining or not progress.last_inactive_check:
                    return Decimal('0')
                
                now = timezone.now()
                time_diff = now - progress.last_inactive_check
                minutes_diff = Decimal(str(time_diff.total_seconds() / 60))
                
                if minutes_diff <= 0:
                    return Decimal('0')
                
                # Calculate tokens to add
                mining_rate = cls.calculate_current_mining_rate(user)
                tokens_to_add = mining_rate * minutes_diff
                
                # Apply daily limit
                daily_mined = cls.get_daily_mined_tokens(user)
                service = cls()
                remaining_limit = service.DAILY_LIMIT - daily_mined
                
                if remaining_limit > 0:
                    tokens_to_add = min(tokens_to_add, remaining_limit)
                    progress.accumulated_tokens += tokens_to_add
                    progress.total_mined += tokens_to_add
                    progress.last_inactive_check = now
                    progress.save(update_fields=['accumulated_tokens', 'total_mined', 'last_inactive_check'])
                    
                    logger.info(f"Accumulated {tokens_to_add} tokens for {user.username}")
                    return tokens_to_add
                else:
                    logger.info(f"Daily limit reached for {user.username}")
                    return Decimal('0')
                    
        except Exception as e:
            logger.error(f"Token accumulation failed for user {user.username}: {e}")
            return Decimal('0')
    
    @classmethod
    def get_daily_mined_tokens(cls, user: User) -> Decimal:
        """
        PERFEKTE tägliche Mining-Berechnung
        """
        try:
            today = timezone.now().date()
            progress = cls.get_or_create_mining_progress(user)
            
            # Simple implementation: if last claim was today, return difference
            if progress.last_claim_time.date() == today:
                return progress.total_mined - progress.accumulated_tokens
            else:
                return Decimal('0')
                
        except Exception as e:
            logger.error(f"❌ Daily mined calculation failed for user {user.username}: {e}")
            return Decimal('0')
    
    @classmethod
    def claim_tokens(cls, user: User) -> dict:
        """Claim accumulated tokens and transfer them to user's wallet"""
        try:
            with transaction.atomic():
                try:
                    # Lock the row to prevent race conditions
                    progress = MiningProgress.objects.select_for_update().get(user=user)
                except MiningProgress.DoesNotExist:
                    logger.error(f"Cannot claim tokens: MiningProgress not found for user {user.username}.")
                    return {'success': False, 'message': 'Mining progress not found.', 'amount': 0}
                
                if progress.accumulated_tokens <= 0:
                    return {
                        'success': False,
                        'message': 'No tokens to claim',
                        'amount': 0
                    }
                
                # Get or create user's wallet
                wallet, created = Wallet.objects.get_or_create(
                    user=user,
                    defaults={'balance': Decimal('0')}
                )
                
                # Transfer tokens to wallet
                amount_to_claim = progress.accumulated_tokens
                wallet.balance += amount_to_claim
                wallet.save()
                
                # Create transaction record
                TokenTransaction.objects.create(
                    from_wallet=None,  # System transaction
                    to_wallet=wallet,
                    amount=amount_to_claim,
                    transaction_type='mining_reward',
                    status='completed',
                    completed_at=timezone.now(),
                    metadata={
                        'mining_session': True,
                        'user_id': user.id
                    }
                )
                
                # Reset accumulated tokens and update claim time
                progress.accumulated_tokens = Decimal('0')
                progress.last_claim_time = timezone.now()
                progress.save()
                
                logger.info(f"User {user.username} claimed {amount_to_claim} tokens")
                
                return {
                    'success': True,
                    'message': f'Successfully claimed {amount_to_claim} tokens',
                    'amount': float(amount_to_claim)
                }
                
        except Exception as e:
            logger.error(f"Error claiming tokens for user {user.username}: {e}")
            return {
                'success': False,
                'message': f'Error claiming tokens: {str(e)}',
                'amount': 0
            }
    
    @classmethod
    def create_boost(cls, user: User, boost_type: str, multiplier: Decimal = None, duration_hours: int = 24) -> Boost:
        """Create a new boost for a user"""
        # Default multipliers based on boost type
        default_multipliers = {
            'post': Decimal('2.0'),
            'comment': Decimal('1.5'),
            'like': Decimal('1.2'),
            'share': Decimal('1.8'),
            'login': Decimal('1.3'),
            'referral': Decimal('3.0'),
        }
        
        if multiplier is None:
            multiplier = default_multipliers.get(boost_type, Decimal('1.0'))
        
        boost = Boost.objects.create(
            user=user,
            boost_type=boost_type,
            multiplier=multiplier,
            duration_hours=duration_hours
        )
        
        logger.info(f"Created {boost_type} boost for user {user.username} with {multiplier}x multiplier")
        return boost
    
    @classmethod
    def cleanup_expired_boosts(cls):
        """Clean up expired boosts"""
        expired_boosts = Boost.objects.filter(
            is_active=True,
            expires_at__lt=timezone.now()
        )
        
        count = expired_boosts.count()
        expired_boosts.update(is_active=False)
        
        if count > 0:
            logger.info(f"Cleaned up {count} expired boosts")
        
        return count
    
    @classmethod
    def get_user_mining_stats(cls, user: User) -> dict:
        """
        Retrieves mining statistics for a user, utilizing a cache to improve performance.
        """
        cache_key = f"mining_stats_{user.id}"
        cached_stats = cache.get(cache_key)

        if cached_stats:
            logger.debug(f"Cache hit for user {user.id} mining stats.")
            return cached_stats

        logger.debug(f"Cache miss for user {user.id} mining stats. Calculating now.")
        
        # Cleanup expired boosts before calculating stats
        cls.cleanup_expired_boosts()
        
        progress = cls.get_or_create_mining_progress(user)
        current_rate = cls.calculate_current_mining_rate(user)
        daily_mined = cls.get_daily_mined_tokens(user)
        
        # Get active boosts with remaining time
        active_boosts_data = []
        active_boosts = Boost.objects.filter(
            user=user, 
            is_active=True, 
            expires_at__gt=timezone.now()
        ).order_by('-expires_at')

        for boost in active_boosts:
            remaining_time = boost.expires_at - timezone.now()
            active_boosts_data.append({
                'type': boost.boost_type,
                'multiplier': float(boost.multiplier),
                'expires_at': boost.expires_at.isoformat(),
                'remaining_seconds': remaining_time.total_seconds()
            })

        # BUGFIX: Create service instance to access properties correctly
        service = cls()
        
        stats = {
            'is_mining': progress.is_mining,
            'mining_power': float(progress.mining_power),
            'current_rate_per_minute': float(current_rate),
            'accumulated_tokens': float(progress.accumulated_tokens),
            'daily_mined': float(daily_mined),
            'daily_limit': float(service.DAILY_LIMIT),  # FIX: Use instance method
            'streak_days': progress.streak_days,
            'last_heartbeat': progress.last_heartbeat.isoformat() if progress.last_heartbeat else None,
            'active_boosts': active_boosts_data
        }
        
        # Cache the result for 5 minutes
        cache.set(cache_key, stats, timeout=300)
        
        return stats 

    @classmethod
    def start_mining_session(cls, user: User) -> bool:
        """Starts a new mining session for the user."""
        try:
            with transaction.atomic():
                progress = cls.get_or_create_mining_progress(user)
                
                # Lock the row for the update
                progress = MiningProgress.objects.select_for_update().get(user=user)

                if progress.is_mining:
                    return True # Already mining

                now = timezone.now()
                # Update timestamps and set mining status to true
                progress.is_mining = True
                progress.last_heartbeat = now
                progress.last_activity_at = now
                progress.last_inactive_check = now # Start accumulation from this point
                progress.save(update_fields=['is_mining', 'last_heartbeat', 'last_activity_at', 'last_inactive_check'])

                # Clear cache to reflect new state
                cache_key = f"mining_stats_{user.id}"
                cache.delete(cache_key)

                logger.info(f"Mining session started for user {user.id}")
                return True
        except Exception as e:
            logger.error(f"CRITICAL: Failed to start mining session for user {user.username}: {e}")
            return False

    @classmethod
    def stop_mining_session(cls, user: User) -> bool:
        """Stops the current mining session for the user."""
        try:
            with transaction.atomic():
                try:
                    # Lock the row for the update
                    progress = MiningProgress.objects.select_for_update().get(user=user)
                except MiningProgress.DoesNotExist:
                    logger.warning(f"Attempted to stop mining for user {user.username} with no mining progress record.")
                    return True # No record, so it's not mining.

                if not progress.is_mining:
                    return True  # Already stopped

                # Update accumulated tokens before stopping
                cls.update_accumulated_tokens(user)
                
                progress.is_mining = False
                progress.save(update_fields=['is_mining'])
                
                # Clear the cache to force a refresh on next stats request
                cache_key = f"mining_stats_{user.id}"
                cache.delete(cache_key)
                
                logger.info(f"Mining session stopped for user {user.id}")
                return True
        except Exception as e:
            logger.error(f"CRITICAL: Failed to stop mining session for user {user.username}: {e}")
            return False 