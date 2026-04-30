import React, { useState } from 'react';
import { Fingerprint, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { Layout } from '../Layout';
import { AnimatePresence, motion } from 'framer-motion';

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
      <div className="space-y-8 py-2">
        <div className="space-y-2">
          <h2 className="text-[22px] font-semibold text-slate-900 leading-tight">
            Enter your {type}
          </h2>
          <p className="text-[14px] text-slate-500">
            Your 11-digit {type} number — we'll check it against official records.
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative group">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${error ? 'text-red-400' : 'text-slate-300 group-focus-within:text-slate-500'}`}>
              {type === 'BVN' ? <Fingerprint size={20} /> : <ShieldCheck size={20} />}
            </div>
            <input
              type="tel"
              value={val}
              onChange={(e) => {
                setVal(e.target.value.replace(/\D/g, '').slice(0, 11));
                setError(false);
              }}
              placeholder={`${type} Number`}
              className={`w-full pl-12 pr-5 py-4 bg-white border rounded-xl text-[16px] font-mono font-medium tracking-[0.12em] outline-none transition-all duration-200 placeholder:tracking-normal placeholder:font-sans placeholder:font-normal placeholder:text-slate-300 ${error ? 'border-red-300 bg-red-50/50' : 'border-slate-200 focus:border-slate-400'}`}
            />
          </div>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 text-red-500 pl-1"
              >
                <AlertCircle size={14} />
                <span className="text-[13px] font-medium">Enter a valid 11-digit {type}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleConfirm}
          className="btn-premium group"
        >
          <div className="flex items-center justify-center gap-2">
            <span>Continue</span>
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>
    </Layout>
  );
};
