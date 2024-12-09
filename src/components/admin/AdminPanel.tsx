import { useState } from 'react';
import UserManagement from './UserManagement';
import SystemStats from './SystemStats';
import GeofenceManagement from './GeofenceManagement';
import { LayoutGrid, Users, MapPin, Activity } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'geofences', label: 'Geofence Management', icon: MapPin },
  { id: 'stats', label: 'System Stats', icon: Activity },
] as const;

type TabId = typeof TABS[number]['id'];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium ${
                    activeTab === id
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-indigo-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">Total Users</h3>
                <p className="text-3xl font-bold text-indigo-600">1,234</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Active Now</h3>
                <p className="text-3xl font-bold text-green-600">567</p>
              </div>
              <div className="bg-amber-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Geofences</h3>
                <p className="text-3xl font-bold text-amber-600">89</p>
              </div>
            </div>
          )}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'geofences' && <GeofenceManagement />}
          {activeTab === 'stats' && <SystemStats />}
        </div>
      </div>
    </div>
  );
}