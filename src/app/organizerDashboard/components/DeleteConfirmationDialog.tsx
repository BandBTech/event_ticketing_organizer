import { TierTemplate } from "@/services/tierService";
import { TrashIcon } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "@/hooks/useTranslation";

interface DeleteConfirmationDialogProps {
  title: string;
  deleteWhat?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeleteConfirmationDialog({
  title = "Delete",
  deleteWhat,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: DeleteConfirmationDialogProps) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="break-all">
            {t("common.deleteModal.description", "Are you sure you want to delete")}
            {deleteWhat ? <span className="font-semibold">&quot;{deleteWhat}&quot;</span> : <br />}
            {t("common.deleteModal.warning", "This action cannot be undone.")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t("common.cancel", "Cancel")}</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("common.deleteModal.loading", "Deleting...")}
              </>
            ) : (
              <>
                <TrashIcon className="h-4 w-4" />
                {t("common.deleteModal.confirm", "Delete")}
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
