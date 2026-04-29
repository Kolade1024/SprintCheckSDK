import React from 'react';
import { useSprintCheck } from '../../hooks/useSprintCheck';
import { Dashboard } from './screens/Dashboard';
import { Consent } from './screens/Consent';
import { IDEntry } from './screens/IDEntry';
import { Validation } from './screens/Validation';
import { FaceIntro } from './screens/FaceIntro';
import { Score } from './screens/Score';
import { Success } from './screens/Success';
import { LivenessView } from './screens/LivenessView';
import { AnimatePresence, motion } from 'framer-motion';

export const SprintCheckSDK: React.FC = () => {
  const {
    state,
    setStep,
    setEmail,
    setSelectedAction,
    setBvn,
    setNin,
    startVerification,
    handleLivenessComplete,
    reset
  } = useSprintCheck();

  const handleAction = (type: 'FACE' | 'BVN' | 'NIN' | 'ID') => {
    setSelectedAction(type);
    setStep('CONSENT');
  };

  const handleIDConfirm = (val: string) => {
    const type = state.step === 'BVN_ENTRY' ? 'BVN' : 'NIN';
    startVerification(type, val);
  };

  const renderScreen = () => {
    switch (state.step) {
      case 'DASHBOARD':
        return (
          <Dashboard
            email={state.email}
            onEmailChange={setEmail}
            bvn={state.bvn}
            onBvnChange={setBvn}
            nin={state.nin}
            onNinChange={setNin}
            onAction={handleAction}
          />
        );
      case 'CONSENT':
        return (
          <Consent
            onContinue={() => {
              if (state.selectedAction === 'FACE') {
                startVerification('FACE', '');
              } else {
                const savedValue = state.selectedAction === 'NIN' ? state.nin : state.bvn;
                if (savedValue) {
                  startVerification(state.selectedAction as 'BVN' | 'NIN', savedValue);
                } else if (state.selectedAction === 'NIN') {
                  setStep('NIN_ENTRY');
                } else {
                  setStep('BVN_ENTRY');
                }
              }
            }}
            onClose={reset}
          />
        );
      case 'BVN_ENTRY':
        return (
          <IDEntry
            type="BVN"
            value={state.bvn}
            onConfirm={handleIDConfirm}
            onBack={() => setStep('CONSENT')}
            onClose={reset}
          />
        );
      case 'NIN_ENTRY':
        return (
          <IDEntry
            type="NIN"
            value={state.nin}
            onConfirm={handleIDConfirm}
            onBack={() => setStep('CONSENT')}
            onClose={reset}
          />
        );
      case 'VALIDATING':
        return (
          <Validation
            error={state.error}
            onRetry={() => {
              if (state.verificationType === 'FACE') setStep('DASHBOARD');
              else setStep(state.verificationType === 'BVN' ? 'BVN_ENTRY' : 'NIN_ENTRY');
            }}
          />
        );
      case 'FACE_INTRO':
        return (
          <FaceIntro
            onStart={() => setStep('LIVENESS')}
            onBack={() => setStep('DASHBOARD')}
            onClose={reset}
          />
        );
      case 'LIVENESS':
        return (
          <LivenessView
            onSuccess={handleLivenessComplete}
            onFailure={() => setStep('SCORE_FAIL')}
            onCancel={reset}
          />
        );
      case 'SCORE_SUCCESS':
        return (
          <Score
            type="success"
            score={state.score}
            image={state.capturedImage}
            referenceImage={state.apiImage}
            onHome={() => setStep('COMPLETED')}
            onRetry={() => setStep('FACE_INTRO')}
          />
        );
      case 'SCORE_FAIL':
        return (
          <Score
            type="fail"
            score={state.score}
            image={state.capturedImage}
            referenceImage={state.apiImage}
            onHome={reset}
            onRetry={() => setStep('FACE_INTRO')}
          />
        );
      case 'COMPLETED':
        return <Success onDone={reset} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-100 selection:text-brand-700">
      <AnimatePresence mode="wait">
        <motion.div
          key={state.step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen relative flex flex-col"
        >
          {state.step !== 'DASHBOARD' && state.step !== 'LIVENESS' && (
            <div className="ntl-backdrop">
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className={`ntl-modal ${state.step.startsWith('SCORE') ? 'wide' : ''}`}
              >
                {renderScreen()}
              </motion.div>
            </div>
          )}

          {state.step === 'DASHBOARD' && (
            <div className="flex-1">
              {renderScreen()}
            </div>
          )}

          {state.step === 'LIVENESS' && (
            <div className="fixed inset-0 z-[100] bg-white lg:flex lg:items-center lg:justify-center">
              <div className="w-full max-w-4xl mx-auto h-full lg:h-auto lg:aspect-video lg:rounded-4xl lg:shadow-2xl overflow-hidden">
                {renderScreen()}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
