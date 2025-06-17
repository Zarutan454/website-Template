
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
  colorLog: (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const styles = {
      info: 'color: #3498db; font-weight: bold;',
      success: 'color: #2ecc71; font-weight: bold;',
      warning: 'color: #f39c12; font-weight: bold;',
      error: 'color: #e74c3c; font-weight: bold;'
    };
    
    return { message, style: styles[type] };
  }
};
