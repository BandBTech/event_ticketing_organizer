/**
 * Lightweight scanner beep using the Web Audio API.
 *
 * The @yudiel/react-qr-scanner library plays its built-in sound *inside*
 * the requestAnimationFrame detection loop, **before** our onScan callback
 * runs.  Because the `sound` prop is captured in a stale closure, toggling
 * it via React state can't prevent the beep in the same frame.
 *
 * To solve this we disable the library's sound entirely (`sound={false}`)
 * and call `playBeep()` ourselves from within the mutation callbacks,
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
 * Plays a short 880 Hz beep (~120 ms) using the Web Audio API.
 * Falls back silently if the browser blocks autoplay or if the
 * AudioContext API is unavailable.
 */
export function playBeep(): void {
  try {
    const ctx = getAudioContext();

    // Resume suspended context (browsers require user gesture first)
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    // Quick fade-out to avoid click/pop
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.12);
  } catch {
    // Silently ignore — audio is non-critical UX feedback
  }
}
