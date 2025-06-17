
import { MiningRepositoryInterface } from './interfaces/MiningRepositoryInterface';
import { MiningRepository } from './mining';

/**
 * Exportiert die MiningRepository-Schnittstelle und Implementierung
 * Zentrale Stelle für alle Mining-Repository-Abhängigkeiten
 */
export type { MiningRepositoryInterface } from './interfaces/MiningRepositoryInterface';
export { MiningRepository };

// Create a singleton instance to use throughout the app
export const miningRepository = new MiningRepository();
