import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageTemplate from '../components/templates/PageTemplate';
import SectionTitle from '../components/ui/SectionTitle';
import EnhancedBackground from '../components/ui/EnhancedBackground';
import { safeT, safeObjectT } from '../utils/i18nUtils';

const DocumentationPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  
  // URL-Hash beim Laden der Seite überprüfen und entsprechenden Tab aktivieren
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && defaultDocumentationCategories.some(cat => cat.id === hash)) {
      setActiveTab(hash);
    }
  }, []);

  // Standardwerte für Dokumentationskategorien
  const defaultDocumentationCategories = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'whitepaper', label: 'Whitepaper' },
    { id: 'api', label: 'API-Dokumentation' },
    { id: 'guides', label: 'Anleitungen' },
    { id: 'faq', label: 'FAQ' }
  ];

  // Versuche, die Übersetzungen zu laden, mit Fallback auf die Standardwerte
  const documentationCategories = safeObjectT(t, 'documentationPage.categories', defaultDocumentationCategories);

  // Standardwerte für Anleitungen
  const defaultGuides = [
    {
      title: "Erste Schritte mit BSN",
      description: "Lerne die Grundlagen von BSN kennen und erstelle dein erstes Profil.",
      icon: "🚀",
      link: "/docs/getting-started"
    },
    {
      title: "Wallet-Integration",
      description: "Verbinde deine Krypto-Wallet mit BSN und nutze alle Blockchain-Features.",
      icon: "💼",
      link: "/docs/wallet-integration"
    },
    {
      title: "Content-Erstellung",
      description: "Erstelle ansprechenden Content und verdiene BSN-Tokens durch Mining.",
      icon: "✍️",
      link: "/docs/content-creation"
    },
    {
      title: "Community-Gruppen",
      description: "Erstelle und verwalte deine eigenen Community-Gruppen auf BSN.",
      icon: "👥",
      link: "/docs/community-groups"
    },
    {
      title: "NFT-Erstellung",
      description: "Erstelle und verkaufe deine eigenen NFTs auf dem BSN-Marktplatz.",
      icon: "🖼️",
      link: "/docs/nft-creation"
    },
    {
      title: "DAO-Governance",
      description: "Nimm an der dezentralen Governance von BSN teil und stimme über Vorschläge ab.",
      icon: "🏛️",
      link: "/docs/dao-governance"
    }
  ];

  // Versuche, die Übersetzungen zu laden, mit Fallback auf die Standardwerte
  const guides = safeObjectT(t, 'documentationPage.guides.items', defaultGuides);

  // Standardwerte für FAQ-Einträge
  const defaultFaqItems = [
    {
      question: "Was ist BSN?",
      answer: "BSN (Blockchain Social Network) ist ein dezentrales soziales Netzwerk, das auf Blockchain-Technologie basiert. Es gibt den Nutzern die volle Kontrolle über ihre Daten und ermöglicht neue Formen der Interaktion und Wertschöpfung."
    },
    {
      question: "Wie funktioniert das Token-Mining?",
      answer: "BSN verwendet einen Proof-of-Contribution-Mechanismus, bei dem Nutzer für wertvolle Beiträge zum Netzwerk belohnt werden. Dies umfasst das Erstellen von qualitativ hochwertigem Content, die Teilnahme an der Moderation und andere Aktivitäten, die zur Gesundheit des Netzwerks beitragen."
    },
    {
      question: "Ist BSN Open Source?",
      answer: "Ja, BSN ist ein Open-Source-Projekt. Der Quellcode ist auf GitHub verfügbar, und wir ermutigen Entwickler, zum Projekt beizutragen. Unser Ziel ist es, ein transparentes und gemeinschaftlich entwickeltes soziales Netzwerk zu schaffen."
    },
    {
      question: "Wie werden meine Daten geschützt?",
      answer: "BSN speichert persönliche Daten dezentral und verschlüsselt. Du behältst die volle Kontrolle über deine Daten und entscheidest, welche Informationen du teilen möchtest. Deine Daten werden nicht für Werbezwecke verkauft oder ohne deine Zustimmung verwendet."
    },
    {
      question: "Welche Blockchain nutzt BSN?",
      answer: "BSN ist blockchain-agnostisch und unterstützt mehrere Blockchains, darunter Ethereum und Polygon. Dies ermöglicht es Nutzern, die Blockchain zu wählen, die ihren Bedürfnissen am besten entspricht, sei es in Bezug auf Kosten, Geschwindigkeit oder Funktionalität."
    },
    {
      question: "Wie kann ich zum Projekt beitragen?",
      answer: "Es gibt viele Möglichkeiten, zum BSN-Projekt beizutragen: als Entwickler durch Code-Beiträge, als Community-Mitglied durch Feedback und Ideen, als Content Creator durch qualitativ hochwertige Inhalte oder als Botschafter durch die Verbreitung des Projekts."
    }
  ];

  // Versuche, die Übersetzungen zu laden, mit Fallback auf die Standardwerte
  const faqItems = safeObjectT(t, 'documentationPage.faq.items', defaultFaqItems);

  // Standardwerte für API-Endpunkte
  const defaultApiEndpoints = [
    {
      name: "Nutzer",
      endpoints: [
        { method: "GET", path: "/api/v1/users", description: "Liste aller Nutzer abrufen" },
        { method: "GET", path: "/api/v1/users/:id", description: "Nutzerdetails abrufen" },
        { method: "POST", path: "/api/v1/users", description: "Neuen Nutzer erstellen" },
        { method: "PUT", path: "/api/v1/users/:id", description: "Nutzerdaten aktualisieren" }
      ]
    },
    {
      name: "Posts",
      endpoints: [
        { method: "GET", path: "/api/v1/posts", description: "Liste aller Posts abrufen" },
        { method: "GET", path: "/api/v1/posts/:id", description: "Post-Details abrufen" },
        { method: "POST", path: "/api/v1/posts", description: "Neuen Post erstellen" },
        { method: "DELETE", path: "/api/v1/posts/:id", description: "Post löschen" }
      ]
    },
    {
      name: "Wallet",
      endpoints: [
        { method: "GET", path: "/api/v1/wallet/balance", description: "Wallet-Guthaben abrufen" },
        { method: "POST", path: "/api/v1/wallet/transfer", description: "Token übertragen" },
        { method: "GET", path: "/api/v1/wallet/transactions", description: "Transaktionshistorie abrufen" }
      ]
    }
  ];

  // Versuche, die Übersetzungen zu laden, mit Fallback auf die Standardwerte
  const apiEndpoints = safeObjectT(t, 'documentationPage.api.endpoints', defaultApiEndpoints);

  // Standardwerte für Whitepaper-Abschnitte
  const defaultWhitepaperSections = [
    {
      title: "Einführung",
      content: "BSN wurde mit der Vision gegründet, ein soziales Netzwerk zu schaffen, das den Nutzern gehört und von ihnen kontrolliert wird. Durch die Integration von Blockchain-Technologie schaffen wir eine Plattform, die Transparenz, Datenschutz und neue Formen der Wertschöpfung ermöglicht."
    },
    {
      title: "Technische Architektur",
      content: "BSN basiert auf einer hybriden Architektur, die zentrale und dezentrale Komponenten kombiniert, um Benutzerfreundlichkeit mit den Vorteilen der Blockchain zu verbinden. Die Kernfunktionalitäten wie Identität, Daten und Transaktionen werden auf der Blockchain gespeichert, während die Benutzeroberfläche und bestimmte Funktionen zentral gehostet werden, um eine optimale Performance zu gewährleisten."
    },
    {
      title: "Tokenomics",
      content: "Der BSN-Token ist das Herzstück des Ökosystems und dient mehreren Zwecken: als Governance-Token für die DAO, als Belohnung für Beiträge zum Netzwerk und als Zahlungsmittel innerhalb der Plattform. Das Token-Design wurde sorgfältig entwickelt, um ein nachhaltiges und wachsendes Ökosystem zu fördern."
    },
    {
      title: "Governance",
      content: "BSN wird als DAO (Dezentrale Autonome Organisation) verwaltet, bei der Token-Inhaber über Plattformänderungen abstimmen können. Das Governance-Modell verwendet quadratisches Voting, um eine faire Entscheidungsfindung zu gewährleisten und Machtkonzentration zu verhindern."
    },
    {
      title: "Roadmap",
      content: "Die Entwicklung von BSN ist in mehrere Phasen unterteilt, beginnend mit der Alpha-Version und endend mit einem vollständig dezentralen Protokoll. Jede Phase baut auf der vorherigen auf und fügt neue Funktionen und Verbesserungen hinzu."
    }
  ];

  // Versuche, die Übersetzungen zu laden, mit Fallback auf die Standardwerte
  const whitepaperSections = safeObjectT(t, 'documentationPage.whitepaper.sections', defaultWhitepaperSections);

  // Content basierend auf aktivem Tab rendern
  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-light text-white mb-4">{safeT(t, 'documentationPage.overview.title', 'Was ist BSN?')}</h2>
              <p className="text-white/70">
                {safeT(t, 'documentationPage.overview.description', 'BSN (Blockchain Social Network) ist ein dezentrales soziales Netzwerk, das auf Blockchain-Technologie basiert. Es gibt den Nutzern die volle Kontrolle über ihre Daten und ermöglicht neue Formen der Interaktion und Wertschöpfung.')}
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-light text-white mb-4">{safeT(t, 'documentationPage.overview.documentation.title', 'Unsere Dokumentation')}</h2>
              <p className="text-white/70 mb-6">
                {safeT(t, 'documentationPage.overview.documentation.description', 'Unsere Dokumentation ist in mehrere Bereiche unterteilt, um dir den Einstieg in BSN so einfach wie möglich zu machen. Wähle einen Bereich, der dich interessiert:')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {documentationCategories.slice(1).map((category) => (
                  <button
                    key={category.id}
                    className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 hover:border-[#00a2ff]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00a2ff]/10 text-center"
                    onClick={() => setActiveTab(category.id)}
                  >
                    <h3 className="text-xl font-light text-white mb-2">{category.label}</h3>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-light text-white mb-4">{safeT(t, 'documentationPage.overview.resources.title', 'Technische Ressourcen')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 hover:border-[#00a2ff]/40 transition-all duration-300">
                  <h3 className="text-xl font-medium text-[#00a2ff] mb-2">{safeT(t, 'documentationPage.overview.resources.github.title', 'GitHub Repository')}</h3>
                  <p className="text-white/70 mb-4">{safeT(t, 'documentationPage.overview.resources.github.description', 'Zugang zum Quellcode und technischen Dokumentationen des Projekts.')}</p>
                  <a 
                    href="https://github.com/bsn" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-[#00a2ff] hover:underline"
                  >
                    {safeT(t, 'documentationPage.overview.resources.github.link', 'Zum Repository →')}
                  </a>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 hover:border-[#00a2ff]/40 transition-all duration-300">
                  <h3 className="text-xl font-medium text-[#00a2ff] mb-2">{safeT(t, 'documentationPage.overview.resources.discord.title', 'Developer Discord')}</h3>
                  <p className="text-white/70 mb-4">{safeT(t, 'documentationPage.overview.resources.discord.description', 'Tritt unserem Entwickler-Discord bei für technischen Support und Diskussionen.')}</p>
                  <a 
                    href="https://discord.gg/bsn-dev" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-[#00a2ff] hover:underline"
                  >
                    {safeT(t, 'documentationPage.overview.resources.discord.link', 'Zum Discord →')}
                  </a>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 hover:border-[#00a2ff]/40 transition-all duration-300">
                  <h3 className="text-xl font-medium text-[#00a2ff] mb-2">{safeT(t, 'documentationPage.overview.resources.sandbox.title', 'API Sandbox')}</h3>
                  <p className="text-white/70 mb-4">{safeT(t, 'documentationPage.overview.resources.sandbox.description', 'Teste unsere API in einer sicheren Sandbox-Umgebung.')}</p>
                  <a 
                    href="https://sandbox.bsn.network" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-[#00a2ff] hover:underline"
                  >
                    {safeT(t, 'documentationPage.overview.resources.sandbox.link', 'Zur Sandbox →')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'guides':
        return (
          <div>
            <h2 className="text-3xl font-light text-white mb-8">{safeT(t, 'documentationPage.guides.title', 'Anleitungen')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide, index) => (
                <div 
                  key={index} 
                  className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 hover:border-[#00a2ff]/40 transition-all duration-300"
                >
                  <div className="text-4xl mb-4">{guide.icon}</div>
                  <h3 className="text-xl font-medium text-white mb-2">{guide.title}</h3>
                  <p className="text-white/70 mb-4">{guide.description}</p>
                  <a 
                    href={guide.link} 
                    className="inline-flex items-center text-[#00a2ff] hover:underline"
                  >
                    {safeT(t, 'common.learnMore', 'Mehr erfahren')} →
                  </a>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'faq':
        return (
          <div>
            <h2 className="text-3xl font-light text-white mb-8">{safeT(t, 'documentationPage.faq.title', 'Häufig gestellte Fragen')}</h2>
            
            <div className="space-y-6">
              {faqItems.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 hover:border-[#00a2ff]/40 transition-all duration-300"
                >
                  <h3 className="text-xl font-medium text-white mb-3">{item.question}</h3>
                  <p className="text-white/70">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'api':
        return (
          <div>
            <h2 className="text-3xl font-light text-white mb-4">{safeT(t, 'documentationPage.api.title', 'API-Dokumentation')}</h2>
            <p className="text-white/70 mb-8">{safeT(t, 'documentationPage.api.description', 'Unsere API ermöglicht es Entwicklern, auf BSN-Daten und -Funktionen zuzugreifen und eigene Anwendungen zu erstellen.')}</p>
            
            <div className="space-y-8">
              {apiEndpoints.map((group, groupIndex) => (
                <div key={groupIndex} className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-medium text-white mb-4">{group.name}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-2 px-4 text-[#00a2ff]">Methode</th>
                          <th className="text-left py-2 px-4 text-[#00a2ff]">Pfad</th>
                          <th className="text-left py-2 px-4 text-[#00a2ff]">Beschreibung</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.endpoints.map((endpoint, endpointIndex) => (
                          <tr key={endpointIndex} className="border-b border-gray-800/50">
                            <td className="py-3 px-4">
                              <span className={`
                                inline-block px-2 py-1 rounded text-xs font-medium
                                ${endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' : ''}
                                ${endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' : ''}
                                ${endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                                ${endpoint.method === 'DELETE' ? 'bg-red-500/20 text-red-400' : ''}
                              `}>
                                {endpoint.method}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-sm text-white/80">{endpoint.path}</td>
                            <td className="py-3 px-4 text-white/70">{endpoint.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'whitepaper':
        return (
          <div>
            <h2 className="text-3xl font-light text-white mb-4">{safeT(t, 'documentationPage.whitepaper.title', 'Whitepaper')}</h2>
            <p className="text-white/70 mb-8">{safeT(t, 'documentationPage.whitepaper.description', 'Unser Whitepaper beschreibt die technischen Details und die Vision hinter BSN.')}</p>
            
            <div className="space-y-8">
              {whitepaperSections.map((section, index) => (
                <div key={index} className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-medium text-white mb-4">{section.title}</h3>
                  <p className="text-white/70 whitespace-pre-line">{section.content}</p>
                </div>
              ))}
              
              <div className="mt-8 text-center">
                <a 
                  href="/whitepaper.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-[#00a2ff]/20 transition duration-300"
                >
                  {safeT(t, 'common.readWhitepaper', 'Whitepaper lesen')}
                </a>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <PageTemplate>
      <section className="pt-32 pb-20 relative overflow-hidden">
        <EnhancedBackground type="grid" />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle 
            title={safeT(t('documentationPage.title'), 'Dokumentation')}
            subtitle={safeT(t('documentationPage.subtitle'), 'Alles, was du über BSN wissen musst')}
          />
          
          <div className="mt-16">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-12">
              {documentationCategories.map((category) => (
                <button
                  key={category.id}
                  className={`py-2 px-4 rounded-lg transition-all ${
                    activeTab === category.id 
                      ? 'bg-[#00a2ff] text-white' 
                      : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white'
                  }`}
                  onClick={() => setActiveTab(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            <div>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
};

export default DocumentationPage;
