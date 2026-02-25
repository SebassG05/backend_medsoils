import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['video', 'pdf', 'image'],
      required: true,
    },
    // URL principal del recurso (enlace al video, PDF o imagen)
    url: {
      type: String,
      required: true,
      trim: true,
    },
    // Imagen de portada (opcional para PDFs/guides)
    thumbnail: {
      type: String,
      default: '',
    },
    // Etiqueta temática visible en la tarjeta
    tag: {
      type: String,
      default: '',
    },
    // Metadatos opcionales según tipo
    duration: { type: String, default: '' },  // para video  (ej. "18 min")
    pages:    { type: String, default: '' },  // para pdf    (ej. "24 pages")
    count:    { type: String, default: '' },  // para imagen (ej. "38 photos")

    isPublished: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Resource', resourceSchema);
