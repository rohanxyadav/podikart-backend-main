import mongoose from 'mongoose';

const blogSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        tags: {
            type: [String],
            required: true,
        },
        images: {
            type: [String],
            validate: [arrayLimit, '{PATH} exceeds the limit of 5'],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        isHidden: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

function arrayLimit(val) {
    return val.length <= 5;
}

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
