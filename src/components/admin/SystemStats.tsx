import { useState, useEffect } from 'react';
import { Activity, Users, MapPin, Clock } from 'lucide-react';

interface SystemMetrics {
  activeUsers: number;
  totalGeofences: number;
  averageResponseTime: number;
  uptime: string;
}

export default function SystemStats() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeUsers: 0,
    totalGeofences: 0,
    averageResponseTime: 0,
    uptime: '0d 0h 0m'
  });

  useEffect(() => {
    // Simulated metrics for demo
    setMetrics({
      activeUsers: 567,
      totalGeofences: 89,
      averageResponseTime: 245,
      uptime: '15d 7h 23m'
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">System Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Geofences</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalGeofences}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Activity className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.averageResponseTime}ms</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.uptime}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Load</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Load graph will be displayed here</p>
        </div>
      </div>
    </div>
  );
}