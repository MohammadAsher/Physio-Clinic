'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, AreaChart as AreaChartIcon, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import PremiumCard from './PremiumCard';

interface AnalyticsSuiteProps {
  isAdmin?: boolean;
  isDoctor?: boolean;
  doctorData?: {
    patientsTreatedToday: number;
    totalAppointments: number;
    dailyPatientVolume: number[];
  };
  adminData?: {
    dailyRevenue: number;
    monthlyTarget: number;
    monthlyRevenue: number;
    appointments?: any[];
    earningsData: {
      daily: { name: string; value: number }[];
      weekly: { name: string; value: number }[];
      monthly: { name: string; value: number }[];
    };
  };
}

const slideUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  },
};

export default function AnalyticsSuite({ isAdmin = false, isDoctor = false, doctorData, adminData }: AnalyticsSuiteProps) {
  const [earningsView, setEarningsView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedMonthData, setSelectedMonthData] = useState<{ month: number; year: number; name: string } | null>(null);
  const [dailyBreakdown, setDailyBreakdown] = useState<{ name: string; value: number; month?: number; year?: number }[]>([]);

  const earningsData = adminData?.earningsData || {
    daily: Array.from({ length: 7 }, (_, i) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - i));
      return {
        name: format(day, 'EEE'),
        value: Math.floor(Math.random() * 5000) + 1000,
      };
    }),
    weekly: Array.from({ length: 4 }, (_, i) => ({
      name: `Week ${i + 1}`,
      value: Math.floor(Math.random() * 20000) + 10000,
    })),
    monthly: Array.from({ length: 6 }, (_, i) => {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - (5 - i));
      return {
        name: format(monthDate, 'MMM'),
        value: Math.floor(Math.random() * 80000) + 30000,
        month: monthDate.getMonth() + 1,
        year: monthDate.getFullYear(),
      };
    }),
  };

  const getDaySuffix = (day: number): string => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Compute daily breakdown for selected month
  useEffect(() => {
    if (!selectedMonthData || !(adminData as any)?.appointments) {
      setDailyBreakdown([]);
      return;
    }
    const monthAppointments = (adminData as any).appointments.filter((appt: any) => {
      const date = appt.date instanceof Date ? appt.date : new Date(appt.date);
      return date.getMonth() + 1 === selectedMonthData.month && date.getFullYear() === selectedMonthData.year;
    });
    // Group by day of month
    const dailyMap = new Map<number, number>();
    monthAppointments.forEach((appt: any) => {
      const date = appt.date instanceof Date ? appt.date : new Date(appt.date);
      const day = date.getDate();
      dailyMap.set(day, (dailyMap.get(day) || 0) + (appt.fee || 0));
    });
    // Convert to array with formatted day labels (1st, 2nd, 3rd, 4th...)
    const dailyData = Array.from(dailyMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([day, value]) => ({
        name: `${day}${getDaySuffix(day)}`,
        value,
        day,
        month: selectedMonthData.month,
        year: selectedMonthData.year,
      }));
    setDailyBreakdown(dailyData);
  }, [selectedMonthData, (adminData as any)?.appointments]);

  const formatCurrency = (value: number) => `PKR ${value.toLocaleString()}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.year, data.month - 1, data.day || 1);
      const formattedDate = data.day
        ? format(date, 'MMMM d, yyyy')
        : format(date, 'MMMM yyyy');
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-slate-400 text-sm">{formattedDate}</p>
          <p className="text-white font-bold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    if (selectedMonthData || !data.month || !data.year) return;
    setSelectedMonthData({ month: data.month, year: data.year, name: data.name });
  };

  const radialData = [
    {
      name: 'Daily Revenue',
      value: adminData?.dailyRevenue || Math.floor(Math.random() * 50000) + 10000,
      fill: '#06b6d4',
    },
  ];

  const targetData = [
    {
      name: 'Target',
      value: 100,
      fill: 'transparent',
    },
    {
      name: 'Progress',
      value: adminData?.monthlyTarget ? 100 : 65,
      fill: '#22c55e',
    },
  ];

  const pieData = doctorData ? [
    { name: 'Treated', value: doctorData.patientsTreatedToday, color: '#10b981' },
    { name: 'Remaining', value: doctorData.totalAppointments - doctorData.patientsTreatedToday, color: '#6b7280' },
  ] : [
    { name: 'Treated', value: 8, color: '#10b981' },
    { name: 'Remaining', value: 4, color: '#6b7280' },
  ];

  const areaData = doctorData ? 
    doctorData.dailyPatientVolume.map((value, index) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
      patients: value,
    })) :
    [
      { day: 'Mon', patients: 5 },
      { day: 'Tue', patients: 8 },
      { day: 'Wed', patients: 12 },
      { day: 'Thu', patients: 7 },
      { day: 'Fri', patients: 10 },
      { day: 'Sat', patients: 6 },
      { day: 'Sun', patients: 4 },
    ];

  return (
    <motion.div
      variants={slideUpVariant}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {isAdmin && (
        <>
          {/* Admin Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Revenue Radial Bar */}
            <motion.div
              variants={slideUpVariant}
              className="premium-glass premium-card relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=800&q=80')] bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-transparent to-slate-900/80" />
              <div className="absolute inset-0 backdrop-blur-[1px]" />
              <div className="relative z-10 flex items-center gap-3 mb-4 p-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white drop-shadow-lg">Daily Revenue</h3>
              </div>
              <div className="relative z-10 h-64 px-6 pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    data={radialData}
                    startAngle={90}
                    endAngle={450}
                  >
                    <RadialBar
                      minAngle={15}
                      label={{ fill: '#fff', position: 'insideStart' }}
                      background
                      clockWise={true}
                      dataKey="value"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '12px',
                        color: '#fff',
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <p className="relative z-10 text-center text-slate-300 mt-2 pb-6 font-bold">
                {formatCurrency(adminData?.dailyRevenue || 35000)}
              </p>
            </motion.div>

            {/* Monthly Target Radial Bar */}
            <motion.div
              variants={slideUpVariant}
              className="premium-glass premium-card relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551269901-b5f7d5c0c0c2?w=800&q=80')] bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-slate-900/70" />
              <div className="absolute inset-0 backdrop-blur-[1px]" />
              <div className="relative z-10 flex items-center gap-3 mb-4 p-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white drop-shadow-lg">Monthly Target</h3>
              </div>
              <div className="relative z-10 h-64 px-6 pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    data={targetData}
                    startAngle={90}
                    endAngle={450}
                  >
                    <RadialBar
                      minAngle={15}
                      background
                      clockWise={true}
                      dataKey="value"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '12px',
                        color: '#fff',
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <p className="relative z-10 text-center text-slate-300 mt-2 pb-6 font-bold">
                {adminData?.monthlyTarget || 65}% Complete
              </p>
            </motion.div>
          </div>

           {/* Earnings Bar Chart */}
            <motion.div
              variants={slideUpVariant}
              className="premium-glass premium-card relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=800&q=80')] bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-transparent to-slate-900/80" />
              <div className="absolute inset-0 backdrop-blur-[1px]" />
              <div className="relative z-10 flex items-center justify-between mb-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white drop-shadow-lg">Earnings</h3>
                </div>
                <div className="flex gap-2">
                  {(['daily', 'weekly', 'monthly'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setEarningsView(view)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        earningsView === view
                          ? 'premium-gradient text-white'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
               <div className="relative z-10 h-64 px-6 pb-6">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart
                     data={selectedMonthData ? dailyBreakdown : earningsData[earningsView]}
                     barGap={0}
                   >
                     <XAxis
                       dataKey="name"
                       stroke="#64748b"
                       fontSize={12}
                       tickLine={false}
                       axisLine={false}
                     />
                     <YAxis
                       stroke="#64748b"
                       fontSize={12}
                       tickLine={false}
                       axisLine={false}
                       tickFormatter={(value) => `PKR ${value / 1000}k`}
                     />
                     <CustomTooltip />
                     <Bar
                       dataKey="value"
                       fill="url(#barGradient)"
                       radius={[4, 4, 0, 0]}
                       filter="url(#barShadow)"
                       onClick={handleBarClick}
                     />
                     <defs>
                       <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#06b6d4" />
                         <stop offset="100%" stopColor="#3b82f6" />
                       </linearGradient>
                       <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                         <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
                       </filter>
                     </defs>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
               {selectedMonthData && (
                 <div className="relative z-10 px-6 pb-6">
                   <h4 className="text-lg font-semibold text-white mb-4">
                     Earnings for {selectedMonthData.name} {selectedMonthData.year}
                   </h4>
                   <button
                     onClick={() => setSelectedMonthData(null)}
                     className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 transition-colors text-sm"
                   >
                     Back to Monthly
                   </button>
                 </div>
               )}
            </motion.div>
        </>
      )}

      {isDoctor && (
        <>
          {/* Doctor Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patients Treated Pie Chart */}
            <motion.div
              variants={slideUpVariant}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <PieChartIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Today's Appointments</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="text-center">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full mx-auto mb-1" />
                  <p className="text-slate-400 text-xs">Treated: {pieData[0].value}</p>
                </div>
                <div className="text-center">
                  <div className="w-4 h-4 bg-slate-500 rounded-full mx-auto mb-1" />
                  <p className="text-slate-400 text-xs">Remaining: {pieData[1].value}</p>
                </div>
              </div>
            </motion.div>

            {/* Patient Volume Area Chart */}
            <motion.div
              variants={slideUpVariant}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <AreaChartIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Patient Volume (7 Days)</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <XAxis
                      dataKey="day"
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="patients"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#areaGradient)"
                      filter="url(#glow)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}