import { motion } from "framer-motion";
import {
  CurrencyDollarIcon,
  BankIcon,
  ClockIcon,
  WalletIcon,
  CheckCircleIcon,
  ReceiptIcon,
  HourglassIcon,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { PayoutSummary } from "@/types/payout";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { formatCurrency } from "@/lib/utils";

interface PayoutSummaryCardsProps {
  summary: PayoutSummary | undefined;
  isLoading: boolean;
}

export function PayoutSummaryCards({
  summary,
  isLoading,
}: PayoutSummaryCardsProps) {
  const { t } = useTranslation();
  const { locale } = useLanguageStore();
  const symbol = summary?.symbol;
  const totalEarnings = formatCurrency(summary?.total_earnings ?? 0, symbol);
  const totalReceived = formatCurrency(summary?.total_received ?? 0, symbol);
  const availableAmount = formatCurrency(summary?.available_amount ?? 0, symbol);
  const pendingAmount = formatCurrency(summary?.pending_amount ?? 0, symbol);
  const cards = [
    {
      icon: <CurrencyDollarIcon className="w-6 h-6 text-primary" />,
      label: t("payouts.summary.earnings", "Total Earnings"),
      value: isLoading ? null : totalEarnings,
    },
    {
      icon: <BankIcon className="w-6 h-6 text-primary" />,
      label: t("payouts.summary.received", "Total Received Amount"),
      value: isLoading ? null : totalReceived,
    },
    {
      icon: <WalletIcon className="w-6 h-6 text-primary" />,
      label: t("payouts.summary.available", "Total Requestable Amount"),
      value: isLoading ? null : availableAmount,
    },
    {
      icon: <ClockIcon className="w-6 h-6 text-primary" />,
      label: t("payouts.summary.pending", "Total Pending Amount"),
      value: isLoading ? null : pendingAmount,
    },
    // {
    //   icon: <HourglassIcon className="w-6 h-6 text-primary" />,
    //   label: t("payouts.summary.pendingRequests", "Pending Requests"),
    //   value: isLoading
    //     ? null
    //     : `${summary?.pending_requests.toLocaleString() ?? "0"}`,
    // },
    // {
    //   icon: <CheckCircleIcon className="w-6 h-6 text-primary" />,
    //   label: t("payouts.summary.approvedRequests", "Approved Requests"),
    //   value: isLoading
    //     ? null
    //     : `${summary?.approved_requests.toLocaleString() ?? "0"}`,
    // },
    // {
    //   icon: <ReceiptIcon className="w-6 h-6 text-primary" />,
    //   label: t("payouts.summary.paidRequests", "Completed Payouts"),
    //   value: isLoading
    //     ? null
    //     : `${summary?.paid_requests.toLocaleString() ?? "0"}`,
    // },
  ];

  return (
    <div className="@container">
      <div className="grid grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.03 }}
            className={`@container/card p-2.5 rounded-2xl glass-card-lowest transition-all`}
          >
            <div className="flex gap-3 items-center @max-[220px]/card:flex-col @max-[220px]/card:items-start">
              <div className="p-4 rounded-lg bg-primary/10 ">{card.icon}</div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                {card.value === null ? (
                  <Skeleton className="h-7 w-24 mb-1" />
                ) : (
                  <h2 className="text-xl text-gray-700 font-bold mt-0.5">
                    {card.value}
                  </h2>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
