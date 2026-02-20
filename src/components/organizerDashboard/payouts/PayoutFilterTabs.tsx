import { useTranslation } from "@/hooks/useTranslation";

export interface PayoutTab {
  value: string;
  label: string;
}

interface PayoutFilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function PayoutFilterTabs({
  activeTab,
  onTabChange,
}: PayoutFilterTabsProps) {
  const { t } = useTranslation();

  const tabs: PayoutTab[] = [
    { value: "all", label: t("payouts.tabs.all", "All Requests") },
    { value: "pending", label: t("payouts.tabs.pending", "Pending") },
    { value: "approved", label: t("payouts.tabs.approved", "Approved") },
    { value: "rejected", label: t("payouts.tabs.rejected", "Rejected") },
    { value: "paid", label: t("payouts.tabs.paid", "Paid") },
  ];

  return (
    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === tab.value
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
