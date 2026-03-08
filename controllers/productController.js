import asyncHandler from '../utils/asyncHandler.js';
import Product from '../models/Product.js';

// Lazy-initialize ImageKit so env vars are always loaded first
let _imagekit = null;
async function getImageKit() {
    if (!_imagekit) {
        // Import inline to avoid top-level initialization before dotenv
        const ImageKit = (await import('imagekit')).default;
        _imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        });
    }
    return _imagekit;
}

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.featured) query.featured = req.query.featured === 'true';

    // Filter hidden products for non-admin requests
    const adminPin = req.headers['x-admin-pin'];
    const validPin = process.env.ADMIN_PIN || '123456';
    if (adminPin !== validPin) {
        query.isHidden = { $ne: true };
    }

    let apiQuery = Product.find(query);

    // Sorting
    if (req.query.sort) {
        const sortBy = req.query.sort;
        if (sortBy === 'price-low-high') {
            apiQuery = apiQuery.sort({ valuePrice: 1 });
        } else if (sortBy === 'price-high-low') {
            apiQuery = apiQuery.sort({ valuePrice: -1 });
        } else if (sortBy === 'rating') {
            apiQuery = apiQuery.sort({ rating: -1 });
        } else if (sortBy === 'reviews') {
            apiQuery = apiQuery.sort({ reviewCount: -1 });
        }
    } else {
        apiQuery = apiQuery.sort({ createdAt: -1 });
    }

    const products = await apiQuery;
    res.json(products);
});

// @desc    Fetch single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug });
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    // ... logic remains same as before ... existing createProduct code ...
    let imageUrl = 'https://ik.imagekit.io/mn97a0qq9f/default-image.jpg';

    if (req.file) {
        try {
            const { default: ImageKit } = await import('imagekit');
            const imagekit = new ImageKit({
                publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
                privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
                urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            });

            const base64String = req.file.buffer.toString('base64');
            const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');

            const uploadResponse = await imagekit.upload({
                file: base64String,
                fileName: `${Date.now()}-${safeName}`,
                folder: '/podikart/products',
                useUniqueFileName: true,
            });

            console.log('✅ ImageKit Upload Success:', uploadResponse.url);
            imageUrl = uploadResponse.url;
        } catch (err) {
            console.error('❌ ImageKit Upload Error:', err.message);
            res.status(500);
            throw new Error('Image upload failed: ' + err.message);
        }
    }

    const {
        name, slug, shortDescription, description, category,
        rating, reviewCount, trialPrice, valuePrice, weight,
        ingredients, benefits, usage, shelfLife, featured,
        faqs, reviews
    } = req.body;

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

    const product = new Product({
        name: name || 'Sample name',
        slug: slug || `product-${Date.now()}`,
        user: req.user._id,
        image: imageUrl,
        category: category || 'general',
        shortDescription: shortDescription || 'Short description',
        description: description || 'Description',
        rating: Number(rating) || 0,
        reviewCount: Number(reviewCount) || 0,
        trialPrice: Number(trialPrice) || 0,
        valuePrice: Number(valuePrice) || 0,
        weight: Number(weight) || 0,
        ingredients: parseList(ingredients),
        benefits: parseList(benefits),
        usage: parseList(usage),
        faqs: parseList(faqs),
        shelfLife: shelfLife || '3 months',
        featured: featured === 'true' || false,
    });

    // Add manual reviews if provided (e.g., from admin panel)
    const adminReviews = parseList(reviews);
    if (adminReviews && adminReviews.length > 0) {
        product.reviews = adminReviews.map(r => ({
            ...r,
            user: req.user._id // Admin attribution
        }));
        product.reviewCount = product.reviews.length;
    }

    try {
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (saveError) {
        res.status(500);
        throw new Error('Database Error: ' + saveError.message);
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        const {
            name, slug, shortDescription, description, category,
            trialPrice, valuePrice, weight, ingredients, benefits, usage,
            shelfLife, featured, isHidden, rating, faqs, reviews
        } = req.body;

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

        product.name = name || product.name;
        product.slug = slug || product.slug;
        product.shortDescription = shortDescription || product.shortDescription;
        product.description = description || product.description;
        product.category = category || product.category;
        product.trialPrice = trialPrice !== undefined ? Number(trialPrice) : product.trialPrice;
        product.valuePrice = valuePrice !== undefined ? Number(valuePrice) : product.valuePrice;
        product.weight = weight !== undefined ? Number(weight) : product.weight;
        product.shelfLife = shelfLife || product.shelfLife;
        product.featured = featured !== undefined ? (featured === 'true' || featured === true) : product.featured;
        product.isHidden = isHidden !== undefined ? (isHidden === 'true' || isHidden === true) : product.isHidden;
        product.rating = rating !== undefined ? Number(rating) : product.rating;

        const updatedIngredients = parseList(ingredients);
        if (updatedIngredients) product.ingredients = updatedIngredients;

        const updatedBenefits = parseList(benefits);
        if (updatedBenefits) product.benefits = updatedBenefits;

        const updatedUsage = parseList(usage);
        if (updatedUsage) product.usage = updatedUsage;

        const updatedFaqs = parseList(faqs);
        if (updatedFaqs) product.faqs = updatedFaqs;

        const updatedReviews = parseList(reviews);
        if (updatedReviews) {
            product.reviews = updatedReviews.map(r => ({
                ...r,
                user: r.user || req.user._id
            }));
            product.reviewCount = product.reviews.length;
        }

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
                    fileName: `${Date.now()}-${product.slug}`,
                    folder: '/podikart/products',
                });
                product.image = uploadResponse.url;
            } catch (err) {
                res.status(500);
                throw new Error('Image upload failed: ' + err.message);
            }
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

export { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct };
