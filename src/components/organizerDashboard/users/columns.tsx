"use client";

import { ColumnDef } from "@tanstack/react-table";
import { OrgUser } from "@/types/organizerUser";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { Pencil, Trash2 } from "lucide-react";

interface ColumnActions {
  onEdit: (user: OrgUser) => void;
  onDelete: (user: OrgUser) => void;
  t: (key: string, fallback: string) => string;
  pageIndex: number;
  pageSize: number;
}

export function getColumns({ onEdit, onDelete, t, pageIndex, pageSize }: ColumnActions): ColumnDef<OrgUser>[] {
  return [
    {
      id: "sn",
      header: t('common.columns.sn', "S.N."),
      cell: (info) => info.row.index + 1 + pageIndex * pageSize,
      size: 50,
    },
    {
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      id: "name",
      header: t('common.columns.name', "Name"),
      meta: { sortKey: 'name' },
      cell: (info) => <span className="font-medium text-gray-900">{info.getValue<string>()}</span>,
    },
    {
      accessorKey: "email",
      header: t('common.columns.email', "Email"),
      meta: { sortKey: 'email' },
      cell: (info) => <span className="text-gray-600 font-medium">{info.getValue<string>()}</span>,
    },
    {
      accessorFn: (row) => row.roles?.[0]?.name || "-",
      id: "role_name",
      header: t('common.role', "Role"),
      cell: (info) => <span className="font-medium capitalize text-gray-900">{info.getValue<string>()}</span>,
    },
    {
      accessorKey: "phone",
      header: t('common.columns.contact', "Contact"),
      cell: (info) => {
        const phone = info.getValue<string>();
        const code = info.row.original.country_code;
        return phone ? <span className="font-medium text-gray-900">{code ? `${code} ` : ""}{phone}</span> : "-";
      },
    },
    {
      accessorKey: "account_status",
      id: "account_status",
      header: t('common.status', "Status"),
      cell: (info) => {
        const status = info.getValue<string>();
        const isActive = status === "active";
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${isActive ? "bg-emerald-400 text-white" : "bg-red-400 text-white"
              }`}
          >
            {status || t('common.unknown', "Unknown")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: (info) => (
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <PermissionGuard permission={PERMISSIONS.USER_UPDATE}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(info.row.original);
              }}
              className="text-gray-400 hover:text-blue-600 transition-colors"
              title={t('common.edit', "Edit")}
            >
              <Pencil className="w-5 h-5" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission={PERMISSIONS.USER_DELETE}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(info.row.original);
              }}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title={t('common.delete', "Remove")}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </PermissionGuard>
        </div>
      ),
    },
  ];
}
