import React from 'react';
import { useTranslation } from 'react-i18next';
import PageTemplate from '../components/templates/PageTemplate';
import SectionTitle from '../components/ui/SectionTitle';
import EnhancedBackground from '../components/ui/EnhancedBackground';
import { safeT, safeObjectT } from '../utils/i18nUtils';

const CommunityPage = () => {
  const { t } = useTranslation();

  // Community-Kanäle
  const defaultCommunityChannels = [
    {
      name: "Discord",
      description: "Tritt unserem Discord-Server bei und verbinde dich mit anderen BSN-Enthusiasten. Hier findest du Hilfe, kannst an Diskussionen teilnehmen und erhältst die neuesten Updates.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 127.14 96.36" fill="currentColor">
          <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
        </svg>
      ),
      link: "https://discord.gg/bsn",
      buttonText: "Discord beitreten",
      color: "bg-[#5865F2]"
    },
    {
      name: "Telegram",
      description: "Folge unserem Telegram-Kanal für schnelle Updates und Ankündigungen. Ideal für mobile Nutzer, die immer auf dem Laufenden bleiben möchten.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm2.692 14.889c.161.115.368.143.553.073.474-.181.836-.616.94-1.119.141-.671.307-1.684.307-1.684.082-.41-.169-.629-.544-.439l-1.436.726c-.354.178-.616.132-.616.132-.169-.042-.367-.22-.275-.648.092-.428.275-.954.275-.954.082-.354.059-.428-.127-.588s-.48-.295-.791-.413c-.312-.118-.68-.155-1.028-.105-.348.049-.682.169-1.028.354-.346.185-.651.429-.89.726-.239.297-.38.587-.422.87-.042.283 0 .531.127.745.127.214.253.363.38.447.127.084.253.152.38.205.127.053.232.094.317.121.085.028.127.044.127.044.253.094.464.23.634.41.169.18.253.418.253.712 0 .294-.084.532-.253.712-.169.18-.38.316-.634.41 0 0-.042.016-.127.044-.85.027-.19.068-.317.121-.127.053-.253.121-.38.205-.127.084-.253.233-.38.447-.127.214-.169.462-.127.745-.042.283.183.573.422.87.239.297.544.541.89.726.346.185.68.305 1.028.354.348.05.716.013 1.028-.105.312-.118.605-.253.791-.413s.209-.234.127-.588c0 0-.183-.526-.275-.954-.092-.428.106-.606.275-.648 0 0 .262-.046.616.132l1.436.726c.375.19.626-.29.544-.439 0 0 .166-1.013-.307-1.684-.104-.503-.466-.938-.94-1.119-.185-.07-.392-.042-.553.073-.403.29-.857.435-1.311.435s-.908-.145-1.311-.435c-.161-.115-.368-.143-.553-.073-.474.181-.836.616-.94 1.119-.141.671-.307 1.684-.307 1.684-.082.41.169.629.544.439l1.436-.726c.354-.178.616-.132.616-.132.169.042.367.22.275.648-.092.428-.275.954-.275.954-.082.354-.059.428.127.588s.48.295.791.413c.312.118.68.155 1.028.105.348-.049.682-.169 1.028-.354.346-.185.651-.429.89-.726.239-.297.38-.587.422-.87.042-.283 0-.531-.127-.745-.127-.214-.253-.363-.38-.447-.127-.084-.253-.152-.38-.205-.127-.053-.232-.094-.317-.121-.085-.028-.127-.044-.127-.044-.253-.094-.464-.23-.634-.41-.169-.18-.253-.418-.253-.712 0-.294.084-.532.253-.712.169-.18.38-.316.634-.41 0 0 .042-.016.127-.044.085-.027.19-.068.317-.121.127-.053.253-.121.38-.205.127-.084.253-.233.38-.447.127-.214.169-.462.127-.745-.042-.283-.183-.573-.422-.87-.239-.297-.544-.541-.89-.726-.346-.185-.68-.305-1.028-.354-.348-.05-.716-.013-1.028.105-.312.118-.605.253-.791.413s-.209.234-.127.588c0 0 .183.526.275.954.092.428-.106.606-.275.648 0 0-.262.046-.616-.132l-1.436-.726c-.375-.19-.626.029-.544.439 0 0 .166 1.013.307 1.684.104.503.466.938.94 1.119.185.07.392.042.553-.073.403-.29.857-.435 1.311-.435s.908.145 1.311.435z"/>
        </svg>
      ),
      link: "https://t.me/bsncommunity",
      buttonText: "Telegram beitreten",
      color: "bg-[#0088cc]"
    },
    {
      name: "Twitter",
      description: "Folge uns auf Twitter für die neuesten Ankündigungen, Updates und Einblicke in die Entwicklung von BSN. Bleibe mit einem Klick informiert.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
        </svg>
      ),
      link: "https://twitter.com/bsn_official",
      buttonText: "Twitter folgen",
      color: "bg-[#1DA1F2]"
    },
    {
      name: "GitHub",
      description: "Besuche unser GitHub-Repository, um zum BSN-Projekt beizutragen. Wir sind ein Open-Source-Projekt und freuen uns über Beiträge aus der Community.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      link: "https://github.com/bsn",
      buttonText: "GitHub besuchen",
      color: "bg-[#333]"
    }
  ];

  // Use safeObjectT to get translated community channels or fallback to default
  const communityChannels = safeObjectT(t, 'communityPage.channels', defaultCommunityChannels);

  // Community-Events
  const defaultCommunityEvents = [
    {
      title: "BSN Community Call",
      date: "Jeden Freitag, 18:00 Uhr",
      description: "Wöchentliches Update über die Entwicklung, neue Features und kommende Änderungen. Mit Q&A-Session.",
      link: "https://discord.gg/bsn/events",
      location: "Discord"
    },
    {
      title: "Entwickler-Workshop",
      date: "15. Juli 2023, 14:00 Uhr",
      description: "Lerne, wie du deine eigenen dApps auf BSN entwickeln kannst. Für Anfänger und Fortgeschrittene.",
      link: "https://discord.gg/bsn/workshops",
      location: "Discord + YouTube"
    },
    {
      title: "Token Launch Party",
      date: "1. August 2023, 20:00 Uhr",
      description: "Feiere mit uns den offiziellen Launch des BSN-Tokens mit Überraschungen und Airdrops.",
      link: "https://bsn.network/token-launch",
      location: "Online"
    }
  ];

  // Use safeObjectT to get translated community events or fallback to default
  const communityEvents = safeObjectT(t, 'communityPage.events', defaultCommunityEvents);

  // Community-Botschafter
  const defaultAmbassadors = [
    {
      name: "Julia Schmidt",
      role: "Community Lead",
      image: "/team/placeholder.svg",
      description: "Organisiert Community-Events und moderiert den Discord-Server."
    },
    {
      name: "Markus Weber",
      role: "Developer Advocate",
      image: "/team/placeholder.svg",
      description: "Unterstützt Entwickler bei der Integration mit BSN."
    },
    {
      name: "Sarah Müller",
      role: "Content Creator",
      image: "/team/placeholder.svg",
      description: "Erstellt Tutorials und Anleitungen für die BSN-Plattform."
    }
  ];

  // Use safeObjectT to get translated ambassadors or fallback to default
  const ambassadors = safeObjectT(t, 'communityPage.ambassadors', defaultAmbassadors);

  return (
    <PageTemplate>
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <EnhancedBackground type="particles" />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle 
            title={safeT(t, 'communityPage.title', 'BSN Community')} 
            subtitle={safeT(t, 'communityPage.subtitle', 'Werde Teil unserer wachsenden Community und gestalte die Zukunft sozialer Netzwerke mit')}
          />

          <div className="mt-12 text-center max-w-3xl mx-auto">
            <p className="text-white/80 text-lg mb-8">
              {safeT(t, 'communityPage.description', 'BSN ist mehr als nur eine Plattform - es ist eine Gemeinschaft von Gleichgesinnten, die an eine dezentrale, nutzerorientierte Zukunft sozialer Netzwerke glauben. Schließe dich uns an und hilf mit, diese Vision Wirklichkeit werden zu lassen.')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="https://discord.gg/bsn" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-[#00a2ff]/20 transition duration-300 text-lg"
              >
                {safeT(t, 'common.joinCommunity', 'Community beitreten')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Community Channels */}
      <section className="py-20 relative overflow-hidden bg-black/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-light text-center text-white mb-16">{safeT(t, 'communityPage.channels.title', 'Unsere Kommunikationskanäle')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {communityChannels.map((channel, index) => (
              <div 
                key={index} 
                className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-8 hover:border-[#00a2ff]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00a2ff]/10 flex flex-col"
              >
                <div className="flex items-center mb-6">
                  <div className={`text-white p-3 rounded-lg ${channel.color}`}>
                    {channel.icon}
                  </div>
                  <h3 className="text-2xl font-light text-white ml-4">{channel.name}</h3>
                </div>
                <p className="text-white/70 mb-6 flex-grow">{channel.description}</p>
                <div>
                  <a 
                    href={channel.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block bg-transparent border border-[#00a2ff] text-[#00a2ff] px-6 py-2 rounded-full hover:bg-[#00a2ff]/10 transition duration-300"
                  >
                    {channel.buttonText}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Events */}
      <section id="events" className="py-20 relative overflow-hidden">
        <EnhancedBackground type="dataFlow" />
        
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-3xl font-light text-center text-white mb-16">{safeT(t, 'communityPage.events.title', 'Kommende Events')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {communityEvents.map((event, index) => (
              <div 
                key={index} 
                className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-8 hover:border-[#00a2ff]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00a2ff]/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-medium text-white">{event.title}</h3>
                  <span className="text-[#00a2ff] text-sm bg-[#00a2ff]/10 px-3 py-1 rounded-full">
                    {event.location}
                  </span>
                </div>
                <p className="text-[#00a2ff] mb-4">{event.date}</p>
                <p className="text-white/70 mb-6">{event.description}</p>
                <a 
                  href={event.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block bg-transparent border border-[#00a2ff] text-[#00a2ff] px-4 py-1 rounded-full hover:bg-[#00a2ff]/10 transition duration-300 text-sm"
                >
                  {safeT(t, 'common.learnMore', 'Mehr erfahren')}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Ambassadors */}
      <section id="ambassadors" className="py-20 relative overflow-hidden bg-black/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-light text-center text-white mb-6">{safeT(t, 'communityPage.ambassadors.title', 'Community-Botschafter')}</h2>
          <p className="text-white/70 text-center mb-16 max-w-2xl mx-auto">
            {safeT(t, 'communityPage.ambassadors.description', 'Unsere Botschafter helfen dabei, die BSN-Community zu unterstützen und zu erweitern. Sie sind deine ersten Ansprechpartner bei Fragen und Anliegen.')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ambassadors.map((ambassador, index) => (
              <div 
                key={index} 
                className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 hover:border-[#00a2ff]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00a2ff]/10 text-center"
              >
                <img 
                  src={ambassador.image} 
                  alt={ambassador.name} 
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-[#00a2ff]/30"
                />
                <h3 className="text-xl font-medium text-white">{ambassador.name}</h3>
                <p className="text-[#00a2ff] mb-4">{ambassador.role}</p>
                <p className="text-white/70">{ambassador.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section id="guidelines" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-light text-white mb-6">{safeT(t, 'communityPage.guidelines.title', 'Community-Richtlinien')}</h2>
            <p className="text-white/80 mb-6">
              {safeT(t, 'communityPage.guidelines.description', 'Um eine positive und produktive Community-Erfahrung für alle zu gewährleisten, bitten wir alle Mitglieder, sich an folgende Richtlinien zu halten:')}
            </p>
            <ul className="space-y-4">
              <li className="flex">
                <span className="text-[#00a2ff] mr-3">•</span>
                <span className="text-white/70">{safeT(t, 'communityPage.guidelines.rule1', 'Sei respektvoll und freundlich zu anderen Community-Mitgliedern, unabhängig von Hintergrund, Erfahrung oder Meinung.')}</span>
              </li>
              <li className="flex">
                <span className="text-[#00a2ff] mr-3">•</span>
                <span className="text-white/70">{safeT(t, 'communityPage.guidelines.rule2', 'Keine Belästigung, Hassrede oder diskriminierendes Verhalten jeglicher Art.')}</span>
              </li>
              <li className="flex">
                <span className="text-[#00a2ff] mr-3">•</span>
                <span className="text-white/70">{safeT(t, 'communityPage.guidelines.rule3', 'Keine Spam, Werbung oder selbstpromotende Inhalte ohne vorherige Genehmigung.')}</span>
              </li>
              <li className="flex">
                <span className="text-[#00a2ff] mr-3">•</span>
                <span className="text-white/70">{safeT(t, 'communityPage.guidelines.rule4', 'Respektiere die Privatsphäre anderer Mitglieder und teile keine persönlichen Informationen ohne Erlaubnis.')}</span>
              </li>
              <li className="flex">
                <span className="text-[#00a2ff] mr-3">•</span>
                <span className="text-white/70">{safeT(t, 'communityPage.guidelines.rule5', 'Befolge die Anweisungen der Moderatoren und Administratoren.')}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden bg-black/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-light text-white mb-6">Bereit, Teil der BSN-Community zu werden?</h2>
          <p className="text-white/70 mb-10 max-w-2xl mx-auto">
            Schließe dich Tausenden von Gleichgesinnten an, die an die Zukunft dezentraler sozialer Netzwerke glauben. Gemeinsam gestalten wir die nächste Generation sozialer Interaktion.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://discord.gg/bsn" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-[#00a2ff]/20 transition duration-300 text-lg"
            >
              Discord beitreten
            </a>
            <a 
              href="/token-reservation" 
              className="bg-transparent border border-[#00a2ff] text-[#00a2ff] px-8 py-3 rounded-full hover:bg-[#00a2ff]/10 transition duration-300 text-lg"
            >
              Token reservieren
            </a>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
};

export default CommunityPage;
