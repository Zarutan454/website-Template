import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { safeT } from '../utils/i18nUtils';
import PageTemplate from '../components/templates/PageTemplate';
import PieChart from '../components/charts/PieChart';
import CTA from '../components/CTA';

const TokenomicsPage = () => {
  const { t, i18n } = useTranslation();

  // Verwende die safeT-Funktion für Übersetzungen mit korrektem Format
  const tokenomicsT = (key) => safeT(t, `tokenomicsPage.${key}`);
  
  // Debug-Ausgabe für Übersetzungen
  useEffect(() => {
    console.log("Current language:", i18n.language);
    console.log("Distribution Community:", tokenomicsT('distribution.community'));
    console.log("Distribution Team:", tokenomicsT('distribution.team'));
    console.log("Utility Transactions:", tokenomicsT('utility.transactions'));
  }, [i18n.language]);

  // Token-Verteilungsdaten für das Diagramm - Daten direkt aus der Übersetzungsdatei holen
  const distributionData = [
    { label: tokenomicsT('distribution.community'), value: 30, color: '#00a2ff' },
    { label: tokenomicsT('distribution.team'), value: 20, color: '#0077ff' },
    { label: tokenomicsT('distribution.investors'), value: 15, color: '#36b9ff' },
    { label: tokenomicsT('distribution.advisors'), value: 10, color: '#5cc6ff' },
    { label: tokenomicsT('distribution.marketing'), value: 10, color: '#7fd2ff' },
    { label: tokenomicsT('distribution.ecosystem'), value: 10, color: '#a1dfff' },
    { label: tokenomicsT('distribution.reserve'), value: 5, color: '#c4ebff' }
  ];

  // Token-Nutzungsdaten
  const utilityData = [
    {
      icon: '🔄',
      title: tokenomicsT('utility.transactions'),
      description: tokenomicsT('utility.transactionsDesc')
    },
    {
      icon: '🏆',
      title: tokenomicsT('utility.governance'),
      description: tokenomicsT('utility.governanceDesc')
    },
    {
      icon: '💰',
      title: tokenomicsT('utility.staking'),
      description: tokenomicsT('utility.stakingDesc')
    },
    {
      icon: '🛒',
      title: tokenomicsT('utility.marketplace'),
      description: tokenomicsT('utility.marketplaceDesc')
    },
    {
      icon: '🎮',
      title: tokenomicsT('utility.gamification'),
      description: tokenomicsT('utility.gamificationDesc')
    },
    {
      icon: '🔐',
      title: tokenomicsT('utility.access'),
      description: tokenomicsT('utility.accessDesc')
    }
  ];

  // Vesting-Zeitplan
  const vestingSchedule = [
    {
      group: tokenomicsT('vesting.community'),
      initialUnlock: '10%',
      cliff: '1 ' + tokenomicsT('vesting.month'),
      vesting: '24 ' + tokenomicsT('vesting.months')
    },
    {
      group: tokenomicsT('vesting.team'),
      initialUnlock: '0%',
      cliff: '12 ' + tokenomicsT('vesting.months'),
      vesting: '36 ' + tokenomicsT('vesting.months')
    },
    {
      group: tokenomicsT('vesting.investors'),
      initialUnlock: '5%',
      cliff: '3 ' + tokenomicsT('vesting.months'),
      vesting: '24 ' + tokenomicsT('vesting.months')
    },
    {
      group: tokenomicsT('vesting.advisors'),
      initialUnlock: '0%',
      cliff: '6 ' + tokenomicsT('vesting.months'),
      vesting: '24 ' + tokenomicsT('vesting.months')
    },
    {
      group: tokenomicsT('vesting.marketing'),
      initialUnlock: '15%',
      cliff: '0',
      vesting: '18 ' + tokenomicsT('vesting.months')
    }
  ];

  // Tokenomics-Modell
  const economicsModel = [
    {
      title: tokenomicsT('model.inflation'),
      value: '5% ' + tokenomicsT('model.yearly'),
      description: tokenomicsT('model.inflationDesc')
    },
    {
      title: tokenomicsT('model.burning'),
      value: '2% ' + tokenomicsT('model.transactions'),
      description: tokenomicsT('model.burningDesc')
    },
    {
      title: tokenomicsT('model.staking'),
      value: '8-12% APY',
      description: tokenomicsT('model.stakingDesc')
    }
  ];

  return (
    <PageTemplate>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">{tokenomicsT('title')}</h1>
          <p className="text-xl text-gray-400">{tokenomicsT('subtitle')}</p>
        </div>

        {/* Token Overview Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">{tokenomicsT('overview')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-xl font-semibold mb-2 text-white">{tokenomicsT('tokenName')}</h3>
              <p className="text-gray-300">Blockchain Social Network Token</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-xl font-semibold mb-2 text-white">{tokenomicsT('tokenSymbol')}</h3>
              <p className="text-gray-300">BSN</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-xl font-semibold mb-2 text-white">{tokenomicsT('blockchain')}</h3>
              <p className="text-gray-300">Ethereum (ERC-20)</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-xl font-semibold mb-2 text-white">{tokenomicsT('tokenStandard')}</h3>
              <p className="text-gray-300">ERC-20</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-xl font-semibold mb-2 text-white">{tokenomicsT('totalSupply')}</h3>
              <p className="text-gray-300">1,000,000,000 BSN</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-xl font-semibold mb-2 text-white">{tokenomicsT('initialSupply')}</h3>
              <p className="text-gray-300">200,000,000 BSN (20%)</p>
            </div>
          </div>
        </section>

        {/* Token Distribution Section */}
        <section className="mb-20" id="distribution">
          <h2 className="text-3xl font-bold mb-8 text-center">{tokenomicsT('distributionTitle')}</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="w-full max-w-md mx-auto">
              <PieChart
                data={distributionData}
                title={tokenomicsT('distributionTitle')}
              />
            </div>
            <div>
              <ul className="space-y-4">
                {distributionData.map((item, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }}></span>
                    <span className="font-medium text-white">{item.label}:</span>
                    <span className="ml-2 text-gray-300">{item.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Token Utility Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">{tokenomicsT('utilityTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {utilityData.map((item, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Token Vesting Schedule */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">{tokenomicsT('vestingTitle')}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden shadow-md border border-gray-700">
              <thead className="bg-gray-900/70">
                <tr>
                  <th className="py-3 px-4 text-left text-white">{tokenomicsT('vestingGroup')}</th>
                  <th className="py-3 px-4 text-left text-white">{tokenomicsT('initialUnlock')}</th>
                  <th className="py-3 px-4 text-left text-white">{tokenomicsT('cliff')}</th>
                  <th className="py-3 px-4 text-left text-white">{tokenomicsT('vestingPeriod')}</th>
                </tr>
              </thead>
              <tbody>
                {vestingSchedule.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-700/30' : 'bg-gray-800/50'}>
                    <td className="py-3 px-4 text-white">{item.group}</td>
                    <td className="py-3 px-4 text-white">{item.initialUnlock}</td>
                    <td className="py-3 px-4 text-white">{item.cliff}</td>
                    <td className="py-3 px-4 text-white">{item.vesting}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Token Economics Model */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">{tokenomicsT('modelTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {economicsModel.map((item, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700">
                <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                <p className="text-2xl font-bold text-[#00a2ff] mb-2">{item.value}</p>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <CTA
          title={tokenomicsT('ctaTitle')}
          description={tokenomicsT('ctaDescription')}
          buttonText={t('common.tokenReservation')}
          buttonLink="/token-reservation"
        />
      </div>
    </PageTemplate>
  );
};

export default TokenomicsPage;
