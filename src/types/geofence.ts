export interface GeoFence {
  id: string;
  name: string;
  type: 'circle' | 'polygon';
  coordinates: number[] | number[][];
  radius?: number;
  createdAt: Date;
  assignedUsers: string[];
}