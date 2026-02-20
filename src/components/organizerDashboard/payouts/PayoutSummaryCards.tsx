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
      icon: <CurrencyDollarIcon className="w-10 h-10 text-blue-500" />,
      label: t("payouts.summary.earnings", "Total Earnings"),
      value: isLoading
        ? null
        : `Rs. ${summary?.total_earnings.toLocaleString() ?? "0"}`,
      gradient: "from-blue-50 to-white",
    },
    {
      icon: <BankIcon className="w-10 h-10 text-green-500" />,
      label: t("payouts.summary.withdrawn", "Amount Withdrawn"),
      value: isLoading
        ? null
        : `Rs. ${summary?.total_withdrawn.toLocaleString() ?? "0"}`,
      gradient: "from-green-50 to-white",
    },
    {
      icon: <ClockIcon className="w-10 h-10 text-yellow-500" />,
      label: t("payouts.summary.pending", "Pending Requests"),
      value: isLoading
        ? null
        : `Rs. ${summary?.pending_amount.toLocaleString() ?? "0"}`,
      gradient: "from-yellow-50 to-white",
    },
    {
      icon: <WalletIcon className="w-10 h-10 text-purple-500" />,
      label: t("payouts.summary.balance", "Available Balance"),
      value: isLoading
        ? null
        : `Rs. ${summary?.available_balance.toLocaleString() ?? "0"}`,
      gradient: "from-purple-50 to-white",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          whileHover={{ scale: 1.03 }}
          className={`flex items-center gap-4 p-6 rounded-2xl shadow bg-linear-to-tr ${card.gradient} transition-all`}
        >
          {card.icon}
          <div>
            {card.value === null ? (
              <Skeleton className="h-7 w-24 mb-1" />
            ) : (
              <h2 className="text-xl text-gray-700 font-bold">{card.value}</h2>
            )}
            <p className="text-sm text-gray-600">{card.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
