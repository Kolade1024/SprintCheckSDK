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

export function useSprintCheck({
  apiKey,
  encryptionKey
}: {
  apiKey?: string;
  encryptionKey?: string;
} = {}) {
  const API_KEY = apiKey || import.meta.env.VITE_SPRINTCHECK_API_KEY;
  const ENCRYPTION_KEY = encryptionKey || import.meta.env.VITE_SPRINTCHECK_ENCRYPTION_KEY;

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
