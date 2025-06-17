
import { describe } from 'vitest';

// Diese Datei importiert alle Tests, um sicherzustellen, dass sie ausgeführt werden
describe('Application Tests', () => {
  // Importieren der Test-Dateien
  require('./hooks/usePost.test');
  require('./wallet/services/coinGeckoService.test');
  require('./wallet/services/apiService.test');
  require('./hooks/mining/utils/networkUtils.test');
  require('./hooks/mining/services/heartbeat.test');
  require('./lib/database.test');
  
  // Importieren der Services für Mining
  require('./hooks/mining/services/index.test');
});
