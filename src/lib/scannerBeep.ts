/**
 * Professional two-stage audio + haptic feedback engine for staff ticket scanning.
 * Resolves mobile Safari / Chrome autoplay lockout via one-time passive user gesture unlock.
 */

let audioCtx: AudioContext | null = null;
let unlockInitialized = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

/**
 * Initializes a one-time passive gesture listener on window to unlock AudioContext
 * on iOS Safari and mobile Chrome before barcode callbacks execute.
 */
export function initAudioUnlock(): void {
  if (typeof window === "undefined" || unlockInitialized) return;
  unlockInitialized = true;

  const unlock = () => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      // Play brief silent buffer to satisfy WebKit autoplay policy
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch {
      // Ignore
    } finally {
      window.removeEventListener("touchstart", unlock, true);
      window.removeEventListener("touchend", unlock, true);
      window.removeEventListener("click", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    }
  };

  window.addEventListener("touchstart", unlock, true);
  window.addEventListener("touchend", unlock, true);
  window.addEventListener("click", unlock, true);
  window.addEventListener("keydown", unlock, true);
}

/**
 * Stage 1 Feedback: Immediate subtle camera decode click / shutter tick.
 * Informs staff "barcode captured, checking with server...".
 */
export function playCaptureFeedback(): void {
  try {
    navigator.vibrate?.([20]);
  } catch {}

  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(420, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  } catch {}
}

/**
 * Stage 2 Feedback: Successful check-in.
 * Bright ascending retail chirp (1480 Hz -> 1860 Hz) + 80ms haptic.
 */
export function playSuccessFeedback(): void {
  try {
    navigator.vibrate?.([80]);
  } catch {}

  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.28, now);
    master.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    master.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1480, now);
    osc1.connect(master);
    osc1.start(now);
    osc1.stop(now + 0.1);

    const harmGain = ctx.createGain();
    harmGain.gain.setValueAtTime(0.15, now);
    harmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    harmGain.connect(ctx.destination);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1860, now);
    osc2.connect(harmGain);
    osc2.start(now);
    osc2.stop(now + 0.08);
  } catch {}
}

/**
 * Stage 2 Feedback: Already Checked In Warning.
 * Double-pulse alert tone (880 Hz -> 880 Hz) + double haptic.
 */
export function playWarningFeedback(): void {
  try {
    navigator.vibrate?.([40, 60, 40]);
  } catch {}

  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const now = ctx.currentTime;

    // Pulse 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "square";
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.07);

    // Pulse 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "square";
    osc2.frequency.setValueAtTime(880, now + 0.1);
    gain2.gain.setValueAtTime(0.12, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.17);
  } catch {}
}

/**
 * Stage 2 Feedback: Invalid / Expired / Day Mismatch Error.
 * Low descending buzz (300 Hz -> 180 Hz) + 220ms haptic.
 */
export function playErrorFeedback(): void {
  try {
    navigator.vibrate?.([220]);
  } catch {}

  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.22);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch {}
}

/**
 * Backward compatibility alias for legacy callers
 */
export const playScanFeedback = playSuccessFeedback;