import { Scanner } from "@yudiel/react-qr-scanner";
import { QrCode, CheckCircle } from "@phosphor-icons/react";
import type { ScanMode } from "@/hooks/useScannerState";

interface QRCameraViewProps {
  mode: ScanMode;
  onScan: (result: unknown[]) => void;
  onError: (error: unknown) => void;
  scanHintText: string;
  disabled?: boolean;
}

export function QRCameraView({
  mode,
  onScan,
  onError,
  scanHintText,
  disabled = false,
}: QRCameraViewProps) {
  return (
    <>
      {/* Camera feed */}
      <div className="w-full h-full relative">
        <Scanner
          scanDelay={1200}
          onScan={disabled ? () => { } : onScan}
          onError={onError}
          classNames={{ container: "scanner-wrapper" }}
          components={{ finder: false }}
          constraints={{ facingMode: "environment", width: { ideal: 1080 } }}
          styles={{
            container: {
              width: "100vw",
              height: "calc(100dvh - 64px)",
            },
            video: {
              width: "100vw",
              height: "calc(100dvh - 64px)",
              objectFit: "cover",
              filter: disabled ? "brightness(0.4)" : undefined,
              transition: "filter 0.4s ease",
            },
          }}
        />
      </div>

      {/* Finder overlay — rendered on top of the camera feed */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Scanning target rectangle */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
            mode === "bulk" ? "w-72 h-48 border-dashed" : "w-64 h-64"
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
