"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/app/contexts/UserContext";
import { useState, useMemo, useCallback } from "react";
import { organizerUserService } from "@/services/organizerUserService";
import { OrgUser } from "@/types/organizerUser";
import { toast } from "sonner";
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight, Users, /* ArrowUpDown, ArrowUp, ArrowDown */ } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  PaginationState,
  // SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UsersList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { openEditUserModal, openCreateUserModal } = useUser();

  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [deleteUser, setDeleteUser] = useState<OrgUser | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  // const [sorting, setSorting] = useState<SortingState>([]);

  const { data: usersResponse, isLoading, isError } = useQuery({
    queryKey: ["orgUsers", pagination.pageIndex + 1, pagination.pageSize, globalFilter, roleFilter],
    queryFn: () => organizerUserService.getUsers(
      pagination.pageIndex + 1,
      pagination.pageSize,
      globalFilter || undefined,
      roleFilter !== "all" ? roleFilter : undefined
    ),
  });

  // Extract data from paginated response
  const users = usersResponse?.users || [];
  const totalPages = usersResponse ? Math.ceil(usersResponse.total / usersResponse.limit) : 0;

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => organizerUserService.deleteUser(userId),
    onSuccess: () => {
      toast.success(t('users.delete.success', "User removed successfully"));
      queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
      setDeleteUser(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('users.delete.error', "Failed to remove user"));
    },
  });

  const handleEdit = useCallback((user: OrgUser) => {
    openEditUserModal(user);
  }, [openEditUserModal]);

  const handleDelete = () => {
    if (deleteUser) {
      deleteMutation.mutate(deleteUser.id);
    }
  };

  // --- Table Columns ---
  const columns = useMemo<ColumnDef<OrgUser>[]>(
    () => [
      {
        id: "sn",
        header: t('common.sn', "S.N."),
        cell: (info) => info.row.index + 1 + pagination.pageIndex * pagination.pageSize,
        size: 50,
      },
      {
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        id: "name",
        header: t('common.name', "Name"),
        /* header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4 h-8 data-[state=open]:bg-accent"
            >
              {t('common.name', "Name")}
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
              )}
            </Button>
          )
        }, */
        cell: (info) => <span className="font-medium text-gray-900">{info.getValue<string>()}</span>,
        // enableSorting: true,
      },
      {
        accessorKey: "email",
        header: t('common.email', "Email"),
        cell: (info) => <span className="text-gray-600 font-medium">{info.getValue<string>()}</span>,
        // enableSorting: false,
      },
      {
        accessorFn: (row) => row.roles?.[0]?.name || "-",
        id: "role_name", // Match backend field
        header: t('common.role', "Role"),
        /* header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4 h-8 data-[state=open]:bg-accent"
            >
              {t('common.role', "Role")}
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
              )}
            </Button>
          )
        }, */
        cell: (info) => <span className="font-medium capitalize text-gray-900">{info.getValue<string>()}</span>,
        // enableSorting: true,
      },
      {
        accessorKey: "phone",
        header: t('common.contact', "Contact"),
        cell: (info) => {
          const phone = info.getValue<string>();
          const code = info.row.original.country_code;
          return phone ? <span className="font-medium text-gray-900">{code ? `${code} ` : ""}{phone}</span> : "-";
        },
        // enableSorting: false,
      },
      {
        accessorKey: "account_status",
        id: "account_status",
        header: t('common.status', "Status"),
        /* header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4 h-8 data-[state=open]:bg-accent"
            >
              {t('common.status', "Status")}
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
              )}
            </Button>
          )
        }, */
        cell: (info) => {
          const status = info.getValue<string>();
          const isActive = status === "active";
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${isActive ? "bg-emerald-400 text-white" : "bg-red-400 text-white"
                }`}
            >
              {status || "unknown"}
            </span>
          );
        },
        // enableSorting: true,
      },
      {
        id: "actions",
        header: "",
        cell: (info) => (
          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <PermissionGuard permission={PERMISSIONS.USER_UPDATE}>
              <button
                onClick={() => handleEdit(info.row.original)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title={t('common.edit', "Edit")}
              >
                <Pencil className="w-5 h-5" />
              </button>
            </PermissionGuard>
            <PermissionGuard permission={PERMISSIONS.USER_DELETE}>
              <button
                onClick={() => setDeleteUser(info.row.original)}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title={t('common.delete', "Remove")}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </PermissionGuard>
          </div>
        ),
        meta: {
          align: "right",
        },
      },
    ],
    [t, pagination.pageIndex, pagination.pageSize, handleEdit]
  );

  // --- Filtering & Table Data ---
  // Filtering is now handled by the backend (search and role)

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
      // sorting
    },
    onPaginationChange: setPagination,
    // onSortingChange: setSorting,
    manualFiltering: true, // Filtering is handled by the backend
    manualPagination: true,
    // manualSorting: true,
    pageCount: totalPages,
  });

  const handleSearch = (value: string) => {
    setGlobalFilter(value);
    setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset to first page on search
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset to first page on filter
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={t('users.search', "Search users...")}
            value={globalFilter}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-white border-gray-200"
          />
        </div>

        <div className="w-full sm:w-48">
          <Select value={roleFilter} onValueChange={handleRoleChange}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Filter by role</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Content */}
      {isError ? (
        <div className="text-center p-8 text-red-500">{t('common.error', "An error occurred while loading users.")}</div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-gray-500 font-medium whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <UsersTableSkeleton columns={columns.length} />
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50/50 transition-colors group border-gray-100">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500 py-12">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Users className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium mb-1">
                        {users.length === 0 ? "No team members yet" : "No users found"}
                      </p>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        {users.length === 0
                          ? "Add your first team member by clicking the 'Add User' button above."
                          : "Try adjusting your search or filters."}
                      </p>
                      {users.length === 0 && (
                        <PermissionGuard permission={PERMISSIONS.USER_CREATE}>
                          <Button onClick={openCreateUserModal} className="mt-4">
                            Add Team Member
                          </Button>
                        </PermissionGuard>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 rounded-full px-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="flex gap-2">
            {Array.from({ length: table.getPageCount() }).map((_, i) => (
              <Button
                key={i}
                variant={pagination.pageIndex === i ? "default" : "outline"}
                size="sm"
                onClick={() => table.setPageIndex(i)}
                className={`h-8 w-8 rounded-full p-0 ${pagination.pageIndex === i ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 rounded-full px-4"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('users.delete.title', "Remove User")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('users.delete.confirm', "Are you sure you want to remove this user? This action cannot be undone.")
                .replace('{name}', deleteUser ? `${deleteUser.first_name} ${deleteUser.last_name}` : 'this user')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t('common.deleting', "Removing...") : t('common.delete', "Remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


function UsersTableSkeleton({ columns }: { columns: number }) {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <TableRow key={i} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((_, j) => (
            <TableCell key={j} className="py-4">
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
