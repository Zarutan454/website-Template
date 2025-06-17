from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status, permissions
from django.shortcuts import get_object_or_404
from bsn_social_network.models import Wallet, TokenTransaction, User
from bsn_social_network.api.serializers import WalletSerializer, TokenTransactionSerializer
from django.db import transaction
from django.utils import timezone
import uuid
from decimal import Decimal
from django.db import models

class WalletView(APIView):
    """
    Get or create user wallet
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        wallet, created = Wallet.objects.get_or_create(user=request.user)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data)

class TransactionListView(generics.ListAPIView):
    """
    List user transactions
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TokenTransactionSerializer
    
    def get_queryset(self):
        wallet = Wallet.objects.get(user=self.request.user)
        
        # Filter by transaction type if provided
        tx_type = self.request.query_params.get('type')
        
        sent_query = TokenTransaction.objects.filter(from_wallet=wallet)
        received_query = TokenTransaction.objects.filter(to_wallet=wallet)
        
        if tx_type:
            sent_query = sent_query.filter(transaction_type=tx_type)
            received_query = received_query.filter(transaction_type=tx_type)
        
        # Combine and order by created_at in descending order
        return (sent_query | received_query).order_by('-created_at')

class SendTokensView(APIView):
    """
    Send tokens to another user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Get required parameters
            to_username = request.data.get('to_username')
            amount_str = request.data.get('amount')
            memo = request.data.get('memo', '')
            
            # Validate parameters
            if not to_username or not amount_str:
                return Response(
                    {"message": "Both 'to_username' and 'amount' are required."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                amount = Decimal(amount_str)
                if amount <= 0:
                    return Response(
                        {"message": "Amount must be greater than 0."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except (ValueError, TypeError):
                return Response(
                    {"message": "Invalid amount format."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Find recipient
            try:
                recipient = User.objects.get(username=to_username)
            except User.DoesNotExist:
                return Response(
                    {"message": f"User '{to_username}' not found."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Prevent sending to self
            if recipient.id == request.user.id:
                return Response(
                    {"message": "Cannot send tokens to yourself."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create wallets
            sender_wallet, _ = Wallet.objects.get_or_create(user=request.user)
            recipient_wallet, _ = Wallet.objects.get_or_create(user=recipient)
            
            # Check balance
            if sender_wallet.balance < amount:
                return Response(
                    {"message": "Insufficient balance."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Perform transaction atomically
            with transaction.atomic():
                # Update balances
                sender_wallet.balance -= amount
                recipient_wallet.balance += amount
                sender_wallet.save()
                recipient_wallet.save()
                
                # Create transaction record
                tx_hash = str(uuid.uuid4()).replace('-', '')
                tx = TokenTransaction.objects.create(
                    transaction_hash=tx_hash,
                    from_wallet=sender_wallet,
                    to_wallet=recipient_wallet,
                    amount=amount,
                    transaction_type='transfer',
                    status='completed',
                    metadata={
                        'memo': memo,
                        'sender_username': request.user.username,
                        'recipient_username': recipient.username
                    },
                    completed_at=timezone.now()
                )
                
                return Response({
                    "message": f"Successfully sent {amount} tokens to {to_username}",
                    "transaction_hash": tx_hash,
                    "new_balance": sender_wallet.balance
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {"message": f"Error sending tokens: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class WalletStatsView(APIView):
    """
    Get wallet statistics
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        
        # Get transaction counts
        sent_count = TokenTransaction.objects.filter(from_wallet=wallet).count()
        received_count = TokenTransaction.objects.filter(to_wallet=wallet).count()
        
        # Get transaction volume
        sent_volume = TokenTransaction.objects.filter(from_wallet=wallet).aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        received_volume = TokenTransaction.objects.filter(to_wallet=wallet).aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        # Get latest transactions
        latest_transactions = TokenTransaction.objects.filter(
            from_wallet=wallet
        ) | TokenTransaction.objects.filter(
            to_wallet=wallet
        )
        latest_transactions = latest_transactions.order_by('-created_at')[:5]
        
        # Serialize the latest transactions
        serializer = TokenTransactionSerializer(latest_transactions, many=True)
        
        return Response({
            "balance": wallet.balance,
            "transaction_count": {
                "sent": sent_count,
                "received": received_count,
                "total": sent_count + received_count
            },
            "volume": {
                "sent": sent_volume,
                "received": received_volume,
                "net": received_volume - sent_volume
            },
            "latest_transactions": serializer.data
        }) 