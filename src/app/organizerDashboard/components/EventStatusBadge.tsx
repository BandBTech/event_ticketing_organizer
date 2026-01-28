"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";

interface EventStatusBadgeProps {
  status?: string;
  className?: string;
}

const eventStatusConfig: Record<string, { color: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  'pending': { color: 'bg-yellow-700 text-yellow-100 border-yellow-600', variant: 'secondary' },
  'approved': { color: 'bg-green-700 text-green-100 border-green-600', variant: 'secondary' },
  'rejected': { color: 'bg-red-700 text-red-100 border-red-600', variant: 'destructive' },
  'cancelled': { color: 'bg-red-700 text-white border-red-600', variant: 'destructive' },
  'draft': { color: 'bg-gray-700 text-gray-100 border-gray-600', variant: 'secondary' },
  'default': { color: 'bg-gray-700 text-gray-100 border-gray-600', variant: 'secondary' },
  'on_sale': { color: 'bg-green-700 text-green-100 border-green-600', variant: 'secondary' },
};

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  if (!status) return null;

  const config = eventStatusConfig[status] || eventStatusConfig['default'];

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "uppercase px-3 py-1 flex items-center gap-1.5 font-semibold rounded-full",
        config.color,
        className
      )}
    >
      {/* Optional: Add dot indicator if needed, currently just text matching previous implementation */}
      {/* <span className="w-2 h-2 rounded-full bg-current opacity-75" /> */}
      {t(`event.status.${status}`, status)}
    </Badge>
  );
}
