import express from 'express';
const router = express.Router();
import {
    sendMessage,
    getMessages,
    markAsRead,
    getAdminUnreadCount
} from '../controllers/messageController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
    .post(protect, sendMessage);

router.route('/unread')
    .get(protect, admin, getAdminUnreadCount);

router.route('/:orderId')
    .get(protect, getMessages);

router.route('/:orderId/read')
    .put(protect, markAsRead);

export default router;
