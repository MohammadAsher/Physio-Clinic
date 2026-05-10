'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center px-6">

      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-rose-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl">

          {/* Icon */}
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 120,
              damping: 12,
            }}
            className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center shadow-[0_10px_40px_rgba(244,63,94,0.35)]"
          >
            <ShieldAlert className="w-12 h-12 text-white" />
          </motion.div>

          {/* Badge */}
          <div className="flex justify-center mb-4">
            <div className="px-4 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Access Restricted
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-bold text-center text-white mb-4">
            Unauthorized Access
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-center text-lg leading-relaxed max-w-xl mx-auto mb-10">
            You do not have permission to access this page.
            Please contact the administrator or return to your dashboard.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Go Home
              </motion.button>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          {/* Bottom Text */}
          <div className="mt-10 text-center">
            <p className="text-slate-500 text-sm">
              Error Code: 403 Forbidden
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}