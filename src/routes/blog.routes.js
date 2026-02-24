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

// All blog routes require authentication
router.use(authenticate);

router.get('/',    getAllBlogs);
router.get('/:id', getBlogById);
router.post('/',   createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);

export default router;
