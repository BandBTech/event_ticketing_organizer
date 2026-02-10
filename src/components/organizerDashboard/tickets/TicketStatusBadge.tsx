import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface TicketStatusBadgeProps {
  status: string;
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const { t } = useTranslation();

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "valid":
        return {
          variant: "success",
          label: t("tickets.status.valid", "Valid"),
          icon: CheckCircle,
          className: "bg-green-50 text-green-700 border-green-600 hover:bg-green-100",
        };
      case "used":
      case "checked_in":
        return {
          variant: "secondary",
          label: t("tickets.status.used", "Used"),
          icon: Clock,
          className: "bg-blue-50 text-blue-700 border-blue-600 hover:bg-blue-100",
        };
      case "cancelled":
        return {
          variant: "destructive",
          label: t("tickets.status.cancelled", "Cancelled"),
          icon: XCircle,
          className: "bg-red-50 text-red-700 border-red-600 hover:bg-red-100",
        };
      case "refunded":
        return {
          variant: "destructive",
          label: t("tickets.status.refunded", "Refunded"),
          icon: AlertCircle,
          className: "bg-orange-50 text-orange-700 border-orange-600 hover:bg-orange-100",
        };
      default:
        return {
          variant: "outline",
          label: status,
          icon: AlertCircle,
          className: "bg-gray-50 text-gray-700 border-gray-600 hover:bg-gray-100",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`font-medium shadow-none gap-1.5 py-1 px-2.5 capitalize border ${config.className}`}
    >
      <Icon size={14} className="shrink-0" />
      {config.label}
    </Badge>
  );
}
