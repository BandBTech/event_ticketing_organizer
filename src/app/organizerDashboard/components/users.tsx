"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilSimpleLineIcon,
  TrashIcon,
  XCircleIcon,
  UserCirclePlusIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/app/contexts/UserContext";
import { useAuthStore } from "@/store/authStore";
import { userService, OrgUser, CreateOrgUserRequest } from "@/services/userService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedState } from "@/hooks/useDebounce";
import EventPagination from "./EventPagination";
import { toast } from "@/lib/toast";

export default function Users() {
  const [searchInput, debouncedSearch, setSearchInput] = useDebouncedState("", 300);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  const { isCreateUserModalOpen, closeCreateUserModal } = useUser();
  const { user } = useAuthStore();
  const organizationId = user?.organization?.id;

  // Fetch users
  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["orgUsers", organizationId],
    queryFn: () => userService.getOrgUsers(organizationId!),
    enabled: !!organizationId,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: CreateOrgUserRequest) =>
      userService.createOrgUser(organizationId!, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgUsers", organizationId] });
      toast.success("Success", "User created successfully");
      closeCreateUserModal();
      resetForm();
    },
    onError: (error: Error) => {
      toast.error("Error", error.message || "Failed to create user");
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => userService.deleteOrgUser(organizationId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgUsers", organizationId] });
      toast.success("Success", "User deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Error", error.message || "Failed to delete user");
    },
  });

  // New user form state
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    role_name: "" as "staff" | "manager" | "",
  });

  const resetForm = () => {
    setNewUser({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone: "",
      role_name: "",
    });
  };

  // Filter users by search
  const filteredUsers = users.filter((u: OrgUser) =>
    `${u.first_name} ${u.last_name} ${u.email}`
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.role_name) {
      toast.error("Error", "Please select a role");
      return;
    }
    createUserMutation.mutate({
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      password: newUser.password,
      phone: newUser.phone || undefined,
      role_name: newUser.role_name,
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete ${userName}?`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleBadge = (roles?: { name: string }[]) => {
    const roleName = roles?.[0]?.name || "user";
    const colors: Record<string, string> = {
      manager: "bg-purple-100 text-purple-700",
      staff: "bg-blue-100 text-blue-700",
      organizer: "bg-green-100 text-green-700",
    };
    return colors[roleName.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-gray-100 text-gray-700",
      suspended: "bg-red-100 text-red-700",
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  if (!organizationId) {
    return (
      <div className="flex-1 px-6 py-4">
        <div className="text-center py-12 text-gray-500">
          <p>No organization found. Please complete your profile setup.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-full max-w-md rounded-lg" />
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full">
            <thead>
              <tr>
                {["S.N", "Name", "Email", "Role", "Phone", "Status", ""].map((h) => (
                  <th key={h} className="px-6 py-3">
                    <Skeleton className="h-4 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-t">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-6 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 px-6 py-4">
        <div className="text-center py-12 text-red-500">
          <p>Failed to load users: {(error as Error)?.message || "Unknown error"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center w-full max-w-md relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search users"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-3 py-2"
          />
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="text-gray-800 bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-semibold">S.N</th>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Email</th>
              <th className="px-6 py-3 font-semibold">Role</th>
              <th className="px-6 py-3 font-semibold">Phone</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <UserCirclePlusIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>No users found</p>
                  {searchInput && <p className="text-sm mt-1">Try adjusting your search</p>}
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user: OrgUser, index: number) => (
                <tr
                  key={user.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-3">{startIndex + index + 1}</td>
                  <td className="px-6 py-3 font-medium">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-3">{user.email}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getRoleBadge(user.roles)}`}>
                      {user.roles?.[0]?.name || "User"}
                    </span>
                  </td>
                  <td className="px-6 py-3">{user.phone || "-"}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(user.account_status)}`}>
                      {user.account_status || "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-blue-500 hover:text-blue-600 p-1"
                      title="Edit"
                    >
                      <PencilSimpleLineIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-red-500 hover:text-red-600 p-1"
                      title="Delete"
                      onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                      disabled={deleteUserMutation.isPending}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </motion.button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <EventPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="mt-8"
      />

      {/* Create User Modal */}
      <AnimatePresence>
        {isCreateUserModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <button
                onClick={closeCreateUserModal}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>

              <h2 className="text-xl text-gray-700 font-semibold mb-4">Add User</h2>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={newUser.first_name}
                      onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="Last Name"
                      value={newUser.last_name}
                      onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      value={newUser.role_name}
                      onChange={(e) => setNewUser({ ...newUser, role_name: e.target.value as "staff" | "manager" })}
                      className="w-full h-10 border border-gray-300 text-gray-700 rounded-md px-3 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus:outline-none"
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      placeholder="+1234567890"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      closeCreateUserModal();
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createUserMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createUserMutation.isPending ? (
                      <>
                        <SpinnerGapIcon className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create User"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
