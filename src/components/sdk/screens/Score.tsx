import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../Layout';
import { CheckCircle2, XCircle, Home, RotateCcw, Award, ShieldCheck, Sparkles } from 'lucide-react';

interface ScoreProps {
  type: 'success' | 'fail';
  score: number;
  image: string | null;
  onHome: () => void;
  onRetry: () => void;
  referenceImage: string | null;
}

export const Score: React.FC<ScoreProps> = ({
  type,
  score,
  image,
  onHome,
  onRetry,
  referenceImage
}) => {

  // Removed automatic countdown redirect to allow users to review results

  const rotation = -90 + (score / 100) * 180;

  return (
    <Layout wide>
      <div className="flex flex-col items-center space-y-12 py-8 text-center max-w-5xl mx-auto">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShieldCheck size={18} className="text-black" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Audit <span className="text-black">Finalized</span></span>
          </div>
          {/* <h2 className="text-3xl font-display font-bold text-black tracking-tight">Identity Integrity</h2> */}
          <p className="text-[15px] font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
            Biometric analysis complete. Here is the verified score of your identity match.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-3 items-center justify-center gap-12 lg:gap-6 relative">
          {/* 1. Reference Image (Left) */}
          <div className="flex flex-col items-center gap-4 order-2 lg:order-1">
            <div className="relative group">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-40 h-40 lg:w-52 lg:h-52 rounded-3xl overflow-hidden border border-slate-200 relative z-10 bg-slate-100 shadow-sm"
              >
                {referenceImage ? (
                  <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200">
                    <Award size={56} className="text-slate-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/5" />
              </motion.div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full z-20 shadow-lg whitespace-nowrap">Official ID</div>
            </div>
          </div>

          {/* 2. Match Engine (Center) */}
          <div className="flex flex-col items-center justify-center order-1 lg:order-2 py-6">
            <div className="relative w-full max-w-[260px] shrink-0">
              <svg viewBox="0 0 200 120" className="w-full overflow-visible">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#F1F5F9" strokeWidth="12" strokeLinecap="round" />
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGradient)" strokeWidth="12" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - score / 100)} className="transition-all duration-1000 ease-out" />

                {/* <motion.g
                  initial={{ rotate: -90 }}
                  animate={{ rotate: rotation }}
                  transition={{ duration: 2.5, type: "spring", damping: 15 }}
                  style={{ originX: "-40px", originY: "35px" }}
                >
                  <line x1="110" y1="70" x2="110" y2="20" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="110" cy="70" r="10" fill="#000000" />
                  <circle cx="110" cy="70" r="4" fill="white" />
                </motion.g> */}
              </svg>

              <div className="absolute top-[85%] left-1/2 -translate-x-1/2 w-full text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative group">


                    <div className="absolute -inset-4 bg-black/5 blur-2xl rounded-full -z-10 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div className="flex items-center gap-2 mt-8">
                    <span className="text-3xl font-display font-black text-black tracking-tighter tabular-nums leading-none">
                      {score}<span className="text-2xl ml-1 opacity-20">%</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Similarity Score</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* 3. Captured Image (Right) */}
          <div className="flex flex-col items-center gap-4 order-3 lg:order-3">
            <div className="relative group">
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`w-40 h-40 lg:w-52 lg:h-52 rounded-3xl overflow-hidden border-2 relative z-10 bg-slate-100 shadow-lg ${type === 'success' ? 'border-white' : 'border-red-100'
                  }`}
              >
                {image ? (
                  <img src={image} alt="Captured" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200">
                    <Award size={56} className="text-slate-300" />
                  </div>
                )}
                <div className={`absolute inset-0 opacity-10 ${type === 'success' ? 'bg-success' : 'bg-error'}`} />
              </motion.div>
              <div className={`absolute -bottom-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center text-white z-20 border-4 border-white shadow-xl ${type === 'success' ? 'bg-black' : 'bg-red-500'
                }`}>
                {type === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-brand-blue text-white text-[10px] font-bold uppercase tracking-widest rounded-full z-20 shadow-lg whitespace-nowrap">Live Scan</div>
            </div>
          </div>
        </div>

        <div className="space-y-10 w-full">
          <div className={`p-8 rounded-lg border transition-all duration-300 ${type === 'success'
            ? 'bg-slate-50 border-slate-200 text-slate-700'
            : 'bg-red-50 border-red-100 text-slate-700'
            }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {type === 'success' ? <CheckCircle2 size={18} className="text-black" /> : <ShieldCheck size={18} className="text-red-500" />}
              <h3 className={`text-lg font-display font-bold uppercase tracking-tight ${type === 'success' ? 'text-black' : 'text-red-500'}`}>
                Verification {type === 'success' ? 'Authorized' : 'Flagged'}
              </h3>
            </div>
            <p className="text-[15px] font-medium opacity-80 leading-relaxed max-w-md mx-auto">
              {type === 'success'
                ? 'Biometric markers successfully aligned with official records. Access granted.'
                : 'Similarity score below confidence threshold. Please retry in a well-lit environment.'}
            </p>
          </div>

          <div className="flex flex-col md:flex-col items-center justify-between gap-8 px-4">
            {/* <div className="flex items-center gap-3 text-slate-400 order-2 md:order-1">
              <ShieldCheck size={20} className="text-slate-500" />
              <p className="text-[12px] font-bold uppercase tracking-widest">
                Identity <span className="text-black font-bold">Verified</span>
              </p>
            </div> */}

            <div className="flex items-center gap-4 w-full md:w-auto order-1 md:order-2">
              <button
                onClick={onRetry}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-lg text-[14px] font-bold transition-all active:scale-[0.98] hover:bg-slate-50"
              >
                <RotateCcw size={18} />
                <span>Retry Scan</span>
              </button>
              <button
                onClick={onHome}
                className="btn-premium flex-1 md:flex-none flex items-center justify-center gap-2 px-10 py-4"
              >
                <Home size={18} />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
