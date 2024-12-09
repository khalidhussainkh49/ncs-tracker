import { useState } from 'react';
import { MapPin, Trash2, Plus } from 'lucide-react';
import type { GeoFence } from '../../types/geofence';

const MOCK_GEOFENCES: GeoFence[] = [
  {
    id: '1',
    name: 'Downtown Area',
    type: 'circle',
    radius: 1000,
    coordinates: [40.7128, -74.0060],
    createdAt: new Date('2024-01-15'),
    assignedUsers: ['user1', 'user2']
  },
  {
    id: '2',
    name: 'Airport Zone',
    type: 'polygon',
    coordinates: [
      [40.6413, -73.7781],
      [40.6631, -73.7831],
      [40.6431, -73.7925]
    ],
    createdAt: new Date('2024-01-20'),
    assignedUsers: ['user3']
  }
];

export default function GeofenceManagement() {
  const [geofences] = useState<GeoFence[]>(MOCK_GEOFENCES);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Geofence Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" />
          Add Geofence
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Users
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {geofences.map((fence) => (
              <tr key={fence.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-indigo-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{fence.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {fence.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fence.createdAt.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fence.assignedUsers.length} users
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-red-600 hover:text-red-900"
                    title="Delete geofence"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}