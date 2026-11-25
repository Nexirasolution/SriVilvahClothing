import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    storeName: { type: String },
    logo: { type: String },
    whatsapp: { type: String },
    instagram: { type: String },
    address: { type: String },

    // ── Footer content (editable from Admin → Store Settings) ──
    // No schema defaults on purpose: an old document without these fields
    // stays "undefined", so the admin page and the footer can fall back to
    // the built-in values instead of showing blanks.
    // WhatsApp floating chat button (no defaults, same reason as above)
    whatsappMessage: { type: String },
    whatsappButtonText: { type: String },

    footerTagline: { type: String },
    footerNote: { type: String },
    phoneDisplay: { type: String },
    email: { type: String },
    quickLinks: {
      type: [
        {
          _id: false,
          label: { type: String, required: true },
          href: { type: String, required: true }
        }
      ],
      default: undefined
    },

    // Weight-based shipping: admin sets the assumed weight of a single
    // piece (garment/unit) and a price per kg. Total order weight is
    // computed as (total piece count across the cart) * weightPerPiece,
    // then charged at pricePerKg, rounded up to the next whole kg.
    // See lib/shipping.js — the only place this is calculated.
    // `shippingFee` is legacy and no longer read by the shipping calculator.
    shippingFee: { type: Number, default: 0 },
    weightPerPiece: { type: Number, default: 0 }, // grams, per single piece
    pricePerKg: { type: Number, default: 0 }, // ₹ charged per kg (rounded up)

    // Flat fallback used whenever weight-based shipping can't be computed,
    // i.e. weightPerPiece or pricePerKg is 0.
    defaultShippingCharge: { type: Number, default: 0 },

    // Order subtotal (₹) at or above which shipping is free.
    // 0 means "free shipping disabled".
    freeShippingAbove: { type: Number, default: 0 },

    // State-wise overrides. A rule applies to customers in `state`.
    // pricePerKg / freeShippingAbove of 0 mean "use the global value".
    // NOTE: this MUST be in the schema — Mongoose strict mode silently
    // drops any field that isn't declared here.
    stateShipping: [
      {
        _id: false,
        state: { type: String, required: true },
        pricePerKg: { type: Number, default: 0 },
        freeShippingAbove: { type: Number, default: 0 }
      }
    ],

    seoTitle: { type: String },
    seoDescription: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);