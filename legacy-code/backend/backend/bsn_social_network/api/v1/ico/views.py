from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum, Count
from django.conf import settings
import os

from bsn_social_network.models import ICOTokenReservation, ICOConfiguration, User
from .serializers import ICOTokenReservationSerializer, ICOConfigurationSerializer

class ICOTokenReservationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ICO Token Reservations
    """
    serializer_class = ICOTokenReservationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ICOTokenReservation.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Calculate tokens based on USD amount
        amount_usd = serializer.validated_data['amount_usd']
        token_price = float(os.getenv('TOKEN_PRICE_USD', 0.10))
        tokens_reserved = amount_usd / token_price
        
        # Set expiration (24 hours from now)
        expires_at = timezone.now() + timezone.timedelta(hours=24)
        
        serializer.save(
            user=self.request.user,
            tokens_reserved=tokens_reserved,
            expires_at=expires_at
        )
    
    def destroy(self, request, *args, **kwargs):
        reservation = self.get_object()
        if reservation.status == 'pending' and not reservation.is_expired():
            reservation.cancel('Cancelled by user')
            return Response({'message': 'Reservation cancelled successfully'})
        return Response(
            {'error': 'Cannot cancel this reservation'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

class ICOStatsView(APIView):
    """
    Get ICO Statistics
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        # Get ICO configuration
        ico_start = os.getenv('ICO_START_DATE', '2024-01-01T00:00:00Z')
        ico_end = os.getenv('ICO_END_DATE', '2024-12-31T23:59:59Z')
        token_price = float(os.getenv('TOKEN_PRICE_USD', 0.10))
        min_purchase = float(os.getenv('MIN_PURCHASE_USD', 10))
        max_purchase = float(os.getenv('MAX_PURCHASE_USD', 10000))
        total_tokens = float(os.getenv('TOTAL_TOKENS_AVAILABLE', 10000000))
        
        # Check if ICO is active
        now = timezone.now()
        ico_active = now >= timezone.datetime.fromisoformat(ico_start.replace('Z', '+00:00')) and \
                    now <= timezone.datetime.fromisoformat(ico_end.replace('Z', '+00:00'))
        
        # Get statistics
        total_reservations = ICOTokenReservation.objects.count()
        confirmed_reservations = ICOTokenReservation.objects.filter(
            status__in=['confirmed', 'completed']
        ).count()
        
        total_amount_usd = ICOTokenReservation.objects.filter(
            status__in=['confirmed', 'completed']
        ).aggregate(total=Sum('amount_usd'))['total'] or 0
        
        total_tokens_reserved = ICOTokenReservation.objects.filter(
            status__in=['confirmed', 'completed']
        ).aggregate(total=Sum('tokens_reserved'))['total'] or 0
        
        tokens_sold = total_tokens_reserved
        tokens_remaining = total_tokens - tokens_sold
        progress_percentage = (tokens_sold / total_tokens * 100) if total_tokens > 0 else 0
        
        return Response({
            'ico_active': ico_active,
            'total_reservations': total_reservations,
            'confirmed_reservations': confirmed_reservations,
            'total_amount_usd': float(total_amount_usd),
            'total_tokens_reserved': float(total_tokens_reserved),
            'total_tokens_available': total_tokens,
            'tokens_remaining': float(tokens_remaining),
            'progress_percentage': round(progress_percentage, 2),
            'token_price_usd': token_price,
            'min_purchase_usd': min_purchase,
            'max_purchase_usd': max_purchase,
            'ico_start_date': ico_start,
            'ico_end_date': ico_end
        })

class ICOConfigView(APIView):
    """
    Get ICO Configuration
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        configs = ICOConfiguration.objects.filter(is_active=True)
        serializer = ICOConfigurationSerializer(configs, many=True)
        return Response(serializer.data) 