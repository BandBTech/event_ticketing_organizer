import { motion } from "framer-motion";
import {
  CurrencyDollarIcon,
  BankIcon,
  ClockIcon,
  WalletIcon,
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
      icon: (
        <CurrencyDollarIcon weight="duotone" className="w-5 h-5 text-primary" />
      ),
      label: t("payouts.summary.earnings", "Total Earnings"),
      value: isLoading
        ? null
        : `Rs. ${summary?.total_earnings.toLocaleString() ?? "0"}`,
    },
    {
      icon: <BankIcon weight="duotone" className="w-5 h-5 text-primary" />,
      label: t("payouts.summary.received", "Total Received"),
      value: isLoading
        ? null
        : `Rs. ${summary?.total_received.toLocaleString() ?? "0"}`,
    },
    {
      icon: <WalletIcon weight="duotone" className="w-5 h-5 text-primary" />,
      label: t("payouts.summary.paidRequests", "Paid Requests"),
      value: isLoading
        ? null
        : `${summary?.paid_requests.toLocaleString() ?? "0"}`,
    },
    {
      icon: <ClockIcon weight="duotone" className="w-5 h-5 text-primary" />,
      label: t("payouts.summary.pendingAmount", "Pending Amount"),
      value: isLoading
        ? null
        : `Rs. ${summary?.pending_amount.toLocaleString() ?? "0"}`,
    },
    {
      icon: <WalletIcon weight="duotone" className="w-5 h-5 text-primary" />,
      label: t("payouts.summary.available", "Available Amount"),
      value: isLoading
        ? null
        : `Rs. ${summary?.available_amount.toLocaleString() ?? "0"}`,
    },
    {
      icon: <ClockIcon weight="duotone" className="w-5 h-5 text-primary" />,
      label: t("payouts.summary.pendingRequests", "Pending Requests"),
      value: isLoading
        ? null
        : `${summary?.pending_requests.toLocaleString() ?? "0"}`,
    },
  ];

  return (
    <div className="@container/main w-full payout-summary">
      <div className="grid grid-cols-1 @sm/main:grid-cols-2 @xl/main:grid-cols-3 @4xl/main:grid-cols-6 glass-card-lowest rounded-2xl">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex @4xl/main:flex-col gap-2 transition-all items-start not-last:@4xl/main:border-e  @4xl/main:border-gray-200 p-4"
          >
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              {card.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground truncate">
                {card.label}
              </p>
              {card.value === null ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <h2 className="text-lg text-card-foreground font-bold truncate leading-snug">
                  {card.value}
                </h2>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
