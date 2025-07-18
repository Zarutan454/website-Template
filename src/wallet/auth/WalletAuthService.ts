// TODO: Diese Datei muss auf Django-API migriert werden. Supabase-Logik wurde entfernt.
// Platzhalter-Implementierung, damit der Build funktioniert.

export async function loginWithWallet(address: string, walletClient: unknown): Promise<boolean> {
  throw new Error('loginWithWallet: Not implemented. Use Django API.');
}

export const WalletAuthService = {
  async signIn() {
    throw new Error('signIn: Not implemented. Use Django API.');
  },
  async signUp() {
    throw new Error('signUp: Not implemented. Use Django API.');
  },
  async signOut() {
    throw new Error('signOut: Not implemented. Use Django API.');
  },
};
