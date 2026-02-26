import Review from '../models/Review.js';

export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
    Review.find({ approved: true }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('createdBy', 'name email'),
    ]);

    res.json({ success: true, data: items, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { name, email, rating, text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ success: false, message: 'Review text is required' });
    const r = Number(rating);
    if (Number.isNaN(r) || r < 0 || r > 5) return res.status(400).json({ success: false, message: 'Rating must be between 0 and 5' });

    const payload = {
      name: name?.trim() || 'Anonymous',
      email: email?.trim() || '',
      rating: r,
      text: text.trim(),
    };

    // attach user if authenticated
    if (req.user?.userId) payload.createdBy = req.user.userId;

    const created = await Review.create(payload);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    // allow if superadmin
    if (req.user?.role === 'superadmin') {
      await Review.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'Review deleted' });
    }

    // allow if owner
    if (review.createdBy && req.user?.userId && review.createdBy.toString() === req.user.userId) {
      await Review.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'Review deleted' });
    }

    return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
