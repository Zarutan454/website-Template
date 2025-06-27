
import React from 'react';
import Hero3D from '../components/landing/Hero3D';
import Features3D from '../components/landing/Features3D';
import TokenCreationDemo from '../components/landing/TokenCreationDemo';
import LiveDemoSection from '../components/landing/LiveDemoSection';
import SocialFeatures from '../components/landing/SocialFeatures';
import ProofOfActivity from '../components/landing/ProofOfActivity';
import Roadmap from '../components/landing/Roadmap';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/landing/Footer';
import AnimatedBackground from '../components/landing/AnimatedBackground';
import ScrollToTopButton from '../components/landing/ScrollToTopButton';
import SecurityFeatures from '../components/landing/SecurityFeatures';
import AppDownload from '../components/landing/AppDownload';
import StatsSection from '../components/landing/StatsSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-dark-100 text-white overflow-hidden">
      <AnimatedBackground />
      <main>
        <Hero3D />
        <Features3D />
        <StatsSection />
        <TokenCreationDemo />
        <LiveDemoSection />
        <SocialFeatures />
        <ProofOfActivity />
        <SecurityFeatures />
        <AppDownload />
        <Roadmap />
        <FAQ />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Index;
