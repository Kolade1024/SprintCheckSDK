import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Layout } from '../Layout';
import { motion } from 'framer-motion';

interface ConsentProps {
  onContinue: () => void;
  onClose: () => void;
}

export const Consent: React.FC<ConsentProps> = ({ onContinue, onClose }) => {
  return (
    <Layout onClose={onClose}>
      <div className="flex flex-col items-center text-center px-2 py-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-black mb-6 border border-slate-200"
        >
          <ShieldCheck size={32} strokeWidth={1.5} />
        </motion.div>
        
        <div className="space-y-3 mb-8">
          <h2 className="text-2xl font-display font-bold text-black tracking-tight">System Access Consent</h2>
          <p className="text-[14px] font-medium text-slate-500 leading-relaxed max-w-[280px] mx-auto">
            Authorize SprintCheck to securely validate your identity credentials. Your data is encrypted and biometric information is never stored permanently.
          </p>
        </div>

        <div className="w-full space-y-6">
          <div className="space-y-4">
            <p className="text-[12px] text-slate-400 font-medium px-4">
              By continuing, you acknowledge our <a href="#" className="text-black font-bold hover:underline">Privacy Policy</a> and <a href="#" className="text-black font-bold hover:underline">Compliance Standards</a>.
            </p>
            <button 
              onClick={onContinue}
              className="btn-premium w-full"
            >
              Grant Access & Continue
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};


