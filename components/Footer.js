import { MapPin } from 'lucide-react';
import { Fraunces, Inter } from 'next/font/google';
import { dbConnect } from '@/lib/mongodb';
import Category from '@/models/Category';
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

async function getCategories() {
  await dbConnect();
  const categories = await Category.find({}).select('name slug').lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || '919976449441';
  const phoneDisplay = '+91 99764 49441';
  const email = 'vilvahclothing@gmail.com';
  const instagram =
    process.env.NEXT_PUBLIC_INSTAGRAM ||
    'https://www.instagram.com/vilvahclothings';
  const categories = await getCategories();

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Bulk Order Enquiry', href: '/bulk-enquiry' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <footer
      className={`${body.className} mt-16`}
      style={{ background: CREAM, borderTop: `2px solid ${GOLD}` }}
    >
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-12 gap-10 sm:gap-8">

        {/* Brand column */}
        <div className="sm:col-span-4">
          <h3 className={`${display.className} text-2xl leading-tight`} style={{ color: INK, fontWeight: 400 }}>
            Sri Vilvah
          </h3>
          <p className="text-[11px] font-medium tracking-wide mb-4" style={{ color: NAVY }}>
            by Chitra S
          </p>

          <p className="flex items-start gap-1.5 text-xs leading-relaxed" style={{ color: INK_SOFT }}>
            <MapPin size={13} className="shrink-0 mt-0.5" style={{ color: GOLD }} />
            <span>
              92, SRP Mills, Sathy Road,<br />
              Saravanampatti,<br />
              Coimbatore, Tamil Nadu 641035
            </span>
          </p>

          <p className="inline-flex items-center gap-1.5 mt-4 text-[11px] font-normal tracking-wide" style={{ color: INK_SOFT }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
            Online sales only
          </p>
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px]" style={{ color: GOLD_PALE }}>
            © {new Date().getFullYear()} Sri Vilvah. All rights reserved.
          </p>

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