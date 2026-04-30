import React from 'react';
import { Layout } from '../Layout';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ValidationProps {
  error: string | null;
  onRetry: () => void;
}

export const Validation: React.FC<ValidationProps> = ({ error, onRetry }) => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        {!error ? (
          /* Loading state */
          <div className="space-y-8">
            <div className="w-16 h-16 border-[3px] border-slate-100 border-t-slate-900 rounded-full animate-spin mx-auto" />

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h2 className="text-xl font-semibold text-slate-900">Checking your details</h2>
              <p className="text-[14px] text-slate-400">This usually takes a few seconds.</p>
            </motion.div>
          </div>
        ) : (
          /* Error state */
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-8 w-full"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-400 mx-auto">
              <AlertCircle size={32} strokeWidth={1.5} />
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">Something went wrong</h2>
              <p className="text-[14px] text-slate-500 leading-relaxed max-w-[300px] mx-auto">{error}</p>
            </div>

            <button
              onClick={onRetry}
              className="btn-premium flex items-center justify-center gap-2 mx-auto max-w-[280px]"
            >
              <RefreshCw size={16} />
              <span>Try again</span>
            </button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};
