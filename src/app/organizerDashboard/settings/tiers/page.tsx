"use client";

import { useState, useMemo, useCallback } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { tierService, TierTemplate } from "@/services/tierService";
import { CreateTierTemplateDialog } from "./CreateTierTemplateDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { FileText } from "lucide-react";

// Local components
import { TierDetailModal } from "./TierDetailModal";
import { useTranslation } from "@/hooks/useTranslation";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";
import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";

export default function TierTemplatesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<TierTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<TierTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TierTemplate | null>(null);

  // --- Data Fetching ---
  const { data: templates = [], isLoading } = useQuery({
    queryKey: queryKeys.tierTemplates.all,
    queryFn: () => tierService.getTierTemplates(),
  });

  // --- Mutations ---
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tierService.deleteTierTemplate(id),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<TierTemplate[]>(queryKeys.tierTemplates.all, (old) =>
        old ? old.filter((template) => template.id !== variables) : []
      );
      toast.success("Tier template deleted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tierTemplates.all });
      setTemplateToDelete(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tierTemplates.all });
    },
  });

  // --- Event Handlers ---
  const handleOpenDialog = useCallback((template?: TierTemplate) => {
    setCurrentTemplate(template || null);
    setIsDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((template: TierTemplate, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTemplateToDelete(template);
  }, []);

  const handleEditClick = useCallback((template: TierTemplate, e?: React.MouseEvent) => {
    e?.stopPropagation();
    handleOpenDialog(template);
  }, [handleOpenDialog]);

  const handleConfirmDelete = useCallback(() => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete.id);
    }
  }, [templateToDelete, deleteMutation]);

  const handleRowClick = useCallback((template: TierTemplate) => {
    setSelectedTemplate(template);
  }, []);

  // --- Table Columns ---
  const columns = useMemo(
    () => getColumns({ onEdit: handleEditClick, onDelete: handleDeleteClick, t }),
    [handleEditClick, handleDeleteClick, t]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("tierTemplates.title", "Tier Templates")}</h1>
          <p className="text-gray-500">{t("tierTemplates.description", "Manage your reusable tier templates")}</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2 w-full sm:w-auto">
          <PlusIcon size={16} />
          {t("tierTemplates.createButton", "Create Tier Template")}
        </Button>
      </div>

      {/* Content */}
      {templates.length === 0 && !isLoading ? (
        <EmptyState onCreateClick={handleOpenDialog} />
      ) : (
          <DataTable
            columns={columns}
            data={templates}
            isLoading={isLoading}
            onRowClick={handleRowClick}
          />
      )}

      {/* Dialogs */}
      <CreateTierTemplateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.tierTemplates.all });
        }}
        initialData={currentTemplate}
      />

      <TierDetailModal
        template={selectedTemplate}
        open={!!selectedTemplate}
        onOpenChange={(open) => !open && setSelectedTemplate(null)}
        onEdit={handleOpenDialog}
        onDelete={setTemplateToDelete}
      />

      <DeleteConfirmationDialog
        title={t("tierTemplates.deleteModal.title", "Delete Tier Template")}
        deleteWhat={templateToDelete?.template_name}
        open={!!templateToDelete}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

// --- Sub-components ---

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <FileText className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-lg font-medium text-gray-900 mb-1">{t("tierTemplates.emptyState.title", "No tier templates yet")}</p>
      <p className="text-gray-500 mb-4 text-sm max-w-sm mx-auto">
        {t("tierTemplates.emptyState.description", "Create reusable tier templates to quickly set up ticket tiers for your events.")}
      </p>
      <Button variant="outline" onClick={onCreateClick}>
        {t("tierTemplates.emptyState.button", "Create your first template")}
      </Button>
    </div>
  );
}
