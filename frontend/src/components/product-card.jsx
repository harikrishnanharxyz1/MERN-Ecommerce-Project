import { Link } from 'react-router-dom';
import { resolveProductImage } from '../utils/image-helper.js';
import { getDiscountPercentage, getSellingPrice } from '../utils/pricing.js';

export default function ProductCard({ product }) {
  const productId = product.id !== undefined ? product.id : product._id;
  const sellingPrice = getSellingPrice(product);
  const discountPercentage = getDiscountPercentage(product);

  return (
    <Link
      to={`/product?id=${productId}`}
      className="group block rounded-2xl bg-white/75 p-3.5 sm:p-4 border border-[#D49A9A]/50 shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:bg-white hover:border-[#AA5E7A]"
      aria-label={`View ${product.name}`}
    >
      <div className="relative overflow-hidden rounded-xl bg-[#F2DACE]/60 aspect-[4/5] flex items-center justify-center">
        <img
          src={resolveProductImage(product.image)}
          alt={product.name}
          loading="lazy"
          className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />
        {product.bestseller && (
          <span className="absolute left-3 top-3 bg-[#AA5E7A] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] rounded-full shadow-sm">
            Bestseller
          </span>
        )}
        {discountPercentage > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#7C0E44] shadow-sm">
            {discountPercentage}% OFF
          </span>
        )}
      </div>

      <div className="mt-3.5 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#381E29] group-hover:text-[#7C0E44] transition-colors truncate">
            {product.name}
          </p>
          <p className="mt-1 text-xs font-medium text-[#AA5E7A]">{product.category}</p>
        </div>
        <div className="whitespace-nowrap text-right">
          <p className="text-sm font-bold text-[#7C0E44]">₹{sellingPrice.toLocaleString('en-IN')}</p>
          {discountPercentage > 0 && (
            <p className="text-[11px] text-[#8F707D] line-through">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
