import React, { useEffect, useRef } from 'react';
import LivenessSDK from '../../../lib/liveness-sdk';

interface LivenessViewProps {
  onSuccess: (image: string) => void;
  onFailure: (error: string) => void;
  onCancel: () => void;
}

export const LivenessView: React.FC<LivenessViewProps> = ({
  onSuccess,
  onFailure,
  onCancel
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sdkRef = useRef<LivenessSDK | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize the Liveness SDK
    const sdk = new LivenessSDK({
      target: containerRef.current,
      injectCSS: false, // Use our index.css styles
      numChallenges: 3,
      onSuccess: (result) => {
        onSuccess(result.capturedImage);
      },
      onFailure: (result) => {
        onFailure(result.error || 'Verification failed');
      },
      onCancel: () => {
        onCancel();
      },
      branding: 'Biometric Verification System',
    });

    sdk.open();
    sdkRef.current = sdk;

    return () => {
      if (sdkRef.current) {
        sdkRef.current.destroy();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[450px] flex items-center justify-center bg-slate-50/50"
    />
  );
};
