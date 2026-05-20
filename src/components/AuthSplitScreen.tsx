import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, Activity, ShieldCheck, Sparkles } from 'lucide-react';

export default function PremiumAuthLayout() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting context data:", formData);
    // Yahan aapka firebase logic integrate hoga
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center font-sans overflow-hidden antialiased">
      
      {/* MAIN CONTAINER SPLIT DESIGN */}
      <div className="w-full h-screen lg:h-[90vh] lg:max-w-6xl lg:rounded-2xl lg:border lg:border-white/10 bg-[#090d16]/40 flex overflow-hidden shadow-2xl relative">
        
        {/* ========================================================================= */}
        {/* LEFT SIDE: DYNAMIC INSTAGRAM-STYLE CINEMATIC ANIMATION PANEL (60%) */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex lg:w-[55%] bg-[#030712] relative items-center justify-center p-12 overflow-hidden border-r border-white/5">
          
          {/* Animated Ambient Light Gradients (Pulsing Grid Circles) */}
          <div className="absolute top-[-10%] left-[-15%] w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] animate-pulse duration-4000" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse duration-3000" />
          
          {/* Moving Tech Matrix Backdrop lines */}
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Core Content Shell */}
          <div className="relative z-10 text-center flex flex-col items-center max-w-sm">
            
            {/* Pulsing Medical Brand Shield Widget */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20 mb-8 transform hover:scale-105 transition-transform duration-500 relative group">
              <div className="absolute inset-0 rounded-2xl bg-rose-400 blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
              <Activity className="w-10 h-10 text-white relative z-10 animate-[pulse_2.5s_infinite]" />
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
              PHYSIO <span className="text-rose-500 bg-gradient-to-r from-rose-500 to-rose-400 bg-clip-text text-transparent">CLINIC</span>
            </h1>
            
            <p className="text-sm italic text-slate-400 tracking-wide mb-8">
              "Restoring Mobility. Transforming Care."
            </p>

            {/* Micro Feature Grid - Animating subtle hover triggers */}
            <div className="w-full space-y-3 text-left">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 transform hover:translate-x-2 transition-transform duration-300">
                <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0" />
                <span className="text-xs text-slate-300 font-medium">Encrypted Medical Vault File Node Control</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 transform hover:translate-x-2 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="text-xs text-slate-300 font-medium">Real-Time Serialized Doctor Allocation Mapping</span>
              </div>
            </div>

            {/* Developer Tag Credit */}
            <div className="absolute bottom-[-40px] text-[11px] uppercase tracking-[4px] text-slate-600">
              Developed by <span className="text-rose-500/60 font-bold">M. Asher</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDE: AUTHENTICATION FORM INPUT MODULE (40% / 100%) */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-8 relative bg-black/40 backdrop-blur-md">
          
          {/* Mobile responsive brand logo top bar */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center mb-2 shadow-md">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wider">PHYSIO CLINIC</h2>
          </div>

          <div className="w-full max-w-sm mx-auto">
            {/* Header Text Headers */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {isSignUp ? 'Join us for premium physiotherapy care' : 'Sign in to access your recovery portal'}
              </p>
            </div>

            {/* Input Action Form Container */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isSignUp && (
                <>
                  {/* Full Name Input Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text"
                        required
                        placeholder="Enter your full name" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Phone Number Input Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="tel"
                        required
                        placeholder="Enter your phone number" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email Input Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="email"
                    required
                    placeholder="Enter your email" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Password Input Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                  {!isSignUp && (
                    <a href="#forgot" className="text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium">Forgot Password?</a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Submit Custom Shell Button */}
              <button 
                type="submit" 
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-lg shadow-rose-950/20 active:scale-[0.99] mt-2"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            {/* Toggle State Footer Switch */}
            <div className="mt-8 text-center border-t border-white/5 pt-6">
              <p className="text-xs text-slate-400">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button 
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-rose-400 hover:text-rose-300 transition-colors font-semibold ml-1 focus:outline-none"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}