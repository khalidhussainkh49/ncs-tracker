import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates'
      }
    }
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  accuracy: {
    type: Number,
    min: 0,
    required: false
  },
  source: {
    type: String,
    enum: ['GPS', 'NETWORK', 'IP', 'MANUAL', 'SOCKET'],
    default: 'GPS'
  },
  speed: {
    type: Number,
    min: 0,
    required: false
  },
  altitude: {
    type: Number,
    required: false
  },
  heading: {
    type: Number,
    min: 0,
    max: 360,
    required: false
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
});

// Create 2dsphere index for geospatial queries
locationSchema.index({ location: '2dsphere' });

// Add methods for common geospatial queries
locationSchema.statics.findNearby = function(coords, maxDistance = 1000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [coords.longitude, coords.latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

locationSchema.statics.findWithinBounds = function(bounds) {
  return this.find({
    location: {
      $geoWithin: {
        $geometry: {
          type: 'Polygon',
          coordinates: bounds
        }
      }
    }
  });
};

const Location = mongoose.model('Location', locationSchema);

export default Location;