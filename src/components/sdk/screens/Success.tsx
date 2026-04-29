import React from 'react';
import { CheckCircle2, PartyPopper, ArrowRight, ShieldCheck } from 'lucide-react';
import { Layout } from '../Layout';
import { motion } from 'framer-motion';

interface SuccessProps {
  onDone: () => void;
}

export const Success: React.FC<SuccessProps> = ({ onDone }) => {
  return (
    <Layout onClose={onDone}>
      <div className="flex flex-col items-center justify-center min-h-[480px] text-center px-4 relative overflow-hidden">
        {/* Clean Background */}

        <div className="relative mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="relative w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-black border border-slate-200"
          >
            <CheckCircle2 size={64} strokeWidth={1.5} />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200"
          >
             <PartyPopper size={20} className="text-black" />
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6 relative z-10"
        >
          <div className="space-y-2">
             <div className="flex items-center justify-center gap-2 mb-1">
                <ShieldCheck size={16} className="text-success" />
                <span className="text-[11px] font-bold text-success uppercase tracking-[0.4em]">Authorized Session</span>
             </div>
             <h2 className="text-4xl font-display font-bold text-black tracking-tight">Identity <span className="text-black">Secured</span></h2>
          </div>
          <p className="text-[16px] font-medium text-slate-500 max-w-[280px] mx-auto leading-relaxed">
            Congratulations! Your biometric profile has been successfully verified and secured.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="w-full mt-14"
        >
          <button 
            onClick={onDone}
            className="btn-premium flex items-center justify-center gap-3 group"
          >
            <span className="uppercase tracking-widest text-[13px]">Return to Hub</span>
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
          </button>
          
          <div className="mt-10 pt-10 border-t border-slate-100 flex items-center justify-center gap-4">
             <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400`}>
                    {i === 1 ? 'JD' : i === 2 ? 'SK' : 'OW'}
                  </div>
                ))}
             </div>
             <div className="text-left">
                <p className="text-[10px] font-black text-[#292944] uppercase tracking-widest">Global Network</p>
                <p className="text-[9px] font-bold text-slate-400">Join 1.2M+ verified profiles</p>
             </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};
