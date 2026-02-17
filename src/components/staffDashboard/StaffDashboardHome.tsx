"use client";

import { QrCodeIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

export default function StaffDashboardHome() {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 h-[calc(100vh-100px)]">
      <div className="bg-blue-50 p-6 rounded-full">
        <QrCodeIcon size={64} className="text-blue-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">{t("staffDashboard.readyToScan", "Ready to Scan")}</h1>
      <p className="text-gray-500 max-w-sm">
        {t("staffDashboard.readyToScanDescription", "Start scanning tickets to check in attendees for the event.")}
      </p>
      <Button
        size="lg"
        className="gap-2 text-base px-8 h-12"
        onClick={() => router.push("/staffDashboard/scanner")}
      >
        <QrCodeIcon size={20} />
        {t("staffDashboard.readyToScanButton", "Start Ticket Scan")}
      </Button>
    </div>
  );
}
