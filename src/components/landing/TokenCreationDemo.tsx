
import * as React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import { Coins, CreditCard, Layers, Package, Settings, CheckCircle } from 'lucide-react';
import ParallaxSection from './ParallaxSection';

// Define the step interface
interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Define the StepIndicator component props
interface StepIndicatorProps {
  step: Step;
  currentStep: number;
}

// Define the token data interface
interface TokenData {
  name: string;
  symbol: string;
  supply: string;
  network: string;
  tokenType: string;
  miningRewards: string;
  teamAllocation: string;
  liquidity: string;
  marketing: string;
  reserve: string;
}

// Define the AllocationChart props
interface AllocationChartProps {
  tokenData: TokenData;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ step, currentStep }) => {
  const isActive = step.number <= currentStep;
  const isCompleted = step.number < currentStep;
  
  return (
    <div className="flex items-center mb-8 group">
      <div className={`flex items-center justify-center w-12 h-12 rounded-full mr-4 transition-all duration-300 relative ${
        isCompleted 
          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30' 
          : isActive 
            ? 'bg-gradient-to-r from-primary/90 to-primary/70 text-white ring-4 ring-primary/20' 
            : 'bg-dark-300/70 text-gray-400 backdrop-blur-sm'
      }`}>
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full blur-md -z-10 opacity-60 ${
          isCompleted || isActive ? 'bg-primary/30' : 'bg-transparent'
        }`}></div>
        
        {isCompleted ? <CheckCircle className="w-6 h-6" /> : <span className="text-lg">{step.number}</span>}
      </div>
      <div>
        <h4 className={`text-base font-medium transition-colors duration-300 ${
          isActive ? 'text-white' : 'text-gray-300'
        }`}>{step.title}</h4>
        <p className={`text-sm transition-colors duration-300 ${
          isActive ? 'text-gray-300' : 'text-gray-400'
        }`}>{step.description}</p>
      </div>
    </div>
  );
};

const AllocationChart: React.FC<AllocationChartProps> = ({ tokenData }) => {
  const data = [
    { label: 'Mining Rewards', value: parseInt(tokenData.miningRewards), symbol: tokenData.symbol, percentage: parseInt(tokenData.miningRewards), color: '#e31c79', glowColor: 'rgba(227, 28, 121, 0.5)' },
    { label: 'Team', value: parseInt(tokenData.teamAllocation), symbol: tokenData.symbol, percentage: parseInt(tokenData.teamAllocation), color: '#517fa4', glowColor: 'rgba(81, 127, 164, 0.5)' },
    { label: 'Liquidity', value: parseInt(tokenData.liquidity), symbol: tokenData.symbol, percentage: parseInt(tokenData.liquidity), color: '#f87fb1', glowColor: 'rgba(248, 127, 177, 0.5)' },
    { label: 'Marketing', value: parseInt(tokenData.marketing), symbol: tokenData.symbol, percentage: parseInt(tokenData.marketing), color: '#4BC0C0', glowColor: 'rgba(75, 192, 192, 0.5)' },
    { label: 'Reserve', value: parseInt(tokenData.reserve), symbol: tokenData.symbol, percentage: parseInt(tokenData.reserve), color: '#9966FF', glowColor: 'rgba(153, 102, 255, 0.5)' }
  ];
  
  const totalSupply = parseInt(tokenData.supply);
  
  const CustomTooltip: React.FC<Pick<TooltipProps<number, string>, 'active' | 'payload'>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { label, value, symbol, percentage } = payload[0].payload;
      const amount = Math.floor((percentage / 100) * totalSupply).toLocaleString();
      
      return (
        <div className="custom-tooltip backdrop-blur-sm bg-dark-300/80 p-3 shadow-lg rounded-lg border border-gray-700">
          <p className="label font-medium text-white">{label}</p>
          <p className="intro text-sm text-gray-300">{amount} {symbol} ({percentage}%)</p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={85}
            innerRadius={45}
            fill="#8884d8"
            dataKey="percentage"
            animationBegin={200}
            animationDuration={1200}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                className="hover:opacity-90 transition-all"
                strokeWidth={3}
                stroke="rgba(255,255,255,0.15)"
                style={{
                  filter: `drop-shadow(0px 0px 8px ${entry.glowColor})`
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center space-x-2 group">
            <div className="w-3 h-3 rounded-full group-hover:scale-110 transition-transform" style={{ backgroundColor: entry.color }}></div>
            <div className="text-sm text-white font-medium">
              <span className="mr-1">{entry.label}</span>
              <span className="bg-dark-400/90 px-1.5 py-0.5 rounded text-xs">{entry.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TokenCreationDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const steps: Step[] = [
    {
      number: 1,
      title: "Token-Details wählen",
      description: "Grundlegende Informationen definieren",
      icon: <Coins />
    },
    {
      number: 2,
      title: "Verteilung festlegen",
      description: "Allokation des Token-Angebots",
      icon: <Layers />
    },
    {
      number: 3,
      title: "Mining-Parameter",
      description: "Einstellungen zum Mining",
      icon: <Settings />
    },
    {
      number: 4,
      title: "Smart Contract",
      description: "Vertrag überprüfen & bestätigen",
      icon: <Package />
    },
    {
      number: 5,
      title: "Deployment",
      description: "Token auf die Blockchain bringen",
      icon: <CreditCard />
    }
  ];
  
  const tokenData: TokenData = {
    name: "Best Social Network",
    symbol: "BSN",
    supply: "1000000",
    network: "Ethereum",
    tokenType: "ERC-20",
    miningRewards: "40",
    teamAllocation: "15",
    liquidity: "20",
    marketing: "15",
    reserve: "10"
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  return (
    <div id="token-creation">
      <ParallaxSection speed={0.2} className="py-20">
        <div className="bg-gradient-to-b from-dark-200/80 to-dark-300/80 border border-gray-700/30 rounded-2xl shadow-xl backdrop-blur-lg w-full max-w-4xl mx-auto overflow-hidden relative transform perspective-1000 rotate-x-1 hover:rotate-x-0 transition-transform duration-700">
        {/* Enhanced 3D Glow effects */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-secondary/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute bottom-1/3 left-1/4 w-16 h-16 bg-purple-500/20 rounded-full blur-xl animate-float-slow-reverse"></div>
        
        {/* 3D Border Effect */}
        <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none"></div>
        <div className="absolute inset-0 rounded-2xl border-t border-l border-white/10 pointer-events-none transform translate-x-0.5 -translate-y-0.5"></div>
        
        <div className="border-b border-gray-700/30 p-6 backdrop-blur-sm bg-dark-200/10 relative overflow-hidden">
          {/* Glass reflection effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30 pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-3 relative z-10">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-300 to-secondary-300 bg-clip-text text-transparent drop-shadow-glow">
              Token Creator
            </h3>
            <div className="bg-gradient-to-r from-primary/40 to-secondary/40 text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide border border-primary/30 shadow-glow-sm animate-pulse-slow">
              BETA
            </div>
          </div>
          <p className="text-sm text-gray-300">Erstelle deinen eigenen Mining-Token für deine Community</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Left side - Steps */}
          <div className="space-y-2 relative">
            {/* 3D-style decorative elements */}
            <div className="absolute -left-4 top-10 w-1 h-40 bg-gradient-to-b from-primary/50 to-secondary/50 rounded-full blur-sm"></div>
            
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <StepIndicator step={step} currentStep={currentStep} />
              </motion.div>
            ))}
            
            <div className="flex justify-between mt-8">
              <button
                className="px-5 py-2.5 rounded-lg border border-gray-700/50 bg-dark-400/30 text-gray-300 hover:bg-dark-500/50 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm relative group overflow-hidden"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
              >
                {/* Button glow effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/0 via-white/5 to-primary/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative z-10 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Zurück
                </span>
              </button>
              
              <button
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-70 disabled:hover:shadow-none relative overflow-hidden group"
                onClick={handleNextStep}
                disabled={currentStep === steps.length}
              >
                {/* Enhanced glow effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="absolute -inset-1 bg-gradient-to-r from-primary/0 to-secondary/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"></span>
                <span className="relative z-10 flex items-center">
                  {currentStep === steps.length ? "Abschließen" : "Weiter"}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
          
          {/* Right side - Content */}
          <div className="relative">
            {/* 3D-style decorative elements */}
            <div className="absolute -right-4 top-1/4 w-1 h-20 bg-gradient-to-b from-secondary/50 to-primary/50 rounded-full blur-sm"></div>
            
            <div className="border border-gray-700/30 rounded-xl overflow-hidden bg-gradient-to-br from-dark-400/60 to-dark-500/60 backdrop-blur-lg shadow-inner relative">
              {/* Glass reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30 pointer-events-none"></div>
              {currentStep === 1 && (
                <div className="p-5 space-y-5">
                  <h4 className="text-lg font-medium text-gray-200 mb-4">Token-Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-1 text-gray-300 font-medium">Name</label>
                      <div className="bg-dark-200/30 border border-gray-700/30 rounded-lg px-3 py-2 text-white backdrop-blur-sm shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {tokenData.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-300 font-medium">Symbol</label>
                      <div className="bg-dark-200/30 border border-gray-700/30 rounded-lg px-3 py-2 text-white backdrop-blur-sm shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {tokenData.symbol}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-300 font-medium">Angebot</label>
                      <div className="bg-dark-200/30 border border-gray-700/30 rounded-lg px-3 py-2 text-white backdrop-blur-sm shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {parseInt(tokenData.supply).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-300 font-medium">Netzwerk</label>
                      <div className="bg-dark-200/30 border border-gray-700/30 rounded-lg px-3 py-2 text-white backdrop-blur-sm shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {tokenData.network}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-300 font-medium">Token-Typ</label>
                      <div className="bg-dark-200/30 border border-gray-700/30 rounded-lg px-3 py-2 text-white backdrop-blur-sm shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {tokenData.tokenType}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="p-5">
                  <h4 className="text-lg font-medium text-gray-200 mb-4">Token-Verteilung</h4>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <AllocationChart tokenData={tokenData} />
                  </motion.div>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="p-5 space-y-5">
                  <h4 className="text-lg font-medium text-gray-200 mb-4">Mining-Parameter</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Mining-Belohnungen</label>
                      <div className="bg-dark-200/30 border border-gray-700/30 rounded-lg px-3 py-2 text-white backdrop-blur-sm shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="bg-gradient-to-r from-primary-300 to-secondary-300 bg-clip-text text-transparent font-medium">{tokenData.miningRewards}%</span> des Angebots
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Emission Schedule</label>
                      <div className="bg-dark-200/30 border border-gray-700/30 rounded-lg px-3 py-2 text-white backdrop-blur-sm shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent font-medium">Linear</span> über 4 Jahre
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Halving</label>
                      <div className="bg-dark-200/30 border border-gray-700/30 rounded-lg px-3 py-2 text-white backdrop-blur-sm shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        Alle <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent font-medium">12 Monate</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Aktivitätsmultiplikator</label>
                      <div className="bg-dark-200/30 border border-gray-700/30 rounded-lg px-3 py-2 text-white backdrop-blur-sm shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-medium">Aktiviert</span> (1.0x - 3.0x)
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 4 && (
                <div className="p-5 space-y-4">
                  <h4 className="text-lg font-medium bg-gradient-to-r from-primary-300 to-secondary-300 bg-clip-text text-transparent mb-4">Smart Contract</h4>
                  <div className="space-y-4">
                    <div className="relative">
                      {/* Glow effect for code block */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-sm opacity-70"></div>
                      
                      <pre className="p-3 bg-dark-200/30 border border-gray-700/30 rounded-lg text-xs overflow-auto max-h-64 text-gray-300 backdrop-blur-sm shadow-inner relative">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ${tokenData.symbol}Token is ERC20, Ownable {
    // Token distribution
    uint256 public constant MINING_ALLOCATION = ${tokenData.miningRewards};
    uint256 public constant TEAM_ALLOCATION = ${tokenData.teamAllocation};
    uint256 public constant LIQUIDITY_ALLOCATION = ${tokenData.liquidity};
    // ... more code here
    
    constructor() ERC20("${tokenData.name}", "${tokenData.symbol}") {
        _mint(msg.sender, ${tokenData.supply} * 10**decimals());
    }
}`}
                      </pre>
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="flex items-center bg-gradient-to-r from-dark-400/30 to-dark-300/30 p-3 rounded-lg border border-gray-700/30 backdrop-blur-sm relative overflow-hidden group"
                    >
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Glow effect */}
                      <div className="absolute -inset-1 bg-green-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                      
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                      <span className="text-sm text-gray-200 relative z-10">Contract verified and secure</span>
                    </motion.div>
                  </div>
                </div>
              )}
              
              {currentStep === 5 && (
                <div className="p-5 space-y-5">
                  <h4 className="text-lg font-medium text-gray-200 mb-4">Deployment</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-dark-200/50 border border-gray-700/50 rounded-lg space-y-3 backdrop-blur-md relative overflow-hidden group">
                      {/* Glass reflection effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30 pointer-events-none"></div>
                      
                      {/* 3D hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="flex items-center justify-between mb-2 relative z-10">
                        <span className="text-sm text-gray-400">Netzwerk</span>
                        <span className="text-sm font-medium text-white bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">{tokenData.network}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2 relative z-10">
                        <span className="text-sm text-gray-400">Gas-Gebühr</span>
                        <span className="text-sm font-medium text-white bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">~0.05 ETH</span>
                      </div>
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-sm text-gray-400">Geschätzte Zeit</span>
                        <span className="text-sm font-medium text-white bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">~2 Minuten</span>
                      </div>
                    </div>
                    <button className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg flex items-center justify-center font-medium hover:shadow-lg hover:shadow-primary/30 transition-all relative overflow-hidden group">
                      {/* Enhanced glow effect */}
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                      <span className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></span>
                      <CreditCard className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      <span className="relative z-10">Deployment starten</span>
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-2 animate-pulse-slow">
                      Sie werden aufgefordert, die Transaktion in Ihrer Wallet zu bestätigen
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ParallaxSection>
    </div>
  );
};

export default TokenCreationDemo;
