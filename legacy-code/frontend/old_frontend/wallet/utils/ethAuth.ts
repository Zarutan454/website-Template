
import { type WalletClient } from 'viem';
import { supabase } from "@/integrations/supabase/client";

export const authenticateWithEthereum = async (address: string, walletClient: WalletClient): Promise<boolean> => {
  try {
    // Hole die Nonce aus dem Profil des Benutzers
    const { data: profile } = await supabase
      .from('profiles')
      .select('eth_nonce')
      .eq('wallet_address', address)
      .single();

    if (!profile?.eth_nonce) {
      throw new Error('Keine Nonce für diese Adresse gefunden');
    }

    // Erstelle die Nachricht zum Signieren
    const message = `Authentifiziere mit Nonce: ${profile.eth_nonce}`;
    
    // Signiere die Nachricht mit dem Wallet-Client mit dem erforderlichen Account-Parameter
    const signature = await walletClient.signMessage({
      message,
      account: address as `0x${string}`
    });

    // Überprüfe die Signatur auf dem Backend
    const { error } = await supabase.functions.invoke('verify-signature', {
      body: { address, message, signature }
    });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Authentifizierungsfehler:', error);
    return false;
  }
};
