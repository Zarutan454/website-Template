import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AirdropRecipient {
  address: string;
  amount: string;
}

export function AirdropCreator({ tokenId }: { tokenId: string }) {
  const { address } = useAccount();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [recipients, setRecipients] = useState<AirdropRecipient[]>([]);
  const [recipientsText, setRecipientsText] = useState("");
  const { toast } = useToast();

  const parseRecipients = (text: string) => {
    try {
      const lines = text.split('\n').filter(line => line.trim());
      const parsed = lines.map(line => {
        const [address, amount] = line.split(',').map(s => s.trim());
        if (!address || !amount || isNaN(Number(amount))) throw new Error("Invalid format or amount");
        return { address, amount };
      });
      setRecipients(parsed);
      toast({
        title: "Empfänger geparst",
        description: `${parsed.length} Empfänger erfolgreich geparst`,
      });
    } catch (error) {
      toast({
        title: "Fehler beim Parsen",
        description: "Bitte überprüfen Sie das Format: Adresse,Betrag (pro Zeile)",
        variant: "destructive",
      });
    }
  };

  const createAirdrop = async () => {
    try {
      if (!address || !tokenId || recipients.length === 0) {
        toast({
          title: "Fehler",
          description: "Bitte füllen Sie alle erforderlichen Felder aus",
          variant: "destructive",
        });
        return;
      }

      const totalAmount = recipients.reduce((sum, r) => sum + Number(r.amount), 0);

      const { data: campaign, error: campaignError } = await supabase
        .from('airdrop_campaigns')
        .insert({
          token_id: tokenId,
          creator_id: address,
          name,
          description,
          total_amount: totalAmount,
          recipients_count: recipients.length,
          status: 'pending'
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      const recipientRecords = recipients.map(r => ({
        campaign_id: campaign.id,
        wallet_address: r.address,
        amount: Number(r.amount) // Convert string to number here
      }));

      const { error: recipientsError } = await supabase
        .from('airdrop_recipients')
        .insert(recipientRecords);

      if (recipientsError) throw recipientsError;

      toast({
        title: "Airdrop erstellt",
        description: "Der Airdrop wurde erfolgreich erstellt",
      });

      // Reset form
      setName("");
      setDescription("");
      setRecipientsText("");
      setRecipients([]);

    } catch (error) {
      console.error("Error creating airdrop:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen des Airdrops",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Airdrop Creator</CardTitle>
        <CardDescription>
          Erstellen Sie einen Token-Airdrop für mehrere Empfänger
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Airdrop Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Beschreibung"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Empfänger (Format: Adresse,Betrag - eine pro Zeile)"
            value={recipientsText}
            onChange={(e) => setRecipientsText(e.target.value)}
            className="h-48"
          />
          <Button onClick={() => parseRecipients(recipientsText)}>
            Empfänger überprüfen
          </Button>
        </div>

        {recipients.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              {recipients.length} Empfänger geparst
            </p>
            <Button onClick={createAirdrop}>
              Airdrop erstellen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}