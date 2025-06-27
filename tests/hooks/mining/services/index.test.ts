
import { describe, it } from 'vitest';

// Diese Datei importiert alle Tests, um sicherzustellen, dass sie ausgeführt werden
describe('Mining Services Tests', () => {
  it('Importiert alle Test-Dateien', () => {
    // Dieser Test dient nur dazu, sicherzustellen, dass die Test-Suite läuft
    expect(true).toBe(true);
  });
});

// Importieren Sie hier alle Tests, um sicherzustellen, dass sie ausgeführt werden
import './sessions.test';
import './intervals.test';
import './heartbeat.test';
import './maintenance.test';

