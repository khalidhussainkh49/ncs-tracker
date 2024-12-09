import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import LocationService from '../services/locationService.js';

const router = express.Router();

// Middleware to protect all location routes
router.use(verifyToken);

// Save new location
router.post('/', async (req, res) => {
  try {
    const { longitude, latitude, ...options } = req.body;
    
    const location = await LocationService.saveLocation(
      req.userId,
      longitude,
      latitude,
      options
    );
    
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get location history
router.get('/history', async (req, res) => {
  try {
    const { limit, startDate, endDate } = req.query;
    
    const locations = await LocationService.getLocationHistory(
      req.userId,
      { limit: parseInt(limit), startDate, endDate }
    );
    
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Find nearby users
router.get('/nearby', async (req, res) => {
  try {
    const { longitude, latitude, radius } = req.query;
    
    const nearbyLocations = await LocationService.findNearbyUsers(
      parseFloat(longitude),
      parseFloat(latitude),
      parseFloat(radius)
    );
    
    res.json(nearbyLocations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get last known location
router.get('/last', async (req, res) => {
  try {
    const location = await LocationService.getLastLocation(req.userId);
    if (!location) {
      return res.status(404).json({ message: 'No location found' });
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;