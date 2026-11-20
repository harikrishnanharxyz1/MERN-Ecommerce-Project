import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SectionTitle from '../components/section-title.jsx';
import { useShop } from '../context/use-shop.js';
import { api } from '../api/api.js';
import { getSellingPrice } from '../utils/pricing.js';

export default function PlaceOrder() {
  const { cart, createOrder, productsById, user } = useShop();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [activeOffers, setActiveOffers] = useState([]);

  const subtotal = cart.reduce((sum, item) => {
    const product = productsById.get(item.productId);
    return sum + (product ? getSellingPrice(product) * item.quantity : 0);
  }, 0);
  const shipping = subtotal === 0 || subtotal >= 1500 ? 0 : 99;

  useEffect(() => {
    let active = true;
    api.getActiveOffers().then((offers) => {
      if (active && Array.isArray(offers)) setActiveOffers(offers);
    }).catch((error) => {
      console.warn('Could not load active offers:', error.message);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!cart.length) {
    return (
      <section className="py-20 text-center">
        <div className="mx-auto max-w-md rounded-3xl bg-white/75 border border-[#D49A9A]/60 p-10 shadow-sm">
          <SectionTitle
            centered
            title="Nothing to check out yet"
            description="Add a few favorites to your bag and come back here."
          />
          <div className="mt-6">
            <Link
              to="/collection"
              className="inline-block bg-[#7C0E44] text-white px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#630A36] transition-colors"
            >
              Shop the collection
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const formData = new FormData(event.currentTarget);
      const customer = Object.fromEntries(formData.entries());
      const order = await createOrder(customer, coupon?.code || '');
      const orderId = order.id || order._id;
      navigate(`/orders?placed=${encodeURIComponent(orderId)}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
      setSubmitting(false);
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCoupon(null);
    if (!couponCode.trim()) {
      setCouponError('Enter a coupon code.');
      return;
    }
    try {
      setCouponLoading(true);
      const result = await api.validateCoupon(couponCode, subtotal);
      setCoupon(result);
    } catch (err) {
      setCouponError(err.message || 'Could not apply this coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  const nameParts = user && user.name ? user.name.split(' ') : ['', ''];
  const defaultFirstName = nameParts[0] || '';
  const defaultLastName = nameParts.slice(1).join(' ') || '';

  return (
    <section className="py-4 sm:py-8">
      <SectionTitle
        eyebrow="One last step"
        title="Checkout"
        description="Add your delivery details to place your order with Fastbuy."
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_380px] items-start">
        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl bg-white/80 border border-[#D49A9A]/60 p-6 sm:p-10 shadow-md">
          <fieldset>
            <legend className="mb-5 text-base font-bold text-[#7C0E44] flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#AA5E7A] text-white text-xs">1</span>
              Contact details
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field-label sm:col-span-2">
                Email address
                <input
                  required
                  type="email"
                  name="email"
                  defaultValue={user ? user.email : ''}
                  autoComplete="email"
                  className="field-input"
                  placeholder="name@example.com"
                />
              </label>
              <label className="field-label">
                First name
                <input
                  required
                  name="firstName"
                  defaultValue={defaultFirstName}
                  autoComplete="given-name"
                  className="field-input"
                  placeholder="First name"
                />
              </label>
              <label className="field-label">
                Last name
                <input
                  required
                  name="lastName"
                  defaultValue={defaultLastName}
                  autoComplete="family-name"
                  className="field-input"
                  placeholder="Last name"
                />
              </label>
              <label className="field-label sm:col-span-2">
                Phone number
                <input
                  required
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  className="field-input"
                  placeholder="e.g. 9876543210"
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-5 text-base font-bold text-[#7C0E44] flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#AA5E7A] text-white text-xs">2</span>
              Delivery address
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field-label sm:col-span-2">
                Street address
                <input
                  required
                  name="address"
                  autoComplete="street-address"
                  className="field-input"
                  placeholder="House / Flat no., Building, Street"
                />
              </label>
              <label className="field-label">
                City
                <input required name="city" autoComplete="address-level2" className="field-input" placeholder="City" />
              </label>
              <label className="field-label">
                State
                <input required name="state" autoComplete="address-level1" className="field-input" placeholder="State" />
              </label>
              <label className="field-label">
                PIN code
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  title="Enter a 6-digit PIN code"
                  name="postalCode"
                  autoComplete="postal-code"
                  className="field-input"
                  placeholder="6-digit PIN code"
                />
              </label>
              <label className="field-label">
                Country
                <input
                  required
                  name="country"
                  defaultValue="India"
                  autoComplete="country-name"
                  className="field-input"
                />
              </label>
            </div>
          </fieldset>

          <div className="rounded-2xl bg-[#AA5E7A]/15 border border-[#AA5E7A]/30 p-4 text-xs font-medium text-[#4A2033] space-y-1">
            <p className="font-bold text-[#7C0E44]">💳 Payment Option: Cash on Delivery (COD)</p>
            <p>Pay conveniently when your package arrives at your doorstep.</p>
          </div>

          {errorMsg && (
            <p className="rounded-xl border border-red-300 bg-red-50 p-3.5 text-sm font-semibold text-red-800">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto sm:min-w-64 rounded-xl bg-[#7C0E44] px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md hover:bg-[#630A36] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:bg-[#AA5E7A]/40"
          >
            {submitting ? 'Placing order...' : 'Place order now'}
          </button>
        </form>

        {/* Order Review Aside */}
        <aside className="rounded-3xl bg-white/80 border border-[#D49A9A] p-6 sm:p-8 shadow-md">
          <h2 className="text-xl font-bold text-[#381E29]">Your order</h2>
          <div className="mt-5 space-y-4 max-h-80 overflow-y-auto pr-1">
            {cart.map((item) => {
              const product = productsById.get(item.productId);
              if (!product) return null;
              return (
                <div key={`${item.productId}-${item.size}`} className="flex items-start justify-between gap-4 text-sm font-medium">
                  <div>
                    <p className="font-bold text-[#381E29]">{product.name}</p>
                    <p className="mt-1 text-xs text-[#AA5E7A] font-semibold">Size {item.size} · Qty {item.quantity}</p>
                  </div>
                  <span className="whitespace-nowrap font-bold text-[#7C0E44]">
                    ₹{(getSellingPrice(product) * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-5 border-t border-[#D49A9A]/40 pt-5">
            {activeOffers.length > 0 && (
              <div className="mb-4 rounded-xl bg-[#AA5E7A]/10 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7C0E44]">Available offers</p>
                <ul className="mt-2 space-y-1">
                  {activeOffers.map((offer) => (
                    <li key={offer._id} className="text-xs text-[#5E2F44]">
                      <strong>{offer.code}</strong> — {offer.type === 'percentage' ? `${offer.amount}% off` : `₹${offer.amount} off`}
                      {offer.minimumOrderValue > 0 ? ` on orders over ₹${offer.minimumOrderValue}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <label htmlFor="coupon-code" className="field-label">Coupon code</label>
            <div className="mt-2 flex gap-2">
              <input
                id="coupon-code"
                value={couponCode}
                onChange={(event) => {
                  setCouponCode(event.target.value.toUpperCase());
                  setCoupon(null);
                }}
                className="field-input min-w-0"
                placeholder="Enter code"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading}
                className="shrink-0 rounded-xl bg-[#AA5E7A] px-4 py-2 text-xs font-bold uppercase text-white disabled:opacity-50"
              >
                {couponLoading ? 'Checking…' : 'Apply'}
              </button>
            </div>
            {couponError && <p className="mt-2 text-xs font-semibold text-red-700">{couponError}</p>}
            {coupon && <p className="mt-2 text-xs font-semibold text-green-800">{coupon.name} applied.</p>}
          </div>

          <div className="mt-6 space-y-3 border-t border-[#D49A9A]/40 pt-5 text-sm font-medium">
            <div className="flex justify-between text-[#5E2F44]">
              <span>Subtotal</span>
              <span className="font-bold text-[#381E29]">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#5E2F44]">
              <span>Shipping</span>
              <span className="font-bold text-[#381E29]">{shipping ? `₹${shipping}` : 'Free'}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-green-800">
                <span>Coupon discount</span>
                <span className="font-bold">−₹{coupon.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[#D49A9A]/50 pt-4 text-base font-extrabold text-[#381E29]">
              <span>Total</span>
              <span className="text-[#7C0E44]">₹{(subtotal + shipping - (coupon?.discount || 0)).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
