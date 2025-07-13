import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/django-api-new';

interface Proposal {
  id: number;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  total_votes: number;
  quorum: number;
  dao: {
    id: number;
    name: string;
  };
}

interface ProposalCardProps {
  proposal: Proposal;
  onVoteSubmitted: () => void;
}

export default function ProposalCard({ proposal, onVoteSubmitted }: ProposalCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [voteReason, setVoteReason] = useState('');
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [selectedVote, setSelectedVote] = useState<'for' | 'against' | 'abstain' | null>(null);
  const { toast } = useToast();

  const getProposalProgress = () => {
    const totalVotes = proposal.votes_for + proposal.votes_against + proposal.votes_abstain;
    const progress = totalVotes > 0 ? (totalVotes / proposal.quorum) * 100 : 0;
    return Math.min(progress, 100);
  };

  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'passed':
        return 'bg-blue-500';
      case 'rejected':
        return 'bg-red-500';
      case 'draft':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleVote = async (vote: 'for' | 'against' | 'abstain') => {
    if (!voteReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for your vote',
        variant: 'destructive',
      });
      return;
    }

    setIsVoting(true);
    try {
      await api.post(`/api/proposals/${proposal.id}/vote/`, {
        vote,
        reason: voteReason,
      });
      
      toast({
        title: 'Success',
        description: 'Vote submitted successfully',
      });
      
      setShowVoteDialog(false);
      setVoteReason('');
      setSelectedVote(null);
      onVoteSubmitted();
    } catch (error) {
      console.error('Error voting on proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit vote',
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };

  const isExpired = new Date(proposal.end_date) < new Date();
  const isActive = proposal.status === 'active' && !isExpired;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{proposal.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getProposalStatusColor(proposal.status)}>
              {proposal.status}
            </Badge>
            {isActive && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Active
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500">
          DAO: {proposal.dao.name} • Ends: {new Date(proposal.end_date).toLocaleDateString()}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-700">{proposal.description}</p>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Voting Progress</span>
              <span>{proposal.total_votes} / {proposal.quorum}</span>
            </div>
            <Progress value={getProposalProgress()} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{proposal.votes_for}</p>
              <p className="text-sm text-gray-600">For</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{proposal.votes_against}</p>
              <p className="text-sm text-gray-600">Against</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-gray-600">{proposal.votes_abstain}</p>
              <p className="text-sm text-gray-600">Abstain</p>
            </div>
          </div>

          {isActive && (
            <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">Vote on Proposal</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Vote on "{proposal.title}"</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Vote</label>
                    <div className="flex space-x-2">
                      <Button
                        variant={selectedVote === 'for' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedVote('for')}
                      >
                        For
                      </Button>
                      <Button
                        variant={selectedVote === 'against' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedVote('against')}
                      >
                        Against
                      </Button>
                      <Button
                        variant={selectedVote === 'abstain' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedVote('abstain')}
                      >
                        Abstain
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reason (Required)</label>
                    <Textarea
                      placeholder="Explain your vote..."
                      value={voteReason}
                      onChange={(e) => setVoteReason(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowVoteDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => selectedVote && handleVote(selectedVote)}
                      disabled={!selectedVote || !voteReason.trim() || isVoting}
                      className="flex-1"
                    >
                      {isVoting ? 'Submitting...' : 'Submit Vote'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {!isActive && (
            <div className="text-center">
              <Badge variant="secondary">
                {isExpired ? 'Voting Closed' : 'Not Active'}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 