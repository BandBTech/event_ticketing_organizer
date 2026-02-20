import { Button } from "@/components/ui/button";
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
        <Button
          key={tab.value}
          size="sm"
          variant={activeTab === tab.value ? "default" : "outline"}
          onClick={() => onTabChange(tab.value)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
