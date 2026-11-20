import { Link } from 'react-router-dom';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#D49A9A] border-t border-[#AA5E7A]/30 text-[#381E29] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Link to="/" className="text-2xl font-bold tracking-[0.18em] text-[#381E29] inline-block hover:opacity-90">
              FASTBUY
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#4A2033]">
              Everyday essentials, thoughtfully picked. Find the pieces you’ll reach for again and again.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 bg-white/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#7C0E44] border border-[#AA5E7A]/25 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-[#AA5E7A] animate-pulse" />
                Thoughtful lifestyle goods
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C0E44]">Explore</h3>
            <div className="mt-4 flex flex-col gap-2.5 text-sm font-medium text-[#4A2033]">
              <Link to="/collection" className="hover:text-[#7C0E44] transition-colors hover:translate-x-1 duration-200 inline-block">
                Shop all products
              </Link>
              <Link to="/about" className="hover:text-[#7C0E44] transition-colors hover:translate-x-1 duration-200 inline-block">
                Our story
              </Link>
              <Link to="/contact" className="hover:text-[#7C0E44] transition-colors hover:translate-x-1 duration-200 inline-block">
                Contact & Support
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C0E44]">Your account</h3>
            <div className="mt-4 flex flex-col gap-2.5 text-sm font-medium text-[#4A2033]">
              <Link to="/login" className="hover:text-[#7C0E44] transition-colors hover:translate-x-1 duration-200 inline-block">
                Sign in / Register
              </Link>
              <Link to="/orders" className="hover:text-[#7C0E44] transition-colors hover:translate-x-1 duration-200 inline-block">
                Track an order
              </Link>
              <Link to="/cart" className="hover:text-[#7C0E44] transition-colors hover:translate-x-1 duration-200 inline-block">
                Shopping bag
              </Link>
              <Link to="/admin" className="text-[#7C0E44] font-semibold hover:underline transition-colors hover:translate-x-1 duration-200 inline-block">
                ⚙️ Admin Panel
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-[#AA5E7A]/25 pt-6 text-xs text-[#5E2F44] gap-4">
          <p>© {currentYear} Fastbuy. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-[#7C0E44] transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-[#7C0E44] transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-[#7C0E44] transition-colors">Customer Care</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
