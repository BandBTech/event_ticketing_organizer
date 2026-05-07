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
          label: t("tickets.status.valid", "Active"),
          icon: CheckCircle,
          className:
            "bg-green-50 text-green-700 border-green-600 hover:bg-green-100",
        };
      case "used":
        return {
          variant: "secondary",
          label: t("tickets.status.used", "Used"),
          icon: Clock,
          className:
            "bg-blue-50 text-blue-700 border-blue-600 hover:bg-blue-100",
        };
      case "checked_in":
        return {
          variant: "secondary",
          label: t("tickets.status.checkedIn", "Checked In"),
          icon: Clock,
          className:
            "bg-blue-50 text-blue-700 border-blue-600 hover:bg-blue-100",
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
          className:
            "bg-orange-50 text-orange-700 border-orange-600 hover:bg-orange-100",
        };
      case "payment_pending":
        return {
          variant: "outline",
          label: t("tickets.status.paymentPending", "Payment Pending"),
          icon: AlertCircle,
          className:
            "bg-yellow-50 text-yellow-700 border-yellow-600 hover:bg-yellow-100",
        };
      case "pending_refund":
        return {
          variant: "outline",
          label: t("tickets.status.pendingRefund", "Pending Refund"),
          icon: AlertCircle,
          className:
            "bg-amber-50 text-amber-700 border-amber-600 hover:bg-amber-100",
        };
      case "expired":
        return {
          variant: "outline",
          label: t("tickets.status.expired", "Expired"),
          icon: Clock,
          className:
            "bg-gray-50 text-gray-500 border-gray-400 hover:bg-gray-100",
        };
      default:
        return {
          variant: "outline",
          label: status,
          icon: AlertCircle,
          className:
            "bg-gray-50 text-gray-700 border-gray-600 hover:bg-gray-100",
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
