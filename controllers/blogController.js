import asyncHandler from '../utils/asyncHandler.js';
import Blog from '../models/Blog.js';

// Helper for ImageKit upload
async function uploadToImageKit(file) {
    const { default: ImageKit } = await import('imagekit');
    const imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });

    const base64String = file.buffer.toString('base64');
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uploadResponse = await imagekit.upload({
        file: base64String,
        fileName: `${Date.now()}-${safeName}`,
        folder: '/podikart/blogs',
        useUniqueFileName: true,
    });
    return uploadResponse.url;
}

// @desc    Fetch all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = asyncHandler(async (req, res) => {
    // Public only sees visible blogs
    const query = req.user && req.user.isAdmin ? {} : { isHidden: false };
    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    res.json(blogs);
});

// @desc    Fetch single blog
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    if (blog) {
        // If hidden, only admin can see it
        if (blog.isHidden && !(req.user && req.user.isAdmin)) {
            res.status(404);
            throw new Error('Blog not found');
        }
        res.json(blog);
    } else {
        res.status(404);
        throw new Error('Blog not found');
    }
});

// @desc    Create a blog
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = asyncHandler(async (req, res) => {
    let images = [];
    if (req.files && req.files.length > 0) {
        images = await Promise.all(req.files.map(file => uploadToImageKit(file)));
    }

    const { title, slug, tags, content, isHidden } = req.body;

    const parseList = (val) => {
        if (!val) return [];
        try {
            if (typeof val === 'string') {
                if (val.startsWith('[') || val.startsWith('{')) return JSON.parse(val);
                return val.split(',').map(s => s.trim());
            }
            return val;
        } catch { return val.split(',').map(s => s.trim()); }
    };

    const blog = new Blog({
        title,
        slug: slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        tags: parseList(tags),
        images: images.length > 0 ? images : ['https://ik.imagekit.io/mn97a0qq9f/default-image.jpg'],
        content,
        isHidden: isHidden === 'true' || isHidden === true,
        user: req.user._id,
    });

    const createdBlog = await blog.save();
    res.status(201).json(createdBlog);
});

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
const updateBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    if (blog) {
        const { title, slug, tags, content, isHidden, existingImages } = req.body;

        const parseList = (val) => {
            if (!val) return undefined;
            try {
                if (typeof val === 'string') {
                    if (val.startsWith('[') || val.startsWith('{')) return JSON.parse(val);
                    return val.split(',').map(s => s.trim());
                }
                return val;
            } catch { return val.split(',').map(s => s.trim()); }
        };

        blog.title = title || blog.title;
        blog.slug = slug || blog.slug;
        blog.content = content || blog.content;
        blog.isHidden = isHidden !== undefined ? (isHidden === 'true' || isHidden === true) : blog.isHidden;

        const updatedTags = parseList(tags);
        if (updatedTags) blog.tags = updatedTags;

        let images = blog.images;
        if (existingImages) {
            images = parseList(existingImages);
        }

        if (req.files && req.files.length > 0) {
            const newImages = await Promise.all(req.files.map(file => uploadToImageKit(file)));
            images = [...(images || []), ...newImages].slice(0, 5);
        }

        blog.images = images;

        const updatedBlog = await blog.save();
        res.json(updatedBlog);
    } else {
        res.status(404);
        throw new Error('Blog not found');
    }
});

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    if (blog) {
        await blog.deleteOne();
        res.json({ message: 'Blog removed' });
    } else {
        res.status(404);
        throw new Error('Blog not found');
    }
});

export {
    getBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
};
