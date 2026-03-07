import express from 'express';
import { getAdminStats, getAdminUsers } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/stats').get(protect, admin, getAdminStats);
router.route('/users').get(protect, admin, getAdminUsers);

export default router;
