import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useShop } from '../context/use-shop.js';

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/collection' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const { cartCount, user } = useShop();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 ${
      isActive
        ? 'bg-[#AA5E7A] text-white shadow-sm'
        : 'text-[#381E29] hover:bg-white/40 hover:text-[#7C0E44]'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[#D49A9A] border-b border-[#AA5E7A]/30 shadow-sm backdrop-blur-md bg-[#D49A9A]/95 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/40 text-[#381E29] md:hidden hover:bg-white/60 transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="text-xl leading-none">{menuOpen ? '✕' : '☰'}</span>
          </button>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group" aria-label="Fastbuy home">
            <div className="h-11 w-11 rounded-2xl bg-white/80 p-2 shadow-xs transition-transform duration-300 group-hover:scale-105 flex items-center justify-center">
              <img src="/fastbuy-logo.svg" alt="" className="h-full w-full object-contain" />
            </div>
            <span className="flex flex-col items-start">
              <span className="text-lg font-bold leading-none tracking-[0.16em] text-[#381E29]">
                FASTBUY
              </span>
              <span className="mt-1 text-[9px] uppercase leading-none tracking-[0.22em] text-[#AA5E7A] font-semibold">
                Everyday goods
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 md:flex bg-white/30 p-1.5 rounded-full border border-white/40 shadow-xs" aria-label="Main navigation">
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Action buttons (Account & Cart) */}
          <div className="flex items-center gap-2.5">
            {/* Account Link */}
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#381E29] bg-white/50 hover:bg-white px-4 py-2.5 rounded-full border border-[#AA5E7A]/30 transition-all duration-200 hover:shadow-xs hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 text-[#7C0E44]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{user ? user.name.split(' ')[0] : 'Account'}</span>
            </Link>

            {/* Bag / Cart Link */}
            <Link
              to="/cart"
              className="relative inline-flex items-center gap-2 bg-[#7C0E44] text-white px-4 py-2.5 rounded-full shadow-sm hover:bg-[#630A36] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              aria-label={`Shopping bag, ${cartCount} items`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 8h14l1 13H4L5 8Z" />
                <path d="M9 9V6a3 3 0 0 1 6 0v3" />
              </svg>
              <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">Bag</span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#AA5E7A] px-1.5 text-[11px] font-bold text-white shadow-xs">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <nav className="flex flex-col gap-2 rounded-2xl bg-[#D49A9A] p-4 pb-6 md:hidden border border-[#AA5E7A]/40 shadow-xl mt-2 mb-4" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/login"
              className="text-sm font-medium text-[#381E29] bg-white/50 px-4 py-2.5 rounded-full text-center hover:bg-white"
              onClick={() => setMenuOpen(false)}
            >
              {user ? `Account (${user.name})` : 'Account'}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
