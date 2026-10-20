// Cached homepage (ISR). Rendered once, then served as static HTML and
// re-built in the background at most every 5 minutes. Admin edits can show up
// instantly by calling revalidatePath('/') from the admin API routes.
// NOTE: the DB must be reachable at `next build` time (the page is generated then).
export const revalidate = 300;

import { dbConnect } from '@/lib/mongodb';
import Banner from '@/models/Banner';
import Product from '@/models/Product';
import Review from '@/models/Review';
import Combo from '@/models/Combo';
import Category from '@/models/Category';
import BannerCarousel from '@/components/BannerCarousel';
import ProductCard from '@/components/ProductCard';
import ReviewSection from '@/components/ReviewSection';

import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import { resizeImage, buildSrcSet } from '@/lib/image';
import { ArrowRight, Tag } from 'lucide-react';

// Design tokens — white / navy / gold theme
//   60%  WHITE + CREAM   page + section backgrounds
//   25%  NAVY + NAVY_DEEP headings, buttons, the Combo Offers band
//   10%  GOLD            accents, badges, CTA text, category rings
//    5%  GOLD_LIGHT      hairlines, dividers, soft washes
const WHITE = '#FFFFFF';
const CREAM = '#F8F6EF';
const NAVY = '#102A56';
const NAVY_DEEP = '#071A3A';
const GOLD = '#C9A227';
const GOLD_LIGHT = '#E6D39A';

const INK = NAVY_DEEP;
const INK_SOFT = '#5B6B88';
const HAIRLINE = GOLD_LIGHT;
const GOLD_WASH = CREAM;

const FONT_SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const FEATURED_LIMIT = 6;

// Only the fields this page renders — keeps DB reads and the page payload small.
const COMBO_FIELDS = 'name slug type packOptions comboPrice originalPrice images image';
const CATEGORY_FIELDS = 'name slug image';
// Everything ProductCard reads. If ProductCard starts using another field,
// add it here.
const PRODUCT_FIELDS = 'name slug basePrice sleeveOptions zipOptions variants';

// Responsive image hints for the combo grid (2 cols mobile, 3 cols desktop)
const COMBO_WIDTHS = [300, 450, 700];
const COMBO_SIZES = '(max-width: 640px) 50vw, 33vw';

// ProductCard only displays the FIRST variant and its FIRST image, so don't
// ship every colour/image of every product into the page HTML.
function slimProduct(p) {
  const v = p.variants?.[0];
  return {
    ...p,
    variants: v ? [{ ...v, images: (v.images || []).slice(0, 1) }] : [],
  };
}

async function getData() {
  await dbConnect();
  const [banners, newArrivals, reviews, combos, categories] = await Promise.all([
    Banner.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
    Product.find({ isActive: true, isActiveSeller: true })
      .sort({ createdAt: -1 })
      .limit(FEATURED_LIMIT)
      .select(PRODUCT_FIELDS)
      .lean(),
    Review.find({ isApproved: true, isFeatured: true }).populate('product', 'name').limit(10).lean(),
    Combo.find({ isActive: true }).select(COMBO_FIELDS).limit(6).lean(),
    Category.find({ isActive: true, parent: null }).select(CATEGORY_FIELDS).limit(10).lean(),
  ]);

  // One serialization pass (ObjectId / Date -> plain JSON for client components).
  return JSON.parse(
    JSON.stringify({
      banners,
      newArrivals: newArrivals.map(slimProduct),
      reviews,
      combos,
      categories,
    })
  );
}

export default async function HomePage() {
  const { banners, newArrivals, reviews, combos, categories } = await getData();

  return (
    <div className="overflow-x-hidden" style={{ background: WHITE }}>

      {/* Banner */}
      <BannerCarousel banners={banners} />

      {/* Shop by Category — cream band */}
      {categories.length > 0 && (
        <section style={{ background: CREAM }}>
          <div className="max-w-6xl mx-auto px-4 pt-14 pb-10">
            <h2
              className="text-xl sm:text-2xl font-bold tracking-[3px] uppercase text-center"
              style={{ color: NAVY, fontFamily: FONT_SANS }}
            >
              Shop by Category
            </h2>

            <div className="flex items-center justify-center gap-3 mt-4 mb-8">
              <span style={{ width: '28px', height: '1px', background: GOLD_LIGHT }} />
              <span className="w-1 h-1 rounded-full" style={{ background: GOLD }} />
              <span style={{ width: '28px', height: '1px', background: GOLD_LIGHT }} />
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6">
              {categories.map((c) => (
                <Link
                  key={c._id}
                  href={`/category/${c.slug}`}
                  className="group flex flex-col items-center text-center"
                >
                  <div
                    className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-105"
                    style={{ border: `1px solid ${GOLD}`, background: WHITE }}
                  >
                    {c.image ? (
                      <img
                        // 96px circle -> a 200px square crop covers retina screens
                        src={resizeImage(c.image, 200, 200)}
                        alt={c.name}
                        width={96}
                        height={96}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full" style={{ background: GOLD_LIGHT }} />
                    )}
                  </div>

                  <span
                    className="mt-2 text-[10.5px] sm:text-[11px] font-bold tracking-wide leading-tight line-clamp-2 max-w-[80px]"
                    style={{ color: NAVY, fontFamily: FONT_SANS }}
                  >
                    {c.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured collection */}
      <section className="max-w-6xl mx-auto px-4 pt-12 sm:pt-14 pb-16 text-center">
        <h2
          className="text-lg sm:text-xl font-bold tracking-[3px] uppercase"
          style={{ color: NAVY, fontFamily: FONT_SANS }}
        >
          Featured Collection
        </h2>

        {newArrivals.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mt-8 text-left">
            {newArrivals.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

        <Link
          href="/products"
          className="inline-block mt-10 px-8 py-3 text-[12px] font-bold tracking-[2px] uppercase transition-colors bg-[#102A56] text-[#C9A227] border border-[#C9A227] hover:bg-[#C9A227] hover:text-[#071A3A]"
          style={{ fontFamily: FONT_SANS }}
        >
          Shop the collection
        </Link>
      </section>

      {/* Combo Offers */}
      {combos.length > 0 && (
        <section className="py-16" style={{ background: NAVY_DEEP }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col items-center text-center mb-8">
              <span
                className="text-[11px] font-bold uppercase tracking-[3px] mb-3 px-3 py-1"
                style={{ color: NAVY_DEEP, background: GOLD, fontFamily: FONT_SANS }}
              >
                Save More
              </span>
              <h2
                className="text-xl sm:text-2xl font-bold tracking-[1px]"
                style={{ color: WHITE, fontFamily: FONT_SANS }}
              >
                Combo Offers
              </h2>
              <p className="text-sm mt-1 font-light" style={{ color: GOLD_LIGHT, fontFamily: FONT_SANS }}>
                Buy together, save together
              </p>
              <Link
                href="/combos"
                className="hidden sm:flex items-center gap-1 text-sm font-bold hover:gap-2 transition-all mt-3"
                style={{ color: GOLD, fontFamily: FONT_SANS }}
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
              {combos.map((c) => {
                const isColorPack = c.type === 'color-pack';
                const cheapestPack = isColorPack && c.packOptions?.length
                  ? c.packOptions.reduce((min, p) => (p.price < min.price ? p : min), c.packOptions[0])
                  : null;

                const cover = c.images?.[0] || c.image;

                const displayPrice = isColorPack ? cheapestPack?.price ?? 0 : c.comboPrice;
                const displayOriginal = isColorPack ? cheapestPack?.originalPrice ?? 0 : c.originalPrice;
                const savings = displayOriginal > displayPrice ? displayOriginal - displayPrice : 0;
                const pct = displayOriginal > 0 ? Math.round((savings / displayOriginal) * 100) : 0;

                return (
                  <Link
                    key={c._id}
                    href={`/combo/${c.slug}`}
                    className="group relative overflow-hidden transition-colors"
                    style={{ background: WHITE, border: `1px solid ${GOLD}` }}
                  >
                    <div className="relative w-full aspect-square overflow-hidden" style={{ background: CREAM }}>
                      {cover ? (
                        <img
                          src={resizeImage(cover, 450)}
                          srcSet={buildSrcSet(cover, COMBO_WIDTHS)}
                          sizes={COMBO_SIZES}
                          alt={c.name}
                          width={450}
                          height={450}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full" style={{ background: GOLD_WASH }} />
                      )}
                      {pct > 0 && (
                        <div
                          className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1"
                          style={{ color: NAVY_DEEP, background: GOLD, fontFamily: FONT_SANS }}
                        >
                          <Tag size={9} /> {pct}% off
                        </div>
                      )}
                      {isColorPack && (
                        <div
                          className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5"
                          style={{ background: NAVY, color: WHITE }}
                        >
                          Color Pack
                        </div>
                      )}
                    </div>

                    <div className="p-3" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
                      <p
                        className="text-[13px] font-bold tracking-wide line-clamp-1"
                        style={{ color: INK, fontFamily: FONT_SANS }}
                      >
                        {c.name}
                      </p>
                      <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="font-bold text-sm" style={{ color: INK, fontFamily: FONT_SANS }}>
                          {isColorPack && 'From '}{formatINR(displayPrice)}
                        </span>
                        {savings > 0 && (
                          <span
                            className="text-[11px] line-through font-light"
                            style={{ color: INK_SOFT, fontFamily: FONT_SANS }}
                          >
                            {formatINR(displayOriginal)}
                          </span>
                        )}
                      </div>
                      {savings > 0 && (
                        <p
                          className="text-[10.5px] font-bold mt-1 tracking-wide uppercase"
                          style={{ color: GOLD, fontFamily: FONT_SANS }}
                        >
                          Save {formatINR(savings)}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/combos" className="text-sm font-bold" style={{ color: GOLD, fontFamily: FONT_SANS }}>
                View all combos →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <ReviewSection reviews={reviews} />

    </div>
  );
}