'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Shield, ArrowRight, X } from 'lucide-react';
import { User } from '@/types';

interface AdminDashboardProps {
  users: User[];
  onAssignRole: (userId: string, role: 'patient' | 'doctor') => void;
  onLogout: () => void;
}

export default function AdminDashboard({ users, onAssignRole, onLogout }: AdminDashboardProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const patients = users.filter(u => u.role === 'patient');
  const doctors = users.filter(u => u.role === 'doctor');

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
            <p className="text-slate-400">Manage users and assign roles</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            className="glass-button secondary flex items-center gap-2"
          >
            <span>Sign Out</span>
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl blue-gradient flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Patients</h2>
            </div>
            <p className="text-4xl font-bold text-sky mb-2">{patients.length}</p>
            <p className="text-slate-400 text-sm">Registered patients</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl red-gradient flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Doctors</h2>
            </div>
            <p className="text-4xl font-bold text-primary mb-2">{doctors.length}</p>
            <p className="text-slate-400 text-sm">Active physiotherapists</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-white">User Management</h2>
          </div>

          <div className="space-y-3">
            {users.map((user) => (
              <motion.div
                key={user.id}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full premium-gradient flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'doctor' 
                      ? 'bg-primary/20 text-primary' 
                      : user.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-sky/20 text-sky'
                  }`}>
                    {user.role}
                  </span>
                  {user.role === 'patient' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onAssignRole(user.id, 'doctor')}
                      className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-sm hover:bg-primary/30 transition-colors"
                    >
                      Make Doctor
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No users registered yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}