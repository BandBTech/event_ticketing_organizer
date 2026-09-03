import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProcessingOverlayProps {
  visible: boolean;
  label: string;
  onCancel?: () => void;
}

export function ProcessingOverlay({ visible, label, onCancel }: ProcessingOverlayProps) {
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowCancel(false);
      return;
    }
    // Reveal cancel button after 4 seconds to prevent staff entrapment on network hang
    const timer = setTimeout(() => setShowCancel(true), 4000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30 animate-in fade-in duration-150"
    >
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl max-w-xs text-center">
        <Loader2Icon className="size-9 animate-spin text-blue-400" />
        <span className="text-sm font-semibold text-white">{label}</span>

        {showCancel && onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="mt-1 text-xs bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            Cancel Request
          </Button>
        )}
      </div>
    </div>
  );
}

export default ProcessingOverlay;