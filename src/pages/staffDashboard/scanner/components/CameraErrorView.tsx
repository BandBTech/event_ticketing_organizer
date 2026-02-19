import { XCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface CameraErrorViewProps {
  errorMessage: string;
  retryLabel?: string;
}

export function CameraErrorView({
  errorMessage,
  retryLabel = "Retry",
}: CameraErrorViewProps) {
  return (
    <div className="flex items-center justify-center h-full bg-gray-900 text-white p-6 text-center">
      <div className="max-w-md space-y-4">
        <XCircleIcon size={48} className="mx-auto text-red-500" />
        <p className="text-lg font-medium">{errorMessage}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
        >
          {retryLabel}
        </Button>
      </div>
    </div>
  );
}
