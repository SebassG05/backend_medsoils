import Resource from '../models/Resource.js';

/* ─────────────────────────────────────────────
   GET /api/v1/resources   — público
───────────────────────────────────────────── */
export const getAllResources = async (req, res) => {
  try {
    const { type, q } = req.query;

    const filter = { isPublished: true };
    if (type && ['video', 'pdf', 'image'].includes(type)) filter.type = type;
    if (q) {
      const re = new RegExp(q, 'i');
      filter.$or = [{ title: re }, { description: re }, { tag: re }];
    }

    const resources = await Resource.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    res.json({ success: true, data: resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────
   GET /api/v1/resources/:id   — público
───────────────────────────────────────────── */
export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('createdBy', 'name email');
    if (!resource || !resource.isPublished) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────
   POST /api/v1/resources   — superadmin only
───────────────────────────────────────────── */
export const createResource = async (req, res) => {
  try {
    const { title, description, type, url, thumbnail, tag, duration, pages, count } = req.body;

    if (!title?.trim() || !description?.trim() || !type || !url?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'title, description, type and url are required',
      });
    }

    if (!['video', 'pdf', 'image'].includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be video, pdf or image' });
    }

    const resource = await Resource.create({
      title:       title.trim(),
      description: description.trim(),
      type,
      url:         url.trim(),
      thumbnail:   thumbnail?.trim() || '',
      tag:         tag?.trim() || '',
      duration:    duration?.trim() || '',
      pages:       pages?.trim() || '',
      count:       count?.trim() || '',
      createdBy:   req.user.userId,
    });

    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────
   PUT /api/v1/resources/:id   — superadmin only
───────────────────────────────────────────── */
export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    res.json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────
   DELETE /api/v1/resources/:id   — superadmin only
───────────────────────────────────────────── */
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
