import React from 'react';
import { X, ChevronLeft, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  onClose?: () => void;
  onBack?: () => void;
  showSteps?: boolean;
  currentStep?: number;
  wide?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  onClose,
  onBack,
  showSteps,
  currentStep = 1,
  wide = false
}) => {
  return (
    <div className="flex flex-col h-full bg-white relative lg:rounded-xl overflow-hidden border border-slate-200">
      {/* Premium Navigation Header */}
      <div className="px-6 lg:px-10 py-6 flex justify-between items-center bg-white sticky top-0 z-50 border-b border-slate-100">
        <div className="w-10">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all active:scale-90 text-slate-900 border border-transparent hover:border-slate-100"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            <span className="text-[16px] font-display font-extrabold tracking-tight text-[#292944]">Identity Check</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1 h-1 bg-black rounded-full" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.25em]">Secure Protocol</span>
          </div>
        </div>

        <div className="w-10">
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all active:scale-90 text-slate-400 hover:text-error border border-transparent hover:border-slate-100"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Progress HUD - Modern & Minimal */}
      {showSteps && (
        <div className="px-10 pt-8 pb-4">
          <div className="flex gap-2.5 justify-center">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex-1 max-w-[50px] h-1.5 rounded-full bg-slate-100 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: s <= currentStep ? "100%" : "0%" }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                  className={`h-full ${s === currentStep ? 'bg-black' : s < currentStep ? 'bg-slate-300' : 'bg-transparent'}`}
                />
              </div>
            ))}
          </div>
          <p className="text-center mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verification Phase {currentStep} of 4</p>
        </div>
      )}

      {/* Content Area with Fluid Transitions */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`h-full mx-auto ${wide ? 'max-w-5xl' : 'max-w-lg'}`}
        >
          {children}
        </motion.div>
      </div>

      {/* Footer Branding - Transparent Feel */}
      <div className="px-10 py-6 bg-slate-50 flex flex-col items-center gap-2 border-t border-slate-100">
        <div className="flex items-center gap-2 opacity-50">
          <Globe size={12} className="text-black" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em]">
            Authorized by <strong className="text-slate-900">SprintCheck</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
