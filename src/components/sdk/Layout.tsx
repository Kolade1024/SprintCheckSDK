import React from 'react';
import { X, ChevronLeft } from 'lucide-react';
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
      {/* Header — logo + nav only */}
      <div className="px-6 lg:px-10 py-5 flex justify-between items-center bg-white sticky top-0 z-50 border-b border-slate-100">
        <div className="w-10">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all active:scale-90 text-slate-900"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <img src="/logo.png" alt="SprintCheck" className="w-7 h-7 object-contain" />

        <div className="w-10">
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all active:scale-90 text-slate-400 hover:text-slate-600"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Progress dots — minimal */}
      {showSteps && (
        <div className="px-10 pt-6 pb-2">
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex-1 max-w-[48px] h-1 rounded-full overflow-hidden bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: s <= currentStep ? "100%" : "0%" }}
                  transition={{ duration: 0.6, ease: "circOut" }}
                  className={`h-full rounded-full ${s <= currentStep ? 'bg-slate-900' : 'bg-transparent'}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`h-full mx-auto ${wide ? 'max-w-5xl' : 'max-w-lg'}`}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};
