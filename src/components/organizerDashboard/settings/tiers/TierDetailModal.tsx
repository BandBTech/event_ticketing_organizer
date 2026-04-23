import { TierTemplate } from "@/services/tierService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { formatDateTimeLong } from "@/lib/utils";

interface TierDetailModalProps {
  template: TierTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (template: TierTemplate) => void;
  onDelete: (template: TierTemplate) => void;
}

export function TierDetailModal({
  template,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: TierDetailModalProps) {
  const { t } = useTranslation();
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t("tierTemplates.detailModal.title", "Tier Template Details")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2 overflow-y-auto">
          <div>
            <label className="text-sm font-medium text-gray-500">
              {t("tierTemplates.columns.templateName", "Tier Template Name")}
            </label>
            <p className="text-gray-900 font-medium max-w-[464px] wrap-anywhere">
              {template.template_name}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              {t("tierTemplates.columns.description", "Description")}
            </label>
            <p className="text-gray-900 max-w-[464px] wrap-anywhere">
              {template.description || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              {t("tierTemplates.columns.status", "Status")}
            </label>
            <div className="">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  template.is_active
                    ? "bg-emerald-400 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                {template.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              {t("common.createdAt", "Created At")}
            </label>
            <p className="text-gray-900 ">
              {formatDateTimeLong(template.created_at)}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              {t("common.updatedAt", "Last Updated")}
            </label>
            <p className="text-gray-900 ">
              {formatDateTimeLong(template.updated_at)}
            </p>
          </div>
        </div>
        <DialogFooter>
          <div className="flex w-full gap-3 pt-4 border-t justify-end">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onEdit(template);
              }}
            >
              {t("common.edit", "Edit")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onOpenChange(false);
                onDelete(template);
              }}
            >
              {t("common.delete", "Delete")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
