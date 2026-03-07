import asyncHandler from '../utils/asyncHandler.js';
import Message from '../models/Message.js';
import Order from '../models/Order.js';

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { orderId, content } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const message = await Message.create({
        orderId,
        sender: req.user._id,
        isAdmin: req.user.isAdmin || (req.headers['x-admin-pin'] ? true : false),
        content,
        readByAdmin: req.user.isAdmin || (req.headers['x-admin-pin'] ? true : false),
        readByUser: !req.user.isAdmin && !(req.headers['x-admin-pin'] ? true : false)
    });

    res.status(201).json(message);
});

// @desc    Get messages for an order
// @route   GET /api/messages/:orderId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
    const messages = await Message.find({ orderId: req.params.orderId }).sort({ createdAt: 1 });
    res.json(messages);
});

// @desc    Mark messages as read
// @route   PUT /api/messages/:orderId/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const isAdmin = req.user.isAdmin || (req.headers['x-admin-pin'] ? true : false);

    if (isAdmin) {
        await Message.updateMany({ orderId: req.params.orderId, readByAdmin: false }, { readByAdmin: true });
    } else {
        await Message.updateMany({ orderId: req.params.orderId, readByUser: false }, { readByUser: true });
    }

    res.json({ message: 'Messages marked as read' });
});

// @desc    Get unread message counts for admin
// @route   GET /api/messages/admin/unread
// @access  Private/Admin
const getAdminUnreadCount = asyncHandler(async (req, res) => {
    const unread = await Message.aggregate([
        { $match: { readByAdmin: false } },
        { $group: { _id: "$orderId", count: { $sum: 1 } } }
    ]);
    res.json(unread);
});

export { sendMessage, getMessages, markAsRead, getAdminUnreadCount };
