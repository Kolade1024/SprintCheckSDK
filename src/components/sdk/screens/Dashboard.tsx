import React, { useState } from 'react';
import { Camera, Shield, Fingerprint, CreditCard, ChevronRight, Bell, Settings, User, LayoutGrid, History, HelpCircle, LogOut, ArrowUpRight, Pencil, Save, CheckCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
  email: string;
  onEmailChange: (email: string) => void;
  bvn: string;
  onBvnChange: (bvn: string) => void;
  nin: string;
  onNinChange: (nin: string) => void;
  onAction: (action: 'FACE' | 'BVN' | 'NIN' | 'ID') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  email,
  onEmailChange,
  bvn,
  onBvnChange,
  nin,
  onNinChange,
  onAction
}) => {
  const [isEditing, setIsEditing] = useState(!email || !bvn || !nin);
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
      {/* Main Content - Minimalist Aesthetic */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 lg:px-10 py-5 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain brightness-0 invert" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight text-black">SprintCheck</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 text-slate-400 hover:bg-slate-50 hover:text-brand-blue rounded-xl transition-all">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent-amber rounded-full border-2 border-white" />
            </button>
            <div className="h-6 w-px bg-slate-200 hidden lg:block" />
            <div className="hidden lg:flex items-center gap-3 px-1">
              <div className="text-right leading-tight">
                <p className="text-xs font-bold text-black">{email || 'Guest User'}</p>
                <p className="text-[10px] font-medium text-slate-500">Active Session</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200">
                <User size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="px-6 lg:px-10 py-8 lg:py-12 max-w-7xl w-full mx-auto space-y-10">
          <div className="space-y-3">
            <h2 className="text-3xl lg:text-4xl font-display font-extrabold tracking-tight text-black">
              Welcome back, <span className="text-black">Ready to Verify?</span>
            </h2>
            <p className="text-slate-500 font-medium text-[15px]">Secure identity management at your fingertips.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Balance Card - The Purple Accent */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-4 bg-black p-8 rounded-xl text-white border border-slate-800 relative overflow-hidden group"
            >
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <CreditCard size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded">Primary Identity</span>
                </div>

                <div className="space-y-1">
                  <p className="text-white/60 text-xs font-medium">BVN</p>
                  <h3 className="text-2xl font-mono font-bold tracking-wider">{(bvn || nin) ? `**** **** ${(bvn || nin).slice(-4)}` : 'XXXX XXXX XXXX'}</h3>
                </div>

                <div className="space-y-1">
                  <p className="text-white/60 text-xs font-medium">NIN</p>
                  <h3 className="text-2xl font-mono font-bold tracking-wider">{(nin) ? `**** **** ${(nin).slice(-4)}` : 'XXXX XXXX XXXX'}</h3>
                </div>


                <div className="pt-4 flex justify-between items-end">
                  <div className="space-y-1">
                    {/* <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Verification Tier</p> */}
                    <p className="text-sm font-bold">Standard Account</p>
                  </div>

                  <CheckCircle2 />
                </div>
              </div>
            </motion.div>

            {/* Input Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Your Details</h3>
                {isEditing ? (
                  <button
                    onClick={() => {
                      if (email && (bvn || nin)) setIsEditing(false);
                    }}
                    disabled={!email || (!bvn && !nin)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Save size={14} />
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-200 hover:text-black transition-all border border-slate-200"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => onEmailChange(e.target.value)}
                      placeholder="your@email.com"
                      className="input-field"
                    />
                  ) : (
                    <div className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-lg text-[15px] font-semibold text-black tracking-tight">
                      {email || <span className="text-slate-300 font-medium">Not set</span>}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">BVN</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={bvn}
                      onChange={(e) => onBvnChange(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="11-digit BVN"
                      className="input-field"
                    />
                  ) : (
                    <div className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-lg text-[15px] font-mono font-bold text-black tracking-wider">
                      {bvn || <span className="text-slate-300 font-sans font-medium tracking-normal">Not set</span>}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">NIN</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={nin}
                      onChange={(e) => onNinChange(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="11-digit NIN"
                      className="input-field"
                    />
                  ) : (
                    <div className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-lg text-[15px] font-mono font-bold text-black tracking-wider">
                      {nin || <span className="text-slate-300 font-sans font-medium tracking-normal">Not set</span>}
                    </div>
                  )}
                </div>
              </div>

              <div className={`flex items-center gap-2 p-4 rounded-lg text-[13px] font-medium border transition-all ${!isEditing && email && (bvn || nin)
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                {!isEditing && email && (bvn || nin) ? (
                  <><CheckCircle size={16} className="text-emerald-600" /> Details confirmed and saved.</>
                ) : (
                  <><Shield size={16} className="text-black" /> Confirm your details are up-to-date before initiating a scan.</>
                )}
              </div>
            </motion.div>
          </div>

          {/* Action Cards Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold text-black uppercase tracking-widest">Verification Suite</h3>
              {/* <button className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-black transition-colors">
                View all logs <ArrowUpRight size={14} />
              </button> */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <ActionCard
                icon={<Camera size={24} />}
                label="Face Match"
                sub="Face verification"
                onClick={() => onAction('FACE')}
                color="bg-black"
                delay={0.2}
              />
              <ActionCard
                icon={<Fingerprint size={24} />}
                label="BVN Check"
                sub="Bank verification"
                onClick={() => onAction('BVN')}
                color="bg-slate-900"
                delay={0.3}
              />
              <ActionCard
                icon={<Shield size={24} />}
                label="NIN Check"
                sub="National ID"
                onClick={() => onAction('NIN')}
                color="bg-slate-800"
                delay={0.4}
              />
              <ActionCard
                icon={<CreditCard size={24} />}
                label="ID Card"
                sub="Card verification"
                onClick={() => setShowComingSoon(true)}
                color="bg-slate-700"
                delay={0.5}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-500">
                <CreditCard size={24} />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Coming Soon</h3>
              <p className="text-slate-500 text-sm mb-6">
                ID Card Verification is currently under development. Please try our Face Match or BVN/NIN verification options.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowComingSoon(false)}
                  className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};



const ActionCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
  disabled?: boolean;
  color: string;
  delay: number;
}> = ({ icon, label, sub, onClick, disabled, color, delay }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    onClick={onClick}
    disabled={disabled}
    className={`card-hover p-8 rounded-xl text-left flex flex-col gap-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden group ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
      }`}
  >
    <div className={`w-14 h-14 shrink-0 rounded-lg flex items-center justify-center text-white ${color}`}>
      {icon}
    </div>
    <div className="space-y-1 relative z-10">
      <div className="flex justify-between items-center">
        <span className="text-lg font-display font-bold text-black leading-tight">{label}</span>
        <ChevronRight size={18} className="text-slate-300 group-hover:text-black transition-colors" />
      </div>
      <p className="text-sm font-medium text-slate-500">{sub}</p>
    </div>

    {/* Hover Accent Line */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
  </motion.button>
);
