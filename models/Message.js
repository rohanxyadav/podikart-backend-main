import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Order',
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        content: {
            type: String,
            required: true,
        },
        readByAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        readByUser: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
