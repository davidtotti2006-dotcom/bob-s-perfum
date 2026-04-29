const mongoose = require('mongoose');

const SizeSchema = new mongoose.Schema(
  {
    ml: { type: Number, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
  },
  { _id: false }
);

const PerfumeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    story: { type: String, default: '' },
    family: {
      type: String,
      enum: ['floral', 'boisé', 'oriental', 'frais', 'musqué', 'aromatique'],
      required: true,
    },
    notes: {
      top: [String],
      heart: [String],
      base: [String],
    },
    images: [String],
    sizes: [SizeSchema],
    status: {
      type: String,
      enum: ['Nouveau', 'Best-seller', 'Exclusif', 'Épuisé', 'Édition Limitée'],
      default: 'Nouveau',
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Perfume', PerfumeSchema);
