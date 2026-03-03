import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  isOpen: boolean;
  onClose: (open: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}

export function Modal({
  title,
  description,
  isOpen,
  onClose,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 p-0 max-h-[calc(100vh-4rem)] overflow-hidden",
          className,
        )}
      >
        {(title || description) && (
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
