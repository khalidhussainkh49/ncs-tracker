import { useState, useEffect } from 'react';
import { UserPlus, Lock, UserX, RefreshCw } from 'lucide-react';
import AddUserModal from './AddUserModal';
import ResetPasswordModal from './ResetPasswordModal';
import UserTable from './UserTable';
import type { AdminUser } from '../../types/user';

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/deactivate`, {
        method: 'PUT'
      });
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      ));
    } catch (error) {
      console.error('Failed to deactivate user:', error);
    }
  };

  const handleAddUser = async (userData: Partial<AdminUser>) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      const newUser = await response.json();
      setUsers([...users, newUser]);
      setShowAddUser(false);
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  const handleResetPassword = async (userId: string, newPassword: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
      });
      setShowResetPassword(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <UserPlus className="w-5 h-5" />
            Add User
          </button>
        </div>
      </div>

      <UserTable
        users={users}
        onDeactivate={handleDeactivateUser}
        onResetPassword={(user) => {
          setSelectedUser(user);
          setShowResetPassword(true);
        }}
      />

      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onSubmit={handleAddUser}
        />
      )}

      {showResetPassword && selectedUser && (
        <ResetPasswordModal
          user={selectedUser}
          onClose={() => {
            setShowResetPassword(false);
            setSelectedUser(null);
          }}
          onSubmit={handleResetPassword}
        />
      )}
    </div>
  );
}