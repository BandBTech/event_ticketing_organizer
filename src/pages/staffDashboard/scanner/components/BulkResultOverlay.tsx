import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { BulkResult } from "../useScannerState";

interface BulkResultItem {
  success: boolean;
  message?: string;
  ticket_number?: string;
  code?: string;
}

interface BulkResultOverlayProps {
  result: BulkResult | null;
  onDismiss: () => void;
  bulkOperationLabel: string;
  doneLabel: string;
}

export function BulkResultOverlay({
  result,
  onDismiss,
  bulkOperationLabel,
  doneLabel,
}: BulkResultOverlayProps) {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className={`p-6 text-center ${result.success ? "bg-green-50" : "bg-red-50"}`}
        >
          <div
            className={`mx-auto mb-3 rounded-full p-3 w-16 h-16 flex items-center justify-center ${
              result.success
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {result.success ? (
              <CheckCircleIcon size={32} weight="fill" />
            ) : (
              <XCircleIcon size={32} weight="fill" />
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {bulkOperationLabel} {result.success ? "Complete" : "Failed"}
          </h3>
          <p className="text-sm text-gray-600">{result.message}</p>
        </div>

        {/* Per-ticket results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
          {result.items?.map((item: BulkResultItem, i: number) => (
            <div
              key={i}
              className={`p-3 rounded-lg border flex items-start gap-3 bg-white ${
                item.success ? "border-green-200" : "border-red-200"
              }`}
            >
              {item.success ? (
                <CheckCircleIcon className="text-green-500 mt-0.5" />
              ) : (
                <XCircleIcon className="text-red-500 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.ticket_number || item.code || `Ticket #${i + 1}`}
                </p>
                <p className="text-xs text-gray-500">{item.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button className="w-full" size="lg" onClick={onDismiss}>
            {doneLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
