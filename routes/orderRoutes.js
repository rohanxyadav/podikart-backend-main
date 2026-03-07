import express from 'express';
const router = express.Router();
import {
    addOrderItems,
    getOrders,
    getOrderById,
    updateOrderToDelivered,
    updateOrderStatus,
    getMyOrders,
    deleteOrder
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id')
    .get(protect, admin, getOrderById)
    .delete(protect, admin, deleteOrder);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

export default router;
