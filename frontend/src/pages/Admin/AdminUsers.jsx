import { useEffect, useState } from "react";
import {
  Users,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-react";
import api from "../../services/api";
import "./AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // =====================================================
  // Load all users
  // =====================================================

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users/");

      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to load users:", error);

      alert(
        error.response?.data?.detail ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // =====================================================
  // Activate / Deactivate user
  // =====================================================

  const handleToggleStatus = async (user) => {
    const newStatus = !user.is_active;

    const action = newStatus
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUserId(user.id);

      const response = await api.patch(
        `/users/${user.id}/status`,
        {
          is_active: newStatus,
        }
      );

      // Update only this user in the table
      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === user.id
            ? response.data
            : item
        )
      );

      alert(
        newStatus
          ? "User activated successfully"
          : "User deactivated successfully"
      );
    } catch (error) {
      console.error(
        "Failed to update user status:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to update user status"
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <div className="admin-users-page">
        <div className="admin-users-loading">
          <RefreshCw
            size={22}
            className="admin-users-spinner"
          />
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  // =====================================================
  // Page
  // =====================================================

  return (
    <div className="admin-users-page">

      {/* Header */}
      <div className="admin-users-header">

        <div className="admin-users-heading">

          <div className="admin-users-heading-icon">
            <Users size={24} />
          </div>

          <div>
            <h1>Manage Users</h1>

            <p>
              View all users and manage their account
              status.
            </p>
          </div>

        </div>

        <button
          className="admin-users-refresh"
          onClick={loadUsers}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* Summary */}
      <div className="admin-users-summary">

        <div className="admin-user-summary-card">
          <Users size={20} />

          <div>
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>
        </div>

        <div className="admin-user-summary-card">
          <UserCheck size={20} />

          <div>
            <span>Active Users</span>
            <strong>
              {
                users.filter(
                  (user) => user.is_active
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="admin-user-summary-card">
          <UserX size={20} />

          <div>
            <span>Inactive Users</span>
            <strong>
              {
                users.filter(
                  (user) => !user.is_active
                ).length
              }
            </strong>
          </div>
        </div>

      </div>

      {/* Users Table */}
      <div className="admin-users-table-container">

        <table className="admin-users-table">

          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="admin-users-empty"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {

                const isUpdating =
                  updatingUserId === user.id;

                return (
                  <tr key={user.id}>

                    {/* User */}
                    <td>
                      <div className="admin-user-info">

                        <div className="admin-user-avatar">
                          {user.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div>
                          <div className="admin-user-name">
                            {user.name}
                          </div>

                          <div className="admin-user-id">
                            ID:{" "}
                            {String(user.id).slice(0, 8)}
                          </div>
                        </div>

                      </div>
                    </td>

                    {/* Email */}
                    <td>
                      <span className="admin-user-email">
                        {user.email}
                      </span>
                    </td>

                    {/* Role */}
                    <td>
                      <span
                        className={`admin-role-badge role-${String(
                          user.role
                        ).toLowerCase()}`}
                      >
                        {user.role === "support_agent"
                          ? "Support Agent"
                          : user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={
                          user.is_active
                            ? "admin-status active"
                            : "admin-status inactive"
                        }
                      >
                        <span className="admin-status-dot" />

                        {user.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    {/* Action */}
                    <td>

                      <button
                        className={
                          user.is_active
                            ? "admin-user-action deactivate"
                            : "admin-user-action activate"
                        }
                        disabled={isUpdating}
                        onClick={() =>
                          handleToggleStatus(user)
                        }
                      >
                        {isUpdating ? (
                          <>
                            <RefreshCw
                              size={15}
                              className="admin-users-spinner"
                            />
                            Updating...
                          </>
                        ) : user.is_active ? (
                          <>
                            <UserX size={16} />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck size={16} />
                            Activate
                          </>
                        )}
                      </button>

                    </td>

                  </tr>
                );
              })
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default AdminUsers;