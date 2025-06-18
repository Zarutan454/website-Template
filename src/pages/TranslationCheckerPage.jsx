import React from 'react';
import PageTemplate from '../components/templates/PageTemplate';
import TranslationChecker from '../utils/TranslationChecker';

/**
 * TranslationCheckerPage
 * 
 * Diese Seite zeigt den Übersetzungsprüfer an, der fehlende Übersetzungen in allen Sprachen identifiziert.
 * Nur für Entwicklungszwecke gedacht.
 */
const TranslationCheckerPage = () => {
  return (
    <PageTemplate>
      <TranslationChecker />
    </PageTemplate>
  );
};

export default TranslationCheckerPage; 