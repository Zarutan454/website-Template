
import { describe } from 'vitest';

// Diese Datei importiert alle Tests, um sicherzustellen, dass sie ausgeführt werden
describe('Application Tests', () => {
  // Importieren der Test-Dateien
  import('./hooks/usePost.test');
  import('./wallet/services/coinGeckoService.test');
  import('./wallet/services/apiService.test');
  import('./hooks/mining/utils/networkUtils.test');
  import('./hooks/mining/services/heartbeat.test');
  import('./lib/database.test');
  
  // Importieren der Services für Mining
  import('./hooks/mining/services/index.test');
});
