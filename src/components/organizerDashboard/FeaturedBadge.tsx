import { Badge } from "@/components/ui/badge";
import { CrownIcon } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

export default function FeaturedBadge() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  return (
    <Badge className="bg-linear-to-r from-amber-500 to-orange-500 text-white text-sm text-shadow-md border-white/20 shadow-sm">
      <CrownIcon weight="fill" className="size-4!" />
      {t("event.badge.featured", "Featured")}
    </Badge>
  );
}