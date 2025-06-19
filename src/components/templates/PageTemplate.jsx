import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import SEO from "../SEO";

/**
 * PageTemplate - Eine Wrapper-Komponente für konsistentes Layout auf allen Seiten
 *
 * @param {Object} props - Die Komponenten-Props
 * @param {React.ReactNode} props.children - Der Inhalt, der innerhalb des Templates gerendert werden soll
 * @param {boolean} props.fullWidth - Optional: Wenn true, wird der Inhalt ohne Container-Begrenzung angezeigt
 * @param {string} props.className - Optional: Zusätzliche CSS-Klassen für den Hauptinhalt
 * @param {string} props.title - Optional: Seitentitel für SEO
 * @param {string} props.description - Optional: Seitenbeschreibung für SEO
 * @param {string} props.image - Optional: Bild-URL für Social Media
 * @param {string} props.translationKey - Optional: Übersetzungsschlüssel für Titel und Beschreibung
 * @returns {React.ReactElement} Die gerenderte PageTemplate-Komponente
 */
const PageTemplate = ({ 
  children, 
  fullWidth = false, 
  className = "",
  title = "",
  description = "",
  image = "",
  translationKey = ""
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* SEO */}
      <SEO 
        title={title}
        description={description}
        image={image}
        translationKey={translationKey}
      />
      
      {/* Header/Navbar */}
      <Navbar />

      {/* Hauptinhalt */}
      <main className={`flex-grow ${className}`}>
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PageTemplate;
