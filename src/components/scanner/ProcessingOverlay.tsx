import { Loader2Icon } from "lucide-react";

interface ProcessingOverlayProps {
  visible: boolean;
  label: string;
}

export function ProcessingOverlay({ visible, label }: ProcessingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
      <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl">
        <Loader2Icon className="size-8 animate-spin" />
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </div>
    </div>
  );
}

export default ProcessingOverlay;
