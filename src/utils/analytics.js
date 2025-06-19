/**
 * Analytics-Modul für die Integration von Tracking-Tools
 * Unterstützt Google Analytics, Matomo und benutzerdefinierte Events
 */

// Konfiguration für Analytics-Tools
const config = {
  enabled: typeof window !== 'undefined' && window.location.hostname !== 'localhost', // Nur in Produktion aktivieren
  googleAnalyticsId: import.meta.env?.VITE_GA_ID || '',
  matomoUrl: import.meta.env?.VITE_MATOMO_URL || '',
  matomoSiteId: import.meta.env?.VITE_MATOMO_SITE_ID || '',
};

/**
 * Initialisiert die Analytics-Tools
 */
export const initAnalytics = () => {
  if (!config.enabled) {
    console.log('Analytics im Entwicklungsmodus deaktiviert');
    return;
  }

  try {
    // Google Analytics initialisieren (wenn konfiguriert)
    if (config.googleAnalyticsId) {
      // Google Analytics Script laden
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
      document.head.appendChild(script);

      // Google Analytics konfigurieren
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', config.googleAnalyticsId, {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure',
      });

      console.log('Google Analytics initialisiert');
    }

    // Matomo initialisieren (wenn konfiguriert)
    if (config.matomoUrl && config.matomoSiteId) {
      // Matomo Script laden
      window._paq = window._paq || [];
      window._paq.push(['trackPageView']);
      window._paq.push(['enableLinkTracking']);
      
      const u = config.matomoUrl;
      window._paq.push(['setTrackerUrl', u + 'matomo.php']);
      window._paq.push(['setSiteId', config.matomoSiteId]);
      
      const script = document.createElement('script');
      script.async = true;
      script.src = u + 'matomo.js';
      document.head.appendChild(script);

      console.log('Matomo initialisiert');
    }
  } catch (error) {
    console.error('Fehler bei der Analytics-Initialisierung:', error);
  }
};

/**
 * Trackt einen Seitenaufruf
 * @param {string} path - Der Pfad der Seite
 * @param {string} title - Der Titel der Seite
 */
export const trackPageView = (path, title) => {
  if (!config.enabled) return;

  try {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title,
      });
    }

    // Matomo
    if (window._paq) {
      window._paq.push(['setCustomUrl', path]);
      window._paq.push(['setDocumentTitle', title]);
      window._paq.push(['trackPageView']);
    }
  } catch (error) {
    console.error('Fehler beim Tracking des Seitenaufrufs:', error);
  }
};

/**
 * Trackt ein benutzerdefiniertes Event
 * @param {string} category - Kategorie des Events
 * @param {string} action - Aktion des Events
 * @param {string} label - Label des Events (optional)
 * @param {number} value - Wert des Events (optional)
 */
export const trackEvent = (category, action, label = null, value = null) => {
  if (!config.enabled) return;

  try {
    // Google Analytics
    if (window.gtag) {
      const eventParams = {
        event_category: category,
        event_label: label,
      };
      
      if (value !== null) {
        eventParams.value = value;
      }
      
      window.gtag('event', action, eventParams);
    }

    // Matomo
    if (window._paq) {
      const eventParams = [category, action];
      
      if (label !== null) {
        eventParams.push(label);
      }
      
      if (value !== null) {
        eventParams.push(value);
      }
      
      window._paq.push(['trackEvent', ...eventParams]);
    }
  } catch (error) {
    console.error('Fehler beim Tracking des Events:', error);
  }
};

/**
 * Trackt einen Conversion (z.B. für Anmeldungen oder Käufe)
 * @param {string} id - ID der Conversion
 * @param {string} label - Label der Conversion
 * @param {number} value - Wert der Conversion
 */
export const trackConversion = (id, label, value) => {
  if (!config.enabled) return;

  try {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: `${config.googleAnalyticsId}/${id}`,
        value: value,
        currency: 'EUR',
      });
    }

    // Matomo
    if (window._paq) {
      window._paq.push(['trackGoal', id, value]);
    }
  } catch (error) {
    console.error('Fehler beim Tracking der Conversion:', error);
  }
};

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackConversion,
}; 