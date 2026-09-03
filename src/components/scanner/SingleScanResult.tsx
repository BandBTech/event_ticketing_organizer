import { CheckCircleIcon, XCircleIcon, WarningCircleIcon, X } from "@phosphor-icons/react";
import type { ScanResult } from "@/hooks/useScannerState";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";

interface SingleScanResultProps {
  result: ScanResult | null;
  onClose?: () => void;
}

export function SingleScanResult({ result, onClose }: SingleScanResultProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  if (!result) return null;

  const isAlreadyCheckedIn = result.alreadyCheckedIn;
  const isSuccess = result.success && !isAlreadyCheckedIn;

  const glowBorder = isAlreadyCheckedIn
    ? "border-amber-400/50 shadow-amber-500/20"
    : isSuccess
      ? "border-green-400/50 shadow-green-500/20"
      : "border-red-500/50 shadow-red-500/20";

  const iconBg = isAlreadyCheckedIn
    ? "bg-amber-500/15 text-amber-400"
    : isSuccess
      ? "bg-green-500/15 text-green-400"
      : "bg-red-500/15 text-red-400";

  const heading = isAlreadyCheckedIn
    ? t("scanner.alreadyCheckedIn", "Already Checked In!")
    : isSuccess
      ? t("scanner.checkedIn", "Checked In!")
      : t("scanner.scanFailed", "Scan Failed");

  return (
    <div
      role="alert"
      aria-live="assertive"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-gray-900/90 border-2 ${glowBorder} text-white rounded-3xl p-8 max-w-sm w-full mx-6 text-center shadow-2xl space-y-4 backdrop-blur-xl animate-in zoom-in-95 duration-150`}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={20} weight="bold" />
          </button>
        )}

        <div className={`mx-auto rounded-full p-4 w-20 h-20 flex items-center justify-center ${iconBg}`}>
          {isAlreadyCheckedIn ? (
            <WarningCircleIcon size={48} weight="fill" />
          ) : isSuccess ? (
            <CheckCircleIcon size={48} weight="fill" />
          ) : (
            <XCircleIcon size={48} weight="fill" />
          )}
        </div>

        <div>
          <h3 className="text-2xl font-bold text-white mb-1.5">{heading}</h3>
          <p className="text-gray-300 font-medium text-sm leading-relaxed">{result.message}</p>
          {result.ticketNumber && (
            <p className="text-xs text-gray-400 mt-2.5 font-mono bg-white/5 py-1 px-2 rounded-md inline-block">
              {result.ticketNumber}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SingleScanResult;