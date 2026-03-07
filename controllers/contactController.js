import asyncHandler from '../utils/asyncHandler.js';
import Contact from '../models/Contact.js';

// @desc    Submit a contact form
// @route   POST /api/contacts
// @access  Public
const submitContact = asyncHandler(async (req, res) => {
    const { name, email, phone, message } = req.body;

    const contact = await Contact.create({
        name,
        email,
        phone,
        message,
    });

    res.status(201).json(contact);
});

// @desc    Get all contact submissions
// @route   GET /api/contacts
// @access  Private/Admin
const getContacts = asyncHandler(async (req, res) => {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.json(contacts);
});

export { submitContact, getContacts };
