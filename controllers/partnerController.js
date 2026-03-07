import asyncHandler from '../utils/asyncHandler.js';
import PartnerRequest from '../models/PartnerRequest.js';

// @desc    Submit a partner request
// @route   POST /api/partners
// @access  Public
const submitPartnerRequest = asyncHandler(async (req, res) => {
    const { name, email, phone, business, city, message } = req.body;

    const partnerRequest = await PartnerRequest.create({
        name,
        email,
        phone,
        business,
        city,
        message,
    });

    res.status(201).json(partnerRequest);
});

// @desc    Get all partner requests
// @route   GET /api/partners
// @access  Private/Admin
const getPartnerRequests = asyncHandler(async (req, res) => {
    const partnerRequests = await PartnerRequest.find({}).sort({ createdAt: -1 });
    res.json(partnerRequests);
});

export { submitPartnerRequest, getPartnerRequests };
