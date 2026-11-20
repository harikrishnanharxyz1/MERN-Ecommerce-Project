import { Link } from 'react-router-dom';
import { assets } from '../assets/assets.js';
import ProductCard from '../components/product-card.jsx';
import SectionTitle from '../components/section-title.jsx';
import { useShop } from '../context/use-shop.js';

export default function Home() {
  const { products } = useShop();
  const bestsellers = products.filter((product) => product.bestseller).slice(0, 4);

  return (
    <div className="space-y-14 sm:space-y-18">
      {/* Hero Banner with Rounded Corners & Gliding Visuals */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#DFABA5] to-[#D49A9A] border border-[#AA5E7A]/30 shadow-lg min-h-[460px] sm:min-h-[520px] grid lg:grid-cols-2 items-center">
        <div className="flex flex-col items-start justify-center p-8 sm:p-12 lg:p-16 z-10">
          <span className="mb-4 inline-flex items-center gap-2 bg-[#AA5E7A] text-white px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xs">
            Curated Essentials
          </span>
          <h1 className="max-w-lg text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-[#381E29]">
            The little things that make a big difference.
          </h1>
          <p className="mt-5 max-w-md text-sm sm:text-base leading-relaxed text-[#4A2033] font-medium">
            Thoughtful everyday essentials, crafted to elevate your daily routine with style and timeless simplicity.
          </p>
          <Link
            to="/collection"
            className="mt-8 inline-flex items-center gap-3 bg-[#7C0E44] text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-[0.16em] shadow-md hover:bg-[#630A36] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            Shop the collection <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="group h-full min-h-[280px] lg:min-h-[520px] overflow-hidden p-4 lg:p-6 flex items-center justify-center">
          <div className="h-full w-full overflow-hidden rounded-2xl shadow-md bg-white/20">
            <img
              src={assets.decoration1}
              alt="Soft white fabric with a flowing, sculptural texture"
              fetchPriority="high"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* Bestsellers Showcase */}
      <section className="py-4 sm:py-6">
        <SectionTitle
          eyebrow="Loved by you"
          title="Shop our bestsellers"
          description="Everyday favorites that never stay on the shelf for long."
        />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {bestsellers.map((product) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/collection"
            className="inline-block bg-[#7C0E44] text-white hover:bg-[#630A36] px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.16em] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            Explore all products
          </Link>
        </div>
      </section>

      {/* 3 Core Value Cards */}
      <section className="grid gap-6 sm:grid-cols-3">
        {[
          ['01', 'Made for everyday', 'Simple, useful pieces you’ll keep reaching for day after day.'],
          ['02', 'Picked with care', 'A considered edit of quality goods truly worth bringing into your home.'],
          ['03', 'Seamless from start to finish', 'Fast, dependable ordering with a thoughtful shopping experience.'],
        ].map(([number, title, copy]) => (
          <div
            key={number}
            className="rounded-2xl bg-white/75 backdrop-blur-sm border border-[#D49A9A]/60 p-6 sm:p-7 shadow-sm hover:-translate-y-1.5 hover:shadow-md hover:border-[#AA5E7A] transition-all duration-300 flex flex-col items-start gap-4"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#AA5E7A]/20 font-bold text-xs text-[#7C0E44]">
              {number}
            </span>
            <div>
              <h3 className="text-base font-bold text-[#381E29]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5E2F44]">{copy}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
