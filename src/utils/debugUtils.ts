
/**
 * Hilfsklasse für die Diagnose von verschiedenen Funktionen in der Anwendung
 */

interface ErrorLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message: string;
  context?: string;
  url: string;
  userAgent: string;
  userId?: string;
  component?: string;
  additionalData?: Record<string, unknown>;
  sessionId?: string;
}

type SafeErrorLoggerInterface = {
  isEnabled: boolean;
  logs: ErrorLog[];
  logError: (message: string, context?: string, additionalData?: Record<string, unknown>) => void;
  logWarning: (message: string, context?: string, additionalData?: Record<string, unknown>) => void;
  logInfo: (message: string, context?: string, additionalData?: Record<string, unknown>) => void;
  logDebug: (message: string, context?: string, additionalData?: Record<string, unknown>) => void;
  getLogs: () => ErrorLog[];
  clearLogs: () => void;
  enable: () => void;
  disable: () => void;
};

class SafeErrorLogger implements SafeErrorLoggerInterface {
  private static instance: SafeErrorLogger;
  public logs: ErrorLog[] = [];
  public isEnabled = false;
  private sessionId: string;
  private backendCheckDone = false;

  private constructor() {
    this.sessionId = this.generateSessionId();
    
    // Deaktiviere Error Logger komplett um Fehler zu vermeiden
    this.isEnabled = false;
    
    // Error Logger ist deaktiviert - keine Backend-Verbindung
  }

  static getInstance(): SafeErrorLogger {
    if (!SafeErrorLogger.instance) {
      SafeErrorLogger.instance = new SafeErrorLogger();
    }
    return SafeErrorLogger.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupBasicErrorHandlers() {
    try {
      // Nur globale Error Handler ohne Console-Interception
      window.addEventListener('error', (event) => {
        this.safeLog('error', event.message, 'GlobalError', {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.safeLog('error', `Unhandled Promise Rejection: ${event.reason}`, 'PromiseRejection');
      });
    } catch (error) {
      // Silent fail
    }
  }

  private safeLog(level: ErrorLog['level'], message: string, context?: string, additionalData?: Record<string, unknown>) {
    if (!this.isEnabled) return;

    try {
      const errorLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        level,
        message: this.sanitizeMessage(message),
        context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.getUserId(),
        component: this.getCurrentComponent(),
        additionalData: this.sanitizeData(additionalData),
        sessionId: this.sessionId
      };

      this.logs.push(errorLog);

      // Nur Backend API senden, kein WebSocket
      this.safeSendToBackend(errorLog);

      // Logs begrenzen
      if (this.logs.length > 50) {
        this.logs = this.logs.slice(-50);
      }

      // Einfache Console-Ausgabe ohne Farben
      console.log(`[${level.toUpperCase()}] ${message}`);
    } catch (error) {
      // Silent fail
    }
  }

  private sanitizeMessage(message: string): string {
    return message
      .replace(/password[=:]\s*\w+/gi, 'password=***')
      .replace(/token[=:]\s*\w+/gi, 'token=***')
      .replace(/key[=:]\s*\w+/gi, 'key=***')
      .substring(0, 500);
  }

  private sanitizeData(data: Record<string, unknown> | undefined): Record<string, unknown> {
    if (!data) return {};
    
    try {
      const sanitized = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
      delete sanitized.password;
      delete sanitized.token;
      delete sanitized.key;
      return sanitized;
    } catch {
      return { sanitized: true };
    }
  }

  private async safeSendToBackend(errorLog: ErrorLog) {
    try {
      // Nur einmal Backend-Check machen
      if (!this.backendCheckDone) {
        const isAvailable = await this.checkBackendAvailability();
        if (!isAvailable) {
          this.isEnabled = false;
          return;
        }
        this.backendCheckDone = true;
      }

      const apiUrl = 'http://localhost:8000/api/error-logs/';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorLog),
        signal: AbortSignal.timeout(5000) // 5 Sekunden Timeout
      });
      
      if (!response.ok) {
        // Bei Fehlern Logger deaktivieren
        this.isEnabled = false;
      }
    } catch (error) {
      // Bei Netzwerkfehlern Logger deaktivieren
      this.isEnabled = false;
    }
  }

  private async checkBackendAvailability(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:8000/api/', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(3000) // 3 Sekunden Timeout
      });
      // 401 ist OK - bedeutet Server läuft aber Auth erforderlich
      // 200 ist auch OK - bedeutet Server läuft und erreichbar
      return response.status === 200 || response.status === 401;
    } catch {
      return false;
    }
  }

  private getUserId(): string | undefined {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id;
    } catch {
      return undefined;
    }
  }

  private getCurrentComponent(): string | undefined {
    return window.location.pathname;
  }

  // Public API
  logError = (message: string, context?: string, additionalData?: Record<string, unknown>) => {
    this.safeLog('error', message, context, additionalData);
  };

  logWarning = (message: string, context?: string, additionalData?: Record<string, unknown>) => {
    this.safeLog('warning', message, context, additionalData);
  };

  logInfo = (message: string, context?: string, additionalData?: Record<string, unknown>) => {
    this.safeLog('info', message, context, additionalData);
  };

  logDebug = (message: string, context?: string, additionalData?: Record<string, unknown>) => {
    this.safeLog('debug', message, context, additionalData);
  };

  getLogs = () => [...this.logs];
  
  clearLogs = () => {
    this.logs = [];
  };

  enable = () => {
    this.isEnabled = true;
  };

  disable = () => {
    this.isEnabled = false;
  };
}

/**
 * Hilfsklasse für die Diagnose von verschiedenen Funktionen in der Anwendung
 */
export const DebugUtils = {
  /**
   * Diagnostiziert die Like-Funktion
   */
  diagnoseLikeFunction: (postId: string, userId: string, result: unknown) => {
    const likeResult = result as { 
      success?: boolean; 
      action?: string; 
      isLiked?: boolean; 
      likesCount?: number;
      error?: string;
    };
    
    return { postId, userId, result: likeResult };
  },
  
  /**
   * Diagnostiziert die YouTube-Einbettung
   */
  diagnoseYouTubeEmbed: (content: string, videoId: string | null) => {
    return { 
      content, 
      videoId, 
      hasYouTubeCom: content.includes('youtube.com'),
      hasYouTuBe: content.includes('youtu.be')
    };
  },
  
  /**
   * Diagnostiziert die Benachrichtigungsfunktion
   */
  diagnoseNotification: (notification: unknown) => {
    const notificationData = notification as {
      id?: string;
      type?: string;
      user_id?: string;
      content?: string;
      read?: boolean;
      created_at?: string;
    };
    
    return { 
      hasNotification: !!notification,
      notification: notificationData
    };
  },
  
  /**
   * Log-Methode mit farbiger Ausgabe für bessere Sichtbarkeit
   */
  colorLog: (message: string, type: 'info' | 'success' | 'warning' | 'error' | 'debug' | 'critical' = 'info') => {
    const styles = {
      info: 'color: #3498db; font-weight: bold;',
      success: 'color: #2ecc71; font-weight: bold;',
      warning: 'color: #f39c12; font-weight: bold;',
      error: 'color: #e74c3c; font-weight: bold;',
      debug: 'color: #9b59b6; font-weight: bold;',
      critical: 'color: #8e44ad; font-weight: bold;'
    };
    
    return { message, style: styles[type] };
  },

  /**
   * Error Logger Instance
   */
  errorLogger: SafeErrorLogger.getInstance(),

  /**
   * Convenience methods for logging
   */
  logError: (message: string, context?: string, additionalData?: Record<string, unknown>) => {
    DebugUtils.errorLogger.logError(message, context, additionalData);
  },

  logWarning: (message: string, context?: string, additionalData?: Record<string, unknown>) => {
    DebugUtils.errorLogger.logWarning(message, context, additionalData);
  },

  logInfo: (message: string, context?: string, additionalData?: Record<string, unknown>) => {
    DebugUtils.errorLogger.logInfo(message, context, additionalData);
  },

  logDebug: (message: string, context?: string, additionalData?: Record<string, unknown>) => {
    DebugUtils.errorLogger.logDebug(message, context, additionalData);
  },

  /**
   * Test function to check if logger is working
   */
  testLogger: () => {
    if (import.meta.env.DEV) {
      DebugUtils.logInfo('Error Logger Test - System is working', 'Test', { test: true });
      return {
        isEnabled: DebugUtils.errorLogger.isEnabled,
        logsCount: DebugUtils.errorLogger.logs.length,
        backendAvailable: true
      };
    }
    return { isEnabled: false, logsCount: 0, backendAvailable: false };
  }
};
