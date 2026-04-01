"use client";

import { TierTemplate } from "@/services/tierService";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";

interface TierTemplateCardProps {
  template: TierTemplate;
  onEdit: (template: TierTemplate, e?: React.MouseEvent) => void;
  onDelete: (template: TierTemplate, e?: React.MouseEvent) => void;
  onClick: (template: TierTemplate) => void;
}

export function TierTemplateCard({
  template,
  onEdit,
  onDelete,
  onClick,
}: TierTemplateCardProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  return (
    <div
      className="border border-gray-200 group p-4 hover:bg-gray-50 duration-300 hover:scale-105 transition-colors transition-transform cursor-pointer group bg-white glass-card-lowest rounded-2xl ease-out flex flex-col"
      onClick={() => onClick(template)}
    >
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div class="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 text-ellipsis line-clamp-2 text-lg">
              {template.template_name}
            </h3>
          </div>
          {template.description && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">
              {template.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-auto gap-2">
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${template.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
        >
          {template.is_active
            ? t("common.active", "Active")
            : t("common.inactive", "Inactive")}
        </span>
        <ButtonGroup className="opacity-0 group-hover:opacity-100 transition-opacity ease-in">
          <Button
            onClick={(e) => onEdit(template, e)}
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title="Edit"
          >
            <PencilSimpleIcon weight="duotone" className="w-4 h-4" />
          </Button>
          <Button
            onClick={(e) => onDelete(template, e)}
            variant="outline"
            size="icon"
            className="h-8 w-8 hover:bg-destructive/10"
            title="Delete"
          >
            <TrashIcon weight="duotone" className="w-4 h-4 text-destructive" />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
