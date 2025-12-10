"use client";

import { useAuthStore } from "@/store/authStore";
import UsersList from "../../components/users/UsersList";
import UserFormDialog from "../../components/users/UserFormDialog";
import { useTranslation } from "@/hooks/useTranslation";
import { useUser } from "@/app/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

export default function UsersPage() {
  const { isLoading: isAuthLoading, getOrganizationId } = useAuthStore();
  const { t } = useTranslation();
  const { openCreateUserModal, isUserModalOpen, closeUserModal, editingUser } = useUser();

  // Get organization ID using the helper that prioritizes organizer_id from organizer profile
  const orgId = getOrganizationId();

  if (isAuthLoading) {
    return <div className="flex-1 p-8 pt-6 flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-1 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('users.title', "Team Management")}</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={openCreateUserModal} disabled={!orgId}>
            <Plus className="mr-2 h-4 w-4" />
            {t('users.create.button', "Add User")}
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground">
        {t('users.subtitle', "Manage your organization team and user access.")}
      </p>

      {!orgId ? (
        <div className="pt-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Organization information is missing
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Please complete your profile to access team management features.
          </p>
        </div>
      ) : (
        <div className="pt-4">
          <UsersList orgId={orgId} />
        </div>
      )}

      {/* User Form Dialog - rendered at page level so it's always available */}
      {orgId && (
        <UserFormDialog
          key={editingUser?.id ?? 'create'}
          open={isUserModalOpen}
          onOpenChange={(open) => {
            if (!open) closeUserModal();
          }}
          orgId={orgId}
          userToEdit={editingUser}
        />
      )}
    </div>
  );
}