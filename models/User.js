import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        isVerified: {
            type: Boolean,
            required: true,
            default: false,
        },
        verificationToken: {
            type: String,
        },
        addresses: [
            {
                label: { type: String, required: true }, // e.g., 'Home', 'Work'
                address: { type: String, required: true },
                city: { type: String, required: true },
                district: { type: String, required: true },
                state: { type: String, required: true },
                pincode: { type: String, required: true },
                lat: { type: Number },
                lng: { type: Number },
            }
        ],
    },
    {
        timestamps: true,
    }
);

// Method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
