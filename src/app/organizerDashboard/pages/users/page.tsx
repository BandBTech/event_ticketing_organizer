"use client";

import { useAuthStore } from "@/store/authStore";
import UsersList from "../../components/users/UsersList";
import UserFormDialog from "../../components/users/UserFormDialog";
import { useTranslation } from "@/hooks/useTranslation";
import { useUser } from "@/app/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { RejectionNotice } from "@/components/organizer/RejectionNotice";
import { PendingNotice } from "@/components/organizer/PendingNotice";

export default function UsersPage() {
  const { isLoading: isAuthLoading, isOrganizerRejected, isOrganizerPending } = useAuthStore();
  const { t } = useTranslation();
  const { isUserModalOpen, closeUserModal, editingUser, openCreateUserModal } = useUser();

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
    return <div className="flex-1 p-8 pt-6 flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-1 p-8 pt-6">
      <div className="flex justify-between space-y-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{t('users.title', "Team Management")}</h2>
          <p className="text-muted-foreground">
            {t('users.subtitle', "Manage your organization team and user access.")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <PermissionGuard permission={PERMISSIONS.USER_CREATE}>
            <Button onClick={openCreateUserModal}>
              <Plus className="mr-2 h-4 w-4" />
              {t('users.create.button', "Add User")}
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <div className="pt-6">
        <UsersList />
      </div>

      {/* User Form Dialog - rendered at page level so it's always available */}
      <UserFormDialog
        key={editingUser?.id ?? 'create'}
        open={isUserModalOpen}
        onOpenChange={(open) => {
          if (!open) closeUserModal();
        }}
        userToEdit={editingUser}
      />
    </div>
  );
}