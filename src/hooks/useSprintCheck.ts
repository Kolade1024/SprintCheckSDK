import { useState, useCallback, useEffect } from 'react';
import { generateHmacSha512 } from '../lib/crypto';
import { compareFaces } from '../lib/face-matching';

export type Step =
  | 'DASHBOARD'
  | 'CONSENT'
  | 'BVN_ENTRY'
  | 'NIN_ENTRY'
  | 'VALIDATING'
  | 'FACE_INTRO'
  | 'LIVENESS'
  | 'SCORE_SUCCESS'
  | 'SCORE_FAIL'
  | 'COMPLETED';

interface SprintCheckState {
  step: Step;
  email: string;
  bvn: string;
  nin: string;
  capturedImage: string | null;
  apiImage: string | null;
  confidence: number | null;
  score: number;
  error: string | null;
  verificationType: 'BVN' | 'NIN' | 'FACE' | null;
  selectedAction: 'FACE' | 'BVN' | 'NIN' | 'ID' | null;
  apiReference: string | null;
}

const API_KEY = import.meta.env.VITE_SPRINTCHECK_API_KEY;
const ENCRYPTION_KEY = import.meta.env.VITE_SPRINTCHECK_ENCRYPTION_KEY;
const DEMO_RESPONSE = {
  success: 1,
  message: "Verified Successfully",
  confidence_level: "80",
  data: {
    image: "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"
  }
};

const STORAGE_KEY = 'sprintcheck_user_details';

function loadSavedDetails(): { email: string; bvn: string; nin: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { }
  return { email: '', bvn: '', nin: '' };
}

function saveDetails(email: string, bvn: string, nin: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, bvn, nin }));
  } catch { }
}

export function useSprintCheck() {
  const saved = loadSavedDetails();

  const [state, setState] = useState<SprintCheckState>({
    step: 'DASHBOARD',
    email: saved.email,
    bvn: saved.bvn,
    nin: saved.nin,
    capturedImage: null,
    apiImage: null,
    confidence: null,
    score: 0,
    error: null,
    verificationType: null,
    selectedAction: null,
    apiReference: null,
  });

  useEffect(() => {
    saveDetails(state.email, state.bvn, state.nin);
  }, [state.email, state.bvn, state.nin]);

  const setStep = (step: Step) => setState(prev => ({ ...prev, step }));
  const setEmail = (email: string) => {
    setState(prev => ({ ...prev, email }));
  };
  const setSelectedAction = (action: 'FACE' | 'BVN' | 'NIN' | 'ID') => setState(prev => ({ ...prev, selectedAction: action }));
  const setBvn = (bvn: string) => {
    setState(prev => ({ ...prev, bvn }));
  };
  const setNin = (nin: string) => {
    setState(prev => ({ ...prev, nin }));
  };

  const startVerification = useCallback(async (type: 'BVN' | 'NIN' | 'FACE', value: string) => {
    if (!state.email) {
      setState(prev => ({ ...prev, error: 'Please enter your email address', step: 'DASHBOARD' }));
      return;
    }

    setState(prev => ({
      ...prev,
      step: 'VALIDATING',
      error: null,
      ...(type !== 'FACE' ? { [type.toLowerCase()]: value } : {}),
      verificationType: type
    }));

    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Accept", "application/json");
      myHeaders.append("Authorization", `${API_KEY}`);

      // Determine endpoint based on type
      let endpoint = '';
      if (type === 'FACE') endpoint = '/api/sdk/facial';
      else if (type === 'BVN') endpoint = '/api/sdk/bvn';
      else endpoint = '/api/sdk/nin';

      let rawPayload: any = {};
      if (type === 'FACE') {
        rawPayload = { "reference": state.email, "identifier": state.email };
      } else {
        rawPayload = { "number": value, "identifier": state.email };
      }
      const raw = JSON.stringify(rawPayload);

      // Strip whitespace to match Postman logic: .replace(/[\n\t\s]/g, '')
      const messageToHash = raw.replace(/[\n\t\s]/g, '');
      const signature = await generateHmacSha512(messageToHash, ENCRYPTION_KEY);
      myHeaders.append("signature", signature);

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow" as RequestRedirect
      };

      const response = await fetch(endpoint, requestOptions);
      const result = await response.json();

      if (result.success === 1) {
        const rawApiImage = result.data?.image || '';
        let apiImage = rawApiImage;
        if (rawApiImage && !rawApiImage.startsWith('data:') && !rawApiImage.startsWith('http')) {
          apiImage = `data:image/jpeg;base64,${rawApiImage}`;
        }

        setState(prev => ({
          ...prev,
          apiImage,
          apiReference: result.data?.reference || null,
          confidence: parseInt(result.confidence_level, 10),
          step: 'FACE_INTRO'
        }));
      } else {
        throw new Error(result.message || 'Verification failed');
      }
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, step: 'VALIDATING' }));
    }
  }, [state.email]);

  const handleLivenessComplete = useCallback(async (capturedImage: string) => {
    setState(prev => ({ ...prev, capturedImage, step: 'VALIDATING' }));

    try {
      if (!state.apiImage) throw new Error('No API image found');

      // 1. Local Face Matching for instant feedback score
      const faceSimilarity = await compareFaces(state.apiImage, capturedImage);
      const apiConfidence = state.confidence || 80;
      const finalScore = Math.round((faceSimilarity * 0.7) + (apiConfidence * 0.3));
      const score = Math.min(99, Math.max(0, finalScore));

      // 2. Submit to API via PUT
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Accept", "application/json");
      myHeaders.append("Authorization", `${API_KEY}`);

      // Strip data URL prefix for the API
      const base64Image = capturedImage.split(',')[1] || capturedImage;

      // Determine endpoint based on type
      let endpoint = '';
      if (state.verificationType === 'FACE') endpoint = '/api/sdk/facial';
      else if (state.verificationType === 'BVN') endpoint = '/api/sdk/bvn';
      else endpoint = '/api/sdk/nin';

      let rawPayload: any = {};
      if (state.verificationType === 'FACE') {
        rawPayload = {
          "reference": state.apiReference,
          "confidence": score.toString(),
          "identifier": state.email,
          "image": base64Image
        };
      } else {
        rawPayload = {
          "number": state.verificationType === 'BVN' ? state.bvn : state.nin,
          "reference": state.apiReference,
          "confidence": score.toString(),
          "identifier": state.email,
          "image": base64Image
        };
      }
      const raw = JSON.stringify(rawPayload);

      // Strip whitespace to match Postman logic: .replace(/[\n\t\s]/g, '')
      const messageToHash = raw.replace(/[\n\t\s]/g, '');
      const signature = await generateHmacSha512(messageToHash, ENCRYPTION_KEY);
      myHeaders.append("signature", signature);

      const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow" as RequestRedirect
      };

      const response = await fetch(endpoint, requestOptions);
      const result = await response.json();

      if (result.success === 1) {
        setState(prev => ({ ...prev, score, step: score > 50 ? 'SCORE_SUCCESS' : 'SCORE_FAIL' }));
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (err: any) {
      setState(prev => ({ ...prev, score: 0, error: err.message, step: 'SCORE_FAIL' }));
    }
  }, [state.apiImage, state.confidence, state.apiReference, state.verificationType, state.bvn, state.nin, state.email]);

  const reset = () => {
    const saved = loadSavedDetails();
    setState({
      step: 'DASHBOARD',
      email: saved.email,
      bvn: saved.bvn,
      nin: saved.nin,
      capturedImage: null,
      apiImage: null,
      confidence: null,
      score: 0,
      error: null,
      verificationType: null,
      selectedAction: null,
      apiReference: null,
    });
  };

  return {
    state,
    setStep,
    setEmail,
    setSelectedAction,
    setBvn,
    setNin,
    startVerification,
    handleLivenessComplete,
    reset,
  };
}
