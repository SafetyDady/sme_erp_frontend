import React, { useEffect, useState, Fragment } from "react";
import { apiClient } from "../api/client";
import { Layout } from "../components/Layout";

interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [showQuickEdit, setShowQuickEdit] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: "viewer",
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    email: "",
    role: "",
  });

  const loadUsers = async () => {
    try {
      const data = await apiClient.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Creating user:", newUser);
      const result = await apiClient.createUser(newUser);
      console.log("User created successfully:", result);

      // Success - close modal and reset form
      setShowAddModal(false);
      setShowQuickForm(false); // Also hide quick form after successful creation
      setNewUser({ email: "", password: "", role: "viewer" });

      // Reload users but don't let reload error affect success
      loadUsers().catch((loadError) => {
        console.error("Failed to reload users after creation:", loadError);
      });
    } catch (error: any) {
      console.error("Failed to create user:", error);

      // Always try to reload users to see if it was actually created
      loadUsers().catch((loadError) => {
        console.error("Failed to reload users:", loadError);
      });

      // Show error with more details
      const errorMsg =
        error?.message || error?.detail || "Unknown error occurred";
      alert(`Failed to create user: ${errorMsg}`);
    }
  };

  const handleDisableUser = async (user: User) => {
    const action = user.is_active ? "disable" : "enable";
    if (!confirm(`Are you sure you want to ${action} user ${user.email}?`)) {
      return;
    }

    try {
      if (user.is_active) {
        await apiClient.disableUser(user.id);
        console.log("User disabled successfully:", user.email);
      } else {
        await apiClient.updateUser(user.id, { is_active: true });
        console.log("User enabled successfully:", user.email);
      }

      // Reload users after action
      loadUsers().catch((loadError) => {
        console.error("Failed to reload users:", loadError);
      });
    } catch (error: any) {
      console.error(`Failed to ${action} user:`, error);
      const errorMsg =
        error?.message || error?.detail || "Unknown error occurred";
      alert(`Failed to ${action} user: ${errorMsg}`);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      email: user.email,
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleQuickEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      email: user.email,
      role: user.role,
    });
    setShowQuickEdit(user.id);
  };

  const cancelQuickEdit = () => {
    setShowQuickEdit(null);
    setEditingUser(null);
    setEditFormData({ email: "", role: "" });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      console.log("Updating user:", editingUser.id, editFormData);
      const result = await apiClient.updateUser(editingUser.id, editFormData);
      console.log("User updated successfully:", result);

      // Success - close modal and reset form
      setShowEditModal(false);
      setShowQuickEdit(null); // Also hide quick edit
      setEditingUser(null);
      setEditFormData({ email: "", role: "" });

      // Reload users after update
      loadUsers().catch((loadError) => {
        console.error("Failed to reload users after update:", loadError);
      });
    } catch (error: any) {
      console.error("Failed to update user:", error);
      const errorMsg =
        error?.message || error?.detail || "Unknown error occurred";
      alert(`Failed to update user: ${errorMsg}`);
    }
  };

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowQuickForm(!showQuickForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              {showQuickForm ? "Hide" : "Quick Add"} User Form
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New User
            </button>
          </div>
        </div>

        {/* Quick Add User Form - Visible at the top */}
        {showQuickForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Quick Add New User
            </h2>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
            <p className="text-xs text-gray-600 mt-2">
              * Required fields. User will be created with Active status by default.
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <Fragment key={user.id}>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === "SUPER_ADMIN"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "ADMIN"
                                ? "bg-red-100 text-red-800"
                                : user.role === "STAFF"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleQuickEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                            title="Quick Edit"
                          >
                            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            title="Edit in Modal"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDisableUser(user)}
                            className={`${
                              user.is_active
                                ? "text-red-600 hover:text-red-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                          >
                            {user.is_active ? "Disable" : "Enable"}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Quick Edit Form Row */}
                      {showQuickEdit === user.id && (
                        <tr className="bg-yellow-50">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="border border-yellow-200 rounded-lg p-4">
                              <h3 className="text-sm font-semibold text-yellow-900 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Quick Edit User: {user.email}
                              </h3>
                              <form onSubmit={handleUpdateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        email: e.target.value,
                                      })
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Role
                                  </label>
                                  <select
                                    value={editFormData.role}
                                    onChange={(e) =>
                                      setEditFormData({ ...editFormData, role: e.target.value })
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                  >
                                    <option value="viewer">Viewer</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                  </select>
                                </div>
                                <div className="flex items-end gap-2">
                                  <button
                                    type="submit"
                                    className="flex-1 bg-yellow-600 text-white px-3 py-2 rounded-md hover:bg-yellow-700 transition-colors text-sm"
                                  >
                                    Update
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelQuickEdit}
                                    className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-400 transition-colors text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No users found.
              </div>
            )}
          </div>
        )}

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Available Features
          </h3>
          <ul className="mt-2 text-sm text-green-700 space-y-1">
            <li>✅ Create and edit user accounts with Quick Forms or Modal dialogs</li>
            <li>✅ Assign and modify user roles (Viewer, Staff, Admin, Super Admin)</li>
            <li>✅ Enable and disable user accounts</li>
            <li>✅ View user creation dates and activity status</li>
          </ul>
          <div className="mt-3 text-xs text-green-600">
            💡 <strong>Tip:</strong> Use "Quick Add User Form" for faster user creation, or click the pencil icon (
            <svg className="w-3 h-3 inline mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            ) for quick inline editing.
          </div>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4">Add New User</h2>
              <form onSubmit={handleAddUser}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4">Edit User</h2>
              <form onSubmit={handleUpdateUser}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, role: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                      setEditFormData({ email: "", role: "" });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
