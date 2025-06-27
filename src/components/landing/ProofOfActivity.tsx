
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Activity, 
  Users, 
  Zap, 
  Trophy, 
  Clock, 
  ChevronRight,
  MessageCircle,
  Heart, 
  Bookmark,
  Share2,
  BarChart4,
  Calendar,
  Star
} from 'lucide-react';
import GlowingButton from './GlowingButton';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GradientText } from '@/components/ui/gradient-text';
import { useLanguage } from '@/components/LanguageProvider';

interface ActivityType {
  id: number;
  name: string;
  icon: React.ReactNode;
  value: number;
  baseReward: number;
  unit: string;
  frequency: string;
  details: string;
  color: string;
}

const ProofOfActivity: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { t, language } = useLanguage();

  const activities: ActivityType[] = [
    { 
      id: 1,
      name: "Social Engagement", 
      icon: <Users size={20} className="text-white" />, 
      value: 72,
      baseReward: 5,
      unit: "pro Interaktion",
      frequency: "täglich",
      details: "Likes, Kommentare und Shares in der Community",
      color: "from-pink-500 to-pink-600" 
    },
    { 
      id: 2,
      name: "Content Creation", 
      icon: <MessageCircle size={20} className="text-white" />, 
      value: 88,
      baseReward: 25,
      unit: "pro Qualitätsbeitrag",
      frequency: "wöchentlich",
      details: "Hochwertige Beiträge und Diskussionen erstellen",
      color: "from-pink-600 to-pink-700" 
    },
    { 
      id: 3,
      name: "Community Building", 
      icon: <Trophy size={20} className="text-white" />, 
      value: 64,
      baseReward: 50,
      unit: "für aktives Netzwerken",
      frequency: "wöchentlich",
      details: "Neue Verbindungen und Community-Wachstum",
      color: "from-pink-400 to-pink-500" 
    },
    { 
      id: 4,
      name: "Daily Check-in", 
      icon: <Clock size={20} className="text-white" />, 
      value: 95,
      baseReward: 10,
      unit: "pro Check-in",
      frequency: "täglich",
      details: "Regelmäßige Aktivität auf der Plattform",
      color: "from-pink-500 to-pink-600" 
    },
  ];

  const [totalBSN, setTotalBSN] = useState(0);
  const [todayEarned, setTodayEarned] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);

  useEffect(() => {
    // Calculate total BSN based on activities
    const total = activities.reduce((acc, activity) => {
      let multiplier = 1;
      if (activity.frequency === "täglich") {
        multiplier = 30; // monthly estimate
      } else if (activity.frequency === "wöchentlich") {
        multiplier = 4; // monthly estimate
      }
      return acc + (activity.baseReward * activity.value / 100 * multiplier);
    }, 0);
    
    setTotalBSN(Math.round(total));
    
    // Random amount for today between 10 and total/30
    const today = Math.floor(Math.random() * (total/30 - 10) + 10);
    setTodayEarned(today);
    
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, [activities]);

  return (
    <section className="py-20 md:py-32 relative" id="mining" ref={ref}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 30, 0], 
            y: [0, -30, 0],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 8,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -20, 0], 
            y: [0, 20, 0],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 10,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.div 
            className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-pink-500/10 to-pink-600/10 rounded-full backdrop-blur-sm border border-pink-500/20"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 20px rgba(227, 28, 121, 0.3)"
            }}
          >
            <span className="text-pink-400 font-medium">{t('mining.title')}</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GradientText 
              variant="primary" 
              className="text-3xl md:text-4xl font-bold mb-6"
              animate={true}
            >
              {language === 'de' 
                ? 'Verdiene Token durch soziale Interaktionen' 
                : 'Earn Tokens Through Social Interactions'}
            </GradientText>
          </motion.div>
          
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            {t('mining.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feature & Analytics Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card variant="glass" className="overflow-hidden relative group">
              {/* Glow effect on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur"></div>
              
              <div className="p-6 border-b border-white/10 relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-0 shadow-lg shadow-pink-500/20">
                    <Activity size={24} className="text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-white">{t('mining.dashboard')}</h3>
                    <p className="text-gray-400">{t('mining.dashboard.desc')}</p>
                  </div>
                  <div className="ml-auto">
                    <Badge className="bg-green-500/20 text-green-400 border-0 flex items-center gap-1 px-3 py-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      {t('mining.status.active')}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-dark-400/30 backdrop-blur-md rounded-lg p-4 border border-white/10 hover:border-pink-500/20 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-gray-400 text-sm">{t('mining.total')}</p>
                      <Badge variant="outline" className="bg-pink-500/10 border-pink-500/30 text-pink-400">
                        {language === 'de' ? 'Monat' : 'Month'}
                      </Badge>
                    </div>
                    <div className="flex items-end">
                      <h4 className="text-2xl font-bold text-white animate-number-count">{totalBSN}</h4>
                      <span className="text-green-400 text-sm ml-2">+{Math.floor(totalBSN*0.12)} BSN</span>
                    </div>
                    <Progress value={65} className="h-1 mt-2 animate-chart-grow" />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-dark-400/30 backdrop-blur-md rounded-lg p-4 border border-white/10 hover:border-pink-500/20 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-gray-400 text-sm">{t('mining.today')}</p>
                      <Badge variant="outline" className="bg-pink-500/10 border-pink-500/30 text-pink-400">
                        {currentTime.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </Badge>
                    </div>
                    <div className="flex items-end">
                      <h4 className="text-2xl font-bold text-white animate-number-count">{todayEarned}</h4>
                      <span className="text-green-400 text-sm ml-2">+{Math.floor(todayEarned*0.15)} BSN</span>
                    </div>
                    <Progress value={Math.floor((todayEarned/(totalBSN/30))*100)} className="h-1 mt-2 animate-chart-grow" />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-dark-400/30 backdrop-blur-md rounded-lg p-4 border border-white/10 hover:border-pink-500/20 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-gray-400 text-sm">{t('mining.efficiency')}</p>
                      <Badge variant="outline" className="bg-pink-500/10 border-pink-500/30 text-pink-400">
                        {currentTime.toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Badge>
                    </div>
                    <div className="flex items-end">
                      <h4 className="text-2xl font-bold text-white animate-number-count">78%</h4>
                      <span className="text-green-400 text-sm ml-2">+12%</span>
                    </div>
                    <Progress value={78} className="h-1 mt-2 animate-chart-grow" />
                  </motion.div>
                </div>

                <div className="bg-dark-400/20 backdrop-blur-md rounded-lg p-4 mb-6 border border-white/5 hover:border-pink-500/20 transition-all duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-white font-medium">{t('mining.performance')}</h4>
                    <div className="flex space-x-2 text-sm">
                      <button className="text-pink-400 underline">{language === 'de' ? 'Woche' : 'Week'}</button>
                      <button className="text-gray-400">{language === 'de' ? 'Monat' : 'Month'}</button>
                      <button className="text-gray-400">{language === 'de' ? 'Jahr' : 'Year'}</button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {activities.slice(0, 2).map((activity) => (
                        <div key={activity.id} className="relative">
                          <div 
                            className="p-3 bg-dark-300/70 rounded-lg hover:bg-dark-300 transition-colors cursor-pointer"
                            onClick={() => setSelectedActivity(activity === selectedActivity ? null : activity)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center mr-3`}>
                                  {activity.icon}
                                </div>
                                <div>
                                  <h5 className="text-white font-medium">{activity.name}</h5>
                                  <p className="text-xs text-gray-400">{activity.baseReward} BSN {activity.unit}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-white font-medium">{activity.value}%</span>
                                <Progress value={activity.value} className="h-1 w-16 mt-1" />
                              </div>
                            </div>
                            
                            {selectedActivity?.id === activity.id && (
                              <div className="mt-3 p-3 bg-dark-400/50 rounded-lg text-sm text-gray-300">
                                <p>{activity.details}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-pink-400 font-medium">
                                    ~{Math.floor(activity.baseReward * activity.value / 100 * (activity.frequency === "täglich" ? 30 : 4))} BSN / Monat
                                  </span>
                                  <Badge className="bg-dark-300 text-gray-300">
                                    {activity.frequency}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      {activities.slice(2, 4).map((activity) => (
                        <div key={activity.id} className="relative">
                          <div 
                            className="p-3 bg-dark-300/70 rounded-lg hover:bg-dark-300 transition-colors cursor-pointer"
                            onClick={() => setSelectedActivity(activity === selectedActivity ? null : activity)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center mr-3`}>
                                  {activity.icon}
                                </div>
                                <div>
                                  <h5 className="text-white font-medium">{activity.name}</h5>
                                  <p className="text-xs text-gray-400">{activity.baseReward} BSN {activity.unit}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-white font-medium">{activity.value}%</span>
                                <Progress value={activity.value} className="h-1 w-16 mt-1" />
                              </div>
                            </div>
                            
                            {selectedActivity?.id === activity.id && (
                              <div className="mt-3 p-3 bg-dark-400/50 rounded-lg text-sm text-gray-300">
                                <p>{activity.details}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-pink-400 font-medium">
                                    ~{Math.floor(activity.baseReward * activity.value / 100 * (activity.frequency === "täglich" ? 30 : 4))} BSN / Monat
                                  </span>
                                  <Badge className="bg-dark-300 text-gray-300">
                                    {activity.frequency}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex items-center bg-dark-400/20 backdrop-blur-md p-3 rounded-lg border border-white/5 hover:border-pink-500/20 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/30 to-pink-600/30 flex items-center justify-center mr-3 shadow-lg shadow-pink-500/10">
                    <Zap size={20} className="text-pink-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white">{t('mining.boost')}</p>
                    <p className="text-xs text-gray-400">{t('mining.boost.desc')}</p>
                  </div>
                  <GlowingButton className="px-4 py-1.5 text-sm">
                    {t('mining.boost.activate')}
                  </GlowingButton>
                </motion.div>
              </div>
              
              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-white">{t('mining.activities')}</h4>
                  <Badge variant="outline" className="bg-pink-500/10 border-pink-500/30 text-pink-400 flex items-center">
                    <Calendar size={14} className="mr-1.5" />
                    {currentTime.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-dark-400/40 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3 text-pink-400">
                        <MessageCircle size={16} />
                      </div>
                      <div>
                        <p className="text-white text-sm">Kommentar zu "DeFi Trends 2025"</p>
                        <p className="text-xs text-gray-400">Vor 32 Minuten</p>
                      </div>
                    </div>
                    <Badge className="bg-pink-500/20 text-pink-400 border-0">
                      +8 BSN
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-dark-400/40 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3 text-pink-400">
                        <Heart size={16} />
                      </div>
                      <div>
                        <p className="text-white text-sm">5 Likes erhalten für deinen Beitrag</p>
                        <p className="text-xs text-gray-400">Vor 1 Stunde</p>
                      </div>
                    </div>
                    <Badge className="bg-pink-500/20 text-pink-400 border-0">
                      +5 BSN
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-dark-400/40 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3 text-pink-400">
                        <Users size={16} />
                      </div>
                      <div>
                        <p className="text-white text-sm">3 neue Follower gewonnen</p>
                        <p className="text-xs text-gray-400">Vor 3 Stunden</p>
                      </div>
                    </div>
                    <Badge className="bg-pink-500/20 text-pink-400 border-0">
                      +15 BSN
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
          
          {/* Activity Board */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-dark-300/50 backdrop-blur-sm border border-white/5 overflow-hidden h-full">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Aktivitäts-Guide</h3>
                  <Badge className="bg-dark-400 text-gray-300">März 2025</Badge>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Dein Mining-Level</h4>
                    <Badge className="bg-pink-500/20 text-pink-400 border-0 flex items-center">
                      <Star size={12} className="mr-1 fill-pink-400" />
                      Silber
                    </Badge>
                  </div>
                  <div className="flex items-center h-6">
                    <div className="w-[70%] h-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-l-full"></div>
                    <div className="w-[30%] h-2 bg-dark-400 rounded-r-full"></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-400">5,400 / 7,500 XP</span>
                    <span className="text-gray-400">Gold Level</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="bg-dark-400/40 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center mr-3">
                          <MessageCircle size={16} className="text-pink-400" />
                        </div>
                        <span className="text-white font-medium">Erstelle 3 Beiträge</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-0">2/3</Badge>
                    </div>
                    <Progress value={66} className="h-1" />
                    <p className="text-xs text-gray-400 mt-2">Belohnung: 30 BSN</p>
                  </div>
                  
                  <div className="bg-dark-400/40 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center mr-3">
                          <Heart size={16} className="text-pink-400" />
                        </div>
                        <span className="text-white font-medium">Sammle 10 Likes</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-0">7/10</Badge>
                    </div>
                    <Progress value={70} className="h-1" />
                    <p className="text-xs text-gray-400 mt-2">Belohnung: 15 BSN</p>
                  </div>
                  
                  <div className="bg-dark-400/40 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center mr-3">
                          <Share2 size={16} className="text-pink-400" />
                        </div>
                        <span className="text-white font-medium">Teile 5 Beiträge</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-0">2/5</Badge>
                    </div>
                    <Progress value={40} className="h-1" />
                    <p className="text-xs text-gray-400 mt-2">Belohnung: 25 BSN</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-pink-500/10 to-purple-600/10 rounded-lg border border-pink-500/20">
                  <div className="flex items-center mb-3">
                    <Trophy size={18} className="text-pink-400 mr-2" />
                    <h5 className="text-white font-medium">Wöchentliche Challenge</h5>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">Kommentiere bei 10 verschiedenen Nutzern und erhalte einen Mining-Boost von 50% für 48 Stunden!</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-white font-medium">3/10</span>
                      <Progress value={30} className="h-1 w-24 ml-2" />
                    </div>
                    <Badge className="bg-dark-300/50 text-gray-300">
                      5 Tage übrig
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-white font-medium">Top Miner dieser Woche</h5>
                  <Badge variant="outline" className="border-pink-500/30 text-pink-400">
                    <BarChart4 size={14} className="mr-1" />
                    Rangliste
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center p-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-dark-300 font-bold mr-2">1</div>
                    <Avatar className="w-8 h-8 mr-2 border-2 border-yellow-500">
                      <img src="https://i.pravatar.cc/150?img=68" alt="Top Miner" />
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-white text-sm font-medium">CryptoKing</span>
                        <Badge className="ml-2 bg-yellow-500/20 text-yellow-400 border-0 text-xs">
                          Premium
                        </Badge>
                      </div>
                    </div>
                    <span className="text-white font-medium">867 BSN</span>
                  </div>
                  
                  <div className="flex items-center p-2">
                    <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-dark-300 font-bold mr-2">2</div>
                    <Avatar className="w-8 h-8 mr-2 border-2 border-gray-400">
                      <img src="https://i.pravatar.cc/150?img=47" alt="Top Miner" />
                    </Avatar>
                    <div className="flex-1">
                      <span className="text-white text-sm font-medium">Blockchain_Eva</span>
                    </div>
                    <span className="text-white font-medium">743 BSN</span>
                  </div>
                  
                  <div className="flex items-center p-2">
                    <div className="w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center text-dark-300 font-bold mr-2">3</div>
                    <Avatar className="w-8 h-8 mr-2 border-2 border-amber-700">
                      <img src="https://i.pravatar.cc/150?img=12" alt="Top Miner" />
                    </Avatar>
                    <div className="flex-1">
                      <span className="text-white text-sm font-medium">TokenMaster</span>
                    </div>
                    <span className="text-white font-medium">651 BSN</span>
                  </div>
                  
                  <div className="flex items-center p-2 bg-pink-500/10 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold mr-2">8</div>
                    <Avatar className="w-8 h-8 mr-2 border-2 border-pink-500">
                      <img src="https://i.pravatar.cc/150?img=3" alt="Your Avatar" />
                    </Avatar>
                    <div className="flex-1">
                      <span className="text-white text-sm font-medium">Du</span>
                    </div>
                    <span className="text-white font-medium">458 BSN</span>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <GlowingButton className="w-full py-2.5 text-sm">
                    Mining-Aktivitäten optimieren
                    <ChevronRight size={16} className="ml-1" />
                  </GlowingButton>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProofOfActivity;
