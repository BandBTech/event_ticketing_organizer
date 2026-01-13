"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useUser } from "@/app/contexts/UserContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizerUserService } from "@/services/organizerUserService";
import { OrgUser, OrgUsersListResponse } from "@/types/organizerUser";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import { PaginationState } from "@tanstack/react-table";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Local Components
import { DeleteConfirmationDialog } from "../components/DeleteConfirmationDialog";

// Icons
import { Plus, Search, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { FunnelIcon } from "@phosphor-icons/react";

// Permissions
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

// Auth States
import { RejectionNotice } from "@/components/organizer/RejectionNotice";
import { PendingNotice } from "@/components/organizer/PendingNotice";

// Local Components
import { getColumns } from "./columns";
import { DataTable } from "./data-table";
import UserFormDialog from "./UserFormDialog";

export default function UsersPage() {
  const { isLoading: isAuthLoading, isOrganizerRejected, isOrganizerPending } = useAuthStore();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { isUserModalOpen, closeUserModal, editingUser, openCreateUserModal, openEditUserModal } = useUser();

  // --- State ---
  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [deleteUser, setDeleteUser] = useState<OrgUser | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // --- Data Fetching (must be before early returns) ---
  const { data: usersResponse, isLoading, isError } = useQuery({
    queryKey: queryKeys.orgUsers.list({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: globalFilter,
      role: roleFilter !== "all" ? roleFilter : undefined
    }),
    queryFn: () => organizerUserService.getUsers(
      pagination.pageIndex + 1,
      pagination.pageSize,
      globalFilter || undefined,
      roleFilter !== "all" ? roleFilter : undefined
    ),
    enabled: !isOrganizerRejected() && !isOrganizerPending() && !isAuthLoading,
  });

  const users = usersResponse?.users || [];
  const totalPages = usersResponse ? Math.ceil(usersResponse.total / usersResponse.limit) : 0;

  // --- Mutations (must be before early returns) ---
  const deleteMutation = useMutation({
    mutationFn: (userId: string) => organizerUserService.deleteUser(userId),
    onSuccess: (_, deletedUserId) => {
      // Eager update: remove user from cache immediately
      const allQueries = queryClient.getQueriesData({ queryKey: queryKeys.orgUsers.all });

      allQueries.forEach(([queryKey, data]) => {
        if (data && typeof data === 'object' && 'users' in data) {
          const listData = data as OrgUsersListResponse;
          queryClient.setQueryData(queryKey, {
            ...listData,
            users: listData.users.filter((user: OrgUser) => user.id !== deletedUserId),
            total: Math.max(0, listData.total - 1),
          });
        }
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers.all });
      toast.success(t('users.delete.success', "User removed successfully"));
      setDeleteUser(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('users.delete.error', "Failed to remove user"));
    },
  });

  // --- Event Handlers (must be before early returns) ---
  const handleEdit = useCallback((user: OrgUser) => {
    openEditUserModal(user);
  }, [openEditUserModal]);

  const handleDeleteClick = useCallback((user: OrgUser) => {
    setDeleteUser(user);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteUser) {
      deleteMutation.mutate(deleteUser.id);
    }
  }, [deleteUser, deleteMutation]);

  const handleSearch = useCallback((value: string) => {
    setGlobalFilter(value);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleRoleChange = useCallback((value: string) => {
    setRoleFilter(value);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  // --- Table Columns (must be before early returns) ---
  const columns = useMemo(
    () => getColumns({
      onEdit: handleEdit,
      onDelete: handleDeleteClick,
      t,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize
    }),
    [handleEdit, handleDeleteClick, t, pagination.pageIndex, pagination.pageSize]
  );

  // --- Auth Protection (AFTER all hooks) ---
  if (isOrganizerRejected()) {
    return (
      <div className="p-6">
        <RejectionNotice />
      </div>
    );
  }

  if (isOrganizerPending()) {
    return (
      <div className="p-6">
        <PendingNotice />
      </div>
    );
  }

  if (isAuthLoading) {
    return <div className="flex-1 p-8 pt-6 flex justify-center items-center">{t("common.loading", "Loading...")}</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('users.pageTitle', "Team Management")}</h1>
          <p className="text-gray-500">{t('users.pageSubtitle', "Manage your organization team and user access.")}</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.USER_CREATE}>
          <Button onClick={openCreateUserModal} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            {t('users.create.button', "Add User")}
          </Button>
        </PermissionGuard>
      </div>

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

        <div className="relative">
          <Select value={roleFilter} onValueChange={handleRoleChange}>
            <SelectTrigger className="bg-white border-gray-200 w-full sm:w-40 pl-9">
              <FunnelIcon weight="duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <SelectValue placeholder={t('users.filterByRole', "Filter by role")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.allRoles', "All Roles")}</SelectItem>
              <SelectItem value="manager">{t('common.manager', "Manager")}</SelectItem>
              <SelectItem value="staff">{t('common.staff', "Staff")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Content */}
      {isError ? (
        <div className="text-center p-8 text-red-500">{t('common.error', "An error occurred while loading users.")}</div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
          pageCount={totalPages}
          emptyState={
            <EmptyState
              hasUsers={users.length > 0}
              onCreateClick={openCreateUserModal}
              t={t}
            />
          }
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, pageIndex: Math.max(0, prev.pageIndex - 1) }))}
            disabled={pagination.pageIndex === 0}
            className="h-8 rounded-full px-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('common.previous', "Previous")}
          </Button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={pagination.pageIndex === i ? "default" : "outline"}
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, pageIndex: i }))}
                className={`h-8 w-8 rounded-full p-0 ${pagination.pageIndex === i ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, pageIndex: Math.min(totalPages - 1, prev.pageIndex + 1) }))}
            disabled={pagination.pageIndex >= totalPages - 1}
            className="h-8 rounded-full px-4"
          >
            {t('common.next', "Next")}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* User Form Dialog */}
      <UserFormDialog
        key={editingUser?.id ?? 'create'}
        open={isUserModalOpen}
        onOpenChange={(open) => {
          if (!open) closeUserModal();
        }}
        userToEdit={editingUser}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        title={t('users.delete.title', "Remove User")}
        deleteWhat={deleteUser ? `${deleteUser.first_name} ${deleteUser.last_name}` : undefined}
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

// --- Sub-components ---

interface EmptyStateProps {
  hasUsers: boolean;
  onCreateClick: () => void;
  t: (key: string, fallback: string) => string;
}

function EmptyState({ hasUsers, onCreateClick, t }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-gray-500 py-12">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Users className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-lg font-medium mb-1">
        {!hasUsers ? t('users.empty.title', "No team members yet") : t('users.noResults.title', "No users found")}
      </p>
      <p className="text-sm text-muted-foreground max-w-sm">
        {!hasUsers
          ? t('users.empty.description', "Add your first team member by clicking the 'Add User' button above.")
          : t('users.noResults.description', "Try adjusting your search or filters.")}
      </p>
      {!hasUsers && (
        <PermissionGuard permission={PERMISSIONS.USER_CREATE}>
          <Button onClick={onCreateClick} className="mt-4">
            {t('users.create.button', "Add Team Member")}
          </Button>
        </PermissionGuard>
      )}
    </div>
  );
}