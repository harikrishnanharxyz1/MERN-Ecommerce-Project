import { Link } from 'react-router-dom';
import SectionTitle from '../components/section-title.jsx';
import { useShop } from '../context/use-shop.js';
import { resolveProductImage } from '../utils/image-helper.js';
import { getSellingPrice } from '../utils/pricing.js';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, productsById } = useShop();
  const subtotal = cart.reduce((sum, item) => {
    const product = productsById.get(item.productId);
    return sum + (product ? getSellingPrice(product) * item.quantity : 0);
  }, 0);
  const shipping = subtotal === 0 || subtotal >= 1500 ? 0 : 99;

  if (!cart.length) {
    return (
      <section className="py-16 sm:py-20 text-center">
        <div className="mx-auto max-w-lg rounded-3xl bg-white/70 border border-[#D49A9A]/60 p-10 sm:p-14 shadow-sm">
          <SectionTitle
            centered
            eyebrow="Your Bag"
            title="Your bag is looking a little light"
            description="Find something you love and it will be waiting here."
          />
          <Link
            to="/collection"
            className="mt-6 inline-block bg-[#7C0E44] text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.16em] shadow-md hover:bg-[#630A36] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            Continue shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 sm:py-8">
      <SectionTitle
        eyebrow="Almost yours"
        title="Your shopping bag"
        description={`${cart.reduce((sum, item) => sum + item.quantity, 0)} items in your bag`}
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_360px] items-start">
        {/* Cart Item List */}
        <div className="rounded-3xl bg-white/75 border border-[#D49A9A]/60 p-6 sm:p-8 shadow-sm">
          <div className="hidden grid-cols-[1fr_120px_100px_36px] gap-4 border-b border-[#D49A9A]/40 pb-4 text-xs font-bold uppercase tracking-[0.14em] text-[#AA5E7A] sm:grid">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span />
          </div>

          <div className="divide-y divide-[#D49A9A]/30">
            {cart.map((item) => {
              const product = productsById.get(item.productId);
              if (!product) return null;
              const prodId = product.id !== undefined ? product.id : product._id;

              return (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="grid grid-cols-[84px_1fr_auto] items-center gap-4 py-5 sm:grid-cols-[100px_1fr_120px_100px_36px]"
                >
                  <Link
                    to={`/product?id=${prodId}`}
                    className="overflow-hidden rounded-xl bg-[#F2DACE]/60 p-1.5 border border-[#D49A9A]/40"
                  >
                    <img
                      src={resolveProductImage(product.image)}
                      alt={product.name}
                      className="aspect-[4/5] w-full object-cover rounded-lg"
                    />
                  </Link>

                  <div>
                    <Link
                      to={`/product?id=${prodId}`}
                      className="text-sm font-bold text-[#381E29] hover:text-[#7C0E44] transition-colors"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs font-semibold text-[#AA5E7A]">Size: {item.size}</p>
                    <p className="mt-2 text-sm font-bold text-[#7C0E44] sm:hidden">
                      ₹{getSellingPrice(product).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <p className="hidden text-sm font-bold text-[#7C0E44] sm:block">
                    ₹{getSellingPrice(product).toLocaleString('en-IN')}
                  </p>

                  <label className="sr-only" htmlFor={`quantity-${item.productId}-${item.size}`}>
                    Quantity for {product.name}
                  </label>
                  <input
                    id={`quantity-${item.productId}-${item.size}`}
                    type="number"
                    min="1"
                    max="99"
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(
                        item.productId,
                        item.size,
                        Math.max(1, Math.min(99, Number(event.target.value) || 1))
                      )
                    }
                    className="w-16 rounded-xl border border-[#D49A9A] bg-white px-2 py-1.5 text-center text-sm font-bold text-[#381E29] outline-none focus:border-[#7C0E44]"
                  />

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId, item.size)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-[#AA5E7A] hover:bg-[#AA5E7A]/20 hover:text-[#7C0E44] transition-colors"
                    aria-label={`Remove ${product.name} from bag`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-[#D49A9A]/30">
            <Link
              to="/collection"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7C0E44] hover:underline"
            >
              ← Continue shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Aside */}
        <aside className="rounded-3xl bg-white/80 border border-[#D49A9A] p-6 sm:p-8 shadow-md">
          <h2 className="text-xl font-bold text-[#381E29]">Order summary</h2>
          <div className="mt-6 space-y-4 text-sm font-medium">
            <div className="flex justify-between text-[#5E2F44]">
              <span>Subtotal</span>
              <span className="font-bold text-[#381E29]">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#5E2F44]">
              <span>Estimated shipping</span>
              <span className="font-bold text-[#381E29]">{shipping ? `₹${shipping}` : 'Free'}</span>
            </div>
            <div className="border-t border-[#D49A9A]/50 pt-4">
              <div className="flex justify-between text-base font-extrabold text-[#381E29]">
                <span>Total</span>
                <span className="text-[#7C0E44]">₹{(subtotal + shipping).toLocaleString('en-IN')}</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#5E2F44] bg-[#AA5E7A]/15 p-3 rounded-xl border border-[#AA5E7A]/25">
                {subtotal < 1500
                  ? `Add ₹${(1500 - subtotal).toLocaleString('en-IN')} more to unlock FREE shipping.`
                  : '🎉 You have qualified for FREE shipping!'}
              </p>
            </div>
          </div>

          <Link
            to="/placeorder"
            className="mt-8 block w-full rounded-xl bg-[#7C0E44] py-4 text-center text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md hover:bg-[#630A36] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Continue to checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}
