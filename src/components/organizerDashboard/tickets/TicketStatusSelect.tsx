import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, CaretDown } from "@phosphor-icons/react";

export function TicketStatusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className="w-[180px] bg-white border-gray-200 justify-between group/trigger"
          hideIcon={true}
        >
          <SelectValue placeholder={t("tickets.status.allStatuses", "All Statuses")} />
          <div className="flex items-center gap-1 ml-2 -mr-1 shrink-0">
            {value && value !== "all" ? (
              <div
                role="button"
                className="p-1 hover:bg-muted rounded-full transition-colors opacity-60 hover:opacity-100"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onChange("all");
                }}
              >
                <X className="h-3 w-3" weight="bold" />
              </div>
            ) : (
              <CaretDown className="h-4 w-4 opacity-50" />
            )}
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("tickets.status.allStatuses", "All Statuses")}</SelectItem>
          <SelectItem value="active">{t("tickets.status.valid", "Active")}</SelectItem>
          <SelectItem value="pending_refund">{t("tickets.status.pendingRefund", "Pending Refund")}</SelectItem>
          <SelectItem value="used">{t("tickets.status.used", "Used")}</SelectItem>
          <SelectItem value="cancelled">{t("tickets.status.cancelled", "Cancelled")}</SelectItem>
          <SelectItem value="refunded">{t("tickets.status.refunded", "Refunded")}</SelectItem>
          <SelectItem value="expired">{t("tickets.status.expired", "Expired")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
