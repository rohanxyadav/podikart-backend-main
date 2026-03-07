import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false, // Allow guest orders if necessary, but your app seems to have auth
        },
        orderItems: [
            {
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                image: { type: String, required: true },
                price: { type: Number, required: true },
                pack: { type: String, required: true }, // "trial" or "value"
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
            },
        ],
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: false },
            district: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            type: { type: String, required: true }, // home, work, etc
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        paymentMethod: {
            type: String,
            required: true,
            default: "WhatsApp/Manual",
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        totalItems: {
            type: Number,
            required: true,
            default: 0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
        status: {
            type: String,
            required: true,
            default: "Pending", // Pending, In Packing, In Delivery, Payment Pending, Done, Cancelled
            enum: ["Pending", "In Packing", "In Delivery", "Payment Pending", "Done", "Cancelled"]
        },
        customerDetails: {
            email: { type: String, required: true },
            phone: { type: String, required: true },
        }
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to handle payment and delivery automation
orderSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        if (this.status === 'Done') {
            this.isPaid = true;
            this.paidAt = Date.now();
            this.isDelivered = true;
            this.deliveredAt = Date.now();
        }
    }
    next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
