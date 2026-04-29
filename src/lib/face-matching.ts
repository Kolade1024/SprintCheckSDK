import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) return;
  const MODEL_URL = '/models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
  ]);
  modelsLoaded = true;
}

export async function compareFaces(img1Base64: string, img2Base64: string): Promise<number> {
  try {
    await loadModels();

    const [img1, img2] = await Promise.all([
      loadImage(img1Base64),
      loadImage(img2Base64)
    ]);

    const options = new faceapi.TinyFaceDetectorOptions();

    const result1 = await faceapi.detectSingleFace(img1, options).withFaceLandmarks().withFaceDescriptor();
    const result2 = await faceapi.detectSingleFace(img2, options).withFaceLandmarks().withFaceDescriptor();

    if (!result1 || !result2) {
      console.warn('[compareFaces] Could not detect a face in one or both images');
      return 50; // Fallback similarity
    }

    const distance = faceapi.euclideanDistance(result1.descriptor, result2.descriptor);

    // Strict Biometric Mapping:
    // face-api.js returns distances usually between 0.0 (perfect match) and 0.8+ (no match).
    // For tiny_face_detector, distances > 0.4 usually indicate a non-match.
    let similarity = 0;
    if (distance <= 0.3) {
      similarity = 90 + ((0.3 - distance) * 33); // 0.0 -> 100, 0.3 -> 90
    } else if (distance <= 0.35) {
      similarity = 60 + ((0.35 - distance) * 600); // 0.3 -> 90, 0.35 -> 60
    } else if (distance <= 0.4) {
      similarity = 20 + ((0.4 - distance) * 800); // 0.35 -> 60, 0.4 -> 20
    } else {
      similarity = 0; // Extremely strict: immediately fail > 0.4
    }

    return Math.min(99, Math.max(0, Math.round(similarity)));
  } catch (err) {
    console.warn('[compareFaces] Error:', err);
    return 50; // Fallback similarity
  }
}

function loadImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let cleanedBase64 = base64 || '';

    // Remove any trailing colon and numbers
    cleanedBase64 = cleanedBase64.replace(/:\d+$/, '').trim();

    // Ensure it has the data URI prefix
    if (cleanedBase64.indexOf('data:') !== 0) {
      // Check if it's an HTTP URL (just load it directly if so)
      if (cleanedBase64.startsWith('http://') || cleanedBase64.startsWith('https://')) {
        // Do nothing, just use the URL
      } else {
        cleanedBase64 = 'data:image/jpeg;base64,' + cleanedBase64;
      }
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = cleanedBase64;
  });
}
