import { useCallback, useEffect, useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { QrCode, CheckCircle, Flashlight, CameraRotate } from "@phosphor-icons/react";
import type { ScanMode } from "@/hooks/useScannerState";

const IDLE_PAUSE_MS = 30_000;

interface QRCameraViewProps {
  mode: ScanMode;
  onScan: (result: unknown[]) => void;
  onError: (error: unknown) => void;
  scanHintText: string;
  disabled?: boolean;
  paused?: boolean;
  scanCompleted?: boolean;
  externalPaused?: boolean;
  resumeHintText?: string;
}

export function QRCameraView({
  mode,
  onScan,
  onError,
  scanHintText,
  disabled = false,
  paused = false,
  scanCompleted = false,
  externalPaused = false,
  resumeHintText = "Tap to resume scanning",
}: QRCameraViewProps) {
  const [hiddenPaused, setHiddenPaused] = useState(false);
  const [idlePaused, setIdlePaused] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onScanRef = useRef(onScan);
  const disabledRef = useRef(disabled);
  const consecutiveErrorsRef = useRef(0);

  // FORENSIC ITEM 3: Guard continuous focus to run strictly once per MediaStreamTrack
  const appliedFocusTrackIdRef = useRef<string | null>(null);
  const activeTrackRef = useRef<MediaStreamTrack | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
    disabledRef.current = disabled;
  }, [onScan, disabled]);

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

  // Handle visibility transitions safely without background permission rejections
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setHiddenPaused(true);
        clearIdleTimer();
      } else {
        setHiddenPaused(false);
        setCameraKey((k) => k + 1);
        consecutiveErrorsRef.current = 0;
        if (!externalPaused && !idlePaused) armIdleTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearIdleTimer();
    };
  }, [armIdleTimer, clearIdleTimer, externalPaused, idlePaused]);

  // Screen Wake Lock API to prevent phone screen sleep during line scanning
  useEffect(() => {
    let wakeLock: { release: () => Promise<void> } | null = null;
    const requestWakeLock = async () => {
      try {
        const nav = navigator as Navigator & {
          wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> };
        };
        if (nav.wakeLock && !document.hidden) {
          wakeLock = await nav.wakeLock.request("screen");
        }
      } catch {
        // Fallback silently if wakeLock is unsupported or rejected
      }
    };
    requestWakeLock();

    const handleVisibility = () => {
      if (!document.hidden && !wakeLock) requestWakeLock();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      wakeLock?.release().catch(() => {});
    };
  }, []);

  // Arm/disarm idle timer
  const isPaused = hiddenPaused || idlePaused || paused;
  useEffect(() => {
    if (isPaused || externalPaused) {
      clearIdleTimer();
    } else {
      armIdleTimer();
    }
  }, [isPaused, externalPaused, armIdleTimer, clearIdleTimer]);

  const handleScanWrapped = useCallback(
    (result: unknown[]) => {
      armIdleTimer();
      // Only process when not disabled and not externalPaused
      if (!disabledRef.current && !externalPaused) {
        onScanRef.current(result);
      }
    },
    [armIdleTimer, externalPaused]
  );

  const handleResumeTap = useCallback(() => {
    setIdlePaused(false);
    setCameraKey((k) => k + 1);
    armIdleTimer();
  }, [armIdleTimer]);

  // Scoped video track capability inspection & strictly single-shot autofocus
  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      const video = containerRef.current?.querySelector("video");
      const track = (video?.srcObject as MediaStream | null)?.getVideoTracks()[0];
      if (!track) return;

      activeTrackRef.current = track;

      // Track onended listener for native OS interruption detection
      track.onended = () => {
        if (!document.hidden && consecutiveErrorsRef.current < 2) {
          consecutiveErrorsRef.current += 1;
          setCameraKey((k) => k + 1);
        }
      };

      const caps = track.getCapabilities?.() as MediaTrackCapabilities & {
        focusMode?: string[];
        torch?: boolean;
      };

      // Detect torch capability safely
      setTorchSupported(!!caps?.torch);

      // Apply continuous autofocus ONCE per track ID to prevent voice-coil hunting
      if (caps?.focusMode?.includes("continuous") && appliedFocusTrackIdRef.current !== track.id) {
        appliedFocusTrackIdRef.current = track.id;
        track
          .applyConstraints({
            advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet],
          })
          .catch(() => {});
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [cameraKey, isPaused]);

  // Safe torch toggle handler
  const handleToggleTorch = useCallback(async () => {
    const track = activeTrackRef.current;
    if (!track || !torchSupported) return;
    const nextState = !torchOn;
    try {
      await track.applyConstraints({
        advanced: [{ torch: nextState } as MediaTrackConstraintSet & { torch?: boolean }],
      });
      setTorchOn(nextState);
    } catch {
      // Ignore unsupported browser errors
    }
  }, [torchOn, torchSupported]);

  // Flip camera between environment and user
  const handleToggleFacing = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    setCameraKey((k) => k + 1);
    appliedFocusTrackIdRef.current = null;
    setTorchOn(false);
  }, []);

  return (
    <>
      <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-black">
        {/* Mount Scanner only when not hard-paused (hidden / idle).
            Keep mounted during externalPaused (drawer) to prevent camera restart delays. */}
        {!isPaused && (
          <Scanner
            key={`${cameraKey}-${facingMode}`}
            formats={["qr_code"]}
            paused={externalPaused}
            scanDelay={300}
            allowMultiple={true}
            sound={false}
            onScan={handleScanWrapped}
            onError={onError}
            classNames={{ container: "scanner-wrapper" }}
            components={{ finder: false }}
            constraints={{
              facingMode,
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 24 },
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
              },
            }}
          />
        )}

        {/* Soft dimming layer when disabled or drawer open */}
        <div
          className="absolute inset-0 bg-black/60 pointer-events-none transition-opacity duration-300"
          style={{ opacity: disabled || idlePaused || externalPaused ? 0.6 : 0 }}
        />

        {/* Floating Hardware Controls (Torch & Flip) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          {torchSupported && (
            <button
              type="button"
              onClick={handleToggleTorch}
              className={`p-3 rounded-full backdrop-blur-md transition-all shadow-lg ${
                torchOn ? "bg-amber-400 text-black" : "bg-black/50 text-white hover:bg-black/70"
              }`}
              aria-label={torchOn ? "Turn torch off" : "Turn torch on"}
            >
              <Flashlight size={22} weight={torchOn ? "fill" : "regular"} />
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleFacing}
            className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md transition-all shadow-lg"
            aria-label="Switch camera"
          >
            <CameraRotate size={22} />
          </button>
        </div>
      </div>

      {/* Tap-to-resume overlay when idle */}
      {idlePaused && !hiddenPaused && !externalPaused && !disabled && (
        <button
          type="button"
          onClick={handleResumeTap}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 text-white text-base font-medium"
          aria-label={resumeHintText}
        >
          <span className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-md">
            {resumeHintText}
          </span>
        </button>
      )}

      {/* Finder overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
            mode === "bulk" ? "w-72 h-48 border-dashed" : "w-64 h-64"
          } border-4 ${scanCompleted ? "border-green-400/80" : "border-white/80"} rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {scanCompleted ? (
              <CheckCircle className="text-green-400" size={56} weight="fill" />
            ) : (
              mode === "bulk" && <QrCode className="text-white/20" size={48} />
            )}
          </div>
        </div>

        <div className="absolute bottom-32 left-0 right-0 text-center px-4">
          <p
            className={`text-sm font-medium drop-shadow-md ${
              scanCompleted ? "text-green-300 font-semibold" : "text-white/90"
            }`}
          >
            {scanHintText}
          </p>
        </div>
      </div>
    </>
  );
}

export default QRCameraView;