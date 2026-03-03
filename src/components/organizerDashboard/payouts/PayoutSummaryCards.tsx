import { motion } from "framer-motion";
import {
  CurrencyDollarIcon,
  BankIcon,
  ClockIcon,
  WalletIcon,
  CheckCircleIcon,
  ReceiptIcon,
  ChartLineUpIcon,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { PayoutSummary } from "@/types/payout";
import { useTranslation } from "@/hooks/useTranslation";

interface PayoutSummaryCardsProps {
  summary: PayoutSummary | undefined;
  isLoading: boolean;
}

export function PayoutSummaryCards({
  summary,
  isLoading,
}: PayoutSummaryCardsProps) {
  const { t } = useTranslation();
  const cards = [
    {
      icon: <CurrencyDollarIcon className="w-6 h-6 text-primary" />,
      label: t("payouts.summary.earnings", "Total Earnings"),
      value: isLoading
        ? null
        : `Rs. ${summary?.total_earnings.toLocaleString() ?? "0"}`,
    },
    {
      icon: <BankIcon className="w-6 h-6 text-primary" />,
      label: t("payouts.summary.received", "Total Received"),
      value: isLoading
        ? null
        : `Rs. ${summary?.total_received.toLocaleString() ?? "0"}`,
    },
    {
      icon: <WalletIcon className="w-6 h-6 text-primary" />,
      label: t("payouts.summary.available", "Available Amount"),
      value: isLoading
        ? null
        : `Rs. ${summary?.available_amount.toLocaleString() ?? "0"}`,
    },
    {
      icon: <ClockIcon className="w-6 h-6 text-primary" />,
      label: t("payouts.summary.pending", "Pending Amount"),
      value: isLoading
        ? null
        : `Rs. ${summary?.pending_amount.toLocaleString() ?? "0"}`,
    },
    {
      icon: <CheckCircleIcon className="w-6 h-6 text-primary" />,
      label: t("payouts.summary.approvedRequests", "Approved Requests"),
      value: isLoading
        ? null
        : `${summary?.approved_requests.toLocaleString() ?? "0"}`,
    },
    {
      icon: <ReceiptIcon className="w-6 h-6 text-primary" />,
      label: t("payouts.summary.paidRequests", "Paid Requests"),
      value: isLoading
        ? null
        : `${summary?.paid_requests.toLocaleString() ?? "0"}`,
    },
  ];

  return (
    <div className="@container">
      <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 @4xl:grid-cols-6 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.03 }}
            className={`@container/card p-2 rounded-2xl glass-card-lowest transition-all`}
          >
            <div className="flex gap-3 items-center @max-[180px]/card:flex-col @max-[180px]/card:items-start">
              <div className="p-3 rounded-xl bg-primary/10 ">{card.icon}</div>
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                {card.value === null ? (
                  <Skeleton className="h-7 w-24 mb-1" />
                ) : (
                  <h2 className="text-xl text-gray-700 font-bold">
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
