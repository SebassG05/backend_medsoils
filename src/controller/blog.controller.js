import Blog from '../models/Blog.js';
import User from '../models/User.js';

// GET /api/v1/blogs  — public list (anyone logged in can read)
const stripHtml = s => (s || '').replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()
const firstImageSrc = s => { const m = (s || '').match(/<img[^>]+src=["']([^"']{1,2000})["']/i); return m ? m[1] : '' }

export const getAllBlogs = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Blog.find({ published: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),                 // include content so we can extract cover image
      Blog.countDocuments({ published: true }),
    ]);

    // Build clean list objects: plain-text excerpt + resolved cover image, no full content
    const cleanedPosts = posts.map(p => {
      const obj = p.toObject()
      obj.excerpt    = stripHtml(obj.excerpt).slice(0, 250) || ''
      // banner wins as card cover; then fall back to stored coverImage or first inline image
      obj.coverImage = obj.bannerImage || obj.coverImage || firstImageSrc(obj.content) || ''
      delete obj.content     // don't send full HTML to the listing endpoint
      delete obj.bannerImage // already folded into coverImage above; keeps response lean
      return obj
    })

    res.json({
      success: true,
      data: {
        posts: cleanedPosts,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/blogs/:id  — single post with full content
export const getBlogById = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post || !post.published) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/blogs  — create (auth required)
export const createBlog = async (req, res) => {
  try {
    const { title, content, tags, coverImage, bannerImage } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    // Auto-generate excerpt and extract cover image
    const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const excerpt   = plainText.length > 250 ? plainText.slice(0, 250) + '…' : plainText;
    const autoCover = coverImage || bannerImage || firstImageSrc(content)

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const post = await Blog.create({
      title:       title.trim(),
      content:     content.trim(),
      excerpt,
      tags:        Array.isArray(tags) ? tags : [],
      coverImage:  autoCover,
      bannerImage: bannerImage || '',
      author:      req.user.userId,
      authorName:  user.name || user.googleName || user.email,
    });

    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/v1/blogs/:id  — update own post (auth required)
export const updateBlog = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, content, tags, coverImage, bannerImage, published } = req.body;

    if (title       !== undefined) post.title       = title.trim();
    if (content     !== undefined) {
      post.content = content.trim();
      const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      post.excerpt    = plainText.length > 250 ? plainText.slice(0, 250) + '…' : plainText;
      if (!post.coverImage && !bannerImage) post.coverImage = firstImageSrc(content)
    }
    if (tags        !== undefined) post.tags        = Array.isArray(tags) ? tags : [];
    if (coverImage  !== undefined) post.coverImage  = coverImage || firstImageSrc(post.content);
    if (bannerImage !== undefined) {
      post.bannerImage = bannerImage;
      if (bannerImage) post.coverImage = bannerImage; // banner wins as card cover too
    }
    if (published   !== undefined) post.published   = published;

    await post.save();
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/blogs/:id  — delete own post (auth required)
export const deleteBlog = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
