import asyncHandler from '../utils/asyncHandler.js';
import Category from '../models/Category.js';

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    res.json(categories);
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    const { name, slug, description } = req.body;

    const categoryExists = await Category.findOne({ slug });

    if (categoryExists) {
        res.status(400);
        throw new Error('Category already exists');
    }

    let imageUrl = '';
    if (req.file) {
        try {
            const { default: ImageKit } = await import('imagekit');
            const imagekit = new ImageKit({
                publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
                privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
                urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            });

            const base64String = req.file.buffer.toString('base64');
            const uploadResponse = await imagekit.upload({
                file: base64String,
                fileName: `${Date.now()}-${slug}`,
                folder: '/podikart/categories',
            });
            imageUrl = uploadResponse.url;
        } catch (err) {
            console.error('Image upload failed:', err);
        }
    }

    const category = new Category({
        name,
        slug,
        description,
        image: imageUrl,
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
    const { description } = req.body;
    const category = await Category.findById(req.params.id);

    if (category) {
        category.description = description || category.description;

        if (req.file) {
            try {
                const { default: ImageKit } = await import('imagekit');
                const imagekit = new ImageKit({
                    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
                    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
                    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                });

                const base64String = req.file.buffer.toString('base64');
                const uploadResponse = await imagekit.upload({
                    file: base64String,
                    fileName: `${Date.now()}-${category.slug}`,
                    folder: '/podikart/categories',
                });
                category.image = uploadResponse.url;
            } catch (err) {
                console.error('Image update failed:', err);
            }
        }

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        await Category.deleteOne({ _id: category._id });
        res.json({ message: 'Category removed' });
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

export { getCategories, createCategory, updateCategory, deleteCategory };
