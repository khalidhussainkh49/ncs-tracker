import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
router.use(verifyToken, isAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    });

    await user.save();
    
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset user password
router.put('/users/:userId/reset-password', async (req, res) => {
  try {
    const { password } = req.body;
    const { userId } = req.params;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(userId, { password: hashedPassword });
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate/Activate user
router.put('/users/:userId/deactivate', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();
    
    res.json({ message: 'User status updated successfully', status: user.status });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;