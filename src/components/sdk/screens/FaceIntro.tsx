import React from 'react';
import { Camera, ArrowRight } from 'lucide-react';
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
      <div className="flex flex-col items-center text-center space-y-10 py-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center"
        >
          <Camera size={44} strokeWidth={1.2} className="text-slate-400" />
        </motion.div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">Take a quick selfie</h2>
          <p className="text-[15px] text-slate-500 max-w-[280px] mx-auto leading-relaxed">
            We'll compare your photo with your ID. Make sure you have good lighting.
          </p>
        </div>

        <div className="w-full pt-2">
          <button
            onClick={onStart}
            className="btn-premium group"
          >
            <div className="flex items-center justify-center gap-2">
              <span>Open camera</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </Layout>
  );
};
