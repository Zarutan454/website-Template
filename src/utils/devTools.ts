import { DebugUtils } from './debugUtils';

export const setupDevTools = () => {
  if (import.meta.env.DEV) {
    // Expose error logger to window for DevTools access
    (window as unknown as Record<string, unknown>).errorLogger = DebugUtils.errorLogger;
    (window as unknown as Record<string, unknown>).debugUtils = DebugUtils;
    
    console.log('🔧 DevTools Error Logger verfügbar: window.errorLogger');
    console.log('🔧 Debug Utils verfügbar: window.debugUtils');
    
    // Expose useful methods
    (window as unknown as Record<string, unknown>).logError = DebugUtils.logError;
    (window as unknown as Record<string, unknown>).logWarning = DebugUtils.logWarning;
    (window as unknown as Record<string, unknown>).logInfo = DebugUtils.logInfo;
    (window as unknown as Record<string, unknown>).logDebug = DebugUtils.logDebug;
    
    console.log('🔧 Convenience methods verfügbar: window.logError, window.logWarning, etc.');
  }
};

// Auto-setup in development
if (import.meta.env.DEV) {
  setupDevTools();
} 