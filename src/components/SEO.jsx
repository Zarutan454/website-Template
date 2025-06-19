import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { languages } from '../translations/i18n';
import { safeT } from '../utils/i18nUtils';

/**
 * SEO-Komponente für die Verwaltung von Meta-Tags und anderen SEO-relevanten Elementen
 * 
 * @param {Object} props - Komponenten-Props
 * @param {string} props.title - Seitentitel
 * @param {string} props.description - Seitenbeschreibung
 * @param {string} props.image - URL des Bildes für Social Media (optional)
 * @param {Object} props.meta - Zusätzliche Meta-Tags (optional)
 * @param {Array} props.links - Zusätzliche Link-Tags (optional)
 * @param {string} props.type - Typ der Seite (z.B. 'website', 'article') (optional)
 * @param {string} props.translationKey - Übersetzungsschlüssel für Titel und Beschreibung (optional)
 * @returns {React.ReactElement}
 */
const SEO = ({
  title,
  description,
  image = '/bsn-og-image.png',
  meta = {},
  links = [],
  type = 'website',
  translationKey = ''
}) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  
  // Verwende Übersetzungen, wenn ein Übersetzungsschlüssel angegeben ist
  const pageTitle = translationKey 
    ? safeT(`${translationKey}.title`, title)
    : title;
    
  const pageDescription = translationKey 
    ? safeT(`${translationKey}.description`, description)
    : description;
  
  // Erstelle die kanonische URL
  const canonicalUrl = `${window.location.origin}${location.pathname}`;
  
  // Erstelle die URL mit Sprachpräfix
  const getUrlWithLanguage = (langCode) => {
    const pathWithoutLang = location.pathname.split('/').filter(Boolean);
    
    // Entferne den Sprachcode, falls vorhanden
    if (languages.some(lang => lang.code === pathWithoutLang[0])) {
      pathWithoutLang.shift();
    }
    
    return `${window.location.origin}/${langCode}/${pathWithoutLang.join('/')}`;
  };
  
  // Erstelle hreflang-Tags für alle unterstützten Sprachen
  const hrefLangLinks = languages.map(lang => ({
    rel: 'alternate',
    hrefLang: lang.code,
    href: getUrlWithLanguage(lang.code)
  }));
  
  // Füge x-default hreflang hinzu
  hrefLangLinks.push({
    rel: 'alternate',
    hrefLang: 'x-default',
    href: getUrlWithLanguage('en') // Englisch als Standard
  });
  
  // Kombiniere alle Link-Tags
  const allLinks = [
    { rel: 'canonical', href: canonicalUrl },
    ...hrefLangLinks,
    ...links
  ];
  
  // Erstelle Meta-Tags für soziale Medien
  const socialMeta = [
    { property: 'og:title', content: pageTitle },
    { property: 'og:description', content: pageDescription },
    { property: 'og:image', content: `${window.location.origin}${image}` },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: 'Blockchain Social Network' },
    { property: 'og:locale', content: i18n.language },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: pageTitle },
    { name: 'twitter:description', content: pageDescription },
    { name: 'twitter:image', content: `${window.location.origin}${image}` }
  ];
  
  // Kombiniere alle Meta-Tags
  const allMeta = [
    { name: 'description', content: pageDescription },
    { name: 'language', content: i18n.language },
    ...socialMeta,
    ...Object.entries(meta).map(([name, content]) => ({ name, content }))
  ];
  
  return (
    <Helmet
      title={pageTitle}
      titleTemplate="%s | Blockchain Social Network"
      meta={allMeta}
      link={allLinks}
    >
      {/* Strukturierte Daten für Google */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Blockchain Social Network',
          url: window.location.origin,
          description: pageDescription,
          inLanguage: i18n.language
        })}
      </script>
    </Helmet>
  );
};

export default SEO; 