import { WarningCircleIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export function RejectionNotice() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  return (
    <div className="relative overflow-hidden rounded-xl border border-red-300 bg-red-100 p-6 shadow-lg shadow-red-500/5">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-red-500/10 blur-2xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-red-500/10 blur-2xl" />

      <div className="relative flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 border border-red-100 shadow-sm">
          <WarningCircleIcon className="h-6 w-6 text-red-600" weight="fill" />
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-gray-900">
            {t('dashboard.accountRejected.title', 'Account Access Restricted')}
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
              {t(
                'dashboard.accountRejected.description',
                'Your organizer account has been rejected.'
              )}
            </p>
            {user?.organizationInfo?.remark && (
              <div className="text-sm bg-red-50 p-3 rounded-md border border-red-200">
                <span className="font-medium text-red-800">{t('common.remark', 'Remark')}: </span>
                <span className="text-red-700">{user.organizationInfo.remark}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0">
          <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300 transition-all shadow-sm">
            <EnvelopeSimpleIcon className="mr-2 h-4 w-4" />
            {t('common.contactSupport', 'Contact Support')}
          </Button>
        </div>
      </div>
    </div>
  );
}
