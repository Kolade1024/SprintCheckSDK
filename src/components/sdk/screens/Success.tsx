import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Layout } from '../Layout';
import { motion } from 'framer-motion';

interface SuccessProps {
  onDone: () => void;
}

export const Success: React.FC<SuccessProps> = ({ onDone }) => {
  return (
    <Layout onClose={onDone}>
      <div className="flex flex-col items-center justify-center min-h-[420px] text-center px-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 200 }}
          className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-10"
        >
          <CheckCircle2 size={40} strokeWidth={1.5} />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 mb-12"
        >
          <h2 className="text-2xl font-semibold text-slate-900">Verification complete</h2>
          <p className="text-[15px] text-slate-500 max-w-[280px] mx-auto leading-relaxed">
            You're all set. Your identity has been verified.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full"
        >
          <button 
            onClick={onDone}
            className="btn-premium flex items-center justify-center gap-2 group"
          >
            <span>Done</span>
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>
      </div>
    </Layout>
  );
};
