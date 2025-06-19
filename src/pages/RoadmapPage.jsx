import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import PageTemplate from '../components/templates/PageTemplate';
import SectionTitle from '../components/ui/SectionTitle';
import EnhancedBackground from '../components/ui/EnhancedBackground';
import { safeT } from '../utils/i18nUtils';

const RoadmapPage = () => {
  const { t, i18n } = useTranslation();
  const [activeQuarter, setActiveQuarter] = useState('2024-Q2');
  
  // Roadmap-Daten - Fallback für den Fall, dass keine Übersetzungen gefunden werden
  const defaultPast = [
    {
      period: "2023-Q1",
      title: "Konzeptphase",
      description: "Entwicklung des Konzepts und der Vision für BSN",
      milestones: [
        { title: "Marktanalyse", status: "completed" },
        { title: "Konzeptentwicklung", status: "completed" },
        { title: "Team-Aufbau", status: "completed" }
      ]
    },
    {
      period: "2023-Q2",
      title: "Seed-Finanzierung",
      description: "Sicherung der ersten Finanzierungsrunde",
      milestones: [
        { title: "Pitch-Deck Erstellung", status: "completed" },
        { title: "Investorengespräche", status: "completed" },
        { title: "Seed-Runde Abschluss", status: "completed" }
      ]
    }
  ];
  
  const defaultCurrent = [
    {
      period: "2024-Q2",
      title: "Beta-Launch",
      description: "Öffentliche Beta-Version mit ersten Nutzern",
      milestones: [
        { title: "Öffentliche Beta-Version", status: "in-progress" },
        { title: "Community-Aufbau", status: "in-progress" },
        { title: "Feedback-Integration", status: "planned" }
      ]
    }
  ];
  
  const defaultFuture = [
    {
      period: "2024-Q3",
      title: "Token-Presale",
      description: "Vorbereitung und Durchführung des Token-Presales",
      milestones: [
        { title: "Tokenomics-Finalisierung", status: "planned" },
        { title: "Smart Contract Audit", status: "planned" },
        { title: "Presale-Durchführung", status: "planned" }
      ]
    },
    {
      period: "2024-Q4",
      title: "Mainnet-Launch",
      description: "Offizieller Launch der BSN-Plattform",
      milestones: [
        { title: "Finale Testphase", status: "planned" },
        { title: "Mainnet-Deployment", status: "planned" },
        { title: "Marketing-Kampagne", status: "planned" }
      ]
    }
  ];

  // Versuche, die Übersetzungen aus dem i18n-Ressourcenbundle zu bekommen
  let roadmapData = { 
    past: Array.isArray(defaultPast) ? [...defaultPast] : [],
    current: Array.isArray(defaultCurrent) ? [...defaultCurrent] : [],
    future: Array.isArray(defaultFuture) ? [...defaultFuture] : []
  };
  
  try {
    // Hole das gesamte Übersetzungsressourcenbundle für die aktuelle Sprache
    const resources = i18n.getResourceBundle(i18n.language, 'translation');
    
    if (resources && resources.roadmapPage) {
      console.log("Gefundene Roadmap-Daten:", resources.roadmapPage);
      
      // Prüfe explizit, ob die Übersetzungsdaten Arrays sind
      if (Array.isArray(resources.roadmapPage.past)) {
        roadmapData.past = [...resources.roadmapPage.past];
      } else {
        console.warn("roadmapPage.past ist kein Array:", resources.roadmapPage.past);
      }
      
      if (Array.isArray(resources.roadmapPage.current)) {
        roadmapData.current = [...resources.roadmapPage.current];
      } else {
        console.warn("roadmapPage.current ist kein Array:", resources.roadmapPage.current);
      }
      
      if (Array.isArray(resources.roadmapPage.future)) {
        roadmapData.future = [...resources.roadmapPage.future];
      } else {
        console.warn("roadmapPage.future ist kein Array:", resources.roadmapPage.future);
      }
    } else {
      console.warn("Keine Roadmap-Daten in den Übersetzungen gefunden");
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Roadmap-Übersetzungen:", error);
  }
  
  // Stellt sicher, dass alle Arrays initialisiert sind, selbst wenn die obigen Versuche fehlschlagen
  if (!Array.isArray(roadmapData.past)) roadmapData.past = [...defaultPast];
  if (!Array.isArray(roadmapData.current)) roadmapData.current = [...defaultCurrent];
  if (!Array.isArray(roadmapData.future)) roadmapData.future = [...defaultFuture];
  
  console.log("Finale Roadmap-Daten:", roadmapData);

  // Alle Perioden für die Navigation
  const allPeriods = [
    ...roadmapData.past.map(item => item.period),
    ...roadmapData.current.map(item => item.period),
    ...roadmapData.future.map(item => item.period)
  ];

  // Aktuelle Roadmap-Phase finden
  const findActivePhase = (period) => {
    const allPhases = [...roadmapData.past, ...roadmapData.current, ...roadmapData.future];
    return allPhases.find(phase => phase.period === period);
  };

  const activePhase = findActivePhase(activeQuarter);

  // Status-Badge Komponente
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      completed: "bg-green-500 text-white",
      "in-progress": "bg-[#00a2ff] text-white",
      planned: "bg-gray-500 text-white"
    };
    
    const statusLabels = {
      completed: safeT(t, 'roadmapPage.statusCompleted', "Abgeschlossen"),
      "in-progress": safeT(t, 'roadmapPage.statusInProgress', "In Arbeit"),
      planned: safeT(t, 'roadmapPage.statusPlanned', "Geplant")
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs ${statusStyles[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  return (
    <PageTemplate>
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <EnhancedBackground type="hexagons" />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle 
            title={safeT(t, 'roadmapPage.title', "BSN Roadmap")}
            subtitle={safeT(t, 'roadmapPage.subtitle', "Unsere Entwicklungsphasen und Meilensteine auf dem Weg zur dezentralen sozialen Plattform")}
          />

          {/* Timeline Navigation */}
          <div className="mt-16 overflow-x-auto">
            <div className="flex min-w-max space-x-1 p-1 bg-black/40 backdrop-blur-md rounded-xl">
              {allPeriods.map((period) => {
                const isPast = roadmapData.past.some(item => item.period === period);
                const isCurrent = roadmapData.current.some(item => item.period === period);
                const isFuture = roadmapData.future.some(item => item.period === period);
                
                return (
                  <button
                    key={period}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      activeQuarter === period
                        ? 'bg-[#00a2ff] text-white'
                        : isPast
                        ? 'bg-gray-800/50 text-white/70 hover:bg-gray-700/50'
                        : isCurrent
                        ? 'bg-[#00a2ff]/20 text-[#00a2ff] hover:bg-[#00a2ff]/30'
                        : 'bg-gray-900/50 text-white/50 hover:bg-gray-800/50'
                    }`}
                    onClick={() => setActiveQuarter(period)}
                  >
                    {period}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Quarter Details */}
          {activePhase && (
            <div className="mt-12 bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-light text-[#00a2ff]">{activePhase.title}</h2>
                  <p className="text-white/70 mt-2">{activePhase.description}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="text-xl font-light text-white bg-[#00a2ff]/20 px-4 py-2 rounded-full">
                    {activePhase.period}
                  </span>
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-xl font-medium text-white">{safeT(t, 'roadmapPage.milestones', "Meilensteine")}</h3>
                <div className="space-y-4">
                  {activePhase.milestones.map((milestone, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 border border-gray-800 rounded-lg hover:border-[#00a2ff]/40 transition-all"
                    >
                      <span className="text-white">{milestone.title}</span>
                      <StatusBadge status={milestone.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-light text-white mb-6">{safeT(t, 'roadmapPage.ctaTitle', "Möchtest du Teil unserer Reise werden?")}</h2>
          <p className="text-white/70 mb-10 max-w-2xl mx-auto">
            {safeT(t, 'roadmapPage.ctaDescription', "Schließe dich uns an und hilf mit, die Zukunft sozialer Netzwerke zu gestalten. Gemeinsam bauen wir eine Plattform, die den Nutzern gehört.")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/token-reservation" 
              className="bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-[#00a2ff]/20 transition duration-300 text-lg"
            >
              {safeT(t, 'common.tokenReservation', "Token reservieren")}
            </a>
            <a 
              href="/community" 
              className="bg-transparent border border-[#00a2ff] text-[#00a2ff] px-8 py-3 rounded-full hover:bg-[#00a2ff]/10 transition duration-300 text-lg"
            >
              {safeT(t, 'common.joinCommunity', "Community beitreten")}
            </a>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
};

export default RoadmapPage;
