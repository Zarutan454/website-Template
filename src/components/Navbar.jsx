import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './ui/LanguageSwitcher';
import WalletConnectButton from './WalletConnectButton';

const Navbar = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleDropdown = (dropdown) => {
    if (activeDropdown === dropdown) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdown);
    }
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  // Verbesserte Navigationskategorien mit strukturierten Dropdown-Menüs
  const navItems = [
    {
      label: t('navigation.about.title'),
      type: 'dropdown',
      key: 'about',
      items: [
        { label: t('navigation.about.mission'), path: '/about' },
        { label: t('navigation.about.team'), path: '/about#team' },
        { label: t('navigation.about.partners'), path: '/about#partners' },
        { label: t('navigation.about.milestones'), path: '/about#milestones' },
      ]
    },
    {
      label: t('navigation.features.title'),
      type: 'dropdown',
      key: 'features',
      items: [
        { label: t('navigation.features.overview'), path: '/features' },
        { label: t('navigation.features.social'), path: '/features#social' },
        { label: t('navigation.features.blockchain'), path: '/features#blockchain' },
        { label: t('navigation.features.governance'), path: '/features#governance' },
      ]
    },
    {
      label: t('navigation.tokenomics.title'),
      type: 'dropdown',
      key: 'tokenomics',
      items: [
        { label: t('navigation.tokenomics.overview'), path: '/tokenomics' },
        { label: t('navigation.tokenomics.distribution'), path: '/tokenomics#distribution' },
        { label: t('navigation.tokenomics.reservation'), path: '/token-reservation' },
        { label: t('navigation.tokenomics.faucet'), path: '/faucet' },
        { label: t('navigation.tokenomics.referral'), path: '/referral' },
      ]
    },
    {
      label: t('navigation.roadmap'),
      type: 'link',
      path: '/roadmap'
    },
    {
      label: t('navigation.community.title'),
      type: 'dropdown',
      key: 'community',
      items: [
        { label: t('navigation.community.hub'), path: '/community' },
        { label: t('navigation.community.events'), path: '/community#events' },
        { label: t('navigation.community.ambassadors'), path: '/community#ambassadors' },
        { label: t('navigation.community.guidelines'), path: '/community#guidelines' },
      ]
    },
    {
      label: t('navigation.documentation.title'),
      type: 'dropdown',
      key: 'documentation',
      items: [
        { label: t('navigation.documentation.whitepaper'), path: '/documentation#whitepaper' },
        { label: t('navigation.documentation.api'), path: '/documentation#api' },
        { label: t('navigation.documentation.tutorials'), path: '/documentation#tutorials' },
        { label: t('navigation.documentation.faqs'), path: '/documentation#faqs' },
      ]
    }
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-md py-3 shadow-lg'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-white font-bold text-2xl">
          <span className="text-[#00a2ff]">BSN</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            item.type === 'link' ? (
              <Link
                key={item.path}
                to={item.path}
                className="text-white hover:text-[#00a2ff] transition"
                onClick={closeDropdowns}
              >
                {item.label}
              </Link>
            ) : (
              <div key={item.key} className="relative">
                <button
                  className="text-white hover:text-[#00a2ff] transition flex items-center"
                  onClick={() => toggleDropdown(item.key)}
                >
                  {item.label}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ml-1 transition-transform ${activeDropdown === item.key ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === item.key && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md rounded-md shadow-lg py-1 z-50 border border-gray-800">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className="block px-4 py-2 text-sm text-white hover:bg-[#00a2ff]/20 transition"
                        onClick={closeDropdowns}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          ))}
        </div>

        {/* Right Side Items (Language + Connect Wallet) */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Language Switcher */}
          <LanguageSwitcher className="mr-2" />

          {/* Connect Wallet Button */}
          <WalletConnectButton />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          {/* Mobile Language Switcher */}
          <LanguageSwitcher variant="minimal" />
          {/* Mobile WalletConnectButton */}
          <WalletConnectButton />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800">
          <div className="container mx-auto px-6 py-4">
            <div className="space-y-4">
              {navItems.map((item) => (
                <div key={item.key || item.path}>
                  {item.type === 'link' ? (
                    <Link
                      to={item.path}
                      className="block text-white hover:text-[#00a2ff] transition py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <div>
                      <button
                        className="block w-full text-left text-white hover:text-[#00a2ff] transition py-2 flex items-center justify-between"
                        onClick={() => toggleDropdown(item.key)}
                      >
                        {item.label}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 transition-transform ${activeDropdown === item.key ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {activeDropdown === item.key && (
                        <div className="ml-4 space-y-2 mt-2">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className="block text-gray-300 hover:text-[#00a2ff] transition py-1"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                closeDropdowns();
                              }}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Mobile Wallet Connect Button */}
              <div className="pt-4 border-t border-gray-800">
                <WalletConnectButton className="w-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 