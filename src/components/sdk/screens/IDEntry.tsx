import React, { useState } from 'react';
import { Fingerprint, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { Layout } from '../Layout';
import { motion, AnimatePresence } from 'framer-motion';

interface IDEntryProps {
  type: 'BVN' | 'NIN';
  value: string;
  onConfirm: (val: string) => void;
  onBack: () => void;
  onClose: () => void;
}

export const IDEntry: React.FC<IDEntryProps> = ({
  type,
  value: initialValue,
  onConfirm,
  onBack,
  onClose
}) => {
  const [val, setVal] = useState(initialValue);
  const [error, setError] = useState(false);

  const handleConfirm = () => {
    if (val.length !== 11) {
      setError(true);
      return;
    }
    onConfirm(val);
  };

  return (
    <Layout
      onBack={onBack}
      onClose={onClose}
      showSteps
      currentStep={type === 'BVN' ? 1 : 2}
    >
      <div className="space-y-10 py-2">
        <div className="space-y-3">
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2 mb-2"
          >
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase tracking-widest border border-slate-200">
              Official Identification
            </span>
          </motion.div>
          <h2 className="text-[24px] font-display font-bold text-black leading-tight">
            {type === 'BVN' ? 'Verify' : 'Confirm'} <span className="text-black">Your Identity</span>
          </h2>
          <p className="text-[14px] font-medium text-slate-500">
            Please provide your 11-digit {type} for secure database validation.
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-all duration-300 ${error ? 'text-red-500 scale-110' : 'text-slate-400 group-focus-within:text-black'
              }`}>
              {type === 'BVN' ? <Fingerprint size={22} /> : <ShieldCheck size={22} />}
            </div>
            <input
              type="tel"
              value={val}
              onChange={(e) => {
                setVal(e.target.value.replace(/\D/g, '').slice(0, 11));
                setError(false);
              }}
              placeholder={`${type} Number`}
              className={`w-full pl-14 pr-5 py-5 bg-white border border-slate-200 rounded-lg text-lg font-mono font-bold tracking-[0.15em] outline-none transition-all duration-300 placeholder:tracking-normal placeholder:font-sans placeholder:font-medium placeholder:text-slate-300 ${error ? 'border-red-500 bg-red-50' : 'focus:border-black'
                }`}
            />
          </div>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-error pl-4"
              >
                <AlertCircle size={14} />
                <span className="text-[11px] font-bold tracking-tight uppercase">Enter a valid 11-digit {type}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4 bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Shield size={12} className="text-black" /> Data Security
          </h4>
          <CheckItem text="End-to-end encrypted connection" />
        </div>

        <div className="pt-2">
          <button
            onClick={handleConfirm}
            className="btn-premium group"
          >
            <div className="flex items-center justify-center gap-2">
              <span>Securely Confirm {type}</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </Layout>
  );
};

const CheckItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex gap-3 items-center">
    <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center text-success">
      <CheckCircle2 size={12} strokeWidth={3} />
    </div>
    <span className="text-[13px] font-bold text-slate-600 tracking-tight">{text}</span>
  </div>
);
