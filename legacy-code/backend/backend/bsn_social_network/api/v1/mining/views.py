from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from bsn_social_network.models import MiningProgress, Wallet, TokenTransaction, Post, Comment, Like
from bsn_social_network.api.serializers import MiningProgressSerializer
from django.utils import timezone
from django.db.models import Sum, Count
from django.db import transaction
import math
import uuid

class MiningProgressView(APIView):
    """
    Get user mining progress
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        progress, created = MiningProgress.objects.get_or_create(user=request.user)
        
        # Update accumulated tokens based on time since last claim
        self._update_accumulated_tokens(progress)
        
        serializer = MiningProgressSerializer(progress)
        return Response(serializer.data)
    
    def _update_accumulated_tokens(self, progress):
        """
        Calculate tokens accumulated since the last claim based on mining power
        """
        now = timezone.now()
        time_diff = now - progress.last_claim_time
        hours_passed = time_diff.total_seconds() / 3600
        
        # Base rate: 1 token per hour per mining power
        new_tokens = hours_passed * progress.mining_power
        
        # Add to accumulated tokens
        progress.accumulated_tokens += new_tokens
        progress.last_claim_time = now
        progress.save()

class ClaimRewardView(APIView):
    """
    Claim mining rewards
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            with transaction.atomic():
                # Get user's mining progress and wallet
                progress = MiningProgress.objects.get(user=request.user)
                wallet, created = Wallet.objects.get_or_create(user=request.user)
                
                # Update accumulated tokens first
                mining_view = MiningProgressView()
                mining_view._update_accumulated_tokens(progress)
                
                # Check if there are tokens to claim
                if progress.accumulated_tokens < 1:
                    return Response(
                        {"message": "Not enough accumulated tokens to claim. Continue mining!"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Calculate tokens to claim (floor to whole tokens)
                tokens_to_claim = math.floor(progress.accumulated_tokens)
                
                # Update user's wallet
                wallet.balance += tokens_to_claim
                wallet.save()
                
                # Create a transaction record
                TokenTransaction.objects.create(
                    transaction_hash=str(uuid.uuid4()).replace('-', ''),
                    to_wallet=wallet,
                    amount=tokens_to_claim,
                    transaction_type='mining_reward',
                    status='completed',
                    metadata={
                        'mining_power': float(progress.mining_power),
                        'claim_time': timezone.now().isoformat()
                    },
                    completed_at=timezone.now()
                )
                
                # Update mining progress
                progress.accumulated_tokens -= tokens_to_claim
                progress.total_mined += tokens_to_claim
                progress.save()
                
                return Response({
                    "message": f"Successfully claimed {tokens_to_claim} tokens!",
                    "tokens_claimed": tokens_to_claim,
                    "total_mined": progress.total_mined,
                    "remaining_accumulated": progress.accumulated_tokens
                })
                
        except Exception as e:
            return Response(
                {"message": f"Error claiming tokens: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MiningStatsView(APIView):
    """
    Get mining statistics and leaderboard
    """
    def get(self, request):
        # Get total mined tokens across all users
        total_mined = MiningProgress.objects.aggregate(total=Sum('total_mined'))['total'] or 0
        
        # Get top miners
        top_miners = MiningProgress.objects.order_by('-total_mined')[:10].select_related('user')
        
        # Get user rank if authenticated
        user_rank = None
        user_percentile = None
        
        if request.user.is_authenticated:
            user_progress = MiningProgress.objects.get(user=request.user)
            better_miners = MiningProgress.objects.filter(total_mined__gt=user_progress.total_mined).count()
            total_miners = MiningProgress.objects.count()
            
            user_rank = better_miners + 1
            if total_miners > 0:
                user_percentile = round((1 - (user_rank / total_miners)) * 100, 2)
        
        return Response({
            "total_mined_tokens": total_mined,
            "top_miners": [
                {
                    "username": miner.user.username,
                    "total_mined": miner.total_mined,
                    "mining_power": miner.mining_power
                }
                for miner in top_miners
            ],
            "user_rank": user_rank,
            "user_percentile": user_percentile
        })

class UpdateMiningPowerView(APIView):
    """
    Update user mining power based on social activity
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Get user's mining progress
            progress, created = MiningProgress.objects.get_or_create(user=request.user)
            
            # Calculate base mining power (1.0)
            base_power = 1.0
            
            # Calculate activity multipliers
            now = timezone.now()
            thirty_days_ago = now - timezone.timedelta(days=30)
            
            # Count recent user activities
            post_count = Post.objects.filter(
                author=request.user, 
                created_at__gte=thirty_days_ago
            ).count()
            
            comment_count = Comment.objects.filter(
                author=request.user, 
                created_at__gte=thirty_days_ago
            ).count()
            
            like_count = Like.objects.filter(
                user=request.user, 
                created_at__gte=thirty_days_ago
            ).count()
            
            # Received likes (engagement)
            received_likes = Like.objects.filter(
                post__author=request.user,
                created_at__gte=thirty_days_ago
            ).count()
            
            # Calculate mining power based on activity
            # Formula can be adjusted based on desired weights
            post_power = min(post_count * 0.5, 10)  # Cap at 10
            comment_power = min(comment_count * 0.2, 5)  # Cap at 5
            like_power = min(like_count * 0.1, 3)  # Cap at 3
            engagement_power = min(received_likes * 0.3, 7)  # Cap at 7
            
            # Calculate streak bonus (if any)
            streak_bonus = min(progress.streak_days * 0.1, 5)  # Cap at 5
            
            # Calculate total mining power
            new_mining_power = base_power + post_power + comment_power + like_power + engagement_power + streak_bonus
            
            # Update mining power
            progress.mining_power = new_mining_power
            progress.save()
            
            return Response({
                "message": "Mining power updated successfully",
                "mining_power": new_mining_power,
                "breakdown": {
                    "base_power": base_power,
                    "post_power": post_power,
                    "comment_power": comment_power,
                    "like_power": like_power,
                    "engagement_power": engagement_power,
                    "streak_bonus": streak_bonus
                }
            })
            
        except Exception as e:
            return Response(
                {"message": f"Error updating mining power: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 