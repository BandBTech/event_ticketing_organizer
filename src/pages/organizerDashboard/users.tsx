import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/hooks/useTranslation";
import {
  useUser,
  UserProvider,
} from "@/components/organizerDashboard/users/UserContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizerUserService } from "@/services/organizerUserService";
import { OrgUser, OrgUsersListResponse } from "@/types/organizerUser";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import { usePaginationSync } from "@/hooks/usePaginationSync";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import Head from "next/head";

// Icons
import { Plus, Search, Users } from "lucide-react";
import { FunnelIcon } from "@phosphor-icons/react";

// Permissions
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

// Auth States
import { RejectionNotice } from "@/components/organizer/RejectionNotice";
import { PendingNotice } from "@/components/organizer/PendingNotice";
import { InactiveNotice } from "@/components/organizer/InactiveNotice";

// Local Components
import { getColumns } from "@/components/organizerDashboard/users/columns";
import { ReusableTable } from "@/components/organizerDashboard/ReusableTable";
import UserFormDialog from "@/components/organizerDashboard/users/UserFormDialog";
import { DeleteConfirmationDialog } from "@/components/organizerDashboard/DeleteConfirmationDialog";

function UsersPageContent() {
  const {
    isLoading: isAuthLoading,
    isOrganizerRejected,
    isOrganizerPending,
    isOrganizerInactive,
  } = useAuthStore();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    isUserModalOpen,
    closeUserModal,
    editingUser,
    openCreateUserModal,
    openEditUserModal,
  } = useUser();

  const [globalFilter, setGlobalFilter] = useState("");
  const debouncedSearch = useDebounce(globalFilter, 500);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteUser, setDeleteUser] = useState<OrgUser | null>(null);

  const { currentPage, limit, handlePageChange, handleLimitChange } =
    usePaginationSync();

  // Sorting state — Users API uses a single `sort` param with `-` prefix for desc
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  // Build the combined sort param for the Users API: e.g. "name" or "-name"
  const sortParam = useMemo(() => {
    if (!sortBy) return undefined;
    return sortOrder === "desc" ? `-${sortBy}` : sortBy;
  }, [sortBy, sortOrder]);

  const { data: usersResponse, isLoading: isUsersLoading } = useQuery({
    queryKey: queryKeys.orgUsers.list({
      page: currentPage,
      limit,
      search: debouncedSearch,
      role: roleFilter !== "all" ? roleFilter : undefined,
      sort: sortParam,
      status: statusFilter !== "all" ? statusFilter : undefined,
    }),
    queryFn: () =>
      organizerUserService.getUsers(
        currentPage,
        limit,
        debouncedSearch || undefined,
        roleFilter !== "all" ? roleFilter : undefined,
        sortParam,
        statusFilter !== "all" ? statusFilter : undefined,
      ),
  });

  const users = usersResponse?.users || [];
  const totalPages = usersResponse?.pagination?.total_pages ?? 0;

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => organizerUserService.deleteUser(userId),
    onSuccess: (_, deletedUserId) => {
      queryClient.setQueryData(
        queryKeys.orgUsers.all,
        (old: OrgUsersListResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            users: old.users
              ? old.users.filter((user: OrgUser) => user.id !== deletedUserId)
              : [],
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers.all });
      toast.success(t("users.delete.success", "User removed successfully"));
      setDeleteUser(null);
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("users.delete.error", "Failed to remove user"),
      );
    },
  });

  const handleEdit = useCallback(
    (user: OrgUser) => {
      openEditUserModal(user);
    },
    [openEditUserModal],
  );

  const handleDeleteClick = useCallback((user: OrgUser) => {
    setDeleteUser(user);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteUser) {
      deleteMutation.mutate(deleteUser.id);
    }
  }, [deleteUser, deleteMutation]);

  const handleSearch = useCallback(
    (value: string) => {
      setGlobalFilter(value);
      handlePageChange(1);
    },
    [handlePageChange],
  );

  const handleRoleChange = useCallback(
    (value: string) => {
      setRoleFilter(value);
      handlePageChange(1);
    },
    [handlePageChange],
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatusFilter(value);
      handlePageChange(1);
    },
    [handlePageChange],
  );

  const handleSortChange = useCallback(
    (
      newSortBy: string | undefined,
      newSortOrder: "asc" | "desc" | undefined,
    ) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      handlePageChange(1);
    },
    [handlePageChange],
  );

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteClick,
        t,
        pageIndex: currentPage - 1,
        pageSize: limit,
      }),
    [handleEdit, handleDeleteClick, t, currentPage, limit],
  );

  if (isOrganizerRejected())
    return (
      <div className="p-6">
        <RejectionNotice />
      </div>
    );
  if (isOrganizerPending())
    return (
      <div className="p-6">
        <PendingNotice />
      </div>
    );
  if (isOrganizerInactive())
    return (
      <div className="p-6">
        <InactiveNotice />
      </div>
    );
  if (isAuthLoading)
    return (
      <div className="flex-1 p-8 pt-6 flex justify-center items-center">
        {t("common.loading", "Loading...")}
      </div>
    );

  return (
    <div className="flex-1 min-w-0 space-y-6 max-w-7xl mx-auto p-4 md:p-6 h-full flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("users.pageTitle", "Team Management")}
          </h1>
          <p className="text-gray-500">
            {t(
              "users.pageSubtitle",
              "Manage your organization team and user access.",
            )}
          </p>
        </div>
        <PermissionGuard permission={PERMISSIONS.USER_CREATE}>
          <Button
            onClick={openCreateUserModal}
            className="gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            {t("users.create.button", "Add User")}
          </Button>
        </PermissionGuard>
      </div>

      <div className="glass-card-lowest rounded-2xl flex-1 min-h-0 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 min-w-0">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t("users.search", "Search users...")}
              value={globalFilter}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 shadow-sm"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Select value={roleFilter} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-full sm:w-40 pl-9">
                  <FunnelIcon
                    weight="duotone"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4"
                  />
                  <SelectValue
                    placeholder={t("users.filterByRole", "Filter by role")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("common.allRoles", "All Roles")}
                  </SelectItem>
                  <SelectItem value="manager">
                    {t("common.manager", "Manager")}
                  </SelectItem>
                  <SelectItem value="staff">
                    {t("common.staff", "Staff")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full sm:w-40 pl-9">
                  <FunnelIcon
                    weight="duotone"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4"
                  />
                  <SelectValue
                    placeholder={t("users.filterByStatus", "Filter by status")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("common.allStatuses", "All Statuses")}
                  </SelectItem>
                  <SelectItem value="active">
                    {t("common.active", "Active")}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t("common.inactive", "Inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <ReusableTable
          wrapperClassName="flex-1 min-h-0 overflow-auto"
          columns={columns}
          data={users}
          isLoading={isUsersLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          total={usersResponse?.pagination?.total}
          limit={limit}
          onLimitChange={handleLimitChange}
          hasNextPage={usersResponse?.pagination?.has_next ?? false}
          hasPreviousPage={usersResponse?.pagination?.has_prev ?? false}
          onPageChange={handlePageChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          emptyState={
            <EmptyState
              hasUsers={users.length > 0}
              onCreateClick={openCreateUserModal}
              t={t}
            />
          }
        />
      </div>

      <UserFormDialog
        key={editingUser?.id ?? "create"}
        open={isUserModalOpen}
        onOpenChange={(open) => {
          if (!open) closeUserModal();
        }}
        userToEdit={editingUser}
      />

      <DeleteConfirmationDialog
        title={t("users.delete.title", "Remove User")}
        deleteWhat={
          deleteUser
            ? `${deleteUser.first_name} ${deleteUser.last_name}`
            : undefined
        }
        open={!!deleteUser}
        onOpenChange={(open: boolean) => !open && setDeleteUser(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

function EmptyState({
  hasUsers,
  onCreateClick,
  t,
}: {
  hasUsers: boolean;
  onCreateClick: () => void;
  t: (key: string, fallback?: string) => string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-gray-500 py-12">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Users className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-lg font-medium mb-1">
        {!hasUsers
          ? t("users.empty.title", "No team members yet")
          : t("users.noResults.title", "No users found")}
      </p>
      {!hasUsers && (
        <PermissionGuard permission={PERMISSIONS.USER_CREATE}>
          <Button
            onClick={onCreateClick}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            {t("users.create.button", "Add Team Member")}
          </Button>
        </PermissionGuard>
      )}
    </div>
  );
}

export default function UsersPage() {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{t("users.pageTitle", "Team Management")}</title>
      </Head>
      <DashboardLayout>
        <ProtectedRoute>
          <UserProvider>
            <UsersPageContent />
          </UserProvider>
        </ProtectedRoute>
      </DashboardLayout>
    </>
  );
}
