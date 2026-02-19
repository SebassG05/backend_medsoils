import express from 'express';
import { submitContactForm } from '../controller/contact.controller.js';

const router = express.Router();

// POST /api/v1/contact
router.post('/', submitContactForm);

export default router;
