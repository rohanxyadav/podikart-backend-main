import mongoose from 'mongoose';

const partnerRequestSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        business: {
            type: String,
            required: true,
        },
        message: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const PartnerRequest = mongoose.model('PartnerRequest', partnerRequestSchema);

export default PartnerRequest;
