import { formatNumber } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ActiveLocksListProps {
  tokenLocks: any[];
  lpLocks: any[];
}

export const ActiveLocksList = ({ tokenLocks, lpLocks }: ActiveLocksListProps) => {
  const renderLockStatus = (unlockDate: string) => {
    const now = new Date();
    const unlock = new Date(unlockDate);
    const isLocked = unlock > now;

    return (
      <Badge variant={isLocked ? "secondary" : "outline"}>
        {isLocked ? (
          <Lock className="w-4 h-4 mr-1" />
        ) : (
          <Unlock className="w-4 h-4 mr-1" />
        )}
        {isLocked ? 'Gesperrt' : 'Entsperrt'}
      </Badge>
    );
  };

  if (tokenLocks.length === 0 && lpLocks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktive Sperrungen</CardTitle>
        <CardDescription>
          Übersicht über Ihre gesperrten Token und LP Token
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tokenLocks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Token Sperrungen</h3>
            <div className="space-y-4">
              {tokenLocks.map((lock) => (
                <div key={lock.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{lock.tokens.name} ({lock.tokens.symbol})</p>
                      <p className="text-sm text-gray-500">
                        Gesperrte Menge: {formatNumber(lock.amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Entsperrdatum: {new Date(lock.unlock_date).toLocaleDateString()}
                      </p>
                    </div>
                    {renderLockStatus(lock.unlock_date)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {lpLocks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">LP Token Sperrungen</h3>
            <div className="space-y-4">
              {lpLocks.map((lock) => (
                <div key={lock.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{lock.tokens.name} LP ({lock.tokens.symbol})</p>
                      <p className="text-sm text-gray-500">
                        Pair Adresse: {lock.pair_address}
                      </p>
                      <p className="text-sm text-gray-500">
                        Gesperrte Menge: {formatNumber(lock.amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Entsperrdatum: {new Date(lock.unlock_date).toLocaleDateString()}
                      </p>
                    </div>
                    {renderLockStatus(lock.unlock_date)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
