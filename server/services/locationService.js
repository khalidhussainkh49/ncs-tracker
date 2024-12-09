import Location from '../models/Location.js';

class LocationService {
  /**
   * Save a new location for a user
   * @param {string} userId - The user's ID
   * @param {number} longitude - Longitude coordinate
   * @param {number} latitude - Latitude coordinate
   * @param {Object} options - Additional location options
   * @returns {Promise<Location>} The saved location document
   */
  static async saveLocation(userId, longitude, latitude, options = {}) {
    try {
      const locationData = {
        userId,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        ...options
      };

      const location = new Location(locationData);
      await location.save();
      return location;
    } catch (error) {
      console.error('Error saving location:', error);
      throw new Error('Failed to save location');
    }
  }

  /**
   * Get user's location history
   * @param {string} userId - The user's ID
   * @param {Object} options - Query options (limit, startDate, endDate)
   * @returns {Promise<Location[]>} Array of location documents
   */
  static async getLocationHistory(userId, options = {}) {
    const { limit = 100, startDate, endDate } = options;
    
    const query = { userId };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    return Location.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  /**
   * Find users within a radius of a point
   * @param {number} longitude - Center point longitude
   * @param {number} latitude - Center point latitude
   * @param {number} radius - Search radius in meters
   * @returns {Promise<Location[]>} Array of nearby locations
   */
  static async findNearbyUsers(longitude, latitude, radius) {
    return Location.findNearby({ longitude, latitude }, radius);
  }

  /**
   * Find users within a polygon boundary
   * @param {Array<Array<number>>} bounds - Array of coordinate pairs forming a polygon
   * @returns {Promise<Location[]>} Array of locations within bounds
   */
  static async findUsersInBounds(bounds) {
    return Location.findWithinBounds(bounds);
  }

  /**
   * Get user's last known location
   * @param {string} userId - The user's ID
   * @returns {Promise<Location>} The most recent location
   */
  static async getLastLocation(userId) {
    return Location.findOne({ userId })
      .sort({ timestamp: -1 });
  }
}

export default LocationService;