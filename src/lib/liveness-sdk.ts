/*!
 * NinjaTech AI — Liveness Detection SDK  v1.1.0
 * https://ninjatech.ai
 *
 * Drop-in browser SDK for real-time face liveness detection.
 */

declare const FaceMesh: any;
declare const Camera: any;

export interface LivenessSDKOptions {
  numChallenges?: number;
  challenges?: string[]; // Added to allow specific challenge selection
  title?: string;
  injectCSS?: boolean;
  branding?: string;
  captureFormat?: string;
  captureQuality?: number;
  onSuccess?: (result: any) => void;
  onFailure?: (result: any) => void;
  onCancel?: () => void;
  onReady?: () => void;
  onCapture?: (base64: string) => void;
  onChallengePass?: (info: any) => void;
  onChallengeFail?: (info: any) => void;
  thresholds?: any;
  target?: HTMLElement; // Added target option
}

export default class LivenessSDK {
  _opts: LivenessSDKOptions;
  _T: any;
  _dom: any;
  _S: any;
  _cssInjected: boolean;
  _destroyed: boolean;

  constructor(options: LivenessSDKOptions) {
    this._opts = Object.assign({
      numChallenges: 3,
      title: 'Face Verification',
      injectCSS: true,
      branding: 'Powered by <a href="https://ninjatech.ai" target="_blank" rel="noopener">NinjaTech AI</a>',
      captureFormat: 'image/jpeg',
      captureQuality: 0.92,
    }, options || {});

    this._T = Object.assign({}, {
      EAR_CLOSED: 0.24,
      EAR_OPEN: 0.28,
      SMILE_RATIO: 0.36,
      SMILE_HOLD: 8,
      HEAD_TURN_DEG: 15,
      MOUTH_OPEN_RATIO: 0.22,
      MOUTH_HOLD: 7,
      LOOK_HOLD: 6,
      LOOK_THRESH: 3,
      BLINK_COOLDOWN: 400,
      CHALLENGE_TIMEOUT: 10000,
      CALIB_FRAMES: 6,
      ALIGN_YAW_MAX: 8,
      ALIGN_PITCH_MAX: 6,
      ALIGN_HOLD_FRAMES: 12,
    }, this._opts.thresholds || {});

    this._dom = null;
    this._S = null;
    this._cssInjected = false;
    this._destroyed = false;
  }

  // CDN URLs
  static MP_CAMERA_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
  static MP_FACEMESH_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
  static MP_CDN_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/';

  static ALL_CHALLENGES = [
    { id: 'blink', name: 'Blink 2 Times', icon: '\uD83D\uDC41\uFE0F', desc: 'Blink both eyes 2 times', prompt: 'Blink your eyes 2 times', sub: 'Keep your face centred', requiredCount: 2 },
    { id: 'turn_left', name: 'Turn Head Right', icon: '\u2B05\uFE0F', desc: 'Slowly turn head to the RIGHT', prompt: 'Turn your head to the RIGHT', sub: 'Slow and steady', direction: 'left' },
    { id: 'turn_right', name: 'Turn Head Left', icon: '\u27A1\uFE0F', desc: 'Slowly turn head to the LEFT', prompt: 'Turn your head to the LEFT', sub: 'Slow and steady', direction: 'right' },
    { id: 'nod', name: 'Nod Your Head', icon: '\u2195\uFE0F', desc: 'Nod your head up and down', prompt: 'Nod your head down, then up', sub: 'Full nod required' },
    { id: 'smile', name: 'Smile & Hold', icon: '\uD83D\uDE01', desc: 'Big smile, hold it steady', prompt: 'Smile and hold it!', sub: 'Hold for half a second' },
    { id: 'mouth_open', name: 'Open Your Mouth', icon: '\uD83D\uDE2E', desc: 'Open your mouth wide', prompt: 'Open your mouth wide', sub: 'Hold it open briefly' },
    { id: 'look_up', name: 'Look Up', icon: '\uD83D\uDC46', desc: 'Tilt your head upward', prompt: 'Tilt your head up', sub: 'Look toward the ceiling', direction: 'up' },
    { id: 'look_down', name: 'Look Down', icon: '\uD83D\uDC47', desc: 'Tilt your head downward', prompt: 'Tilt your head down', sub: 'Look toward the floor', direction: 'down' },
  ];

  static LM = {
    LEFT_EYE: [362, 385, 387, 263, 373, 380],
    RIGHT_EYE: [33, 160, 158, 133, 153, 144],
    MOUTH_LEFT: 61,
    MOUTH_RIGHT: 291,
    MOUTH_TOP: 13,
    MOUTH_BOT: 14,
    NOSE_TIP: 1,
    CHIN: 152,
    FOREHEAD: 10,
    L_CHEEK: 234,
    R_CHEEK: 454,
  };

  static ARC_CIRCUMFERENCE = 829.38;

  open() {
    if (this._dom) return Promise.resolve();
    this._destroyed = false;
    this._injectCSS();
    this._buildDOM();
    this._initState();
    return this._boot();
  }

  close() { this._dismiss(false); }

  destroy() {
    this._destroyed = true;
    this._teardown();
  }

  isOpen() { return !!this._dom && !this._destroyed; }

  _injectCSS() {
    if (this._cssInjected || !this._opts.injectCSS) return;
    this._injectInlineCSS();
    this._cssInjected = true;
  }

  _injectInlineCSS() {
    if (document.getElementById('ntl-inline-styles')) return;
    const style = document.createElement('style');
    style.id = 'ntl-inline-styles';
    style.textContent = '.ntl-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);z-index:99998;display:flex;align-items:center;justify-content:center;padding:16px;animation:ntl-fadeIn .25s ease}@keyframes ntl-fadeIn{from{opacity:0}to{opacity:1}}.ntl-modal{background:#fff;border-radius:28px;width:100%;max-width:420px;max-height:100vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(0,0,0,.28);animation:ntl-slideUp .32s cubic-bezier(.34,1.56,.64,1)}@keyframes ntl-slideUp{from{opacity:0;transform:translateY(40px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}.ntl-root{font-family:\'Segoe UI\',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;--ntl-white:#fff;--ntl-blue:#4A90D9;--ntl-blue-light:#7BB8F0;--ntl-blue-pale:#EAF3FC;--ntl-blue-ring:#A8D4F5;--ntl-green:#22c55e;--ntl-red:#ef4444;--ntl-text:#1a1a2e;--ntl-text-mid:#555577;--ntl-text-muted:#9999bb;--ntl-circle-size:min(260px,58vw)}';
    document.head.appendChild(style);
  }

  _buildDOM() {
    const opts = this._opts;
    const d: any = {};

    d.backdrop = this._el('div', 'ntl-backdrop ntl-root');
    d.backdrop.setAttribute('role', 'dialog');
    d.backdrop.setAttribute('aria-modal', 'true');
    d.backdrop.setAttribute('aria-label', opts.title || 'Face Verification');
    d.backdrop.addEventListener('click', (e: any) => { if (e.target === d.backdrop) this._dismiss(false); });

    d.modal = this._el('div', '');
    d.backdrop.appendChild(d.modal);

    const header = this._el('div', 'ntl-header');
    d.headerTitle = this._el('span', 'ntl-header-title');
    d.headerTitle.textContent = opts.title || 'Face Verification';
    d.closeBtn = this._el('button', 'ntl-close-btn');
    d.closeBtn.setAttribute('aria-label', 'Close');
    d.closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    d.closeBtn.addEventListener('click', () => this._dismiss(false));
    header.appendChild(d.headerTitle);
    header.appendChild(d.closeBtn);
    d.modal.appendChild(header);

    d.body = this._el('div', 'ntl-body');
    d.modal.appendChild(d.body);

    d.circleWrap = this._el('div', 'ntl-circle-wrap');
    d.ripple1 = this._el('div', 'ntl-ripple r1');
    d.ripple2 = this._el('div', 'ntl-ripple r2');
    d.circle = this._el('div', 'ntl-circle');

    d.video = this._el('video', 'ntl-video');
    d.video.autoplay = true; d.video.playsInline = true; d.video.muted = true;
    d.video.setAttribute('playsinline', '');

    d.canvas = this._el('canvas', 'ntl-overlay');
    d.ctx = d.canvas.getContext('2d');

    d.captureCanvas = this._el('canvas', '');
    d.captureCanvas.style.display = 'none';

    d.arcSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    d.arcSvg.setAttribute('class', 'ntl-scan-arc');
    d.arcSvg.setAttribute('viewBox', '0 0 280 280');
    d.arcSvg.setAttribute('fill', 'none');
    const arcTrack = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    arcTrack.setAttribute('class', 'ntl-arc-track');
    arcTrack.setAttribute('cx', '140'); arcTrack.setAttribute('cy', '140'); arcTrack.setAttribute('r', '132');
    d.arcProgress = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    d.arcProgress.setAttribute('class', 'ntl-arc-progress');
    d.arcProgress.setAttribute('cx', '140'); d.arcProgress.setAttribute('cy', '140'); d.arcProgress.setAttribute('r', '132');
    d.arcSvg.appendChild(arcTrack);
    d.arcSvg.appendChild(d.arcProgress);

    d.loading = this._el('div', 'ntl-loading');
    d.spinner = this._el('div', 'ntl-spinner');
    d.loadingLabel = this._el('div', 'ntl-loading-label');
    d.loadingLabel.textContent = 'Starting camera\u2026';
    d.loading.appendChild(d.spinner);
    d.loading.appendChild(d.loadingLabel);

    d.alignOverlay = this._el('div', 'ntl-align-overlay');
    d.alignOverlay.innerHTML = '<div class="ntl-align-crosshair"><div class="ntl-align-h"></div><div class="ntl-align-v"></div></div>';

    d.badge = this._el('div', 'ntl-badge');
    d.badgeIcon = this._el('span', '');
    d.badge.appendChild(d.badgeIcon);

    d.circle.appendChild(d.video);
    d.circle.appendChild(d.canvas);
    d.circle.appendChild(d.arcSvg);
    d.circle.appendChild(d.loading);
    d.circle.appendChild(d.alignOverlay);
    d.circle.appendChild(d.badge);

    d.circleWrap.appendChild(d.ripple1);
    d.circleWrap.appendChild(d.ripple2);
    d.circleWrap.appendChild(d.circle);
    d.body.appendChild(d.circleWrap);

    d.alignBar = this._el('div', 'ntl-align-bar');
    d.alignBarFill = this._el('div', 'ntl-align-bar-fill');
    d.alignBar.appendChild(d.alignBarFill);
    d.body.appendChild(d.alignBar);

    d.instruction = this._el('div', 'ntl-instruction');
    d.instrMain = this._el('p', 'ntl-instruction-main');
    d.instrSub = this._el('p', 'ntl-instruction-sub');
    d.instrMain.textContent = 'Position your face in the circle';
    d.instruction.appendChild(d.instrMain);
    d.instruction.appendChild(d.instrSub);
    d.body.appendChild(d.instruction);

    d.steps = this._el('div', 'ntl-steps');
    d.body.appendChild(d.steps);

    d.dots = this._el('div', 'ntl-dots');
    d.body.appendChild(d.dots);

    if (opts.branding !== '') {
      d.footer = this._el('div', 'ntl-footer');
      d.footer.innerHTML = opts.branding || 'Powered by <a href="https://ninjatech.ai" target="_blank" rel="noopener">NinjaTech AI</a>';
      d.modal.appendChild(d.footer);
    }

    (opts.target || document.body).appendChild(d.backdrop);
    (opts.target || document.body).appendChild(d.captureCanvas);
    if (!opts.target) document.body.style.overflow = 'hidden';

    this._dom = d;
  }

  _initState() {
    this._S = {
      ready: false,
      phase: 'loading',
      running: false,
      faceDetected: false,
      capturedImage: null,
      alignFrames: 0,
      alignPitchBase: null,
      alignCalibBuf: [],
      challenges: [],
      currentIdx: -1,
      challengeActive: false,
      challengeTimeout: null,
      passed: 0,
      results: [],
      blinkCount: 0, lastBlink: 0, eyeClosed: false,
      baseYaw: null, maxYawDelta: 0,
      basePitch: null, nodPhase: 'down', maxDown: 0, maxUp: 0,
      smileFrames: 0, mouthFrames: 0, lookFrames: 0,
      lookCalibBuf: [],
      motionHistory: [], prevLandmarks: null, landmarks: null,
      faceMesh: null, camera: null,
      countdownInterval: null, waitFaceTimeout: null,
    };
  }

  async _boot() {
    const S = this._S;
    const d = this._dom;
    const opts = this._opts;

    S.challenges = this._pickChallenges();
    this._buildSteps();

    try {
      d.loadingLabel.textContent = 'Loading dependencies\u2026';
      await this._loadScript(LivenessSDK.MP_CAMERA_URL);
      await this._loadScript(LivenessSDK.MP_FACEMESH_URL);
    } catch (e) {
      d.loadingLabel.textContent = '\u26A0\uFE0F Failed to load. Check your connection.';
      return;
    }

    d.loadingLabel.textContent = 'Starting camera\u2026';
    const camOk = await this._initCamera();
    if (this._destroyed) return;

    if (!camOk) {
      d.loadingLabel.textContent = '\u26A0\uFE0F Camera access denied. Allow camera permissions and retry.';
      return;
    }

    d.loadingLabel.textContent = 'Loading face detection\u2026';
    try {
      await this._initFaceMesh();
      if (this._destroyed) return;
      S.ready = true;
      d.loading.classList.add('hidden');
      setTimeout(() => { if (d.loading.parentNode) d.loading.remove(); }, 500);
      if (opts.onReady) opts.onReady();
      this._startAlignmentPhase();
    } catch (e) {
      console.error('[LivenessSDK] FaceMesh error:', e);
      d.loadingLabel.textContent = '\u26A0\uFE0F Face detection failed. Please refresh.';
    }
  }

  async _initCamera() {
    if (this._destroyed || !this._dom) return false;
    const d = this._dom;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      if (this._destroyed || !this._dom) return false;
      d.video.srcObject = stream;
      await new Promise(r => { d.video.onloadedmetadata = r; });
      if (this._destroyed || !this._dom) return false;
      await d.video.play();
      d.canvas.width = d.video.videoWidth || 640;
      d.canvas.height = d.video.videoHeight || 480;
      d.captureCanvas.width = d.video.videoWidth || 640;
      d.captureCanvas.height = d.video.videoHeight || 480;
      return true;
    } catch (e) {
      console.error('[LivenessSDK] Camera error:', e);
      return false;
    }
  }

  _initFaceMesh() {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self._destroyed || !self._dom) return reject(new Error('Destroyed'));
      try {
        const fm = new FaceMesh({ locateFile: (f: any) => LivenessSDK.MP_CDN_BASE + f });
        fm.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        fm.onResults((results: any) => self._onResults(results));
        self._S.faceMesh = fm;

        if (self._destroyed || !self._dom) return reject(new Error('Destroyed'));

        const cam = new Camera(self._dom.video, {
          onFrame: async () => {
            if (self._S.faceMesh && !self._destroyed && self._dom) {
              await self._S.faceMesh.send({ image: self._dom.video });
            }
          },
          width: 640, height: 480,
        });
        self._S.camera = cam;
        cam.start().then(resolve).catch(reject);
      } catch (e) { reject(e); }
    });
  }

  _onResults(results: any) {
    if (this._destroyed) return;
    const S = this._S;
    const d = this._dom;
    const ctx = d.ctx;

    ctx.clearRect(0, 0, d.canvas.width, d.canvas.height);

    if (!results.multiFaceLandmarks || !results.multiFaceLandmarks.length) {
      S.faceDetected = false;
      S.prevLandmarks = null;
      S.landmarks = null;
      if (S.phase === 'aligning') this._setInstruction('No face detected', 'Position your face in the circle');
      if (S.phase === 'challenging') this._setInstruction('No face detected', 'Make sure your face is visible');
      this._drawGuideCircle(false);
      return;
    }

    const lm = results.multiFaceLandmarks[0];
    S.prevLandmarks = S.landmarks;
    S.landmarks = lm;
    S.faceDetected = true;
    this._trackMotion(lm);
    this._drawFaceOverlay(lm);

    if (S.phase === 'aligning') this._processAlignment(lm);
    if (S.phase === 'challenging' && S.challengeActive) this._processFrame(lm);
  }

  _startAlignmentPhase() {
    const S = this._S;
    const d = this._dom;
    S.phase = 'aligning';
    S.alignFrames = 0;
    S.alignPitchBase = null;
    S.alignCalibBuf = [];
    S.running = true;

    d.alignOverlay.classList.add('visible');
    d.alignBar.classList.add('visible');
    d.circle.classList.add('active');
    d.ripple1.classList.add('active');
    d.ripple2.classList.add('active');

    this._setInstruction('Straighten your head', 'Look directly at the camera');
    this._waitForFaceAlign();
  }

  _waitForFaceAlign() {
    const S = this._S;
    if (S.waitFaceTimeout) clearTimeout(S.waitFaceTimeout);
    S.waitFaceTimeout = setTimeout(() => {
      if (S.phase === 'aligning' && !S.faceDetected) {
        this._setInstruction('No face detected', 'Closing\u2026');
        const d = this._dom;
        d.circle.classList.remove('active');
        d.ripple1.classList.remove('active');
        d.ripple2.classList.remove('active');
        setTimeout(() => this._dismiss(true, false, { verified: false, capturedImage: null, passed: 0, total: 0, challenges: [] }), 1400);
      }
    }, 15000);
  }

  _processAlignment(lm: any) {
    const S = this._S;
    const T = this._T;
    const d = this._dom;

    if (S.alignPitchBase === null) {
      const p = this._pitch(lm);
      S.alignCalibBuf.push(p);
      if (S.alignCalibBuf.length < T.CALIB_FRAMES) {
        this._setInstruction('Hold still\u2026', 'Calibrating\u2026');
        return;
      }
      S.alignPitchBase = S.alignCalibBuf.reduce((a: any, b: any) => a + b, 0) / S.alignCalibBuf.length;
      S.alignCalibBuf = [];
    }

    const yawDeg = Math.abs(this._yaw(lm));
    const pitchDev = Math.abs(this._pitch(lm) - S.alignPitchBase);
    const isAligned = yawDeg < T.ALIGN_YAW_MAX && pitchDev < T.ALIGN_PITCH_MAX;

    const rawYaw = this._yaw(lm);
    let nudge = '';
    if (yawDeg >= T.ALIGN_YAW_MAX) {
      nudge = rawYaw > 0 ? 'Turn slightly LEFT' : 'Turn slightly RIGHT';
    } else {
      const pitchRaw = this._pitch(lm) - S.alignPitchBase;
      if (Math.abs(pitchRaw) >= T.ALIGN_PITCH_MAX) {
        nudge = pitchRaw > 0 ? 'Tilt up slightly' : 'Tilt down slightly';
      }
    }

    if (isAligned) {
      S.alignFrames++;
      const pct = Math.min(100, Math.round((S.alignFrames / T.ALIGN_HOLD_FRAMES) * 100));
      d.alignBarFill.style.width = pct + '%';
      this._setInstruction('Straighten your head', 'Look directly at the camera');
      this._setAlignCrosshair(false);
      if (S.alignFrames >= T.ALIGN_HOLD_FRAMES) this._captureFrame();
    } else {
      if (S.alignFrames > 0) S.alignFrames = Math.max(0, S.alignFrames - 1);
      const pct = Math.max(0, Math.round((S.alignFrames / T.ALIGN_HOLD_FRAMES) * 100));
      d.alignBarFill.style.width = pct + '%';
      this._setInstruction('Straighten your head', nudge || 'Look directly at the camera');
      this._setAlignCrosshair(false);
    }
  }

  _setAlignCrosshair(aligned: boolean) {
    const crosshair = this._dom.alignOverlay.querySelector('.ntl-align-crosshair');
    if (crosshair) crosshair.classList.toggle('aligned', aligned);
  }

  _captureFrame() {
    const S = this._S;
    const d = this._dom;
    const opts = this._opts;

    S.phase = 'captured';
    clearTimeout(S.waitFaceTimeout);

    const cc = d.captureCanvas;
    const cctx = cc.getContext('2d');
    cctx.clearRect(0, 0, cc.width, cc.height);
    cctx.drawImage(d.video, 0, 0, cc.width, cc.height);

    const base64 = cc.toDataURL(opts.captureFormat, opts.captureQuality);
    S.capturedImage = base64;

    if (opts.onCapture) opts.onCapture(base64);

    d.alignOverlay.classList.remove('visible');
    d.alignBar.classList.remove('visible');
    d.alignBarFill.style.width = '0%';
    this._startVerification();
  }

  _trackMotion(lm: any) {
    const S = this._S;
    if (!S.prevLandmarks) return;
    const keys = [LivenessSDK.LM.NOSE_TIP, LivenessSDK.LM.CHIN, LivenessSDK.LM.L_CHEEK, LivenessSDK.LM.R_CHEEK, LivenessSDK.LM.FOREHEAD];
    let dist = 0;
    keys.forEach(i => { dist += Math.hypot(lm[i].x - S.prevLandmarks[i].x, lm[i].y - S.prevLandmarks[i].y); });
    S.motionHistory.push(dist / keys.length);
    if (S.motionHistory.length > 60) S.motionHistory.shift();
  }

  _hasNaturalMotion() {
    const S = this._S;
    if (S.motionHistory.length < 20) return true;
    const mean = S.motionHistory.reduce((a: any, b: any) => a + b, 0) / S.motionHistory.length;
    const variance = S.motionHistory.reduce((a: any, v: any) => a + Math.pow(v - mean, 2), 0) / S.motionHistory.length;
    return variance > 1e-8;
  }

  _drawGuideCircle(found: boolean) {
    const d = this._dom, ctx = d.ctx, W = d.canvas.width, H = d.canvas.height;
    ctx.save();
    ctx.strokeStyle = found ? 'rgba(74,144,217,0.5)' : 'rgba(239,68,68,0.35)';
    ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  _drawFaceOverlay(lm: any) {
    const d = this._dom, ctx = d.ctx, S = this._S, W = d.canvas.width, H = d.canvas.height;
    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, Math.min(W, H) / 2, 0, Math.PI * 2);
    ctx.clip();

    const cx = lm[LivenessSDK.LM.NOSE_TIP].x * W;
    const cy = ((lm[LivenessSDK.LM.NOSE_TIP].y + lm[LivenessSDK.LM.CHIN].y) / 2) * H;
    const rx = Math.abs(lm[LivenessSDK.LM.R_CHEEK].x - lm[LivenessSDK.LM.L_CHEEK].x) * W / 2 * 1.1;
    const ry = Math.abs(lm[LivenessSDK.LM.CHIN].y - lm[LivenessSDK.LM.FOREHEAD].y) * H / 2 * 1.05;
    ctx.strokeStyle = S.challengeActive ? 'rgba(74,144,217,0.55)' : 'rgba(74,144,217,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    const lEAR = this._ear(lm, LivenessSDK.LM.LEFT_EYE);
    const rEAR = this._ear(lm, LivenessSDK.LM.RIGHT_EYE);
    const T = this._T;
    this._drawEye(lm, LivenessSDK.LM.LEFT_EYE, W, H, lEAR < T.EAR_CLOSED ? '#ef4444' : 'rgba(74,144,217,0.7)');
    this._drawEye(lm, LivenessSDK.LM.RIGHT_EYE, W, H, rEAR < T.EAR_CLOSED ? '#ef4444' : 'rgba(74,144,217,0.7)');

    ctx.beginPath();
    ctx.arc(lm[LivenessSDK.LM.NOSE_TIP].x * W, lm[LivenessSDK.LM.NOSE_TIP].y * H, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(74,144,217,0.7)';
    ctx.fill();
    ctx.restore();

    if (S.challengeActive) this._drawHUD(lm, W, H);
  }

  _drawEye(lm: any, indices: any, W: any, H: any, color: any) {
    const ctx = this._dom.ctx;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 1.5;
    ctx.beginPath();
    indices.forEach((idx: any, i: any) => {
      const p = lm[idx];
      i === 0 ? ctx.moveTo(p.x * W, p.y * H) : ctx.lineTo(p.x * W, p.y * H);
    });
    ctx.closePath(); ctx.stroke();
    ctx.restore();
  }

  _drawHUD(lm: any, _W: any, H: any) {
    const ch = this._S.challenges[this._S.currentIdx];
    const S = this._S, T = this._T;
    if (!ch) return;
    let lines: any[] = [];
    switch (ch.id) {
      case 'blink': lines = ['EAR: ' + ((this._ear(lm, LivenessSDK.LM.LEFT_EYE) + this._ear(lm, LivenessSDK.LM.RIGHT_EYE)) / 2).toFixed(3), 'Blinks: ' + S.blinkCount + '/' + ch.requiredCount]; break;
      case 'turn_left':
      case 'turn_right': lines = ['Yaw: ' + this._yaw(lm).toFixed(1) + '\u00B0', '\u0394: ' + S.maxYawDelta.toFixed(1) + '/' + T.HEAD_TURN_DEG + '\u00B0']; break;
      case 'nod': lines = ['Pitch: ' + this._pitch(lm).toFixed(1), 'Phase: ' + S.nodPhase]; break;
      case 'smile': lines = ['Smile: ' + (this._smileR(lm) * 100).toFixed(0) + '%', 'Hold: ' + S.smileFrames + '/' + T.SMILE_HOLD]; break;
      case 'mouth_open': lines = ['Open: ' + (this._mouthR(lm) * 100).toFixed(0) + '%', 'Hold: ' + S.mouthFrames + '/' + T.MOUTH_HOLD]; break;
      case 'look_up':
      case 'look_down': lines = ['Pitch: ' + this._pitch(lm).toFixed(1), 'Hold: ' + S.lookFrames + '/' + T.LOOK_HOLD]; break;
    }
    const ctx = this._dom.ctx;
    ctx.save();
    ctx.font = 'bold 10px monospace'; ctx.fillStyle = 'rgba(74,144,217,0.85)';
    lines.forEach((l, i) => ctx.fillText(l, 6, H - 4 - (lines.length - 1 - i) * 14));
    ctx.restore();
  }

  _ear(lm: any, idx: any) {
    const [p1, p2, p3, p4, p5, p6] = idx.map((i: any) => lm[i]);
    return (this._d2(p2, p6) + this._d2(p3, p5)) / (2 * this._d2(p1, p4));
  }

  _smileR(lm: any) {
    const fw = this._d2(lm[LivenessSDK.LM.L_CHEEK], lm[LivenessSDK.LM.R_CHEEK]);
    return fw > 0 ? this._d2(lm[LivenessSDK.LM.MOUTH_LEFT], lm[LivenessSDK.LM.MOUTH_RIGHT]) / fw : 0;
  }

  _mouthR(lm: any) {
    const mw = this._d2(lm[LivenessSDK.LM.MOUTH_LEFT], lm[LivenessSDK.LM.MOUTH_RIGHT]);
    return mw > 0 ? this._d2(lm[LivenessSDK.LM.MOUTH_TOP], lm[LivenessSDK.LM.MOUTH_BOT]) / mw : 0;
  }

  _yaw(lm: any) {
    const fc = { x: (lm[LivenessSDK.LM.L_CHEEK].x + lm[LivenessSDK.LM.R_CHEEK].x) / 2 };
    const off = (lm[LivenessSDK.LM.NOSE_TIP].x - fc.x) / this._d2(lm[LivenessSDK.LM.L_CHEEK], lm[LivenessSDK.LM.R_CHEEK]);
    return Math.atan(off * 2.5) * (180 / Math.PI);
  }

  _pitch(lm: any) {
    const foreheadToNose = this._d2(lm[LivenessSDK.LM.FOREHEAD], lm[LivenessSDK.LM.NOSE_TIP]);
    const noseToChin = this._d2(lm[LivenessSDK.LM.NOSE_TIP], lm[LivenessSDK.LM.CHIN]);
    const total = foreheadToNose + noseToChin;
    if (total === 0) return 0;
    return ((foreheadToNose / total) - 0.5) * 100;
  }

  _d2(a: any, b: any) { return Math.hypot(a.x - b.x, a.y - b.y); }

  _processFrame(lm: any) {
    const ch = this._S.challenges[this._S.currentIdx];
    if (!ch) return;
    switch (ch.id) {
      case 'blink': this._doBlink(lm, ch); break;
      case 'turn_left':
      case 'turn_right': this._doTurn(lm, ch); break;
      case 'nod': this._doNod(lm, ch); break;
      case 'smile': this._doSmile(lm, ch); break;
      case 'mouth_open': this._doMouth(lm, ch); break;
      case 'look_up':
      case 'look_down': this._doLook(lm, ch); break;
    }
  }

  _doBlink(lm: any, ch: any) {
    const S = this._S, T = this._T;
    const avg = (this._ear(lm, LivenessSDK.LM.LEFT_EYE) + this._ear(lm, LivenessSDK.LM.RIGHT_EYE)) / 2;
    const now = Date.now();
    if (avg < T.EAR_CLOSED && !S.eyeClosed) { S.eyeClosed = true; }
    else if (avg > T.EAR_OPEN && S.eyeClosed) {
      if (now - S.lastBlink > T.BLINK_COOLDOWN) {
        S.blinkCount++; S.lastBlink = now;
        if (S.blinkCount >= ch.requiredCount) { this._pass(); return; }
      }
      S.eyeClosed = false;
    }
    if (S.blinkCount < ch.requiredCount) {
      this._setInstruction(
        avg < T.EAR_CLOSED ? 'Eyes closed\u2026' : 'Blink your eyes \u2014 ' + (ch.requiredCount - S.blinkCount) + ' more',
        S.blinkCount + ' / ' + ch.requiredCount + ' blinks detected'
      );
    }
  }

  _doTurn(lm: any, ch: any) {
    const S = this._S, T = this._T;
    const y = this._yaw(lm);
    if (S.baseYaw === null) S.baseYaw = y;
    const delta = ch.direction === 'left' ? -(y - S.baseYaw) : (y - S.baseYaw);
    S.maxYawDelta = Math.max(S.maxYawDelta, delta);
    const pct = Math.min(100, (delta / T.HEAD_TURN_DEG) * 100);
    this._setInstruction('Turn head ' + ch.direction.toUpperCase(), Math.round(Math.max(0, pct)) + '% complete');
    if (delta > T.HEAD_TURN_DEG) this._pass();
  }

  _doNod(lm: any, _ch: any) {
    const S = this._S, T = this._T;
    const p = this._pitch(lm);
    if (S.basePitch === null) {
      S.lookCalibBuf.push(p);
      if (S.lookCalibBuf.length < T.CALIB_FRAMES) return;
      S.basePitch = S.lookCalibBuf.reduce((a: any, b: any) => a + b, 0) / S.lookCalibBuf.length;
      S.lookCalibBuf = [];
      return;
    }
    const delta = p - S.basePitch;
    if (S.nodPhase === 'down') {
      S.maxDown = Math.max(S.maxDown, delta);
      const pct = Math.round(Math.min(100, (S.maxDown / T.LOOK_THRESH) * 100));
      this._setInstruction('Nod your head DOWN', pct + '% complete');
      if (S.maxDown > T.LOOK_THRESH) { S.nodPhase = 'up'; this._setInstruction('Now nod back UP', 'Almost done!'); }
    } else {
      S.maxUp = Math.max(S.maxUp, S.basePitch - p);
      const pct = Math.round(Math.min(100, (S.maxUp / T.LOOK_THRESH) * 100));
      this._setInstruction('Nod your head UP', pct + '% complete');
      if (S.maxUp > T.LOOK_THRESH) this._pass();
    }
  }

  _doSmile(lm: any, _ch: any) {
    const S = this._S, T = this._T;
    const sr = this._smileR(lm);
    if (sr > T.SMILE_RATIO) {
      S.smileFrames++;
      const pct = Math.round(Math.min(100, (S.smileFrames / T.SMILE_HOLD) * 100));
      this._setInstruction('Smiling! Hold it\u2026', pct + '% \u2014 keep smiling');
      if (S.smileFrames >= T.SMILE_HOLD) this._pass();
    } else {
      S.smileFrames = Math.max(0, S.smileFrames - 2);
      this._setInstruction('Smile and hold it!', 'Smile wider (' + Math.round(sr * 100) + '% / ' + Math.round(T.SMILE_RATIO * 100) + '% needed)');
    }
  }

  _doMouth(lm: any, _ch: any) {
    const S = this._S, T = this._T;
    const mo = this._mouthR(lm);
    if (mo > T.MOUTH_OPEN_RATIO) {
      S.mouthFrames++;
      const pct = Math.round(Math.min(100, (S.mouthFrames / T.MOUTH_HOLD) * 100));
      this._setInstruction('Mouth open! Hold\u2026', pct + '% \u2014 keep it open');
      if (S.mouthFrames >= T.MOUTH_HOLD) this._pass();
    } else {
      S.mouthFrames = Math.max(0, S.mouthFrames - 2);
      this._setInstruction('Open your mouth wide', 'Open wider (' + Math.round(mo * 100) + '% / ' + Math.round(T.MOUTH_OPEN_RATIO * 100) + '% needed)');
    }
  }

  _doLook(lm: any, ch: any) {
    const S = this._S, T = this._T;
    const p = this._pitch(lm);
    if (S.basePitch === null) {
      S.lookCalibBuf.push(p);
      if (S.lookCalibBuf.length < T.CALIB_FRAMES) {
        this._setInstruction('Get ready to look ' + ch.direction, 'Hold still for a moment\u2026');
        return;
      }
      S.basePitch = S.lookCalibBuf.reduce((a: any, b: any) => a + b, 0) / S.lookCalibBuf.length;
      S.lookCalibBuf = [];
      return;
    }
    const delta = p - S.basePitch;
    const dirDelta = ch.direction === 'up' ? -delta : delta;
    S.maxDown = Math.max(S.maxDown, dirDelta);
    const pct = Math.min(100, (S.maxDown / T.LOOK_THRESH) * 100);
    this._setInstruction('Look ' + ch.direction.toUpperCase(), Math.round(Math.max(0, pct)) + '% \u2014 tilt your head ' + ch.direction);
    if (dirDelta > T.LOOK_THRESH) {
      S.lookFrames++;
      if (S.lookFrames >= T.LOOK_HOLD) this._pass();
    } else {
      S.lookFrames = Math.max(0, S.lookFrames - 1);
    }
  }

  _nextChallenge() {
    const S = this._S;
    S.currentIdx++;
    if (S.currentIdx >= S.challenges.length) { this._endSession(); return; }

    const ch = S.challenges[S.currentIdx];
    S.blinkCount = 0; S.eyeClosed = false; S.lastBlink = 0;
    S.baseYaw = null; S.maxYawDelta = 0;
    S.basePitch = null; S.nodPhase = 'down'; S.maxDown = 0; S.maxUp = 0;
    S.smileFrames = 0; S.mouthFrames = 0; S.lookFrames = 0;
    S.lookCalibBuf = [];
    S.challengeActive = true;

    this._setStepState(ch.id, 'active', 'In progress');
    this._setDot(S.currentIdx, 'active');

    const d = this._dom;
    d.circle.classList.add('active');
    d.ripple1.classList.add('active');
    d.ripple2.classList.add('active');
    d.badgeIcon.textContent = ch.icon;
    d.badge.classList.add('visible');
    this._setInstruction(ch.prompt, ch.sub || '');
    this._startArc(this._T.CHALLENGE_TIMEOUT);

    S.challengeTimeout = setTimeout(() => { if (S.challengeActive) this._fail(); }, this._T.CHALLENGE_TIMEOUT);
  }

  _pass() {
    const S = this._S;
    if (!S.challengeActive) return;
    this._clearTO();
    const ch = S.challenges[S.currentIdx];
    S.challengeActive = false; S.passed++; S.results.push({ id: ch.id, passed: true });
    this._setStepState(ch.id, 'done', 'Passed \u2713');
    this._setDot(S.currentIdx, 'done');
    this._stopArc('success'); this._flash('pass');
    this._dom.badge.classList.remove('visible');
    if (this._opts.onChallengePass) this._opts.onChallengePass({ id: ch.id, index: S.currentIdx });
    setTimeout(() => { if (S.running) this._nextChallenge(); }, 900);
  }

  _fail() {
    const S = this._S;
    if (!S.challengeActive) return;
    this._clearTO();
    const ch = S.challenges[S.currentIdx];
    S.challengeActive = false; S.results.push({ id: ch.id, passed: false });
    this._setStepState(ch.id, 'failed', 'Failed \u2717');
    this._setDot(S.currentIdx, 'failed');
    this._stopArc('fail'); this._flash('fail');
    this._dom.badge.classList.remove('visible');
    this._setInstruction("Time's up!", 'Moving to next challenge\u2026');
    if (this._opts.onChallengeFail) this._opts.onChallengeFail({ id: ch.id, index: S.currentIdx });
    setTimeout(() => { if (S.running) this._nextChallenge(); }, 900);
  }

  _endSession() {
    const S = this._S, d = this._dom;
    S.running = false; S.challengeActive = false; S.phase = 'done';
    this._clearTO(); this._stopArc('reset');
    d.circle.classList.remove('active');
    d.ripple1.classList.remove('active');
    d.ripple2.classList.remove('active');
    d.badge.classList.remove('visible');

    const allPassed = S.results.length > 0 && S.results.every((r: any) => r.passed);
    const verified = allPassed && this._hasNaturalMotion();

    const result = {
      verified,
      capturedImage: S.capturedImage,
      passed: S.results.filter((r: any) => r.passed).length,
      total: S.results.length,
      challenges: S.results,
      error: verified ? null : (S.results.length === 0 ? 'Face not detected' : 'Challenges not completed'),
    };

    if (verified) {
      d.circle.classList.add('verified');
      this._setInstruction('\u2705 Liveness Verified!', 'Closing\u2026');
    } else {
      d.circle.classList.add('failed');
      this._setInstruction('\u274C Verification Failed', 'Closing\u2026');
    }

    setTimeout(() => this._dismiss(true, verified, result), 1600);
  }

  _startVerification() {
    const S = this._S;
    if (S.phase === 'challenging') return;
    this._resetSteps();
    this._resetPerSessionState();
    S.phase = 'challenging';
    S.running = true;
    const d = this._dom;
    d.circle.classList.add('active');
    d.ripple1.classList.add('active');
    d.ripple2.classList.add('active');
    this._setInstruction('Position your face in the circle', 'Make sure you are well lit');
    this._waitForFaceChallenge();
  }

  _waitForFaceChallenge() {
    const S = this._S;
    if (S.waitFaceTimeout) clearTimeout(S.waitFaceTimeout);
    S.waitFaceTimeout = setTimeout(() => {
      if (S.running && !S.faceDetected) {
        S.running = false;
        this._setInstruction('No face detected', 'Closing\u2026');
        const d = this._dom;
        d.circle.classList.remove('active');
        d.ripple1.classList.remove('active');
        d.ripple2.classList.remove('active');
        setTimeout(() => this._dismiss(true, false, { verified: false, capturedImage: S.capturedImage, passed: 0, total: 0, challenges: [] }), 1400);
      }
    }, 15000);

    const check = setInterval(() => {
      if (!S.running) { clearInterval(check); return; }
      if (S.faceDetected) {
        clearInterval(check);
        clearTimeout(S.waitFaceTimeout);
        this._setInstruction('Face detected! \u2713', 'Starting challenges\u2026');
        setTimeout(() => { if (S.running) this._nextChallenge(); }, 700);
      }
    }, 150);
  }

  _resetPerSessionState() {
    const S = this._S;
    S.currentIdx = -1; S.challengeActive = false; S.passed = 0; S.results = [];
    S.blinkCount = 0; S.lastBlink = 0; S.eyeClosed = false;
    S.baseYaw = null; S.maxYawDelta = 0;
    S.basePitch = null; S.nodPhase = 'down'; S.maxDown = 0; S.maxUp = 0;
    S.smileFrames = 0; S.mouthFrames = 0; S.lookFrames = 0;
    S.lookCalibBuf = [];
    S.motionHistory = [];
    this._clearTO();
    if (S.waitFaceTimeout) { clearTimeout(S.waitFaceTimeout); S.waitFaceTimeout = null; }
  }

  _startArc(durationMs: number) {
    const arc = this._dom.arcProgress, S = this._S;
    arc.setAttribute('class', 'ntl-arc-progress');
    arc.style.strokeDashoffset = LivenessSDK.ARC_CIRCUMFERENCE;
    const start = Date.now();
    if (S.countdownInterval) clearInterval(S.countdownInterval);
    S.countdownInterval = setInterval(() => {
      if (!S.challengeActive) { clearInterval(S.countdownInterval); return; }
      const elapsed = Date.now() - start;
      arc.style.strokeDashoffset = LivenessSDK.ARC_CIRCUMFERENCE * (1 - Math.min(1, elapsed / durationMs));
      if (elapsed >= durationMs) clearInterval(S.countdownInterval);
    }, 80);
  }

  _stopArc(state: string) {
    const arc = this._dom.arcProgress;
    clearInterval(this._S.countdownInterval);
    if (state === 'success') {
      arc.style.strokeDashoffset = '0';
      arc.setAttribute('class', 'ntl-arc-progress success');
    } else if (state === 'fail') {
      arc.setAttribute('class', 'ntl-arc-progress fail');
    } else {
      arc.style.strokeDashoffset = LivenessSDK.ARC_CIRCUMFERENCE;
      arc.setAttribute('class', 'ntl-arc-progress');
    }
  }

  _flash(type: string) {
    const circle = this._dom.circle;
    const cls = type === 'pass' ? 'flash-pass' : 'flash-fail';
    circle.classList.add(cls);
    setTimeout(() => circle.classList.remove(cls), 600);
  }

  _setInstruction(main: string, sub: string) {
    this._dom.instrMain.textContent = main;
    this._dom.instrSub.textContent = sub || '';
  }

  _clearTO() {
    if (this._S.challengeTimeout) { clearTimeout(this._S.challengeTimeout); this._S.challengeTimeout = null; }
  }

  _pickChallenges() {
    const opts = this._opts;
    const n = Math.max(1, Math.min(8, opts.numChallenges || 3));
    if (opts.challenges && opts.challenges.length) {
      return opts.challenges.map((id: string) => LivenessSDK.ALL_CHALLENGES.find(c => c.id === id)).filter(Boolean).slice(0, n);
    }
    const mustIds = ['blink', Math.random() < 0.5 ? 'turn_left' : 'turn_right'];
    const must = mustIds.map(id => LivenessSDK.ALL_CHALLENGES.find(c => c.id === id)).filter(Boolean);
    const rest = this._shuffle(LivenessSDK.ALL_CHALLENGES.filter(c => !mustIds.includes(c.id)));

    const combined = must.concat(rest);
    return this._shuffle(combined.slice(0, n));
  }

  _shuffle(arr: any[]) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  _buildSteps() {
    const d = this._dom, S = this._S;
    d.steps.innerHTML = ''; d.dots.innerHTML = '';
    S.challenges.forEach((ch: any, i: any) => {
      const step = this._el('div', 'ntl-step');
      step.id = 'ntl-step-' + ch.id;
      step.innerHTML =
        '<div class="ntl-step-icon" id="ntl-sicon-' + ch.id + '">' + ch.icon + '</div>' +
        '<div class="ntl-step-text">' +
        '<div class="ntl-step-name">' + ch.name + '</div>' +
        '<div class="ntl-step-desc">' + ch.desc + '</div>' +
        '</div>' +
        '<div class="ntl-step-status" id="ntl-sstatus-' + ch.id + '">Pending</div>';
      d.steps.appendChild(step);
      const dot = this._el('div', 'ntl-dot'); dot.id = 'ntl-dot-' + i;
      d.dots.appendChild(dot);
    });
  }

  _resetSteps() {
    this._buildSteps();
    const d = this._dom;
    d.circle.className = 'ntl-circle';
    d.arcProgress.setAttribute('class', 'ntl-arc-progress');
    d.arcProgress.style.strokeDashoffset = LivenessSDK.ARC_CIRCUMFERENCE;
    d.badge.classList.remove('visible');
    d.ripple1.classList.remove('active');
    d.ripple2.classList.remove('active');
    this._setInstruction('Position your face in the circle', '');
  }

  _setStepState(id: string, cls: string, status: string) {
    const step = document.getElementById('ntl-step-' + id);
    const badge = document.getElementById('ntl-sstatus-' + id);
    const icon = document.getElementById('ntl-sicon-' + id);
    if (!step || !badge || !icon) return;
    step.className = 'ntl-step ' + cls;
    badge.textContent = status;
    if (cls === 'done') icon.textContent = '\u2705';
    if (cls === 'failed') icon.textContent = '\u274C';
  }

  _setDot(idx: number, cls: string) {
    const dot = document.getElementById('ntl-dot-' + idx);
    if (dot) dot.className = 'ntl-dot ' + cls;
  }

  _dismiss(fromSession: boolean, verified?: boolean, result?: any) {
    const S = this._S, opts = this._opts;
    if (S && S.running) {
      S.running = false; S.challengeActive = false;
      this._clearTO();
      if (S.waitFaceTimeout) { clearTimeout(S.waitFaceTimeout); S.waitFaceTimeout = null; }
      clearInterval(S.countdownInterval);
    }
    this._teardown();
    if (fromSession && verified !== undefined) {
      if (verified && opts.onSuccess) opts.onSuccess(result);
      if (!verified && opts.onFailure) opts.onFailure(result);
    } else {
      if (opts.onCancel) opts.onCancel();
    }
  }

  _teardown() {
    const S = this._S;
    if (S && S.camera) { try { S.camera.stop(); } catch (e) { } S.camera = null; }
    if (this._dom) {
      if (this._dom.video && this._dom.video.srcObject) {
        this._dom.video.srcObject.getTracks().forEach((t: any) => t.stop());
        this._dom.video.srcObject = null;
      }
      if (this._dom.captureCanvas && this._dom.captureCanvas.parentNode) {
        this._dom.captureCanvas.parentNode.removeChild(this._dom.captureCanvas);
      }
      if (this._dom.backdrop && this._dom.backdrop.parentNode) {
        this._dom.backdrop.style.animation = 'ntl-fadeIn 0.2s ease reverse forwards';
        const bd = this._dom.backdrop;
        setTimeout(() => { if (bd.parentNode) bd.parentNode.removeChild(bd); }, 220);
      }
    }
    if (!this._opts.target) document.body.style.overflow = '';
    this._dom = null;
  }

  _el(tag: string, className?: string) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    return e;
  }

  _loadScript(url: string) {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src="' + url + '"]')) { (resolve as any)(); return; }
      const s = document.createElement('script');
      s.src = url; s.crossOrigin = 'anonymous';
      s.onload = resolve as any;
      s.onerror = () => reject(new Error('Failed to load: ' + url));
      document.head.appendChild(s);
    });
  }
}
