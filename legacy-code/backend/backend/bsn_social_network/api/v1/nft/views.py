from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status, permissions
from django.shortcuts import get_object_or_404
from bsn_social_network.models import NFT, User, Wallet, TokenTransaction
from bsn_social_network.api.serializers import NFTSerializer
from django.utils import timezone
from django.db import transaction
import uuid
import json
from decimal import Decimal

class NFTListView(generics.ListAPIView):
    """
    List NFTs
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = NFTSerializer
    
    def get_queryset(self):
        """
        Filter by owner or creator
        """
        queryset = NFT.objects.all()
        owner_id = self.request.query_params.get('owner_id', None)
        creator_id = self.request.query_params.get('creator_id', None)
        nft_type = self.request.query_params.get('type', None)
        rarity = self.request.query_params.get('rarity', None)
        
        if owner_id is not None:
            queryset = queryset.filter(owner_id=owner_id)
        
        if creator_id is not None:
            queryset = queryset.filter(creator_id=creator_id)
        
        if nft_type is not None:
            queryset = queryset.filter(nft_type=nft_type)
            
        if rarity is not None:
            queryset = queryset.filter(rarity=rarity)
            
        # My NFTs
        my_nfts = self.request.query_params.get('my_nfts', None)
        if my_nfts == 'true' and self.request.user.is_authenticated:
            queryset = queryset.filter(owner=self.request.user)
            
        # For sale NFTs
        for_sale = self.request.query_params.get('for_sale', None)
        if for_sale == 'true':
            queryset = queryset.filter(is_for_sale=True)
            
        return queryset.order_by('-created_at')

class NFTCreateView(APIView):
    """
    Create a new NFT
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Extract data from request
            name = request.data.get('name')
            description = request.data.get('description', '')
            media_url = request.data.get('media_url')
            nft_type = request.data.get('nft_type', 'artwork')
            rarity = request.data.get('rarity', 'common')
            metadata = request.data.get('metadata', {})
            
            # Basic validation
            if not name or not media_url:
                return Response(
                    {"message": "Name and media_url are required fields."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate metadata if provided as string
            if isinstance(metadata, str):
                try:
                    metadata = json.loads(metadata)
                except json.JSONDecodeError:
                    return Response(
                        {"message": "Invalid metadata JSON format."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Get user wallet
            wallet, created = Wallet.objects.get_or_create(user=request.user)
            
            # Creation fee (could be configurable based on rarity, etc.)
            creation_fee = Decimal('10.0')  # 10 tokens to create an NFT
            
            # Check balance
            if wallet.balance < creation_fee:
                return Response(
                    {
                        "message": f"Insufficient balance. NFT creation costs {creation_fee} tokens.",
                        "current_balance": wallet.balance
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate token ID
            token_id = str(uuid.uuid4()).replace('-', '')
            
            # Create NFT with transaction
            with transaction.atomic():
                # Deduct fee from user wallet
                wallet.balance -= creation_fee
                wallet.save()
                
                # Record transaction
                TokenTransaction.objects.create(
                    transaction_hash=str(uuid.uuid4()).replace('-', ''),
                    from_wallet=wallet,
                    amount=creation_fee,
                    transaction_type='nft_creation_fee',
                    status='completed',
                    metadata={
                        'nft_name': name,
                        'token_id': token_id
                    },
                    completed_at=timezone.now()
                )
                
                # Create NFT
                nft = NFT.objects.create(
                    token_id=token_id,
                    name=name,
                    description=description,
                    owner=request.user,
                    creator=request.user,
                    nft_type=nft_type,
                    media_url=media_url,
                    metadata=metadata,
                    rarity=rarity,
                    is_locked=False,
                    transaction_hash=token_id
                )
                
                serializer = NFTSerializer(nft)
                return Response(
                    {
                        "message": "NFT created successfully",
                        "nft": serializer.data
                    },
                    status=status.HTTP_201_CREATED
                )
                
        except Exception as e:
            return Response(
                {"message": f"Error creating NFT: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class NFTDetailView(generics.RetrieveAPIView):
    """
    Retrieve NFT details
    """
    queryset = NFT.objects.all()
    serializer_class = NFTSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class NFTTransferView(APIView):
    """
    Transfer an NFT to another user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            # Get the NFT
            nft = get_object_or_404(NFT, pk=pk)
            
            # Check ownership
            if nft.owner != request.user:
                return Response(
                    {"message": "You do not own this NFT."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if NFT is locked
            if nft.is_locked:
                return Response(
                    {"message": "This NFT is locked and cannot be transferred."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get recipient username
            to_username = request.data.get('to_username')
            if not to_username:
                return Response(
                    {"message": "Recipient username is required."},
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
                    {"message": "Cannot transfer NFT to yourself."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get sender and recipient wallets
            sender_wallet, _ = Wallet.objects.get_or_create(user=request.user)
            recipient_wallet, _ = Wallet.objects.get_or_create(user=recipient)
            
            # Transfer fee
            transfer_fee = Decimal('2.0')  # 2 tokens to transfer an NFT
            
            # Check balance
            if sender_wallet.balance < transfer_fee:
                return Response(
                    {
                        "message": f"Insufficient balance. NFT transfer costs {transfer_fee} tokens.",
                        "current_balance": sender_wallet.balance
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Execute transfer with transaction
            with transaction.atomic():
                # Deduct fee from sender
                sender_wallet.balance -= transfer_fee
                sender_wallet.save()
                
                # Record fee transaction
                tx_hash = str(uuid.uuid4()).replace('-', '')
                TokenTransaction.objects.create(
                    transaction_hash=tx_hash,
                    from_wallet=sender_wallet,
                    amount=transfer_fee,
                    transaction_type='nft_transfer_fee',
                    status='completed',
                    metadata={
                        'nft_id': nft.id,
                        'nft_name': nft.name,
                        'token_id': nft.token_id,
                        'recipient': to_username
                    },
                    completed_at=timezone.now()
                )
                
                # Update NFT ownership
                nft.owner = recipient
                nft.transaction_hash = tx_hash
                nft.save()
                
                return Response({
                    "message": f"NFT '{nft.name}' successfully transferred to {to_username}",
                    "transaction_hash": tx_hash
                })
                
        except Exception as e:
            return Response(
                {"message": f"Error transferring NFT: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class NFTMarketplaceView(APIView):
    """
    List NFTs for sale or purchase NFTs
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        """List an NFT for sale"""
        try:
            # Get the NFT
            nft = get_object_or_404(NFT, pk=pk)
            
            # Check ownership
            if nft.owner != request.user:
                return Response(
                    {"message": "You do not own this NFT."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if NFT is locked
            if nft.is_locked:
                return Response(
                    {"message": "This NFT is locked and cannot be sold."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get sale price
            price_str = request.data.get('price')
            if not price_str:
                return Response(
                    {"message": "Sale price is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                price = Decimal(price_str)
                if price <= 0:
                    return Response(
                        {"message": "Price must be greater than 0."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except (ValueError, TypeError):
                return Response(
                    {"message": "Invalid price format."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update NFT to be for sale
            nft.is_for_sale = True
            nft.sale_price = price
            nft.metadata = {**nft.metadata, 'for_sale': True, 'sale_price': float(price)}
            nft.save()
            
            return Response({
                "message": f"NFT '{nft.name}' is now listed for sale at {price} tokens",
                "nft_id": nft.id,
                "price": price
            })
            
        except Exception as e:
            return Response(
                {"message": f"Error listing NFT for sale: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, pk):
        """Delist an NFT from sale"""
        try:
            # Get the NFT
            nft = get_object_or_404(NFT, pk=pk)
            
            # Check ownership
            if nft.owner != request.user:
                return Response(
                    {"message": "You do not own this NFT."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if NFT is for sale
            if not nft.is_for_sale:
                return Response(
                    {"message": "This NFT is not listed for sale."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update NFT to be not for sale
            nft.is_for_sale = False
            nft.sale_price = None
            nft.metadata = {k: v for k, v in nft.metadata.items() if k != 'for_sale' and k != 'sale_price'}
            nft.save()
            
            return Response({
                "message": f"NFT '{nft.name}' has been removed from sale",
                "nft_id": nft.id
            })
            
        except Exception as e:
            return Response(
                {"message": f"Error removing NFT from sale: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class NFTPurchaseView(APIView):
    """
    Purchase an NFT that's for sale
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            # Get the NFT
            nft = get_object_or_404(NFT, pk=pk)
            
            # Check if NFT is for sale
            if not nft.is_for_sale:
                return Response(
                    {"message": "This NFT is not for sale."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Prevent buying own NFT
            if nft.owner == request.user:
                return Response(
                    {"message": "You already own this NFT."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get wallets
            buyer_wallet, _ = Wallet.objects.get_or_create(user=request.user)
            seller_wallet, _ = Wallet.objects.get_or_create(user=nft.owner)
            
            # Check if buyer has enough balance
            if buyer_wallet.balance < nft.sale_price:
                return Response(
                    {
                        "message": f"Insufficient balance. This NFT costs {nft.sale_price} tokens.",
                        "current_balance": buyer_wallet.balance
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Execute purchase with transaction
            with transaction.atomic():
                # Transfer tokens from buyer to seller
                buyer_wallet.balance -= nft.sale_price
                seller_wallet.balance += nft.sale_price
                buyer_wallet.save()
                seller_wallet.save()
                
                # Record transaction
                tx_hash = str(uuid.uuid4()).replace('-', '')
                TokenTransaction.objects.create(
                    transaction_hash=tx_hash,
                    from_wallet=buyer_wallet,
                    to_wallet=seller_wallet,
                    amount=nft.sale_price,
                    transaction_type='nft_purchase',
                    status='completed',
                    metadata={
                        'nft_id': nft.id,
                        'nft_name': nft.name,
                        'token_id': nft.token_id,
                        'seller': nft.owner.username,
                        'buyer': request.user.username
                    },
                    completed_at=timezone.now()
                )
                
                # Update NFT ownership
                nft.owner = request.user
                nft.is_for_sale = False
                nft.sale_price = None
                nft.transaction_hash = tx_hash
                nft.metadata = {k: v for k, v in nft.metadata.items() if k != 'for_sale' and k != 'sale_price'}
                nft.save()
                
                return Response({
                    "message": f"Successfully purchased NFT '{nft.name}'",
                    "transaction_hash": tx_hash,
                    "new_balance": buyer_wallet.balance
                })
                
        except Exception as e:
            return Response(
                {"message": f"Error purchasing NFT: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 