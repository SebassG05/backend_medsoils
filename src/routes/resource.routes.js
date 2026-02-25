import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
} from '../controller/resource.controller.js';

const router = express.Router();

// ── Public ──────────────────────────────────────────
router.get('/',    getAllResources);
router.get('/:id', getResourceById);

// ── Superadmin only ─────────────────────────────────
router.post(  '/',    authenticate, authorize('superadmin'), createResource);
router.put(   '/:id', authenticate, authorize('superadmin'), updateResource);
router.delete('/:id', authenticate, authorize('superadmin'), deleteResource);

export default router;
