import { useMemo, useState } from 'react';
import ProductCard from '../components/product-card.jsx';
import SectionTitle from '../components/section-title.jsx';
import { useShop } from '../context/use-shop.js';
import { getSellingPrice } from '../utils/pricing.js';

export default function Collection() {
  const { products } = useShop();
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [search, setSearch] = useState('');

  const categories = useMemo(() => {
    return ['All', ...new Set(products.map((product) => product.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === 'All' || product.category === category;
      const matchesSearch = product.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
    if (sort === 'price-low') return [...filtered].sort((a, b) => getSellingPrice(a) - getSellingPrice(b));
    if (sort === 'price-high') return [...filtered].sort((a, b) => getSellingPrice(b) - getSellingPrice(a));
    if (sort === 'newest') return [...filtered].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return filtered;
  }, [category, products, search, sort]);

  return (
    <section className="py-4 sm:py-8">
      <SectionTitle
        eyebrow="The Fastbuy Edit"
        title="Shop the collection"
        description="Find something you’ll love, crafted for wherever the day takes you."
      />

      {/* Filter and Search Bar Controls */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-[#D49A9A]/50 p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex flex-wrap gap-2" aria-label="Filter by category">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                category === item
                  ? 'bg-[#AA5E7A] text-white shadow-xs'
                  : 'bg-white/80 border border-[#D49A9A] text-[#4A2033] hover:bg-[#D49A9A]/40'
              }`}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row items-stretch sm:items-center">
          <label className="sr-only" htmlFor="product-search">Search products</label>
          <input
            id="product-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="rounded-full border border-[#D49A9A] bg-white/95 px-4 py-2 text-sm text-[#381E29] outline-none transition-all focus:border-[#7C0E44] focus:ring-2 focus:ring-[#AA5E7A]/25 sm:w-56"
          />
          <label className="sr-only" htmlFor="sort-products">Sort products</label>
          <select
            id="sort-products"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-full border border-[#D49A9A] bg-white/95 px-4 py-2 text-sm text-[#381E29] outline-none transition-all focus:border-[#7C0E44]"
          >
            <option value="featured">Sort: Featured</option>
            <option value="newest">Sort: Newest</option>
            <option value="price-low">Price: Low to high</option>
            <option value="price-high">Price: High to low</option>
          </select>
        </div>
      </div>

      <p className="mb-6 text-xs font-bold uppercase tracking-wider text-[#AA5E7A]">
        {filteredProducts.length} {filteredProducts.length === 1 ? 'item available' : 'items available'}
      </p>

      {filteredProducts.length ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white/70 border border-[#D49A9A]/60 p-16 text-center shadow-sm">
          <p className="text-xl font-bold text-[#381E29]">No products found</p>
          <p className="mt-2 text-sm text-[#6E4154]">Try adjusting your search terms or selecting another category.</p>
          <button
            type="button"
            onClick={() => {
              setCategory('All');
              setSearch('');
            }}
            className="mt-6 inline-block bg-[#7C0E44] text-white px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#630A36] transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
