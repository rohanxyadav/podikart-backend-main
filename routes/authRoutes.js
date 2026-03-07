import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    registerUser,
    authUser,
    verifyEmail,
    getUserProfile,
    logoutUser,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/verify/:token', verifyEmail);
router.get('/me', protect, getUserProfile);
router.post('/logout', protect, logoutUser);

export default router;
