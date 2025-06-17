from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status, permissions
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum
from bsn_social_network.models import DAO, DAOMembership, Proposal, Vote, Wallet, TokenTransaction, User
from bsn_social_network.api.serializers import DAOSerializer, DAOMembershipSerializer, ProposalSerializer, VoteSerializer
import uuid
from decimal import Decimal

class DAOListView(generics.ListCreateAPIView):
    """
    List and create DAOs
    """
    serializer_class = DAOSerializer
    queryset = DAO.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        """Create a new DAO and set the creator as an admin member"""
        try:
            with transaction.atomic():
                # Create the DAO
                dao = serializer.save(creator=self.request.user)
                
                # Add creator as admin
                DAOMembership.objects.create(
                    dao=dao,
                    user=self.request.user,
                    role='admin',
                    voting_power=100  # Initial voting power for admin
                )
                
                # Ensure creator has a wallet
                wallet, created = Wallet.objects.get_or_create(user=self.request.user)
                
                # Optional: Charge a token fee for creating a DAO
                creation_fee = Decimal('50.0')  # 50 tokens to create a DAO
                
                if wallet.balance >= creation_fee:
                    # Deduct fee
                    wallet.balance -= creation_fee
                    wallet.save()
                    
                    # Record transaction
                    TokenTransaction.objects.create(
                        transaction_hash=str(uuid.uuid4()).replace('-', ''),
                        from_wallet=wallet,
                        amount=creation_fee,
                        transaction_type='dao_creation_fee',
                        status='completed',
                        metadata={
                            'dao_id': dao.id,
                            'dao_name': dao.name
                        },
                        completed_at=timezone.now()
                    )
        except Exception as e:
            # If anything fails, the transaction will roll back
            raise serializers.ValidationError(f"Failed to create DAO: {str(e)}")

class DAODetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a DAO
    """
    queryset = DAO.objects.all()
    serializer_class = DAOSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def update(self, request, *args, **kwargs):
        """Only allow DAO admins to update the DAO"""
        dao = self.get_object()
        
        # Check if user is an admin
        try:
            membership = DAOMembership.objects.get(dao=dao, user=request.user)
            if membership.role != 'admin':
                return Response(
                    {"message": "Only DAO admins can update DAO details"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except DAOMembership.DoesNotExist:
            return Response(
                {"message": "You are not a member of this DAO"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Only allow DAO creator to delete the DAO"""
        dao = self.get_object()
        
        if dao.creator != request.user:
            return Response(
                {"message": "Only the DAO creator can delete this DAO"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)

class DAOMembershipView(APIView):
    """
    Manage DAO memberships
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        """List all members of a DAO"""
        dao = get_object_or_404(DAO, pk=pk)
        memberships = DAOMembership.objects.filter(dao=dao)
        serializer = DAOMembershipSerializer(memberships, many=True)
        return Response(serializer.data)
    
    def post(self, request, pk):
        """Join a DAO"""
        dao = get_object_or_404(DAO, pk=pk)
        
        # Check if user is already a member
        if DAOMembership.objects.filter(dao=dao, user=request.user).exists():
            return Response(
                {"message": "You are already a member of this DAO"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if DAO is active
        if dao.status != 'active':
            return Response(
                {"message": f"This DAO is currently {dao.status} and not accepting new members"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create membership with default role and voting power
        membership = DAOMembership.objects.create(
            dao=dao,
            user=request.user,
            role='member',
            voting_power=10  # Default voting power for new members
        )
        
        serializer = DAOMembershipSerializer(membership)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def delete(self, request, pk):
        """Leave a DAO"""
        dao = get_object_or_404(DAO, pk=pk)
        
        try:
            membership = DAOMembership.objects.get(dao=dao, user=request.user)
            
            # Prevent creator from leaving
            if dao.creator == request.user:
                return Response(
                    {"message": "As the creator, you cannot leave this DAO"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Remove membership
            membership.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except DAOMembership.DoesNotExist:
            return Response(
                {"message": "You are not a member of this DAO"},
                status=status.HTTP_400_BAD_REQUEST
            )

class MemberRoleView(APIView):
    """
    Update member roles
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, dao_pk, user_pk):
        """Update a member's role"""
        dao = get_object_or_404(DAO, pk=dao_pk)
        target_user = get_object_or_404(User, pk=user_pk)
        
        # Check if requester is an admin
        try:
            requester_membership = DAOMembership.objects.get(dao=dao, user=request.user)
            if requester_membership.role != 'admin':
                return Response(
                    {"message": "Only DAO admins can update member roles"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except DAOMembership.DoesNotExist:
            return Response(
                {"message": "You are not a member of this DAO"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get the target user's membership
        try:
            target_membership = DAOMembership.objects.get(dao=dao, user=target_user)
        except DAOMembership.DoesNotExist:
            return Response(
                {"message": "User is not a member of this DAO"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Prevent changing the creator's role
        if target_user == dao.creator and request.user != dao.creator:
            return Response(
                {"message": "Cannot change the role of the DAO creator"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update the role
        new_role = request.data.get('role')
        if new_role not in ['admin', 'moderator', 'member']:
            return Response(
                {"message": "Invalid role. Must be 'admin', 'moderator', or 'member'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        target_membership.role = new_role
        target_membership.save()
        
        serializer = DAOMembershipSerializer(target_membership)
        return Response(serializer.data)

class VotingPowerView(APIView):
    """
    Update voting power
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, dao_pk, user_pk):
        """Update a member's voting power"""
        dao = get_object_or_404(DAO, pk=dao_pk)
        target_user = get_object_or_404(User, pk=user_pk)
        
        # Check if requester is an admin
        try:
            requester_membership = DAOMembership.objects.get(dao=dao, user=request.user)
            if requester_membership.role != 'admin':
                return Response(
                    {"message": "Only DAO admins can update voting power"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except DAOMembership.DoesNotExist:
            return Response(
                {"message": "You are not a member of this DAO"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get the target user's membership
        try:
            target_membership = DAOMembership.objects.get(dao=dao, user=target_user)
        except DAOMembership.DoesNotExist:
            return Response(
                {"message": "User is not a member of this DAO"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update voting power
        try:
            voting_power = int(request.data.get('voting_power', 0))
            if voting_power < 0:
                return Response(
                    {"message": "Voting power cannot be negative"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            target_membership.voting_power = voting_power
            target_membership.save()
            
            serializer = DAOMembershipSerializer(target_membership)
            return Response(serializer.data)
            
        except (ValueError, TypeError):
            return Response(
                {"message": "Invalid voting power format"},
                status=status.HTTP_400_BAD_REQUEST
            )

class ProposalListView(generics.ListCreateAPIView):
    """
    List and create proposals for a DAO
    """
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        dao_id = self.kwargs['pk']
        return Proposal.objects.filter(dao_id=dao_id)
    
    def perform_create(self, serializer):
        dao_id = self.kwargs['pk']
        dao = get_object_or_404(DAO, pk=dao_id)
        
        # Check if user is a member
        try:
            membership = DAOMembership.objects.get(dao=dao, user=self.request.user)
        except DAOMembership.DoesNotExist:
            raise serializers.ValidationError("You must be a member of the DAO to create proposals")
        
        # Check if DAO is active
        if dao.status != 'active':
            raise serializers.ValidationError(f"This DAO is currently {dao.status} and not accepting new proposals")
        
        # Set proposal defaults
        serializer.save(
            creator=self.request.user,
            dao=dao,
            status='active',
            start_date=timezone.now()
        )

class ProposalDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update a proposal
    """
    queryset = Proposal.objects.all()
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        proposal = self.get_object()
        
        # Only allow creator or admin to update
        if proposal.creator != request.user:
            # Check if user is an admin
            try:
                membership = DAOMembership.objects.get(dao=proposal.dao, user=request.user)
                if membership.role != 'admin':
                    return Response(
                        {"message": "Only the proposal creator or DAO admins can update this proposal"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except DAOMembership.DoesNotExist:
                return Response(
                    {"message": "Only the proposal creator or DAO admins can update this proposal"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Can't update active proposals with votes
        if proposal.status == 'active' and Vote.objects.filter(proposal=proposal).exists():
            return Response(
                {"message": "Cannot update an active proposal that has votes"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().update(request, *args, **kwargs)

class ProposalStatusView(APIView):
    """
    Update proposal status
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, pk):
        """Update a proposal's status"""
        proposal = get_object_or_404(Proposal, pk=pk)
        
        # Check if user is an admin
        try:
            membership = DAOMembership.objects.get(dao=proposal.dao, user=request.user)
            if membership.role != 'admin' and proposal.creator != request.user:
                return Response(
                    {"message": "Only DAO admins or the proposal creator can update the status"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except DAOMembership.DoesNotExist:
            return Response(
                {"message": "You are not a member of this DAO"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update status
        new_status = request.data.get('status')
        if new_status not in ['active', 'passed', 'rejected', 'canceled']:
            return Response(
                {"message": "Invalid status. Must be 'active', 'passed', 'rejected', or 'canceled'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # If closing the proposal, calculate results
        if proposal.status == 'active' and new_status in ['passed', 'rejected']:
            total_votes = Vote.objects.filter(proposal=proposal).aggregate(
                for_votes=Sum('voting_power', filter=models.Q(vote='for')),
                against_votes=Sum('voting_power', filter=models.Q(vote='against'))
            )
            
            for_votes = total_votes['for_votes'] or 0
            against_votes = total_votes['against_votes'] or 0
            
            # Add voting results to metadata
            proposal.metadata = {
                **(proposal.metadata or {}),
                'voting_results': {
                    'for_votes': for_votes,
                    'against_votes': against_votes,
                    'total_votes': for_votes + against_votes,
                    'result': new_status,
                    'closed_at': timezone.now().isoformat()
                }
            }
            
            # Execute proposal if passed
            if new_status == 'passed' and proposal.execution_script:
                proposal.metadata['execution'] = {
                    'executed_at': timezone.now().isoformat(),
                    'status': 'executed'
                }
        
        proposal.status = new_status
        if new_status != 'active':
            proposal.end_date = timezone.now()
        
        proposal.save()
        
        serializer = ProposalSerializer(proposal)
        return Response(serializer.data)

class VoteView(APIView):
    """
    Vote on a proposal
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        """Get votes for a proposal"""
        proposal = get_object_or_404(Proposal, pk=pk)
        votes = Vote.objects.filter(proposal=proposal)
        serializer = VoteSerializer(votes, many=True)
        return Response(serializer.data)
    
    def post(self, request, pk):
        """Vote on a proposal"""
        proposal = get_object_or_404(Proposal, pk=pk)
        
        # Check if proposal is active
        if proposal.status != 'active':
            return Response(
                {"message": f"Cannot vote on a {proposal.status} proposal"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if proposal voting period is valid
        now = timezone.now()
        if proposal.end_date and now > proposal.end_date:
            return Response(
                {"message": "Voting period has ended"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is a DAO member
        try:
            membership = DAOMembership.objects.get(dao=proposal.dao, user=request.user)
        except DAOMembership.DoesNotExist:
            return Response(
                {"message": "You must be a member of the DAO to vote"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check vote choice
        vote_choice = request.data.get('vote')
        if vote_choice not in ['for', 'against', 'abstain']:
            return Response(
                {"message": "Invalid vote. Must be 'for', 'against', or 'abstain'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already voted
        if Vote.objects.filter(proposal=proposal, voter=request.user).exists():
            return Response(
                {"message": "You have already voted on this proposal"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create vote
        vote = Vote.objects.create(
            proposal=proposal,
            voter=request.user,
            vote=vote_choice,
            voting_power=membership.voting_power,
            reason=request.data.get('reason', '')
        )
        
        # Check if quorum is reached and auto-close if needed
        if proposal.quorum:
            total_voting_power = Vote.objects.filter(proposal=proposal).aggregate(
                total=Sum('voting_power')
            )['total'] or 0
            
            # Calculate total possible voting power
            total_possible = DAOMembership.objects.filter(dao=proposal.dao).aggregate(
                total=Sum('voting_power')
            )['total'] or 0
            
            # If quorum is reached
            if total_possible > 0 and (total_voting_power / total_possible) * 100 >= proposal.quorum:
                # Calculate result
                vote_totals = Vote.objects.filter(proposal=proposal).aggregate(
                    for_votes=Sum('voting_power', filter=models.Q(vote='for')),
                    against_votes=Sum('voting_power', filter=models.Q(vote='against'))
                )
                
                for_votes = vote_totals['for_votes'] or 0
                against_votes = vote_totals['against_votes'] or 0
                
                # Determine outcome
                new_status = 'passed' if for_votes > against_votes else 'rejected'
                
                # Update proposal
                proposal.status = new_status
                proposal.end_date = now
                proposal.metadata = {
                    **(proposal.metadata or {}),
                    'voting_results': {
                        'for_votes': for_votes,
                        'against_votes': against_votes,
                        'total_votes': for_votes + against_votes,
                        'result': new_status,
                        'closed_at': now.isoformat(),
                        'auto_closed': True,
                        'quorum_reached': True
                    }
                }
                proposal.save()
        
        serializer = VoteSerializer(vote)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class DAOTreasuryView(APIView):
    """
    Manage DAO treasury
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        """Get DAO treasury information"""
        dao = get_object_or_404(DAO, pk=pk)
        
        # Check if user is a member
        try:
            DAOMembership.objects.get(dao=dao, user=request.user)
        except DAOMembership.DoesNotExist:
            return Response(
                {"message": "You must be a member to view the treasury"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get treasury wallet balance if it exists
        treasury_balance = Decimal('0')
        
        # Get transaction history (assuming we have a special wallet or way to track DAO funds)
        # This is a simplified example - in a real implementation, you'd have a dedicated DAO treasury system
        
        return Response({
            "dao_id": dao.id,
            "dao_name": dao.name,
            "treasury_balance": treasury_balance,
            "governance_token": dao.governance_token,
            "currency": "BSN Token"
        })
    
    def post(self, request, pk):
        """Contribute to DAO treasury"""
        dao = get_object_or_404(DAO, pk=pk)
        
        # Get the amount to contribute
        try:
            amount = Decimal(str(request.data.get('amount', '0')))
            if amount <= 0:
                return Response(
                    {"message": "Amount must be greater than 0"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError, InvalidOperation):
            return Response(
                {"message": "Invalid amount format"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user wallet
        try:
            wallet = Wallet.objects.get(user=request.user)
            
            # Check balance
            if wallet.balance < amount:
                return Response(
                    {"message": "Insufficient balance"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Process contribution (simplified example)
            wallet.balance -= amount
            wallet.save()
            
            # Record transaction
            tx_hash = str(uuid.uuid4()).replace('-', '')
            TokenTransaction.objects.create(
                transaction_hash=tx_hash,
                from_wallet=wallet,
                amount=amount,
                transaction_type='dao_contribution',
                status='completed',
                metadata={
                    'dao_id': dao.id,
                    'dao_name': dao.name,
                    'contributor': request.user.username
                },
                completed_at=timezone.now()
            )
            
            return Response({
                "message": f"Successfully contributed {amount} tokens to {dao.name}",
                "transaction_hash": tx_hash,
                "new_balance": wallet.balance
            }, status=status.HTTP_201_CREATED)
            
        except Wallet.DoesNotExist:
            return Response(
                {"message": "Wallet not found"},
                status=status.HTTP_400_BAD_REQUEST
            ) 