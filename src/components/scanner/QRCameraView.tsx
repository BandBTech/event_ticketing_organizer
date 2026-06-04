import { useCallback, useEffect, useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { QrCode, CheckCircle } from "@phosphor-icons/react";
import type { ScanMode } from "@/hooks/useScannerState";

const IDLE_PAUSE_MS = 30_000;

interface QRCameraViewProps {
  mode: ScanMode;
  onScan: (result: unknown[]) => void;
  onError: (error: unknown) => void;
  scanHintText: string;
  disabled?: boolean;
  externalPaused?: boolean;
  resumeHintText?: string;
}

export function QRCameraView({
  mode,
  onScan,
  onError,
  scanHintText,
  disabled = false,
  externalPaused = false,
  resumeHintText = "Tap to resume scanning",
}: QRCameraViewProps) {
  // Mobile browsers pause/end the MediaStream while the page is hidden.
  // On return we bump cameraKey to force the Scanner to remount with a fresh
  // getUserMedia track — pausing alone isn't enough on iOS Safari.
  const [hiddenPaused, setHiddenPaused] = useState(false);
  const [idlePaused, setIdlePaused] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const armIdleTimer = useCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => setIdlePaused(true), IDLE_PAUSE_MS);
  }, [clearIdleTimer]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setHiddenPaused(true);
        clearIdleTimer();
      } else {
        setHiddenPaused(false);
        setCameraKey((k) => k + 1);
        if (!externalPaused && !idlePaused) armIdleTimer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearIdleTimer();
    };
  }, [armIdleTimer, clearIdleTimer, externalPaused, idlePaused]);

  // Arm/disarm idle timer based on the active paused state.
  const isPaused = hiddenPaused || externalPaused || idlePaused || disabled;
  useEffect(() => {
    if (isPaused) {
      clearIdleTimer();
    } else {
      armIdleTimer();
    }
  }, [isPaused, armIdleTimer, clearIdleTimer]);

  const handleScanWrapped = useCallback(
    (result: unknown[]) => {
      armIdleTimer();
      onScan(result);
    },
    [armIdleTimer, onScan],
  );

  const handleResumeTap = useCallback(() => {
    setIdlePaused(false);
    setCameraKey((k) => k + 1);
    armIdleTimer();
  }, [armIdleTimer]);

  // Android Chrome ignores focusMode in getUserMedia constraints — apply it
  // after the track is live instead. Retriggers on every camera remount (cameraKey).
  useEffect(() => {
    if (isPaused) return;

    const id = setTimeout(() => {
      const video = document.querySelector<HTMLVideoElement>("video");
      const track = (video?.srcObject as MediaStream | null)?.getVideoTracks()[0];
      if (!track) return;

      const caps = track.getCapabilities?.() as MediaTrackCapabilities & { focusMode?: string[] };
      if (caps?.focusMode?.includes("continuous")) {
        track.applyConstraints({
          advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet],
        }).catch(() => {});
      }
    }, 800);

    return () => clearTimeout(id);
  }, [cameraKey, isPaused]);

  return (
    <>
      {/* Camera feed */}
      <div className="w-full h-full relative">
        {!isPaused && (
          <Scanner
            key={cameraKey}
            paused={isPaused}
            scanDelay={200}
            onScan={disabled ? () => { } : handleScanWrapped}
            onError={onError}
            classNames={{ container: "scanner-wrapper" }}
            components={{ finder: false }}
            constraints={{
              facingMode: "environment",
              width: { ideal: 720, max: 1080 },
              height: { ideal: 1280, max: 1920 },
              frameRate: { ideal: 15, max: 20 },
            }}
            styles={{
              container: {
                width: "100vw",
                height: "calc(100dvh - 64px)",
              },
              video: {
                width: "100vw",
                height: "calc(100dvh - 64px)",
                objectFit: "cover",
                filter: disabled || idlePaused ? "brightness(0.4)" : undefined,
                transition: "filter 0.4s ease",
              },
            }}
          />
        )}
      </div>

      {/* Tap-to-resume overlay — only shown when idle-paused and nothing else is blocking */}
      {idlePaused && !hiddenPaused && !externalPaused && !disabled && (
        <button
          type="button"
          onClick={handleResumeTap}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 text-white text-base font-medium"
          aria-label={resumeHintText}
        >
          <span className="px-6 py-3 rounded-full bg-white/15 backdrop-blur-sm">
            {resumeHintText}
          </span>
        </button>
      )}

      {/* Finder overlay — rendered on top of the camera feed */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Scanning target rectangle */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${mode === "bulk" ? "w-72 h-48 border-dashed" : "w-64 h-64"
            } border-4 ${disabled ? "border-green-400/60" : "border-white/80"} rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {disabled ? (
              <CheckCircle className="text-green-400" size={56} weight="fill" />
            ) : (
              mode === "bulk" && <QrCode className="text-white/20" size={48} />
            )}
          </div>
        </div>


        {/* Hint text */}
        <div className="absolute bottom-32 left-0 right-0 text-center px-4">
          <p className={`text-sm font-medium drop-shadow-md ${disabled ? "text-green-300 font-semibold" : "text-white/80"}`}>
            {scanHintText}
          </p>
        </div>
      </div>
    </>
  );
}

export default QRCameraView;
