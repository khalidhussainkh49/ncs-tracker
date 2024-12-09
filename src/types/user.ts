export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  location?: {
    lat: number;
    lng: number;
  };
  status?: 'online' | 'offline' | 'away';
  lastActive?: Date;
  peerId?: string;
  role: 'user' | 'admin' | 'moderator' | 'restricted';
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'online' | 'offline' | 'away';
  lastActive: Date;
  peerId?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin' | 'moderator' | 'restricted';
  status: 'active' | 'inactive';
  lastActive: Date;
}

export interface LocationHistory {
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
  };
}