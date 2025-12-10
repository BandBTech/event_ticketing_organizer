"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { OrgUser } from "@/types/organizerUser";

interface UserContextType {
  isUserModalOpen: boolean;
  editingUser: OrgUser | null;
  openCreateUserModal: () => void;
  openEditUserModal: (user: OrgUser) => void;
  closeUserModal: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<OrgUser | null>(null);

  const openCreateUserModal = useCallback(() => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  }, []);

  const openEditUserModal = useCallback((user: OrgUser) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  }, []);

  const closeUserModal = useCallback(() => {
    setIsUserModalOpen(false);
    // Delay clearing editingUser to allow dialog close animation
    setTimeout(() => setEditingUser(null), 300);
  }, []);

  return (
    <UserContext.Provider
      value={{
        isUserModalOpen,
        editingUser,
        openCreateUserModal,
        openEditUserModal,
        closeUserModal,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}