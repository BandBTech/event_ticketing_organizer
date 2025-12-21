import { HourglassHighIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";

export function PendingNotice() {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-xl border border-yellow-300 bg-yellow-100 p-6 shadow-lg shadow-yellow-500/5">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-yellow-500/10 blur-2xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-yellow-500/10 blur-2xl" />

      <div className="relative flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-50 border border-yellow-100 shadow-sm">
          <WarningCircleIcon className="h-6 w-6 text-yellow-600" weight="fill" />
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-gray-900">
            {t('dashboard.accountPending.title', 'Account Approval Pending')}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
            {t(
              'dashboard.accountPending.description',
              'Your organizer account application is currently under review. Access to some platform features is restricted until your account is approved.'
            )}
          </p>
        </div>

        <div className="flex shrink-0">
          <Button variant="outline" className="border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 hover:border-yellow-300 transition-all shadow-sm">
            <EnvelopeSimpleIcon className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}

// Need to import WarningCircleIcon locally or rename used icon
import { WarningCircleIcon } from "@phosphor-icons/react";
