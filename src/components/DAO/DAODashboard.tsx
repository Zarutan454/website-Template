import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/django-api-new';

interface DAO {
  id: number;
  name: string;
  description: string;
  status: string;
  member_count: number;
  proposal_count: number;
  created_at: string;
}

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
}

interface Vote {
  id: number;
  proposal: number;
  voter: number;
  vote: 'for' | 'against' | 'abstain';
  voting_power: number;
  reason?: string;
}

export default function DAODashboard() {
  const [daos, setDaos] = useState<DAO[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchDAOs();
    fetchProposals();
  }, []);

  const fetchDAOs = async () => {
    try {
      const response = await api.get('/api/daos/');
      setDaos(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching DAOs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load DAOs',
        variant: 'destructive',
      });
    }
  };

  const fetchProposals = async () => {
    try {
      const response = await api.get('/api/proposals/');
      setProposals(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load proposals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const joinDAO = async (daoId: number) => {
    try {
      await api.post(`/api/daos/${daoId}/join/`);
      toast({
        title: 'Success',
        description: 'Successfully joined DAO',
      });
      fetchDAOs();
    } catch (error) {
      console.error('Error joining DAO:', error);
      toast({
        title: 'Error',
        description: 'Failed to join DAO',
        variant: 'destructive',
      });
    }
  };

  const voteOnProposal = async (proposalId: number, vote: 'for' | 'against' | 'abstain', reason?: string) => {
    try {
      await api.post(`/api/proposals/${proposalId}/vote/`, {
        vote,
        reason,
      });
      toast({
        title: 'Success',
        description: 'Vote submitted successfully',
      });
      fetchProposals();
    } catch (error) {
      console.error('Error voting on proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit vote',
        variant: 'destructive',
      });
    }
  };

  const getProposalProgress = (proposal: Proposal) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DAO Governance Dashboard</h1>
        <p className="text-gray-600">Manage decentralized autonomous organizations and participate in governance</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daos">My DAOs</TabsTrigger>
          <TabsTrigger value="proposals">Active Proposals</TabsTrigger>
          <TabsTrigger value="voting">Voting History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>My DAOs</span>
                  <Badge variant="secondary">{daos.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">{daos.length}</p>
                <p className="text-sm text-gray-600">Active memberships</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Active Proposals</span>
                  <Badge variant="secondary">
                    {proposals.filter(p => p.status === 'active').length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {proposals.filter(p => p.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600">Requiring your vote</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Voting Power</span>
                  <Badge variant="secondary">1.0x</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-600">1.0x</p>
                <p className="text-sm text-gray-600">Base voting power</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="daos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {daos.map((dao) => (
              <Card key={dao.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{dao.name}</span>
                    <Badge className={getProposalStatusColor(dao.status)}>
                      {dao.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{dao.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Members:</span>
                      <span className="font-medium">{dao.member_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Proposals:</span>
                      <span className="font-medium">{dao.proposal_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Created:</span>
                      <span className="font-medium">
                        {new Date(dao.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => joinDAO(dao.id)}
                  >
                    Join DAO
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-6">
          <div className="space-y-6">
            {proposals.filter(p => p.status === 'active').map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{proposal.title}</span>
                    <Badge className={getProposalStatusColor(proposal.status)}>
                      {proposal.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{proposal.description}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Voting Progress</span>
                        <span>{proposal.total_votes} / {proposal.quorum}</span>
                      </div>
                      <Progress value={getProposalProgress(proposal)} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{proposal.votes_for}</p>
                        <p className="text-sm text-gray-600">For</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{proposal.votes_against}</p>
                        <p className="text-sm text-gray-600">Against</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-600">{proposal.votes_abstain}</p>
                        <p className="text-sm text-gray-600">Abstain</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => voteOnProposal(proposal.id, 'for')}
                      >
                        Vote For
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => voteOnProposal(proposal.id, 'against')}
                      >
                        Vote Against
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => voteOnProposal(proposal.id, 'abstain')}
                      >
                        Abstain
                      </Button>
                    </div>

                    <div className="text-sm text-gray-500">
                      <p>Voting ends: {new Date(proposal.end_date).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="voting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Voting History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Your voting history will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 