import React from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../Layout';
import { CheckCircle2, XCircle, Home, RotateCcw, Award } from 'lucide-react';

interface ScoreProps {
  type: 'success' | 'fail';
  score: number;
  image: string | null;
  onHome: () => void;
  onRetry: () => void;
  referenceImage: string | null;
}

export const Score: React.FC<ScoreProps> = ({
  type,
  score,
  image,
  onHome,
  onRetry,
  referenceImage
}) => {

  // Removed automatic countdown redirect to allow users to review results

  const isSuccess = type === 'success';

  return (
    <Layout wide>
      <div className="flex flex-col items-center space-y-10 py-6 text-center max-w-5xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Your results</h2>
          <p className="text-[14px] text-slate-500">
            {isSuccess ? 'Your photo matched your ID.' : 'We couldn\'t match your photo with your ID.'}
          </p>
        </div>

        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-12">
          {/* Score gauge */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-full max-w-[220px]">
              <svg viewBox="0 0 200 120" className="w-full overflow-visible">
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#F1F5F9" strokeWidth="10" strokeLinecap="round" />
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke={isSuccess ? '#10b981' : '#ef4444'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - score / 100)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-full text-center">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col items-center gap-1 mt-4"
                >
                  <span className="text-3xl font-semibold text-slate-900 tabular-nums">
                    {score}<span className="text-xl text-slate-300 ml-0.5">%</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">match score</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Captured Image */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-36 h-36 lg:w-48 lg:h-48 rounded-2xl overflow-hidden border bg-slate-50 ${isSuccess ? 'border-emerald-200' : 'border-red-200'}`}
              >
                {image ? (
                  <img src={image} alt="Captured" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Award size={48} className="text-slate-200" />
                  </div>
                )}
              </motion.div>
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white ${isSuccess ? 'bg-emerald-500' : 'bg-red-400'}`}>
                {isSuccess ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              </div>
            </div>
            <span className="text-[12px] font-medium text-slate-400">Your Photo</span>
          </div>
        </div>

        {/* Result + Actions */}
        <div className="space-y-6 w-full">
          <div className={`p-5 rounded-xl border text-center ${isSuccess
            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700'
            : 'bg-red-50/50 border-red-100 text-red-600'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              {isSuccess ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              <span className="text-[14px] font-semibold">
                {isSuccess ? 'Match successful' : 'No match found'}
              </span>
            </div>
            <p className="text-[13px] opacity-80">
              {isSuccess
                ? 'Your identity has been verified.'
                : 'Please retry in a well-lit environment.'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[14px] font-medium transition-all active:scale-[0.98] hover:bg-slate-50"
            >
              <RotateCcw size={16} />
              <span>Retry</span>
            </button>
            <button
              onClick={onHome}
              className="btn-premium flex-1 flex items-center justify-center gap-2 px-6 py-3.5"
            >
              <Home size={16} />
              <span>{isSuccess ? 'Continue' : 'Home'}</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
