import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Fraunces, Inter } from 'next/font/google';
import { dbConnect } from '@/lib/mongodb';
import Category from '@/models/Category';
import Settings from '@/models/Settings';
import FooterLinks from './FooterLinks';

const display = Fraunces({ subsets: ['latin'], weight: ['400'], variable: '--font-display' });
const body = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-body' });

// Palette: 60% white/cream · 25% navy · 10% gold · 5% pale gold
// Keep in sync with Navbar, CouponMarquee and FooterLinks.
const CREAM = '#F8F6EF';
const NAVY = '#102A56';
const NAVY_DARK = '#071A3A';
const GOLD = '#C9A227';
const GOLD_PALE = '#E6D39A';

const INK = NAVY_DARK;
const INK_SOFT = 'rgba(16, 42, 86, 0.70)';

// Used until the admin saves footer settings for the first time.
const DEFAULT_QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Bulk Order Enquiry', href: '/bulk-enquiry' },
];
const DEFAULT_ADDRESS = '92, SRP Mills, Sathy Road,\nSaravanampatti,\nCoimbatore, Tamil Nadu 641035';

// Always shown in the bottom bar, independent of the admin-editable quick links.
const POLICY_LINKS = [
  { label: 'Shipping Policy', href: '/shipping-policy' },
  { label: 'Return & Exchange Policy', href: '/return-policy' },
];

async function getFooterData() {
  await dbConnect();
  const [categories, settings] = await Promise.all([
    Category.find({}).select('name slug').lean(),
    Settings.findOne({ key: 'global' }).lean(),
  ]);
  return JSON.parse(JSON.stringify({ categories, settings: settings || {} }));
}

// Accepts "handle", "@handle" or a full URL.
function toInstagramUrl(value, fallback) {
  const v = (value || '').trim();
  if (!v) return fallback;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://www.instagram.com/${v.replace(/^@/, '')}`;
}

export default async function Footer() {
  const { categories, settings: s } = await getFooterData();

  const storeName = s.storeName?.trim() || 'Sri Vilvah';
  const tagline = s.footerTagline ?? 'by Chitra S';
  const note = s.footerNote ?? 'Online sales only';
  const addressLines = (s.address ?? DEFAULT_ADDRESS)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const whatsapp = (s.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP || '919976449441').replace(/\D/g, '');
  const phoneDisplay = s.phoneDisplay?.trim() || `+${whatsapp}`;
  const email = (s.email ?? 'vilvahclothing@gmail.com').trim();
  const instagram = toInstagramUrl(
    s.instagram,
    process.env.NEXT_PUBLIC_INSTAGRAM || 'https://www.instagram.com/vilvahclothings'
  );
  const quickLinks = Array.isArray(s.quickLinks) ? s.quickLinks : DEFAULT_QUICK_LINKS;

  return (
    <footer
      className={`${body.className} mt-16`}
      style={{ background: CREAM, borderTop: `2px solid ${GOLD}` }}
    >
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-12 gap-10 sm:gap-8">

        {/* Brand column */}
        <div className="sm:col-span-4">
          <h3 className={`${display.className} text-2xl leading-tight`} style={{ color: INK, fontWeight: 400 }}>
            {storeName}
          </h3>
          {tagline && (
            <p className="text-[11px] font-medium tracking-wide mb-4" style={{ color: NAVY }}>
              {tagline}
            </p>
          )}

          {addressLines.length > 0 && (
            <p className="flex items-start gap-1.5 text-xs leading-relaxed" style={{ color: INK_SOFT }}>
              <MapPin size={13} className="shrink-0 mt-0.5" style={{ color: GOLD }} />
              <span>
                {addressLines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < addressLines.length - 1 && <br />}
                  </span>
                ))}
              </span>
            </p>
          )}

          {note && (
            <p className="inline-flex items-center gap-1.5 mt-4 text-[11px] font-normal tracking-wide" style={{ color: INK_SOFT }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
              {note}
            </p>
          )}
        </div>

        {/* Shop / Quick Links / Connect — accordion on mobile, columns on desktop */}
        <FooterLinks
          categories={categories}
          quickLinks={quickLinks}
          whatsapp={whatsapp}
          phoneDisplay={phoneDisplay}
          email={email}
          instagram={instagram}
        />
      </div>

      {/* Bottom bar — navy, bookends the coupon marquee */}
      <div style={{ background: NAVY_DARK, borderTop: `1px solid ${GOLD}` }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col lg:flex-row items-center justify-between gap-3">
          <p className="text-[11px]" style={{ color: GOLD_PALE }}>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>

          {/* Policy links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {POLICY_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[11px] transition-opacity hover:opacity-75"
                style={{ color: GOLD_PALE }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <a
            href="https://www.nexirasolution.in"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[11px] transition-opacity hover:opacity-75"
            style={{ color: GOLD_PALE }}
          >
            Designed and developed by
            <span className="font-medium text-[11px] tracking-wide" style={{ color: GOLD }}>
              Nexira Solution
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}