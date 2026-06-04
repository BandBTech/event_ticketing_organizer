import { DoorOpenIcon } from "@phosphor-icons/react";
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

interface ExitConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * Exit confirmation dialog shown when the user presses the browser back button
 * on a dashboard Home Screen. Lets them cancel or confirm leaving the app.
 */
export function ExitConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
}: ExitConfirmationDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 shrink-0">
              <DoorOpenIcon className="h-5 w-5 text-amber-500" weight="duotone" />
            </div>
            <AlertDialogTitle className="text-base">
              {t("common.exitModal.title", "Leave Dashboard?")}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {t(
              "common.exitModal.description",
              "Are you sure you want to leave the dashboard? You will be taken back to the previous page."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel asChild>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              {t("common.exitModal.cancel", "Stay")}
            </Button>
          </AlertDialogCancel>
          <Button
            variant="destructive"
            size="sm"
            className="w-full sm:w-auto"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            <DoorOpenIcon className="h-4 w-4 mr-1.5" weight="fill" />
            {t("common.exitModal.confirm", "Leave")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
