import { Table, User, Lock, UserX } from 'lucide-react';
import type { AdminUser } from '../../types/user';

interface UserTableProps {
  users: AdminUser[];
  onDeactivate: (userId: string) => void;
  onResetPassword: (user: AdminUser) => void;
}

export default function UserTable({ users, onDeactivate, onResetPassword }: UserTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Active
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.avatar}
                      alt={user.name}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.lastActive).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onResetPassword(user)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                  title="Reset Password"
                >
                  <Lock className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDeactivate(user.id)}
                  className={`${
                    user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                  }`}
                  title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                >
                  <UserX className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}