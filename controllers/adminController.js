import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get Admin Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const orders = await Order.find({});

    // Revenue only from "Done" orders
    const totalRevenue = orders
        .filter(o => o.status === 'Done')
        .reduce((acc, item) => acc + item.totalPrice, 0);

    // Calculate orders by status
    const ordersByStatus = {
        Pending: 0,
        "In Packing": 0,
        "In Delivery": 0,
        "Payment Pending": 0,
        Done: 0,
        Cancelled: 0
    };
    orders.forEach(o => {
        if (ordersByStatus[o.status] !== undefined) {
            ordersByStatus[o.status]++;
        }
    });

    // Calculate last 7 days sales for line chart - only Done orders
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailySales = await Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo }, status: 'Done' } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                total: { $sum: "$totalPrice" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.json({
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        ordersByStatus,
        dailySales
    });
});

// @desc    Get All Users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = asyncHandler(async (req, res) => {
    const { sortBy = 'desc' } = req.query;
    const sort = sortBy === 'asc' ? { createdAt: 1 } : { createdAt: -1 };
    const users = await User.find({}).sort(sort);
    res.json(users);
});

export { getAdminStats, getAdminUsers };
