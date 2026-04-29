import React from 'react';
import { Camera, Sun, Glasses, Scan, UserCheck, Sparkles, ShieldCheck } from 'lucide-react';
import { Layout } from '../Layout';
import { motion } from 'framer-motion';

interface FaceIntroProps {
  onStart: () => void;
  onBack: () => void;
  onClose: () => void;
}

export const FaceIntro: React.FC<FaceIntroProps> = ({ onStart, onBack, onClose }) => {
  return (
    <Layout onBack={onBack} onClose={onClose} showSteps currentStep={3}>
      <div className="space-y-12 py-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="relative w-44 h-44 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 overflow-hidden group">
              <div className="text-black group-hover:scale-110 transition-transform duration-700">
                <UserCheck size={80} strokeWidth={1} />
              </div>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -bottom-3 -right-3 w-14 h-14 bg-black rounded-full flex items-center justify-center text-white border-4 border-white"
            >
              <Camera size={24} />
            </motion.div>
          </div>
        </div>

        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-black uppercase tracking-[0.3em]">AI Biometric Active</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-black tracking-tight">Facial Authentication</h2>
          <p className="text-[15px] font-medium text-slate-500 max-w-[280px] mx-auto leading-relaxed">
            Final step: Confirm it's really you with a quick biometric identity scan.
          </p>
        </div>

        {/* <div className="grid grid-cols-2 gap-4">
          <Tip icon={<Sun size={20} />} text="Optimal Light" />
          <Tip icon={<Glasses size={20} />} text="Clear Face" />
          <Tip icon={<Scan size={20} />} text="Frame Alignment" />
          <Tip icon={<ShieldCheck size={20} />} text="Secure Stream" />
        </div> */}

        <div className="pt-6 relative">
          <button
            onClick={onStart}
            className="btn-premium group"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="uppercase tracking-widest text-[13px]">Initialize Biometric Scan</span>
              <Scan size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            </div>
          </button>
          <div className="flex items-center justify-center gap-2 mt-8 opacity-40">
            <div className="h-px w-8 bg-slate-300" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Identity Standard</span>
            <div className="h-px w-8 bg-slate-300" />
          </div>
        </div>
      </div>
    </Layout>
  );
};

const Tip: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex flex-col items-center gap-3 p-5 bg-white rounded-lg border border-slate-200 group hover:bg-slate-50 transition-all duration-300">
    <div className="text-black bg-slate-100 p-3 rounded-md group-hover:bg-black group-hover:text-white transition-all duration-300">
      {icon}
    </div>
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center leading-tight">{text}</span>
  </div>
);
