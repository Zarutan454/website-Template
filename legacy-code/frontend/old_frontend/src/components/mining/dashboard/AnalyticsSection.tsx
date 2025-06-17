
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivitySquare, TrendingUp, DollarSign, Clock, Target } from 'lucide-react';
import { MiningActivity, MiningStats } from '@/hooks/mining/types';

// Hilfsfunktion zum Gruppieren von Aktivitäten nach Typen
const groupActivitiesByType = (activities: MiningActivity[]) => {
  const grouped = activities.reduce((acc, activity) => {
    const type = activity.activity_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(activity);
    return acc;
  }, {} as Record<string, MiningActivity[]>);

  return Object.entries(grouped).map(([type, activities]) => ({
    name: type,
    count: activities.length,
    tokens: activities.reduce((sum, act) => sum + (act.tokens_earned || 0), 0),
    points: activities.reduce((sum, act) => sum + (act.points || 0), 0)
  }));
};

// Hilfsfunktion zum Gruppieren von Aktivitäten nach Tag
const groupActivitiesByDay = (activities: MiningActivity[], days = 7) => {
  const now = new Date();
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const displayDate = format(date, 'dd.MM', { locale: de });
    
    // Filtere Aktivitäten für den aktuellen Tag
    const dayActivities = activities.filter(activity => {
      const activityDate = typeof activity.created_at === 'string' 
        ? new Date(activity.created_at) 
        : activity.created_at;
      return format(activityDate, 'yyyy-MM-dd') === dateStr;
    });

    result.push({
      date: displayDate,
      tokens: dayActivities.reduce((sum, act) => sum + (act.tokens_earned || 0), 0).toFixed(2),
      points: dayActivities.reduce((sum, act) => sum + (act.points || 0), 0),
      activities: dayActivities.length
    });
  }

  return result;
};

interface AnalyticsSectionProps {
  miningStats: MiningStats;
  activities: MiningActivity[];
  isMining: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ 
  miningStats, 
  activities,
  isMining 
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  
  // Daten vorbereiten
  const activityTypeData = groupActivitiesByType(activities);
  const activityTimeData = groupActivitiesByDay(activities, timeRange === 'week' ? 7 : 30);
  
  // Mining-Effizienz berechnen
  const efficiencyPercent = ((miningStats.efficiency_multiplier || 1) * 100).toFixed(0);
  
  // Mining-Rate berechnen (Tokens pro Stunde)
  const hourlyRate = ((miningStats.mining_rate || 0.1) * 60).toFixed(2);
  
  // Projizierte tägliche und monatliche Einnahmen
  const projectedDailyEarnings = (Number(hourlyRate) * 24).toFixed(2);
  const projectedMonthlyEarnings = (Number(projectedDailyEarnings) * 30).toFixed(2);
  
  // Berechnen der aktiven Mining-Zeit
  const firstActivityDate = activities.length > 0 
    ? new Date(activities[activities.length - 1].created_at) 
    : new Date();
  const miningDays = differenceInDays(new Date(), firstActivityDate) || 1;
  
  // Average calculations
  const totalTokens = activities.reduce((sum, act) => sum + act.tokens_earned, 0);
  const dailyAverage = (totalTokens / miningDays).toFixed(2);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <CardTitle className="text-xl flex items-center">
          <ActivitySquare className="mr-2 h-5 w-5 text-primary" />
          Mining-Analysen
        </CardTitle>
        
        <Tabs defaultValue="week" className="w-[200px]">
          <TabsList>
            <TabsTrigger value="week" onClick={() => setTimeRange('week')}>
              Woche
            </TabsTrigger>
            <TabsTrigger value="month" onClick={() => setTimeRange('month')}>
              Monat
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-primary" />
              Mining-Effizienz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{efficiencyPercent}%</div>
            <p className="text-xs text-muted-foreground">
              Streak: {miningStats.streak_days || 0} Tage
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-primary" />
              Mining-Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hourlyRate} BSN/h</div>
            <p className="text-xs text-muted-foreground">
              Status: {isMining ? "Aktiv" : "Inaktiv"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="mr-2 h-4 w-4 text-primary" />
              Ø Tägliche Belohnung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyAverage} BSN</div>
            <p className="text-xs text-muted-foreground">
              Aktiver Mining: {miningDays} Tage
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4 text-primary" />
              Prognose (monatlich)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectedMonthlyEarnings} BSN</div>
            <p className="text-xs text-muted-foreground">
              Bei aktuellem Rate: {hourlyRate} BSN/h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Types Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aktivitätstypen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="count"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {activityTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [value, name]}
                    labelFormatter={() => 'Aktivitäten'}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tokens im Zeitverlauf</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activityTimeData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} BSN`, 'Tokens']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    name="BSN Tokens"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aktivitätsdetails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityTimeData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="activities" fill="#8884d8" name="Anzahl Aktivitäten" />
                <Bar dataKey="points" fill="#82ca9d" name="Punkte" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection;
