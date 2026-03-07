import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const productSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        shortDescription: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            default: 0,
        },
        reviewCount: {
            type: Number,
            required: true,
            default: 0,
        },
        trialPrice: {
            type: Number,
            required: true,
        },
        valuePrice: {
            type: Number,
            required: true,
        },
        ingredients: {
            type: [String],
            required: true,
        },
        benefits: {
            type: [String],
            required: true,
        },
        usage: {
            type: [String],
            required: true,
        },
        shelfLife: {
            type: String,
            required: true,
        },
        featured: {
            type: Boolean,
            required: true,
            default: false,
        },
        isHidden: {
            type: Boolean,
            required: true,
            default: false,
        },
        faqs: [
            {
                question: { type: String, required: true },
                answer: { type: String, required: true },
            }
        ],
        reviews: [reviewSchema],
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
