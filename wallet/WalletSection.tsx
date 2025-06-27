import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Link, Shield, AlertCircle } from "lucide-react";
import type { Profile } from "@/types/user";

interface WalletSectionProps {
  profile: Profile;
}

export const WalletSection = ({ profile }: WalletSectionProps) => {
  return (
    <Card className="p-6 mb-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">Wallet</h2>
        </div>
        {!profile.wallet_address && (
          <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
            <Link className="w-4 h-4 mr-2" />
            Wallet verbinden
          </Button>
        )}
      </div>

      {profile.wallet_address ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">Verifiziert</span>
            </div>
            <code className="text-sm bg-gray-50 px-2 py-1 rounded text-gray-700">
              {profile.wallet_address}
            </code>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2 text-gray-500">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Keine Wallet verbunden</span>
        </div>
      )}
    </Card>
  );
};
