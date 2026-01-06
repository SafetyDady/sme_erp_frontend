import React, { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { Layout } from "../components/Layout";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Alert } from "../components/Alert";
import { SidePanel } from "../components/SidePanel";

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
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    setIsSubmitting(true);
    setFormErrors({});

    try {
      console.log("Creating user:", newUser);
      const result = await apiClient.createUser(newUser);
      console.log("User created successfully:", result);

      // Success - close panel and reset form
      setShowAddPanel(false);
      setNewUser({ email: "", password: "", role: "viewer" });
      setAlert({ type: "success", message: "User created successfully!" });

      // Reload users
      loadUsers().catch((loadError) => {
        console.error("Failed to reload users after creation:", loadError);
      });
    } catch (error: any) {
      console.error("Failed to create user:", error);

      // Always try to reload users to see if it was actually created
      loadUsers().catch((loadError) => {
        console.error("Failed to reload users:", loadError);
      });

      // Show error
      const errorMsg =
        error?.message || error?.detail || "Unknown error occurred";
      setAlert({
        type: "error",
        message: `Failed to create user: ${errorMsg}`,
      });
    } finally {
      setIsSubmitting(false);
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
    setShowEditPanel(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    setFormErrors({});

    try {
      console.log("Updating user:", editingUser.id, editFormData);
      const result = await apiClient.updateUser(editingUser.id, editFormData);
      console.log("User updated successfully:", result);

      // Success - close panel and reset form
      setShowEditPanel(false);
      setEditingUser(null);
      setEditFormData({ email: "", role: "" });
      setAlert({ type: "success", message: "User updated successfully!" });

      // Reload users after update
      loadUsers().catch((loadError) => {
        console.error("Failed to reload users after update:", loadError);
      });
    } catch (error: any) {
      console.error("Failed to update user:", error);
      const errorMsg =
        error?.message || error?.detail || "Unknown error occurred";
      setAlert({
        type: "error",
        message: `Failed to update user: ${errorMsg}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAddPanel = () => {
    setShowAddPanel(false);
    setNewUser({ email: "", password: "", role: "viewer" });
    setFormErrors({});
  };

  const closeEditPanel = () => {
    setShowEditPanel(false);
    setEditingUser(null);
    setEditFormData({ email: "", role: "" });
    setFormErrors({});
  };

  const roleOptions = [
    { value: "viewer", label: "Viewer" },
    { value: "staff", label: "Staff" },
    { value: "admin", label: "Admin" },
    { value: "super_admin", label: "Super Admin" },
  ];

  return (
    <Layout>
      <div>
        {/* Alert Notification */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <Button onClick={() => setShowAddPanel(true)}>Add New User</Button>
        </div>

        <div className="flex gap-6">
          {/* Table Section - Left Side */}
          <div className="flex-1">
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
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
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4 flex justify-end">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="font-medium"
                            >
                              Edit
                            </Button>
                            <Button
                              variant={user.is_active ? "danger" : "primary"}
                              size="sm"
                              onClick={() => handleDisableUser(user)}
                              style={
                                user.is_active
                                  ? {
                                      backgroundColor: "#dc2626",
                                      color: "#ffffff",
                                      fontWeight: "600",
                                    }
                                  : {}
                              }
                              className="font-medium"
                            >
                              {user.is_active ? "Disable" : "Enable"}
                            </Button>
                          </td>
                        </tr>
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

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900">Features</h3>
              <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                <li>• Create and edit user accounts</li>
                <li>• Assign and modify user roles</li>
                <li>• Enable and disable user accounts</li>
                <li>• View user creation dates</li>
              </ul>
            </div>
          </div>

          {/* Side Panel - Add User */}
          <SidePanel
            title="Add New User"
            isOpen={showAddPanel}
            onClose={closeAddPanel}
          >
            <form onSubmit={handleAddUser}>
              <Input
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                error={formErrors.email}
                required
              />

              <Input
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                error={formErrors.password}
                helperText="Minimum 8 characters"
                minLength={8}
                required
              />

              <Select
                label="Role"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                options={roleOptions}
                error={formErrors.role}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeAddPanel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Create User
                </Button>
              </div>
            </form>
          </SidePanel>

          {/* Side Panel - Edit User */}
          <SidePanel
            title="Edit User"
            isOpen={showEditPanel}
            onClose={closeEditPanel}
          >
            <form onSubmit={handleUpdateUser}>
              <Input
                label="Email"
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                error={formErrors.email}
                required
              />

              <Select
                label="Role"
                value={editFormData.role}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, role: e.target.value })
                }
                options={roleOptions}
                error={formErrors.role}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeEditPanel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Update User
                </Button>
              </div>
            </form>
          </SidePanel>
        </div>
      </div>
    </Layout>
  );
};
