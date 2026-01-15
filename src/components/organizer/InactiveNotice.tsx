'use client';

import { ProhibitIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";

export function InactiveNotice() {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-300 bg-gray-100 p-6 shadow-lg shadow-gray-500/5">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gray-500/10 blur-2xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-gray-500/10 blur-2xl" />

      <div className="relative flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-50 border border-gray-100 shadow-sm">
          <ProhibitIcon className="h-6 w-6 text-gray-600" weight="fill" />
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-gray-900">
            {t('dashboard.accountInactive.title', 'Account Deactivated')}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
            {t(
              'dashboard.accountInactive.description',
              'Your organizer account has been deactivated by an administrator. Access to platform features is suspended.'
            )}
          </p>
        </div>

        <div className="flex shrink-0">
          <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 transition-all shadow-sm">
            <EnvelopeSimpleIcon className="mr-2 h-4 w-4" />
            {t('common.contactSupport', 'Contact Support')}
          </Button>
        </div>
      </div>
    </div>
  );
}
