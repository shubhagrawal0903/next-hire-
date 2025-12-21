"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Trash2, Shield, User, Briefcase, Calendar, Edit2, Check, X } from "lucide-react";

interface AdminUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | undefined;
  role: string | undefined;
  createdAt: number;
}

export default function AdminUserList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/users");
        if (response.status === 200) {
          const data = await response.json();
          setUsers(data || []);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleUpdate = async (targetUserId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${targetUserId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUserId ? { ...u, role: selectedRole } : u))
        );
        setEditingUserId(null);
      } else {
        alert("Failed to update role");
      }
    } catch (error) {
      console.error(error);
      alert("Network error");
    }
  };

  const handleDeleteUser = async (targetUserId: string, targetUserEmail: string | undefined) => {
    if (!window.confirm(`Delete user ${targetUserEmail}? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/admin/users/${targetUserId}`, { method: "DELETE" });
      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== targetUserId));
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error(error);
      alert("Network error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-text-secondary">
        No users found.
      </div>
    );
  }

  const getRoleBadge = (role: string | undefined) => {
    switch (role) {
      case 'ADMIN':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"><Shield className="w-3 h-3" /> ADMIN</span>;
      case 'COMPANY_ERP':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"><Briefcase className="w-3 h-3" /> CLIENT</span>;
      case 'JOB_SEEKER':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"><User className="w-3 h-3" /> USER</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface text-text-muted border border-border">{role || 'GUEST'}</span>;
    }
  }

  return (
    <>
      {/* Mobile View - Cards */}
      <div className="block lg:hidden space-y-4 p-4">
        {users.map((user) => (
          <div key={user.id} className="bg-surface rounded-lg border border-border p-4 space-y-3 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                  {(user.firstName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-text-primary text-sm">
                    {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Unknown User'}
                  </div>
                  <div className="text-xs text-text-muted font-mono truncate">{user.id.slice(0, 12)}...</div>
                </div>
              </div>
              {user.id !== editingUserId && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    className="p-2 rounded-md text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors"
                    onClick={() => {
                      setEditingUserId(user.id);
                      setSelectedRole(user.role || "JOB_SEEKER");
                    }}
                    title="Edit Role"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-md text-text-secondary hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => handleDeleteUser(user.id, user.email)}
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Email</span>
                <div className="text-text-secondary break-all">{user.email || "No Email"}</div>
              </div>
              
              <div>
                <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Role</span>
                <div className="mt-1">
                  {user.id === editingUserId ? (
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full"
                    >
                      <option value="JOB_SEEKER">User</option>
                      <option value="COMPANY_ERP">Client</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  ) : (
                    getRoleBadge(user.role)
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Joined</span>
                <div className="flex items-center gap-1.5 text-text-secondary mt-1">
                  <Calendar className="w-3.5 h-3.5 text-text-muted" />
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {user.id === editingUserId && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 font-medium transition-colors"
                  onClick={() => handleRoleUpdate(user.id)}
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary font-medium transition-colors"
                  onClick={() => setEditingUserId(null)}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface/50 text-left">
              <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">User Profile</th>
              <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Email Contact</th>
              <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-surface/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                      {(user.firstName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-text-primary text-sm">
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Unknown User'}
                      </div>
                      <div className="text-xs text-text-muted font-mono">{user.id.slice(0, 12)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {user.email || "No Email"}
                </td>
                <td className="px-6 py-4">
                  {user.id === editingUserId ? (
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full max-w-[140px]"
                    >
                      <option value="JOB_SEEKER">User</option>
                      <option value="COMPANY_ERP">Client</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  ) : (
                    getRoleBadge(user.role)
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-text-muted" />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {user.id === editingUserId ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-1.5 rounded-md bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        onClick={() => handleRoleUpdate(user.id)}
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 rounded-md bg-surface text-text-muted hover:bg-surface-hover hover:text-text-primary"
                        onClick={() => setEditingUserId(null)}
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-1.5 rounded-md text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors"
                        onClick={() => {
                          setEditingUserId(user.id);
                          setSelectedRole(user.role || "JOB_SEEKER");
                        }}
                        title="Edit Role"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 rounded-md text-text-secondary hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
