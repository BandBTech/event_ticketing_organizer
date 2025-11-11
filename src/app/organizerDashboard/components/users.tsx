"use client";

import { useState } from "react";
import { users as initialUsers } from "@/app/data/events";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FileTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilSimpleLineIcon,
  TrashIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/app/contexts/UserContext";

interface NewUser {
  name: string;
  email: string;
  role: string;
  contact: string;
  status: string;
}
export default function Users() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(initialUsers);
  const { isCreateUserModalOpen, closeCreateUserModal } = useUser();

  // new user state
  const [newUser, setNewUser] = useState<NewUser>({
    name: "",
    email: "",
    role: "",
    contact: "",
    status: "Active",
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now().toString();

    setUsers([
      ...users,
      {
        id,
        ...newUser,
      },
    ]);

    // reset form + close modal
    setNewUser({
      name: "",
      email: "",
      role: "",
      contact: "",
      status: "Active",
    });
    closeCreateUserModal();
  };

  return (
    <div className="flex-1 px-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center w-full max-w-md relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg shadow-sm hover:bg-gray-50">
            <FunnelIcon className="w-5 h-5" />
            Filter
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
        <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
          <thead className="dark:bg-gray-800 text-gray-800 dark:text-gray-100">
            <tr>
              <th className="px-6 py-3 font-semibold">S.N</th>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Email</th>
              <th className="px-6 py-3 font-semibold">Role</th>
              <th className="px-6 py-3 font-semibold">Contact</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold text-center"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={`${user.id}-${index}`}
                className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td className="px-6 py-3">{index + 1}</td>
                <td className="px-6 py-3 font-medium">{user.name}</td>
                <td className="px-6 py-3">{user.email}</td>
                <td className="px-6 py-3 capitalize">{user.role}</td>
                <td className="px-6 py-3">{user.contact}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      user.status.toLowerCase() === "active"
                        ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100"
                        : "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-center space-x-3">
                  {[
                    {
                      icon: PencilSimpleLineIcon,
                      color: "text-blue-500",
                      hover: "hover:text-blue-600",
                    },
                    {
                      icon: FileTextIcon,
                      color: "text-blue-500",
                      hover: "hover:text-indigo-600",
                    },
                    {
                      icon: TrashIcon,
                      color: "text-red-500",
                      hover: "hover:text-red-600",
                    },
                  ].map(({ icon: Icon, color, hover }, type) => (
                    <motion.button
                      key={`${user.id}-${type}`}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className={`${color} ${hover}`}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <button className="flex items-center px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50">
          <ArrowLeftIcon className="w-4 h-4" />
          Previous
        </button>
        <button className="px-3 py-1 rounded-full border-gray-300 bg-gradient-to-r from-blue-600 to-indigo-500 text-white">
          1
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50">
          2
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50">
          3
        </button>
        <button className="flex items-center px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50">
          Next
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>

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
              className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-2xl shadow-lg relative"
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

              <h2 className="text-xl font-semibold mb-4">Add User</h2>
              <form onSubmit={handleAddUser} className="space-y-4">
           
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
                      required
                    />
                  </div>
                </div>

           
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select Role</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>

               
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact
                  </label>
                  <input
                    type="text"
                    placeholder="Contact"
                    value={newUser.contact}
                    onChange={(e) =>
                      setNewUser({ ...newUser, contact: e.target.value })
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
                  />
                </div>


                <div className="flex justify-end gap-3 pt-4">
                  
                  <button
                    type="button"
                    onClick={closeCreateUserModal}
                    className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className=" bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
