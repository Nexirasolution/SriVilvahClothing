'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Package, Phone, Truck, Star, X, Loader2, ImagePlus, CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

// Palette: 60% white/cream · 25% navy · 10% gold · 5% pale gold
// Keep in sync with the invoice, success page and other storefront components.
const PAPER = '#FFFFFF';
const CREAM = '#F8F6EF';
const NAVY = '#102A56';
const NAVY_DARK = '#071A3A';
const GOLD = '#C9A227';
const GOLD_PALE = '#E6D39A';

const INK = NAVY_DARK;
const GREY = 'rgba(16, 42, 86, 0.70)';      // secondary text (navy tint)
const GREY_WASH = 'rgba(16, 42, 86, 0.07)'; // neutral badge background
const LINE = GOLD_PALE;                     // hairlines
const ALERT = '#A33A2B';                    // errors and cancelled only, so they still read as problems
const ALERT_WASH = '#FBECE9';
const FONT_SERIF = "Georgia, 'Times New Roman', serif";

const STATUS_STYLES = {
  placed:    { color: GREY,       background: GREY_WASH },
  confirmed: { color: NAVY,       background: CREAM, border: `1px solid ${GOLD_PALE}` },
  packed:    { color: NAVY,       background: CREAM, border: `1px solid ${GOLD_PALE}` },
  shipped:   { color: NAVY_DARK,  background: GOLD_PALE },
  delivered: { color: GOLD_PALE,  background: NAVY_DARK },
  cancelled: { color: ALERT,      background: ALERT_WASH },
  returned:  { color: GREY,       background: GREY_WASH },
};

const KEEP_COLORS = { WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' };

// Same styling as the primary buttons elsewhere on the site.
const BTN_PRIMARY =
  'transition-colors active:opacity-80 disabled:opacity-50 bg-[#071A3A] text-[#E6D39A] border border-[#C9A227] hover:bg-[#C9A227] hover:text-[#071A3A]';

function ReviewForm({ order, item, phone, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        const url = data.url || data.secure_url;
        if (url) urls.push(url);
      }
      setImages((prev) => [...prev, ...urls]);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order._id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, productId: item.product, rating, comment, images })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Thanks for your review!');
        onDone();
      } else {
        toast.error(data.error || 'Could not submit review');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-3.5 mt-2" style={{ background: CREAM, border: `1px solid ${LINE}`, borderRadius: '4px' }}>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-medium" style={{ color: INK }}>Rate {item.name}</span>
        <button onClick={onDone} type="button" aria-label="Close review form">
          <X size={13} strokeWidth={1.5} style={{ color: GREY }} />
        </button>
      </div>
      <div className="flex gap-1 mb-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} type="button" onClick={() => setRating(i + 1)} aria-label={`${i + 1} star${i ? 's' : ''}`}>
            <Star
              size={18}
              strokeWidth={1.5}
              style={{ color: GOLD, fill: i < rating ? GOLD : 'transparent' }}
            />
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        placeholder="How was the product?"
        className="w-full text-sm mb-2.5 px-3 py-2 outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] placeholder:text-[#102A56]/45"
        style={{ border: `1px solid ${LINE}`, borderRadius: '3px', color: INK, background: PAPER }}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex flex-wrap gap-2 mb-3">
        {images.map((url, i) => (
          <img key={i} src={url} alt="" className="w-11 h-11 object-cover" style={{ borderRadius: '3px', border: `1px solid ${LINE}` }} />
        ))}
        <label
          className="w-11 h-11 flex items-center justify-center cursor-pointer"
          style={{ border: `1px dashed ${GOLD}`, borderRadius: '3px', color: NAVY, background: PAPER }}
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} strokeWidth={1.5} />}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
        </label>
      </div>
      <button
        onClick={submit}
        disabled={submitting}
        className={`text-xs font-medium px-4 py-2 ${BTN_PRIMARY}`}
        style={{ borderRadius: '3px', ...KEEP_COLORS }}
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  );
}

export default function OrdersPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewedMap, setReviewedMap] = useState({});
  const [openReview, setOpenReview] = useState(null);

  async function fetchReviewedMap(orderList) {
    const map = {};
    await Promise.all(
      orderList
        .filter((o) => o.status === 'delivered')
        .map(async (o) => {
          const res = await fetch(`/api/reviews?orderId=${o._id}`);
          const data = await res.json();
          map[o._id] = new Set(data.reviewedProductIds || []);
        })
    );
    setReviewedMap(map);
  }

  async function handleLookup(e) {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '').slice(-10);
    if (cleaned.length !== 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setLoading(true);
    setOrders(null);
    try {
      const res = await fetch('/api/orders/by-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      setOrders(data.orders || []);
      fetchReviewedMap(data.orders || []);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function markReviewed(orderId, productId) {
    setReviewedMap((prev) => {
      const next = { ...prev };
      next[orderId] = new Set([...(next[orderId] || []), productId]);
      return next;
    });
    setOpenReview(null);
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-10 sm:py-14 min-h-[60vh]" style={{ background: PAPER }}>
      <div className="mb-7 pb-6" style={{ borderBottom: `1px solid ${GOLD}` }}>
        <h1 className="text-[24px] sm:text-[28px] mb-1.5" style={{ fontFamily: FONT_SERIF, color: INK }}>
          My Orders
        </h1>
        <p className="text-sm" style={{ color: GREY }}>
          Enter the phone number you used at checkout to view your orders.
        </p>
      </div>

      <form onSubmit={handleLookup} className="flex gap-2 mb-2">
        <div className="flex-1 relative">
          <Phone size={14} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: GOLD }} />
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit phone number"
            maxLength={10}
            className="w-full pl-9 pr-3.5 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] placeholder:text-[#102A56]/45"
            style={{ border: `1px solid ${LINE}`, borderRadius: '3px', color: INK, background: PAPER }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`text-sm font-medium px-5 py-2.5 shrink-0 ${BTN_PRIMARY}`}
          style={{ borderRadius: '3px', ...KEEP_COLORS }}
        >
          {loading ? 'Searching…' : 'Find Orders'}
        </button>
      </form>

      {error && <p className="text-sm mb-4" style={{ color: ALERT }}>{error}</p>}

      {orders !== null && orders.length === 0 && !error && (
        <div className="text-center py-16">
          <Package size={26} strokeWidth={1.5} className="mx-auto mb-3" style={{ color: GOLD }} />
          <p className="text-sm" style={{ color: GREY }}>No orders found for this number</p>
        </div>
      )}

      <div className="space-y-4 mt-6">
        {orders?.map((o) => {
          const statusStyle = STATUS_STYLES[o.status] || { color: GREY, background: GREY_WASH };
          return (
            <div key={o._id} className="p-4" style={{ border: `1px solid ${LINE}`, borderRadius: '4px', background: PAPER }}>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-medium" style={{ color: INK }}>#{o.orderNumber}</span>
                <span
                  className="text-[10.5px] font-medium px-2.5 py-1 capitalize"
                  style={{ ...statusStyle, borderRadius: '3px', ...KEEP_COLORS }}
                >
                  {o.status}
                </span>
              </div>

              <div className="space-y-3 mb-3.5">
                {o.items.map((it, i) => {
                  const reviewKey = `${o._id}-${it.product}`;
                  const alreadyReviewed = reviewedMap[o._id]?.has(String(it.product));
                  const canReview = o.status === 'delivered' && it.product && !it.isCombo;
                  const variantLabel = [it.sleeveType, it.zipType, it.pantOption?.name, it.shawlOption?.name]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <div key={i}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-11 h-11 overflow-hidden shrink-0 relative"
                          style={{ background: CREAM, border: `1px solid ${LINE}`, borderRadius: '3px' }}
                        >
                          {it.image && <Image src={it.image} alt={it.name} fill className="object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate" style={{ color: INK }}>{it.name}</p>
                          <p className="text-xs" style={{ color: GREY }}>
                            Qty {it.qty}{variantLabel ? ` · ${variantLabel}` : ''}
                          </p>
                        </div>
                        {canReview && (
                          alreadyReviewed ? (
                            <span className="flex items-center gap-1 text-[11px] shrink-0" style={{ color: NAVY }}>
                              <CheckCircle2 size={12} strokeWidth={1.5} style={{ color: GOLD }} /> Reviewed
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setOpenReview(openReview === reviewKey ? null : reviewKey)}
                              className="flex items-center gap-1 text-[11px] font-medium shrink-0"
                              style={{ color: INK }}
                            >
                              <Star size={12} strokeWidth={1.5} style={{ color: GOLD }} /> Rate
                            </button>
                          )
                        )}
                      </div>
                      {openReview === reviewKey && (
                        <ReviewForm
                          order={o}
                          item={it}
                          phone={phone.replace(/\D/g, '').slice(-10)}
                          onDone={() => markReviewed(o._id, it.product)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-sm pt-3.5" style={{ borderTop: `1px solid ${LINE}` }}>
                <span style={{ color: GREY }}>
                  {o.items.length} item{o.items.length > 1 ? 's' : ''}
                </span>
                <span className="font-medium" style={{ color: NAVY }}>{formatINR(o.total)}</span>
              </div>

              {o.courier?.trackingId && (
                <div className="flex items-center gap-1.5 text-[11px] mt-2" style={{ color: GREY }}>
                  <Truck size={11} strokeWidth={1.5} style={{ color: GOLD }} />
                  {o.courier.partner} · {o.courier.trackingId}
                </div>
              )}

              <p className="text-[11px] mt-1.5" style={{ color: GREY }}>
                {new Date(o.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}