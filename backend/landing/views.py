from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Sum, Count
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import uuid
from datetime import timedelta
import hashlib

from .models import (
    TokenReservation, FaucetRequest, ReferralProgram, ReferralCode,
    NewsletterSubscription, ContactForm, ICOStats
)
from .serializers import (
    TokenReservationSerializer, TokenReservationCreateSerializer,
    FaucetRequestSerializer, FaucetRequestCreateSerializer,
    ReferralProgramSerializer, ReferralCodeSerializer,
    NewsletterSubscriptionSerializer, NewsletterSubscriptionCreateSerializer,
    ContactFormSerializer, ContactFormCreateSerializer,
    ICOStatsSerializer, ICOOverviewSerializer
)


class TokenReservationView(APIView):
    """
    Token reservation management
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user's token reservations"""
        reservations = TokenReservation.objects.filter(user=request.user)
        serializer = TokenReservationSerializer(reservations, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Create new token reservation"""
        serializer = TokenReservationCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            reservation = serializer.save()
            
            # Process referral if provided
            referral_code = request.data.get('referral_code')
            if referral_code:
                self.process_referral(reservation, referral_code)
            
            return Response(
                TokenReservationSerializer(reservation).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def process_referral(self, reservation, referral_code):
        """Process referral code for reservation"""
        try:
            referrer_code = ReferralCode.objects.get(
                code=referral_code,
                is_active=True
            )
            
            # Calculate commission (e.g., 5% of reservation amount)
            commission_rate = 0.05
            commission_amount = reservation.amount_usd * commission_rate
            tokens_earned = commission_amount / settings.TOKEN_PRICE_USD
            
            # Create referral record
            ReferralProgram.objects.create(
                referrer=referrer_code.user,
                referred_user=reservation.user,
                referral_code=referral_code,
                commission_earned=commission_amount,
                tokens_earned=tokens_earned
            )
            
            # Update referral code statistics
            referrer_code.total_referrals += 1
            referrer_code.total_commission += commission_amount
            referrer_code.total_tokens += tokens_earned
            referrer_code.save()
            
        except ReferralCode.DoesNotExist:
            pass


class TokenReservationDetailView(APIView):
    """
    Individual token reservation management
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, reservation_id):
        """Get specific reservation"""
        try:
            reservation = TokenReservation.objects.get(
                id=reservation_id,
                user=request.user
            )
            serializer = TokenReservationSerializer(reservation)
            return Response(serializer.data)
        except TokenReservation.DoesNotExist:
            return Response(
                {'error': 'Reservation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request, reservation_id):
        """Update reservation (e.g., add transaction hash)"""
        try:
            reservation = TokenReservation.objects.get(
                id=reservation_id,
                user=request.user
            )
            
            # Only allow updating certain fields
            allowed_fields = ['transaction_hash', 'notes']
            data = {k: v for k, v in request.data.items() if k in allowed_fields}
            
            serializer = TokenReservationSerializer(
                reservation,
                data=data,
                partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except TokenReservation.DoesNotExist:
            return Response(
                {'error': 'Reservation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class FaucetRequestView(APIView):
    """
    Faucet request management
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user's faucet requests"""
        requests = FaucetRequest.objects.filter(user=request.user)
        serializer = FaucetRequestSerializer(requests, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Create new faucet request"""
        serializer = FaucetRequestCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            faucet_request = serializer.save()
            
            # Send notification email to admin
            self.send_admin_notification(faucet_request)
            
            return Response(
                FaucetRequestSerializer(faucet_request).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def send_admin_notification(self, faucet_request):
        """Send notification to admin about new faucet request"""
        subject = f'New Faucet Request - {faucet_request.network}'
        message = f"""
        New faucet request received:
        
        User: {faucet_request.user.username}
        Network: {faucet_request.network}
        Wallet: {faucet_request.wallet_address}
        Amount: {faucet_request.amount_requested}
        Reason: {faucet_request.reason or 'No reason provided'}
        
        Request ID: {faucet_request.id}
        """
        
        # Send to admin email (configure in settings)
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'admin@bsn.com')
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin_email],
            fail_silently=True,
        )


class ReferralCodeView(APIView):
    """
    Referral code management
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user's referral code"""
        try:
            referral_code = ReferralCode.objects.get(user=request.user)
            serializer = ReferralCodeSerializer(referral_code)
            return Response(serializer.data)
        except ReferralCode.DoesNotExist:
            # Create referral code if it doesn't exist
            code = self.generate_referral_code()
            referral_code = ReferralCode.objects.create(
                user=request.user,
                code=code
            )
            serializer = ReferralCodeSerializer(referral_code)
            return Response(serializer.data)
    
    def generate_referral_code(self):
        """Generate unique referral code"""
        while True:
            code = str(uuid.uuid4())[:8].upper()
            if not ReferralCode.objects.filter(code=code).exists():
                return code


class ReferralProgramView(generics.ListAPIView):
    """
    List user's referrals
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReferralProgramSerializer
    
    def get_queryset(self):
        return ReferralProgram.objects.filter(
            referrer=self.request.user
        ).order_by('-created_at')


class NewsletterSubscriptionView(APIView):
    """
    Newsletter subscription management
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Subscribe to newsletter"""
        serializer = NewsletterSubscriptionCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            # Check if already subscribed
            email = serializer.validated_data['email']
            existing = NewsletterSubscription.objects.filter(email=email).first()
            
            if existing:
                if existing.is_active:
                    return Response({
                        'message': 'Already subscribed to newsletter.'
                    }, status=status.HTTP_200_OK)
                else:
                    # Reactivate subscription
                    existing.is_active = True
                    existing.unsubscribed_at = None
                    existing.save()
                    return Response({
                        'message': 'Newsletter subscription reactivated.'
                    }, status=status.HTTP_200_OK)
            
            subscription = serializer.save()
            return Response({
                'message': 'Successfully subscribed to newsletter.'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NewsletterUnsubscribeView(APIView):
    """
    Newsletter unsubscribe
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Unsubscribe from newsletter"""
        email = request.data.get('email')
        if not email:
            return Response({
                'error': 'Email is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            subscription = NewsletterSubscription.objects.get(email=email)
            subscription.is_active = False
            subscription.unsubscribed_at = timezone.now()
            subscription.save()
            
            return Response({
                'message': 'Successfully unsubscribed from newsletter.'
            }, status=status.HTTP_200_OK)
        
        except NewsletterSubscription.DoesNotExist:
            return Response({
                'error': 'Subscription not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class ContactFormView(APIView):
    """
    Contact form submission
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Submit contact form"""
        serializer = ContactFormCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            contact_form = serializer.save()
            
            # Send notification email
            self.send_contact_notification(contact_form)
            
            return Response({
                'message': 'Contact form submitted successfully.'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def send_contact_notification(self, contact_form):
        """Send notification about contact form submission"""
        subject = f'New Contact Form Submission - {contact_form.subject}'
        message = f"""
        New contact form submission:
        
        Name: {contact_form.name}
        Email: {contact_form.email}
        Subject: {contact_form.subject}
        Message: {contact_form.message}
        
        Submission ID: {contact_form.id}
        """
        
        # Send to admin email
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'admin@bsn.com')
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin_email],
            fail_silently=True,
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def ico_overview(request):
    """
    Get ICO overview statistics
    """
    # Get total statistics
    total_reservations = TokenReservation.objects.count()
    total_payments = TokenReservation.objects.filter(
        payment_status='completed'
    ).count()
    total_raised = TokenReservation.objects.filter(
        payment_status='completed'
    ).aggregate(total=Sum('amount_usd'))['total'] or 0
    total_tokens_sold = TokenReservation.objects.filter(
        payment_status='completed'
    ).aggregate(total=Sum('tokens_amount'))['total'] or 0
    
    # Get user statistics
    from users.models import User
    total_users = User.objects.count()
    
    # Get referral statistics
    total_referrals = ReferralProgram.objects.count()
    total_commission = ReferralProgram.objects.aggregate(
        total=Sum('commission_earned')
    )['total'] or 0
    
    # Check if ICO is active
    now = timezone.now()
    ico_start = timezone.datetime.fromisoformat(settings.ICO_START_DATE.replace('Z', '+00:00'))
    ico_end = timezone.datetime.fromisoformat(settings.ICO_END_DATE.replace('Z', '+00:00'))
    is_ico_active = ico_start <= now <= ico_end
    
    overview = {
        'total_raised_usd': total_raised,
        'total_tokens_sold': total_tokens_sold,
        'total_reservations': total_reservations,
        'total_payments': total_payments,
        'total_users': total_users,
        'total_referrals': total_referrals,
        'token_price_usd': settings.TOKEN_PRICE_USD,
        'ico_start_date': ico_start,
        'ico_end_date': ico_end,
        'is_ico_active': is_ico_active,
    }
    
    serializer = ICOOverviewSerializer(overview)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def ico_stats(request):
    """
    Get detailed ICO statistics
    """
    # Get network distribution
    network_stats = TokenReservation.objects.filter(
        payment_status='completed'
    ).values('payment_method').annotate(
        count=Count('id'),
        total_amount=Sum('amount_usd')
    )
    
    # Get daily statistics for the last 30 days
    from datetime import datetime, timedelta
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=30)
    
    daily_stats = []
    current_date = start_date
    while current_date <= end_date:
        day_reservations = TokenReservation.objects.filter(
            created_at__date=current_date
        )
        day_payments = day_reservations.filter(payment_status='completed')
        
        daily_stats.append({
            'date': current_date,
            'reservations': day_reservations.count(),
            'payments': day_payments.count(),
            'amount_raised': day_payments.aggregate(
                total=Sum('amount_usd')
            )['total'] or 0,
        })
        current_date += timedelta(days=1)
    
    stats = {
        'network_distribution': list(network_stats),
        'daily_stats': daily_stats,
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def token_price_info(request):
    """
    Get token price and ICO information
    """
    info = {
        'token_price_usd': settings.TOKEN_PRICE_USD,
        'min_purchase_usd': settings.MIN_PURCHASE_USD,
        'max_purchase_usd': settings.MAX_PURCHASE_USD,
        'total_tokens_available': settings.TOTAL_TOKENS_AVAILABLE,
        'ico_start_date': settings.ICO_START_DATE,
        'ico_end_date': settings.ICO_END_DATE,
        'supported_networks': [
            'ethereum', 'polygon', 'bsc', 'solana'
        ]
    }
    
    return Response(info)


# Dashboard-spezifische Views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """Dashboard statistics for authenticated user"""
    user = request.user
    
    # User-spezifische Statistiken
    user_reservations = TokenReservation.objects.filter(user=user)
    user_faucet_requests = FaucetRequest.objects.filter(user=user)
    user_referrals = ReferralProgram.objects.filter(referrer=user)
    
    # Wallet-ähnliche Daten basierend auf Token-Reservierungen
    total_invested = user_reservations.filter(payment_status='completed').aggregate(
        total=Sum('amount_usd')
    )['total'] or 0
    
    total_tokens_reserved = user_reservations.aggregate(
        total=Sum('tokens_amount')
    )['total'] or 0
    
    # Referral-Statistiken
    referral_stats = user_referrals.aggregate(
        total_commission=Sum('commission_earned'),
        total_tokens=Sum('tokens_earned')
    )
    
    return Response({
        'wallet': {
            'balance': float(total_tokens_reserved),
            'address': user_reservations.first().wallet_address if user_reservations.exists() else None,
            'totalReceived': float(total_tokens_reserved),
            'totalSent': 0,
            'transactionCount': user_reservations.count(),
            'miningRewards': float(referral_stats['total_tokens'] or 0),
            'recentTransactions': []
        },
        'faucet': {
            'totalRequests': user_faucet_requests.count(),
            'pendingRequests': user_faucet_requests.filter(status='pending').count(),
            'approvedRequests': user_faucet_requests.filter(status='approved').count(),
            'completedRequests': user_faucet_requests.filter(status='completed').count(),
            'totalAmountRequested': float(user_faucet_requests.aggregate(
                total=Sum('amount_requested')
            )['total'] or 0),
            'recentRequests': FaucetRequestSerializer(
                user_faucet_requests.order_by('-created_at')[:5], 
                many=True
            ).data
        },
        'referral': {
            'referralCode': getattr(user.referral_code, 'code', None) if hasattr(user, 'referral_code') else None,
            'referralLink': f"{request.build_absolute_uri('/')[:-1]}/register?ref={getattr(user.referral_code, 'code', '')}" if hasattr(user, 'referral_code') else None,
            'totalReferrals': user_referrals.count(),
            'totalCommission': float(referral_stats['total_commission'] or 0),
            'totalTokens': float(referral_stats['total_tokens'] or 0),
            'activeReferrals': user_referrals.filter(is_active=True).count(),
            'paidOutReferrals': user_referrals.filter(is_paid_out=True).count(),
            'recentReferrals': ReferralProgramSerializer(
                user_referrals.order_by('-created_at')[:5], 
                many=True
            ).data
        },
        'mining': {
            'miningPower': 0.0,  # Will be implemented later
            'accumulatedTokens': float(referral_stats['total_tokens'] or 0),
            'totalMined': 0.0,  # Will be implemented later
            'streakDays': 0,  # Will be implemented later
            'lastClaimTime': None,
            'currentRate': 0.0,
            'estimatedTokens': 0.0,
            'hoursSinceLastClaim': 0,
            'canClaim': False,
            'userRank': 0,  # Will be implemented later
            'userPercentile': 0,
            'topMiners': [],
            'totalMinedTokens': 0  # Will be implemented later
        },
        'activity': [
            {
                'id': reservation.id,
                'type': 'token_purchase',
                'amount': float(reservation.tokens_amount),
                'timestamp': reservation.created_at.isoformat(),
                'description': f'Token purchase - {reservation.payment_method}'
            } for reservation in user_reservations.order_by('-created_at')[:3]
        ] + [
            {
                'id': faucet.id,
                'type': 'faucet_request',
                'amount': float(faucet.amount_requested),
                'timestamp': faucet.created_at.isoformat(),
                'description': f'Faucet request - {faucet.network}'
            } for faucet in user_faucet_requests.order_by('-created_at')[:2]
        ]
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def wallet_dashboard_data(request):
    """Wallet-specific dashboard data"""
    user = request.user
    
    # Return empty data instead of mock data
    return Response({
        'balance': 0.0,  # Real balance will be fetched from blockchain
        'address': '',  # Real address will be provided by frontend
        'totalReceived': 0.0,
        'totalSent': 0.0,
        'transactionCount': 0,
        'miningRewards': 0.0,
        'recentTransactions': []  # Real transactions will be fetched from blockchain
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def faucet_dashboard_stats(request):
    """Faucet-specific dashboard statistics"""
    user = request.user
    
    # Get real faucet data
    user_faucet_requests = FaucetRequest.objects.filter(user=user)
    
    return Response({
        'totalRequests': user_faucet_requests.count(),
        'pendingRequests': user_faucet_requests.filter(status='pending').count(),
        'approvedRequests': user_faucet_requests.filter(status='approved').count(),
        'completedRequests': user_faucet_requests.filter(status='completed').count(),
        'totalAmountRequested': float(user_faucet_requests.aggregate(Sum('amount_requested'))['amount_requested__sum'] or 0),
        'recentRequests': []
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def referral_dashboard_stats(request):
    """Referral-specific dashboard statistics"""
    user = request.user
    
    # Get real referral data
    user_referrals = ReferralProgram.objects.filter(referrer=user)
    referral_stats = user_referrals.aggregate(
        total_tokens=Sum('tokens_earned'),
        total_commission=Sum('commission_earned')
    )
    
    return Response({
        'referralCode': f"BSN{user.id}".upper()[:8],
        'referralLink': f"http://localhost:5176/register?ref=BSN{user.id}",
        'totalReferrals': user_referrals.count(),
        'totalCommission': float(referral_stats['total_commission'] or 0),
        'totalTokens': float(referral_stats['total_tokens'] or 0),
        'activeReferrals': user_referrals.filter(is_active=True).count(),
        'paidOutReferrals': user_referrals.filter(is_paid_out=True).count(),
        'recentReferrals': []
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def mining_dashboard_data(request):
    """Mining-specific dashboard data"""
    user = request.user
    
    # Return empty mining data - will be implemented later
    return Response({
        'miningPower': 0.0,
        'accumulatedTokens': 0.0,
        'totalMined': 0.0,
        'streakDays': 0,
        'lastClaimTime': None,
        'currentRate': 0.0,
        'estimatedTokens': 0.0,
        'hoursSinceLastClaim': 0,
        'canClaim': False,
        'userRank': 0,
        'userPercentile': 0,
        'topMiners': [],
        'totalMinedTokens': 0
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recent_activity(request):
    """Recent user activity"""
    user = request.user
    
    activities = []
    
    # Token Reservations
    reservations = TokenReservation.objects.filter(user=user).order_by('-created_at')[:5]
    for reservation in reservations:
        activities.append({
            'id': str(reservation.id),
            'type': 'token_purchase',
            'amount': float(reservation.tokens_amount),
            'timestamp': reservation.created_at.isoformat(),
            'description': f'Token purchase via {reservation.payment_method} - ${reservation.amount_usd}',
            'status': reservation.payment_status
        })
    
    # Faucet Requests
    faucet_requests = FaucetRequest.objects.filter(user=user).order_by('-created_at')[:3]
    for faucet in faucet_requests:
        activities.append({
            'id': str(faucet.id),
            'type': 'faucet_request',
            'amount': float(faucet.amount_requested),
            'timestamp': faucet.created_at.isoformat(),
            'description': f'Faucet request on {faucet.network}',
            'status': faucet.status
        })
    
    # Referral Bonuses
    referrals = ReferralProgram.objects.filter(referrer=user).order_by('-created_at')[:3]
    for referral in referrals:
        activities.append({
            'id': str(referral.id),
            'type': 'referral_bonus',
            'amount': float(referral.tokens_earned),
            'timestamp': referral.created_at.isoformat(),
            'description': f'Referral bonus from {referral.referred_user.username}',
            'status': 'paid_out' if referral.is_paid_out else 'pending'
        })
    
    # Sortiere nach Timestamp (neueste zuerst)
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return Response(activities[:10])  # Maximal 10 Aktivitäten
