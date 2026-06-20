/**
 * Lightweight scanner beep + haptic feedback using the Web Audio API.
 *
 * The @yudiel/react-qr-scanner library plays its built-in sound *inside*
 * the requestAnimationFrame detection loop, **before** our onScan callback
 * runs.  Because the `sound` prop is captured in a stale closure, toggling
 * it via React state can't prevent the beep in the same frame.
 *
 * To solve this we disable the library's sound entirely (`sound={false}`)
 * and call `playScanFeedback()` ourselves from within the mutation callbacks,
 * where we have synchronous ref-based knowledge of whether the scan
 * should be acknowledged.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/**
 * Plays a sharp, crisp two-tone "scanner chirp" (~100 ms total) and
 * triggers a haptic vibration pattern on supported mobile devices.
 *
 * Audio design:
 *  - Two layered sine oscillators (1480 Hz + 1860 Hz) create a bright,
 *    retail-scanner-style chirp that cuts through ambient noise.
 *  - Fast attack → sharp exponential decay for a punchy feel.
 *
 * Haptic design:
 *  - A short 35 ms pulse for a tactile "click" that pairs with the chirp.
 *
 * Falls back silently if the browser blocks autoplay or if the
 * AudioContext / Vibration API is unavailable.
 */
export function playScanFeedback(): void {
  // ── Haptic ──────────────────────────────────────────────────────────
  try {
    navigator.vibrate?.([35]);
  } catch {
    // Vibration API not available — ignore
  }

  // ── Audio ───────────────────────────────────────────────────────────
  try {
    const ctx = getAudioContext();

    // Resume suspended context (browsers require a prior user gesture)
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Master gain — controls overall volume
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.28, now);
    master.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    master.connect(ctx.destination);

    // Primary tone — bright high-pitched chirp
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1480, now);
    osc1.connect(master);
    osc1.start(now);
    osc1.stop(now + 0.1);

    // Harmonic layer — adds edge / sharpness
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
  } catch {
    // Silently ignore — audio is non-critical UX feedback
  }
}
