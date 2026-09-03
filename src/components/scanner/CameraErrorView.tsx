import { XCircleIcon, ShieldWarning, ArrowClockwise, LockKey } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface CameraErrorViewProps {
  errorMessage: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function CameraErrorView({
  errorMessage,
  retryLabel = "Try Again",
  onRetry,
}: CameraErrorViewProps) {
  const isInsecure =
    typeof window !== "undefined" &&
    !window.isSecureContext &&
    window.location.hostname !== "localhost";

  return (
    <div className="flex items-center justify-center h-full bg-gray-950 text-white p-6 text-center">
      <div className="max-w-md w-full space-y-5">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
          {isInsecure ? <LockKey size={40} /> : <XCircleIcon size={40} weight="fill" />}
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-2">Camera Unavailable</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{errorMessage}</p>
        </div>

        {isInsecure && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-left text-xs text-amber-200 flex items-start gap-2.5">
            <ShieldWarning size={20} className="shrink-0 text-amber-400 mt-0.5" />
            <span>
              Browsers restrict camera access to HTTPS origins. Please access this portal over HTTPS
              or localhost.
            </span>
          </div>
        )}

        <div className="bg-white/5 rounded-xl p-3 text-left text-xs text-gray-400 space-y-1.5">
          <p className="font-semibold text-gray-200">Troubleshooting:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Ensure camera permission is allowed in your browser settings (tap the lock icon in the address bar).</li>
            <li>Close other apps or tabs that may be holding a hardware camera lock.</li>
            <li>Ensure the device has a functional rear or front camera.</li>
          </ul>
        </div>

        {onRetry && (
          <Button
            onClick={onRetry}
            className="w-full bg-white/15 hover:bg-white/25 text-white border border-white/20 h-11 rounded-xl font-semibold gap-2"
          >
            <ArrowClockwise size={18} />
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export default CameraErrorView;