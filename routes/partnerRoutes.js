import express from 'express';
import { submitPartnerRequest, getPartnerRequests } from '../controllers/partnerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(submitPartnerRequest)
    .get(protect, admin, getPartnerRequests);

export default router;
