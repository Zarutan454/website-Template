
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import UserSearchBar from '@/components/UserSearch/UserSearchBar';
import FriendRequestList from '@/components/UserRelationship/FriendRequestList';
import SentFriendRequestsList from '@/components/UserRelationship/SentFriendRequestsList';
import FriendsList from '@/components/UserRelationship/FriendsList';
import BlockedUsers from '@/components/UserRelationship/BlockedUsers';
import { FriendshipProvider } from '@/context/FriendshipContext';
import { motion } from 'framer-motion';
import { Users, UserPlus, Send, Shield } from 'lucide-react';

const FriendsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('friends');
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  
  return (
    <FriendshipProvider>
      <div className="min-h-screen bg-background text-foreground pt-16 lg:pt-0 lg:pl-64">
        <motion.div 
          className="container mx-auto p-4 max-w-6xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-2xl font-bold mb-6"
            variants={itemVariants}
          >
            Freunde &amp; Kontakte
          </motion.h1>
          
          <motion.div 
            className="mb-6"
            variants={itemVariants}
          >
            <UserSearchBar />
          </motion.div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <motion.div variants={itemVariants}>
              <TabsList className="w-full justify-start mb-6 bg-muted/50">
                <TabsTrigger value="friends" className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Freunde</span>
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span>Erhaltene</span>
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex items-center">
                  <Send className="h-4 w-4 mr-2" />
                  <span>Gesendet</span>
                </TabsTrigger>
                <TabsTrigger value="blocked" className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Blockiert</span>
                </TabsTrigger>
              </TabsList>
            </motion.div>
            
            <TabsContent value="friends">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Meine Freunde</CardTitle>
                    <CardDescription>
                      Hier findest du alle deine Verbindungen in BSN
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FriendsList />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="requests">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Erhaltene Freundschaftsanfragen</CardTitle>
                    <CardDescription>
                      Bearbeite erhaltene Freundschaftsanfragen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FriendRequestList />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="sent">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Gesendete Freundschaftsanfragen</CardTitle>
                    <CardDescription>
                      Verwalte deine gesendeten Anfragen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SentFriendRequestsList />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="blocked">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Blockierte Nutzer</CardTitle>
                    <CardDescription>
                      Verwalte Nutzer, die du blockiert hast
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BlockedUsers />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </FriendshipProvider>
  );
};

export default FriendsPage;
