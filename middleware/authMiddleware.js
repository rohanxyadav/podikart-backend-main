import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
    let token;

    const adminPin = req.headers['x-admin-pin'];
    const validPin = process.env.ADMIN_PIN || '123456';

    // Allow bypass if valid admin pin is provided
    if (adminPin === validPin) {
        return next();
    }

    token = req.cookies?.jwt || req.headers.authorization?.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password');
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// Admin Auth middleware
const admin = asyncHandler(async (req, res, next) => {
    const adminPin = req.headers['x-admin-pin'];
    const validPin = process.env.ADMIN_PIN || '123456';

    if (adminPin === validPin) {
        // If authorized via PIN and no user is attached, attach the first admin user found in DB
        // to avoid breaking controllers that rely on req.user._id
        if (!req.user) {
            const adminUser = await User.findOne({ isAdmin: true });
            if (adminUser) {
                req.user = adminUser;
            } else {
                // If no admin user exists, just use any user as a fallback or return error
                const anyUser = await User.findOne({});
                if (anyUser) {
                    req.user = anyUser;
                }
            }
        }
        return next();
    }

    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
});

export { protect, admin };
