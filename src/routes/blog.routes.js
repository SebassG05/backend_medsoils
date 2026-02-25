import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controller/blog.controller.js';

const router = express.Router();

// Public: read
router.get('/',    getAllBlogs);
router.get('/:id', getBlogById);

// Protected: write
router.post(  '/',    authenticate, createBlog);
router.put(   '/:id', authenticate, updateBlog);
router.delete('/:id', authenticate, deleteBlog);

export default router;
