import express from 'express';
const router = express.Router();

import asyncHandler from '../utils/asyncHandler.js';
import Blog from '../models/Blog.js';
import {
    getBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
} from '../controllers/blogController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

// Middleware to optionally set req.user if token is present (for visibility logic in getBlogs)
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const optionalProtect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password');
        } catch (error) {
            // Ignore error, req.user remains undefined
        }
    }
    next();
});

// Middleware removed from here since it's imported above

router.route('/').get(optionalProtect, getBlogs).post(protect, admin, upload.array('images', 5), createBlog);
router
    .route('/:id')
    .get(optionalProtect, getBlogById)
    .put(protect, admin, upload.array('images', 5), updateBlog)
    .delete(protect, admin, deleteBlog);

export default router;
