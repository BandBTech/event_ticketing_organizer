"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  isCreateUserModalOpen: boolean;
  openCreateUserModal: () => void;
  closeCreateUserModal: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  const openCreateUserModal = () => setIsCreateUserModalOpen(true);
  const closeCreateUserModal = () => setIsCreateUserModalOpen(false);

  return (
    <UserContext.Provider
      value={{
        isCreateUserModalOpen,
        openCreateUserModal,
        closeCreateUserModal,
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