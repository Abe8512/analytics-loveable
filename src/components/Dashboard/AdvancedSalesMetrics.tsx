
import React, { useMemo } from "react";
import { 
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Scatter
} from "recharts";
import { 
  TrendingUp, MessageCircle, PieChart as PieChartIcon, Zap, Award, Gauge, 
  ThumbsUp, CheckCircle, AlertTriangle, Clock, Users, DollarSign
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  generateMockKPIData, 
  generateMockChartData, 
  generateMockSalesFunnelData, 
  USE_MOCK_DATA 
} from "@/services/MockDataService";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { motion } from "framer-motion";

// Custom color palette
const COLORS = {
  primary: '#9b87f5',
  secondary: '#00F0FF',
  tertiary: '#06D6A0',
  quaternary: '#f87171',
  accent1: '#f59e0b',
  accent2: '#3b82f6',
  darkBackground: '#1A1F2C',
  lightBackground: '#F6F6F7',
  CHART_COLORS: ['#9b87f5', '#00F0FF', '#06D6A0', '#f87171', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899']
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  const { isDarkMode } = useTheme();
  if (active && payload && payload.length) {
    return (
      <div className={cn(
        "px-3 py-2 rounded-lg shadow-md border",
        isDarkMode ? "bg-dark-purple border-white/10" : "bg-white border-gray-200"
      )}>
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-xs" style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}: </span>
            {entry.value}{typeof entry.unit === 'string' ? entry.unit : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AdvancedSalesMetrics = () => {
  const { isDarkMode } = useTheme();
  
  // Get mock data using useMemo to prevent unnecessary recalculations
  const kpiData = useMemo(() => generateMockKPIData(), []);
  const chartData = useMemo(() => generateMockChartData(), []);
  const funnelData = useMemo(() => generateMockSalesFunnelData(), []);
  
  // Customize the background color of cards based on theme
  const cardBackground = isDarkMode ? 
    "bg-gradient-to-br from-dark-purple to-dark-purple/70" : 
    "bg-gradient-to-br from-white to-gray-50";
  
  // Funnel chart customization
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  return (
    <div className="space-y-6">
      <h2 className={cn(
        "text-xl font-bold flex items-center gap-2", 
        isDarkMode ? "text-white" : "text-gray-800"
      )}>
        <Zap className="h-5 w-5 text-neon-purple" />
        Advanced Sales Performance Metrics
      </h2>
      
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className={cn("h-full", cardBackground)}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Objection Handling</CardTitle>
                <ThumbsUp className="h-5 w-5 text-neon-purple" />
              </div>
              <CardDescription>Effectiveness at addressing concerns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Score</span>
                  <span className="text-2xl font-bold">{kpiData.objectionHandlingScore}%</span>
                </div>
                <Progress value={kpiData.objectionHandlingScore} className="h-2" />
                <div className="pt-4 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.objectionHandlingData}>
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke={COLORS.primary}
                        strokeWidth={2} 
                        dot={false}
                        activeDot={{ r: 4, fill: COLORS.primary }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className={cn("h-full", cardBackground)}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Discovery Questions</CardTitle>
                <MessageCircle className="h-5 w-5 text-neon-blue" />
              </div>
              <CardDescription>Questions asked per hour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Rate</span>
                  <span className="text-2xl font-bold">{kpiData.discoveryQuestionsRate}</span>
                </div>
                <div className="pt-4 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.questionFrequencyData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.questionFrequencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.CHART_COLORS[index % COLORS.CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className={cn("h-full", cardBackground)}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Closing Techniques</CardTitle>
                <CheckCircle className="h-5 w-5 text-neon-green" />
              </div>
              <CardDescription>Effectiveness of sales closings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Score</span>
                  <span className="text-2xl font-bold">{kpiData.closingTechniquesScore}%</span>
                </div>
                <Progress value={kpiData.closingTechniquesScore} className="h-2" />
                <div className="pt-4 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius={60} data={chartData.keywordOccurrenceData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? '#ccc' : '#666', fontSize: 10 }} />
                      <Radar name="Keywords" dataKey="A" stroke={COLORS.accent2} fill={COLORS.accent2} fillOpacity={0.6} />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className={cn("h-full", cardBackground)}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Client Engagement</CardTitle>
                <Users className="h-5 w-5 text-neon-pink" />
              </div>
              <CardDescription>Overall customer interaction quality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Score</span>
                  <span className="text-2xl font-bold">{kpiData.clientEngagementScore}%</span>
                </div>
                <Progress value={kpiData.clientEngagementScore} className="h-2" />
                <div className="pt-4 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.talkRatioData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="agent" stackId="a" fill={COLORS.accent1} name="Agent" />
                      <Bar dataKey="customer" stackId="a" fill={COLORS.tertiary} name="Customer" />
                      <Line type="monotone" dataKey="agent" stroke={COLORS.accent1} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Secondary Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className={cn("h-full", cardBackground)}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Sales Effectiveness Breakdown</CardTitle>
                <Gauge className="h-5 w-5 text-neon-purple" />
              </div>
              <CardDescription>Key performance indicators analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Pain Point Identification</span>
                      <span className="text-sm font-medium">{kpiData.painPointIdentificationScore}%</span>
                    </div>
                    <Progress value={kpiData.painPointIdentificationScore} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Follow-Up Commitment</span>
                      <span className="text-sm font-medium">{kpiData.followUpCommitmentRate}%</span>
                    </div>
                    <Progress value={kpiData.followUpCommitmentRate} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Silence Utilization</span>
                      <span className="text-sm font-medium">{100 - kpiData.silencePercentage}%</span>
                    </div>
                    <Progress value={100 - kpiData.silencePercentage} className="h-1.5" />
                  </div>
                </div>
                <div className="md:col-span-2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.talkRatioData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="customer" fill={COLORS.tertiary} stroke={COLORS.tertiary} name="Customer Talk %" />
                      <Bar dataKey="agent" fill={COLORS.primary} name="Agent Talk %" />
                      <Line type="monotone" dataKey="agent" stroke={COLORS.accent2} name="Trend" dot={true} activeDot={{ r: 6 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className={cn("h-full", cardBackground)}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Sales Funnel</CardTitle>
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <CardDescription>Conversion through sales stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={funnelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.CHART_COLORS[index % COLORS.CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Advanced Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <Card className={cn("", cardBackground)}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Silent Moments Analysis</CardTitle>
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <CardDescription>Distribution of silence during calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Silence Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.silenceDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill={COLORS.quaternary} name="Frequency" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Insights</h3>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex gap-2 items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">Silence Pattern</h4>
                        <p className="text-xs mt-1 text-muted-foreground">
                          {kpiData.silencePercentage}% of your calls include silence periods over 5 seconds. 
                          Strategic silence can be powerful, but extended pauses may indicate uncertainty.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex gap-2 items-start">
                      <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">Opportunity</h4>
                        <p className="text-xs mt-1 text-muted-foreground">
                          Shorter 2-3 second pauses after customer objections showed 27% higher conversion rate. 
                          This demonstrates thoughtful consideration of their concerns.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex gap-2 items-start">
                      <Award className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">Best Practice</h4>
                        <p className="text-xs mt-1 text-muted-foreground">
                          Top performers use strategic 3-5 second pauses after asking discovery questions, 
                          allowing customers to elaborate on their needs more thoroughly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdvancedSalesMetrics;
