import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import useSound from 'use-sound';
import type { User } from '../types/user';

interface GeofenceAlertProps {
  user: User;
  onClose: () => void;
}

export default function GeofenceAlert({ user, onClose }: GeofenceAlertProps) {
  const [play, { stop }] = useSound('/sounds/alert.mp3', { loop: true });
  
  useEffect(() => {
    play();
    return () => stop();
  }, [play, stop]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold">Geofence Alert</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h4 className="font-medium">{user.name}</h4>
            <p className="text-sm text-red-500">
              Has left their assigned geofence area
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Dismiss Alert
        </button>
      </div>
    </div>
  );
}