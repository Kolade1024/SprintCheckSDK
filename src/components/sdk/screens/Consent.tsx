import React from 'react';
import { Lock } from 'lucide-react';
import { Layout } from '../Layout';
import { motion } from 'framer-motion';

interface ConsentProps {
  onContinue: () => void;
  onClose: () => void;
}

export const Consent: React.FC<ConsentProps> = ({ onContinue, onClose }) => {
  return (
    <Layout onClose={onClose}>
      <div className="flex flex-col items-center text-center px-2 py-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 mb-8"
        >
          <Lock size={26} strokeWidth={1.5} />
        </motion.div>
        
        <div className="space-y-3 mb-10">
          <h2 className="text-2xl font-semibold text-slate-900">Before we begin</h2>
          <p className="text-[15px] text-slate-500 leading-relaxed max-w-[300px] mx-auto">
            We'll verify your identity using your camera and ID details. Your data is handled securely and never stored permanently.
          </p>
        </div>

        <div className="w-full space-y-4">
          <button 
            onClick={onContinue}
            className="btn-premium w-full"
          >
            Continue
          </button>
          <p className="text-[12px] text-slate-400 px-4">
            By continuing, you agree to our <a href="#" className="text-slate-600 hover:underline">Privacy Policy</a> and <a href="#" className="text-slate-600 hover:underline">Terms</a>.
          </p>
        </div>
      </div>
    </Layout>
  );
};
