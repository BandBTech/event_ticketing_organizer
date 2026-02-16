"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TierTemplate } from "@/services/tierService";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface ColumnActions {
  onEdit: (template: TierTemplate, e?: React.MouseEvent) => void;
  onDelete: (template: TierTemplate, e?: React.MouseEvent) => void;
  t: (key: string, fallback: string) => string;
}

export function getColumns({ onEdit, onDelete, t }: ColumnActions): ColumnDef<TierTemplate>[] {
  return [
    {
      id: "sn",
      header: "S.N.",
      cell: (info) => (
        <span className="text-gray-500 font-medium">{info.row.index + 1}</span>
      ),
      size: 60,
    },
    {
      accessorKey: "template_name",
      header: ({ column }) => {
        const handleSort = () => {
          const currentSort = column.getIsSorted();
          if (!currentSort) {
            column.toggleSorting(false);
          } else if (currentSort === "asc") {
            column.toggleSorting(true);
          } else {
            column.clearSorting();
          }
        };
        return (
          <Button
            variant="ghost"
            onClick={handleSort}
            className="-ml-4 h-8 data-[state=open]:bg-accent"
          >
            {t("tierTemplates.columns.templateName", "Template Name")}
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
          </Button>
        );
      },
      cell: (info) => (
        <span
          className="font-medium text-gray-900 block truncate"
          style={{ maxWidth: "20vw" }}
          title={info.getValue<string>()}
        >
          {info.getValue<string>()}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "description",
      header: t("tierTemplates.columns.description", "Description"),
      cell: (info) => {
        const description = info.getValue<string>();
        return (
          <span
            className="text-gray-600 block truncate"
            style={{ maxWidth: "30vw" }}
            title={description || ""}
          >
            {description || "-"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: (info) => (
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ButtonGroup>
            <Button
              onClick={(e) => onEdit(info.row.original, e)}
              variant="outline"
              size="icon"
              title="Edit"
            >
              <PencilSimpleIcon weight="duotone" className="w-5 h-5" />
            </Button>
            <Button
              onClick={(e) => onDelete(info.row.original, e)}
              variant="outline"
              className="hover:bg-destructive/10"
              size="icon"
              title="Delete"
            >
              <TrashIcon weight="duotone" className="w-5 h-5 text-destructive" />
            </Button>
          </ButtonGroup>
        </div>
      ),
    },
  ];
}
