import React from 'react';
import { useTranslation } from 'react-i18next';
import PageTemplate from '../components/templates/PageTemplate';
import SectionTitle from '../components/ui/SectionTitle';
import EnhancedBackground from '../components/ui/EnhancedBackground';
import { safeT, safeObjectT } from '../utils/i18nUtils';
import i18n from '../translations/i18n';

const AboutPage = () => {
  const { t } = useTranslation();

  // Team-Mitglieder mit Fallback-Werten
  const defaultTeamMembers = [
    {
      name: "Dr. Sarah Müller",
      role: "Gründerin & CEO",
      bio: "Blockchain-Expertin mit 10+ Jahren Erfahrung. Ehemalige Beraterin bei McKinsey mit Fokus auf digitale Transformation.",
      image: "/team/placeholder.svg",
      social: {
        twitter: "https://twitter.com/sarahmueller",
        linkedin: "https://linkedin.com/in/sarahmueller",
        github: "https://github.com/sarahmueller"
      }
    },
    {
      name: "Michael Weber",
      role: "CTO",
      bio: "Ehemaliger Lead Developer bei Ethereum. Spezialist für Smart Contracts und dezentrale Anwendungen.",
      image: "/team/placeholder.svg",
      social: {
        twitter: "https://twitter.com/michaelweber",
        linkedin: "https://linkedin.com/in/michaelweber",
        github: "https://github.com/michaelweber"
      }
    },
    {
      name: "Lisa Schmidt",
      role: "Head of Product",
      bio: "Produktmanagerin mit Erfahrung bei Facebook und Twitter. Fokus auf Nutzerfreundlichkeit und Community-Building.",
      image: "/team/placeholder.svg",
      social: {
        twitter: "https://twitter.com/lisaschmidt",
        linkedin: "https://linkedin.com/in/lisaschmidt",
        github: "https://github.com/lisaschmidt"
      }
    },
    {
      name: "Thomas Klein",
      role: "Lead Blockchain Developer",
      bio: "Blockchain-Entwickler mit Erfahrung bei ConsenSys. Experte für Solidity und dezentrale Protokolle.",
      image: "/team/placeholder.svg",
      social: {
        twitter: "https://twitter.com/thomasklein",
        linkedin: "https://linkedin.com/in/thomasklein",
        github: "https://github.com/thomasklein"
      }
    },
    {
      name: "Anna Wagner",
      role: "Community Manager",
      bio: "Erfahrene Community-Managerin mit Hintergrund in dezentralen Governance-Systemen und DAO-Management.",
      image: "/team/placeholder.svg",
      social: {
        twitter: "https://twitter.com/annawagner",
        linkedin: "https://linkedin.com/in/annawagner",
        github: "https://github.com/annawagner"
      }
    },
    {
      name: "Markus Bauer",
      role: "Security Lead",
      bio: "Cybersecurity-Experte mit Fokus auf Blockchain-Sicherheit. Ehemaliger Berater für die Europäische Zentralbank.",
      image: "/team/placeholder.svg",
      social: {
        twitter: "https://twitter.com/markusbauer",
        linkedin: "https://linkedin.com/in/markusbauer",
        github: "https://github.com/markusbauer"
      }
    }
  ];

  // Versuche, die Übersetzungen für das Team zu laden
  let teamMembers = [...defaultTeamMembers];
  
  try {
    // Hole das gesamte Übersetzungsressourcenbundle für die aktuelle Sprache
    const resources = i18n.getResourceBundle(i18n.language, 'translation');
    
    if (resources && resources.aboutPage && resources.aboutPage.team && 
        Array.isArray(resources.aboutPage.team.members)) {
      // Kombiniere die übersetzten Daten mit den Standard-Social-Media-Links und Bildern
      teamMembers = resources.aboutPage.team.members.map((member, index) => {
        return {
          ...member,
          image: defaultTeamMembers[index]?.image || "/team/placeholder.svg",
          social: defaultTeamMembers[index]?.social || {
            twitter: "#",
            linkedin: "#",
            github: "#"
          }
        };
      });
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Team-Übersetzungen:", error);
  }
  
  // Als zusätzliche Sicherheitsmaßnahme stellen wir sicher, dass es ein Array ist
  if (!Array.isArray(teamMembers)) {
    teamMembers = [...defaultTeamMembers];
  }

  // Meilensteine mit Fallback-Werten
  const defaultMilestones = [
    {
      year: "2019",
      title: "Gründung",
      description: "BSN wurde mit der Vision gegründet, ein dezentrales soziales Netzwerk zu schaffen, das die Kontrolle zurück in die Hände der Nutzer legt."
    },
    {
      year: "2020",
      title: "Seed-Finanzierung",
      description: "Erfolgreiche Seed-Finanzierungsrunde mit 2,5 Millionen Euro von führenden Blockchain-VCs."
    },
    {
      year: "2021",
      title: "Alpha-Version",
      description: "Veröffentlichung der ersten Alpha-Version mit grundlegenden sozialen Funktionen und Wallet-Integration."
    },
    {
      year: "2022",
      title: "Beta-Launch",
      description: "Öffentliche Beta-Version mit erweitertem Funktionsumfang und verbesserter Benutzeroberfläche."
    },
    {
      year: "2023",
      title: "Token-Launch",
      description: "Erfolgreicher Start des BSN-Tokens mit Notierung an mehreren dezentralen Börsen."
    },
    {
      year: "2024",
      title: "Vollständiger Launch",
      description: "Offizieller Launch der BSN-Plattform mit allen Kernfunktionen und einer wachsenden Community."
    }
  ];

  // Robustere Implementierung zum Laden der Übersetzungen
  let milestones = [...defaultMilestones]; // Mit Standard-Werten initialisieren
  
  try {
    // Hole das gesamte Übersetzungsressourcenbundle für die aktuelle Sprache
    const resources = i18n.getResourceBundle(i18n.language, 'translation');
    
    console.log("Gefundene Übersetzungsressourcen:", resources?.aboutPage?.milestones);
    
    if (resources && resources.aboutPage && resources.aboutPage.milestones && 
        Array.isArray(resources.aboutPage.milestones.items)) {
      milestones = [...resources.aboutPage.milestones.items];
      console.log("Milestones aus Übersetzungen geladen:", milestones);
    } else {
      console.warn("Keine gültigen Milestones in den Übersetzungen gefunden, verwende Standardwerte");
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Milestones-Übersetzungen:", error);
  }
  
  // Als zusätzliche Sicherheitsmaßnahme stellen wir sicher, dass es ein Array ist
  if (!Array.isArray(milestones) || milestones.length === 0) {
    console.warn("Milestones sind kein Array oder leer, verwende Standardwerte");
    milestones = [...defaultMilestones];
  }
  
  console.log("Finale Milestones:", milestones);

  // Partner
  const partners = [
    { name: "Ethereum Foundation", logo: "/images/partners/ethereum.svg" },
    { name: "Polkadot", logo: "/images/partners/polkadot.svg" },
    { name: "Chainlink", logo: "/images/partners/chainlink.svg" },
    { name: "Aave", logo: "/images/partners/aave.svg" },
    { name: "The Graph", logo: "/images/partners/thegraph.svg" },
    { name: "Polygon", logo: "/images/partners/polygon.svg" }
  ];

  return (
    <PageTemplate>
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <EnhancedBackground type="hexagons" />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle 
            title={safeT(t('aboutPage.title'), 'Über BSN')} 
            subtitle={safeT(t('aboutPage.subtitle'), 'Unsere Mission, Vision und das Team hinter dem Blockchain Social Network')}
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-light text-[#00a2ff] mb-4">{safeT(t('aboutPage.mission.title'), 'Unsere Mission')}</h2>
              <p className="text-white/80 mb-6 text-lg">
                {safeT(t('aboutPage.mission.paragraph1'), 'BSN wurde mit einer klaren Mission gegründet: Die Macht über soziale Netzwerke zurück in die Hände der Nutzer zu legen. Wir glauben, dass deine Daten dir gehören sollten, nicht den großen Tech-Konzernen.')}
              </p>
              <p className="text-white/80 mb-6 text-lg">
                {safeT(t('aboutPage.mission.paragraph2'), 'Durch die Integration von Blockchain-Technologie schaffen wir ein transparentes, dezentrales und nutzerorientiertes soziales Netzwerk, das die Privatsphäre respektiert und gleichzeitig neue Möglichkeiten für Interaktion und Wertschöpfung bietet.')}
              </p>
              <p className="text-white/80 text-lg">
                {safeT(t('aboutPage.mission.paragraph3'), 'Unser Ziel ist es, eine Plattform zu schaffen, die nicht nur technologisch fortschrittlich ist, sondern auch ethisch und nachhaltig betrieben wird - mit einer Community, die aktiv an der Governance teilnimmt.')}
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-light text-[#00a2ff] mb-4">{safeT(t('aboutPage.vision.title'), 'Unsere Vision')}</h2>
              <p className="text-white/80 mb-6 text-lg">
                {safeT(t('aboutPage.vision.paragraph1'), 'Wir sehen eine Zukunft, in der soziale Netzwerke nicht mehr von zentralisierten Unternehmen kontrolliert werden, sondern von den Nutzern selbst - transparent, fair und gemeinschaftlich.')}
              </p>
              <p className="text-white/80 mb-6 text-lg">
                {safeT(t('aboutPage.vision.paragraph2'), 'BSN soll die Brücke zwischen der traditionellen Web2-Welt und dem aufkommenden Web3-Ökosystem schlagen, indem es die Benutzerfreundlichkeit klassischer sozialer Medien mit den Vorteilen der Blockchain-Technologie verbindet.')}
              </p>
              <p className="text-white/80 text-lg">
                {safeT(t('aboutPage.vision.paragraph3'), 'Langfristig streben wir an, ein vollständig dezentrales Protokoll zu werden, das von der Community getragen und weiterentwickelt wird - ein wahrhaft demokratisches soziales Netzwerk für das digitale Zeitalter.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meilensteine */}
      <section id="milestones" className="py-20 relative overflow-hidden bg-black/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-light text-center text-white mb-16">{safeT(t('aboutPage.milestones.title'), 'Unsere Meilensteine')}</h2>
          
          <div className="relative">
            {/* Zeitleiste */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#00a2ff]/80 via-[#00a2ff]/30 to-transparent"></div>
            
            <div className="space-y-24">
              {milestones.map((milestone, index) => (
                <div 
                  key={index} 
                  className={`relative flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center`}
                >
                  {/* Jahr */}
                  <div className={`absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-0 bg-[#00a2ff] text-white rounded-full w-12 h-12 flex items-center justify-center z-10`}>
                    {milestone.year}
                  </div>
                  
                  {/* Inhalt */}
                  <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-16 text-right' : 'md:pl-16 text-left'}`}>
                    <h3 className="text-2xl font-light text-[#00a2ff] mb-2">{milestone.title}</h3>
                    <p className="text-white/70">{milestone.description}</p>
                  </div>
                  
                  {/* Leerer Platz für die andere Seite */}
                  <div className="hidden md:block w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-20 relative overflow-hidden">
        <EnhancedBackground type="particles" />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle 
            title={safeT(t('aboutPage.team.title'), 'Unser Team')}
            subtitle={safeT(t('aboutPage.team.subtitle'), 'Die Köpfe hinter BSN')}
          />
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={index} 
                className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 hover:border-[#00a2ff]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00a2ff]/10"
              >
                <div className="flex items-center mb-6">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-20 h-20 rounded-full mr-4 object-cover border-2 border-[#00a2ff]/30"
                  />
                  <div>
                    <h3 className="text-xl font-medium text-white">{member.name}</h3>
                    <p className="text-[#00a2ff]">{member.role}</p>
                  </div>
                </div>
                
                <p className="text-white/70 mb-6">{member.bio}</p>
                
                <div className="flex space-x-4">
                  <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#00a2ff] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                    </svg>
                  </a>
                  <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#00a2ff] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                    </svg>
                  </a>
                  <a href={member.social.github} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#00a2ff] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner */}
      <section id="partners" className="py-20 relative overflow-hidden bg-black/30">
        <div className="container mx-auto px-6">
          <SectionTitle 
            title={safeT(t('aboutPage.partners.title'), 'Unsere Partner')}
            subtitle={safeT(t('aboutPage.partners.subtitle'), 'Gemeinsam bauen wir die Zukunft der sozialen Netzwerke')}
          />
          
          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partners.map((partner, index) => (
              <div 
                key={index} 
                className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 hover:border-[#00a2ff]/40 transition-all duration-300 flex flex-col items-center justify-center hover:shadow-lg hover:shadow-[#00a2ff]/10"
              >
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className="h-16 w-auto mb-4 opacity-80 hover:opacity-100 transition-opacity filter drop-shadow-[0_0_8px_rgba(0,162,255,0.5)]"
                />
                <p className="text-white/80 text-center text-sm font-light">{partner.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageTemplate>
  );
};

export default AboutPage;
