import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const FriendsList: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Freunde
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-4">
          <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm">Freunde-Funktion wird bald verfügbar sein</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendsList;
