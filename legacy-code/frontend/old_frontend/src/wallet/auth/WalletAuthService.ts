
import { supabase } from "@/lib/supabase";
import { Account, createWalletClient, custom, WalletClient } from 'viem';
import { toast } from 'sonner';

/**
 * Hilfsfunktion zur Erzeugung einer Nonce
 */
const generateNonce = (): string => {
  return Math.floor(Math.random() * 1000000).toString();
};

/**
 * Prüft, ob ein Wallet-Profil existiert und erstellt eines, wenn nötig
 */
export const getOrCreateWalletProfile = async (address: string): Promise<{ success: boolean; nonce?: string; error?: unknown }> => {
  try {
    // Prüfen, ob bereits ein Profil mit dieser Wallet-Adresse existiert
    const { data: existingProfile, error: fetchError } = await supabase
      .from('users')
      .select('id, wallet_address, eth_nonce')
      .eq('wallet_address', address.toLowerCase())
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Wenn ein Profil existiert, nutze die existierende Nonce oder erzeuge eine neue
    if (existingProfile) {
      const nonce = existingProfile.eth_nonce || generateNonce();
      
      // Aktualisiere die Nonce, falls sie nicht existiert
      if (!existingProfile.eth_nonce) {
        await supabase
          .from('users')
          .update({ eth_nonce: nonce })
          .eq('wallet_address', address.toLowerCase());
      }
      
      return { success: true, nonce };
    }

    // Wenn kein Profil existiert, erstelle ein neues
    const nonce = generateNonce();
    const username = `user_${address.substring(2, 8)}`;
    
    // Erstelle neues Profil
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        wallet_address: address.toLowerCase(),
        eth_nonce: nonce,
        username: username,
        display_name: `Wallet User ${address.substring(2, 8)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) throw insertError;

    return { success: true, nonce };
  } catch (error) {
    console.error('Fehler beim Erstellen/Abrufen des Wallet-Profils:', error);
    return { success: false, error };
  }
};

/**
 * Erstellt eine signierte Nachricht und authentifiziert den Benutzer
 */
export const authenticateWithWallet = async (address: string, walletClient: WalletClient): Promise<boolean> => {
  try {
    // Hole oder erstelle ein Profil für die Wallet-Adresse
    const profileResult = await getOrCreateWalletProfile(address);
    
    if (!profileResult.success || !profileResult.nonce) {
      throw new Error('Konnte kein Profil für diese Wallet-Adresse erstellen');
    }

    // Erstelle die Nachricht zum Signieren
    const message = `Authentifiziere mit BSN Network\nNonce: ${profileResult.nonce}`;
    
    // Signiere die Nachricht mit der Wallet
    const signature = await walletClient.signMessage({
      message,
      account: address as `0x${string}`
    });

    // Verifiziere die Signatur und führe die Anmeldung bei Supabase durch
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${address.toLowerCase()}@wallet.bsn.network`,
      password: signature.substring(2, 34) // Sichere Art, ein Passwort zu erstellen, das nur der Wallet-Besitzer kennt
    });

    // Behandle den Fall, dass der Benutzer nicht existiert - registriere ihn
    if (error && error.message.includes('Invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: `${address.toLowerCase()}@wallet.bsn.network`,
        password: signature.substring(2, 34),
        options: {
          data: {
            wallet_address: address.toLowerCase()
          }
        }
      });

      if (signUpError) throw signUpError;
      
      if (signUpData?.user) {
        toast.success('Wallet erfolgreich verbunden und neuer Account erstellt');
        return true;
      }
    } else if (error) {
      throw error;
    }

    if (data?.user) {
      toast.success('Wallet erfolgreich authentifiziert');
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('Authentifizierungsfehler:', error);
    toast.error(`Authentifizierungsfehler: ${error.message || 'Unbekannter Fehler'}`);
    return false;
  }
};

/**
 * Wrapper-Funktion für die Wallet-Authentifizierung
 */
export const loginWithWallet = async (address: string, walletClient: WalletClient): Promise<boolean> => {
  try {
    const success = await authenticateWithWallet(address, walletClient);
    return success;
  } catch (error: any) {
    console.error('Wallet-Login-Fehler:', error);
    toast.error(`Login fehlgeschlagen: ${error.message || 'Unbekannter Fehler'}`);
    return false;
  }
};
