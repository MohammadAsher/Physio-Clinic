'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, AreaChart as AreaChartIcon, Calendar } from 'lucide-react';

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

  const earningsData = adminData?.earningsData || {
    daily: Array.from({ length: 7 }, (_, i) => ({ name: `Day ${i + 1}`, value: Math.floor(Math.random() * 5000) + 1000 })),
    weekly: Array.from({ length: 4 }, (_, i) => ({ name: `Week ${i + 1}`, value: Math.floor(Math.random() * 20000) + 10000 })),
    monthly: Array.from({ length: 6 }, (_, i) => ({ name: `Month ${i + 1}`, value: Math.floor(Math.random() * 80000) + 30000 })),
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
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Daily Revenue</h3>
              </div>
              <div className="h-64">
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
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-slate-400 mt-2">PKR {(adminData?.dailyRevenue || 35000).toLocaleString()}</p>
            </motion.div>

            {/* Monthly Target Radial Bar */}
            <motion.div
              variants={slideUpVariant}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Monthly Target</h3>
              </div>
              <div className="h-64">
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
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-slate-400 mt-2">{adminData?.monthlyTarget || 65}% Complete</p>
            </motion.div>
          </div>

          {/* Earnings Bar Chart */}
          <motion.div
            variants={slideUpVariant}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Earnings</h3>
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
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsData[earningsView]}>
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
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