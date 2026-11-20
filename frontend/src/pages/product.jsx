import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useShop } from '../context/use-shop.js';
import { resolveProductImage } from '../utils/image-helper.js';
import { getDiscountPercentage, getSellingPrice } from '../utils/pricing.js';

export default function Product() {
  const [searchParams] = useSearchParams();
  const { products } = useShop();
  const idParam = searchParams.get('id');

  const product = products.find(
    (item) => String(item.id) === idParam || String(item._id) === idParam
  );

  if (!product) {
    return (
      <section className="py-20 text-center">
        <div className="mx-auto max-w-md rounded-3xl bg-white/70 border border-[#D49A9A]/60 p-10 shadow-sm">
          <p className="text-xl font-bold text-[#381E29]">That product could not be found.</p>
          <Link
            to="/collection"
            className="mt-6 inline-block bg-[#7C0E44] px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-[#630A36] transition-colors"
          >
            Back to collection
          </Link>
        </div>
      </section>
    );
  }

  return <ProductDetails key={product.id || product._id} product={product} />;
}

function ProductDetails({ product }) {
  const { addToCart } = useShop();
  const [size, setSize] = useState(product.category === 'Clothing' ? '' : 'One size');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const sizes = product.category === 'Clothing' ? ['S', 'M', 'L', 'XL'] : ['One size'];
  const sellingPrice = getSellingPrice(product);
  const discountPercentage = getDiscountPercentage(product);

  const handleAdd = () => {
    const selectedSize = product.category === 'Clothing' ? size : size || 'One size';
    if (product.category === 'Clothing' && !selectedSize) return;
    addToCart(product, selectedSize, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <section className="py-4 sm:py-8">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#AA5E7A]">
        <Link to="/" className="hover:text-[#7C0E44] transition-colors">Home</Link>
        <span>/</span>
        <Link to="/collection" className="hover:text-[#7C0E44] transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-[#381E29]">{product.name}</span>
      </div>

      {/* Main Product Grid (Desktop View) */}
      <div className="grid gap-10 md:grid-cols-2 lg:gap-16 items-start">
        {/* Product Image with Rounded Corners and Soft Glow */}
        <div className="rounded-3xl overflow-hidden bg-white/75 p-6 border border-[#D49A9A]/60 shadow-lg">
          <div className="overflow-hidden rounded-2xl bg-[#F2DACE]/50 aspect-[4/5] flex items-center justify-center">
            <img
              src={resolveProductImage(product.image)}
              alt={product.name}
              className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col items-start py-2 sm:py-4">
          <span className="inline-block bg-[#AA5E7A]/20 text-[#7C0E44] font-bold text-xs uppercase tracking-[0.18em] px-3.5 py-1.5 rounded-full border border-[#AA5E7A]/30">
            {product.category}
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#381E29]">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#7C0E44]">
            ₹{sellingPrice.toLocaleString('en-IN')}
          </p>
          {discountPercentage > 0 && (
            <p className="mt-1 text-sm font-semibold text-[#8F707D]">
              <span className="line-through">₹{Number(product.price).toLocaleString('en-IN')}</span>
              <span className="ml-2 text-[#7C0E44]">{discountPercentage}% off</span>
            </p>
          )}

          <div className="my-6 h-px w-full bg-[#D49A9A]/40" />

          <p className="text-sm sm:text-base leading-7 text-[#4A2033] font-medium">
            {product.description}
          </p>

          {/* Size Selector with Rounded Pills */}
          <div className="mt-8 w-full">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#7C0E44]">
              {product.category === 'Clothing' ? 'Select size' : 'Size'}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {sizes.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setSize(item)}
                  aria-pressed={size === item}
                  className={`min-w-12 rounded-xl border px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    size === item
                      ? 'border-[#AA5E7A] bg-[#AA5E7A] text-white shadow-xs'
                      : 'border-[#D49A9A] bg-white/70 text-[#381E29] hover:border-[#7C0E44]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mt-6 flex flex-col gap-2">
            <label htmlFor="product-quantity" className="text-xs font-bold uppercase tracking-[0.16em] text-[#7C0E44]">
              Quantity
            </label>
            <input
              id="product-quantity"
              type="number"
              min="1"
              max="99"
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Math.min(99, Number(event.target.value) || 1)))}
              className="w-24 rounded-xl border border-[#D49A9A] bg-white/95 px-3 py-2 text-center text-sm font-bold text-[#381E29] outline-none focus:border-[#7C0E44]"
            />
          </div>

          {/* Add to Bag Button (Theme Button #7C0E44) */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={product.category === 'Clothing' && !size}
            className="mt-8 w-full sm:w-auto sm:min-w-64 rounded-xl bg-[#7C0E44] px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md hover:bg-[#630A36] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:cursor-not-allowed disabled:bg-[#AA5E7A]/40"
          >
            Add to bag
          </button>

          {/* Notification Toast Status */}
          {added && (
            <div className="mt-4 rounded-xl bg-[#AA5E7A]/20 border border-[#AA5E7A] px-4 py-2 text-sm font-semibold text-[#7C0E44] flex items-center gap-2 animate-fadeIn" role="status">
              <span>✓</span> Added to your shopping bag!
            </div>
          )}

          {/* Assurance Highlights */}
          <div className="mt-10 w-full rounded-2xl bg-white/60 border border-[#D49A9A]/60 p-5 text-sm text-[#5E2F44] space-y-2">
            <p className="flex items-center gap-2 font-semibold text-[#7C0E44]">
              <span>🚚</span> Free shipping on orders over ₹1,499.
            </p>
            <p className="flex items-center gap-2">
              <span>✨</span> Thoughtfully packaged and handled with care.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
