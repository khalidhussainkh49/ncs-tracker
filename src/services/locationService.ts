// import Location from '../models/Location'; // Import the Location model
// import type { LocationHistory } from '../types/user';

// // Save a new location for a user
// export const saveLocation = async (userId: string, location: { lat: number; lng: number }, source: string = 'SOCKET') => {
//   const locationData = {
//     userId,
//     location: {
//       type: 'Point',
//       coordinates: [location.lng, location.lat], // MongoDB expects [lng, lat]
//     },
//     source,
//     timestamp: new Date(), // Use the current date as the timestamp
//   };

//   const newLocation = new Location(locationData);
//   await newLocation.save();
// };

// // Get user's location history
// export const getLocationHistory = async (
//   userId: string, 
//   limit: number = 100
// ): Promise<LocationHistory[]> => {
//   const query = {
//     userId,
//   };

//   const locations = await Location.find(query)
//     .sort({ timestamp: -1 })
//     .limit(limit);

//   return locations.map(doc => ({
//     timestamp: doc.timestamp,
//     location: doc.location,
//   }));
// };