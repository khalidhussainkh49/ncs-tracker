import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import locationRoutes from './routes/locations.js';
import { verifyToken } from './middleware/auth.js';
import LocationService from './services/locationService.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
// const io = new Server(httpServer, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"]
//   }
// });

const corsOptions = {
  origin: [
    'http://localhost:5173',     // Web app
    'http://localhost:3001',     // Flutter web
    'capacitor://localhost',     // Mobile app
    'ionic://localhost',         // Ionic apps
    'http://localhost',          // Generic localhost
    'http://10.0.2.2:3001',     // Android emulator
     'http://0.0.0.0:3001'      // iOS simulator
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
};


// Apply CORS middleware to Express
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Configure Socket.IO with the same CORS options
const io = new Server(httpServer, {
  cors: {
    origin: corsOptions.origin,
    methods: corsOptions.methods,
    credentials: corsOptions.credentials,
    allowedHeaders: corsOptions.allowedHeaders
  }
});




// Store connected users
const connectedUsers = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/locations', verifyToken, locationRoutes);

// Serve static files in production
const __dirname = dirname(fileURLToPath(import.meta.url));
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user-connected', (userId) => {
    connectedUsers.set(socket.id, userId);
  });

  socket.on('location-update', async ({ location }) => {
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      try {
        // Save location to database
        await LocationService.saveLocation(
          userId,
          location,
          'SOCKET'
        );
        
        // Broadcast location update to all connected clients
        io.emit('location-update', { userId, location });
      } catch (error) {
        console.error('Error saving location:', error);
      }
    }
  });

  socket.on('private-message', ({ to, message }) => {
    io.to(to).emit('private-message', {
      from: socket.id,
      message
    });
  });

  socket.on('broadcast-message', ({ message }) => {
    socket.broadcast.emit('broadcast-message', {
      from: socket.id,
      message
    });
  });

  socket.on('danger-alert', ({ location }) => {
    socket.broadcast.emit('danger-alert', {
      from: socket.id,
      location
    });
  });

  socket.on('disconnect', () => {
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      io.emit('user-disconnected', userId);
      connectedUsers.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});