import React from 'react';
import { Layout } from '../Layout';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw, Lock, ShieldCheck } from 'lucide-react';

interface ValidationProps {
  error: string | null;
  onRetry: () => void;
}

export const Validation: React.FC<ValidationProps> = ({ error, onRetry }) => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[450px] text-center px-4">
        {!error ? (
          <div className="space-y-12 w-full">
            <div className="relative flex justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full border border-slate-200 flex items-center justify-center">
                <RefreshCw size={28} className="text-black animate-spin" />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-display font-bold text-black tracking-tight">Syncing Records</h2>
              <div className="flex flex-col gap-3">
                <p className="text-[15px] font-medium text-slate-500">Establishing secure connection to database...</p>
                <div className="flex items-center justify-center gap-1.5 pt-2">
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
                </div>
              </div>
            </motion.div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 inline-flex items-center gap-3">
              <Lock size={14} className="text-success" />
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">HMAC-SHA512 Active</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-10 w-full"
          >
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto border border-red-100">
              <ShieldAlert size={40} strokeWidth={1.5} />
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold text-black tracking-tight">Access <span className="text-red-500">Denied</span></h2>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mx-4">
                <p className="text-[14px] font-medium text-slate-600 leading-relaxed">{error}</p>
              </div>
            </div>

            <div className="pt-4 space-y-4 px-6">
              <button
                onClick={onRetry}
                className="btn-premium bg-black"
              >
                Re-authenticate Session
              </button>
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <ShieldCheck size={14} />
                <p className="text-xs font-bold uppercase tracking-widest">Compliance Protocol Error</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};
