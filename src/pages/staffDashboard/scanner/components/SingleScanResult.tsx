import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import type { ScanResult } from "../useScannerState";

interface SingleScanResultProps {
  result: ScanResult | null;
}

export function SingleScanResult({ result }: SingleScanResultProps) {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200 pointer-events-none">
      {/* Full-screen color flash */}
      <div
        className={`absolute inset-0 ${result.success ? "bg-green-500" : "bg-red-500"}`}
      />

      {/* Result card */}
      <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full mx-6 text-center shadow-2xl space-y-4 pointer-events-auto">
        <div
          className={`mx-auto rounded-full p-4 w-20 h-20 flex items-center justify-center ${
            result.success
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {result.success ? (
            <CheckCircleIcon size={48} weight="fill" />
          ) : (
            <XCircleIcon size={48} weight="fill" />
          )}
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {result.success ? "Checked In!" : "Scan Failed"}
          </h3>
          <p className="text-gray-600 font-medium">{result.message}</p>
          {result.ticketNumber && (
            <p className="text-xs text-gray-400 mt-2 font-mono">
              {result.ticketNumber}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
