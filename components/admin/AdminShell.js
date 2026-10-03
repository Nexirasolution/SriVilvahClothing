'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ListTree, ShoppingCart, Boxes, Image as ImageIcon,
  Clapperboard, Star, Ticket, Layers, FileBarChart, Settings as SettingsIcon, Menu, X, LogOut
} from 'lucide-react';

// Palette: 60% white/cream · 25% navy · 10% gold · 5% pale gold
// Keep in sync with the storefront components.
const CREAM = '#F8F6EF';
const NAVY = '#102A56';
const NAVY_DARK = '#071A3A';
const GOLD = '#C9A227';
const GOLD_PALE = '#E6D39A';
const WHITE = '#FFFFFF';

// Sidebar (dark) tokens
const SIDE_BG = NAVY_DARK;
const SIDE_TEXT = 'rgba(230, 211, 154, 0.75)'; // muted pale gold
const SIDE_LINE = 'rgba(230, 211, 154, 0.18)';
const SIDE_HOVER = 'rgba(230, 211, 154, 0.10)';

// Light-area tokens
const INK = NAVY_DARK;

const NAV = [
  { href: '/admin',            label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/products',   label: 'Products',      icon: Package },
  { href: '/admin/categories', label: 'Categories',    icon: ListTree },
  { href: '/admin/orders',     label: 'Orders',        icon: ShoppingCart },
  { href: '/admin/inventory',  label: 'Inventory',     icon: Boxes },
  // { href: '/admin/combos',     label: 'Combo Offers',  icon: Layers },
  { href: '/admin/banners',    label: 'Banners',       icon: ImageIcon },
  // { href: '/admin/reels',      label: 'Shop by Reels', icon: Clapperboard },
  // { href: '/admin/reviews',    label: 'Reviews',       icon: Star },
  // { href: '/admin/coupons',    label: 'Coupons',       icon: Ticket },
  // { href: '/admin/reports',    label: 'Sales Reports', icon: FileBarChart },
  { href: '/admin/settings',   label: 'Settings',      icon: SettingsIcon },
];

export default function AdminShell({ admin, children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen flex" style={{ background: CREAM }}>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(7, 26, 58, 0.5)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 inset-y-0 left-0 w-64 transform transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: SIDE_BG,
          borderRight: `1px solid ${GOLD}`,
        }}
      >
        {/* Sidebar header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${SIDE_LINE}` }}
        >
          <div className="flex flex-col leading-tight">
            <span className="font-medium text-base" style={{ color: GOLD_PALE }}>
              Sri Vilvah Clothings
            </span>
            <span
              className="text-[10px] tracking-widest uppercase mt-0.5"
              style={{ color: GOLD }}
            >
              Admin Panel
            </span>
          </div>
          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
            style={{ color: GOLD_PALE }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="p-3 space-y-0.5 overflow-y-auto h-[calc(100vh-65px)]">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors"
                style={{
                  borderRadius: '4px',
                  background: active ? NAVY : 'transparent',
                  color: active ? GOLD_PALE : SIDE_TEXT,
                  borderLeft: `3px solid ${active ? GOLD : 'transparent'}`,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = SIDE_HOVER;
                    e.currentTarget.style.color = GOLD_PALE;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = SIDE_TEXT;
                  }
                }}
              >
                <Icon size={17} style={{ color: active ? GOLD : 'inherit' }} />
                {label}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-3" style={{ height: '1px', background: SIDE_LINE }} />

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium w-full transition-colors"
            style={{ borderRadius: '4px', color: SIDE_TEXT, borderLeft: '3px solid transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = SIDE_HOVER;
              e.currentTarget.style.color = GOLD_PALE;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = SIDE_TEXT;
            }}
          >
            <LogOut size={17} /> Logout
          </button>
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 min-w-0">
        {/* Mobile topbar */}
        <header
          className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
          style={{
            background: WHITE,
            borderBottom: `2px solid ${GOLD}`,
          }}
        >
          <button onClick={() => setOpen(true)} style={{ color: INK }} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <span className="font-medium text-base" style={{ color: INK }}>
            Sri Vilvah Clothings Admin
          </span>
        </header>

        <main className="p-4 sm:p-6 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}