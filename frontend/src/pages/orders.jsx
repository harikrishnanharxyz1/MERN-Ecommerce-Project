import { Link, useSearchParams } from 'react-router-dom';
import SectionTitle from '../components/section-title.jsx';
import { useShop } from '../context/use-shop.js';
import { resolveProductImage } from '../utils/image-helper.js';
import { getSellingPrice } from '../utils/pricing.js';

export default function Orders() {
  const { orders, productsById } = useShop();
  const [searchParams] = useSearchParams();
  const placedOrderId = searchParams.get('placed');

  return (
    <section className="py-4 sm:py-8">
      <SectionTitle
        eyebrow="Your account"
        title="Order history"
        description="A look at the orders you’ve placed with Fastbuy."
      />

      {placedOrderId && (
        <div role="status" className="mb-8 rounded-2xl border border-[#AA5E7A] bg-[#AA5E7A]/20 p-5 text-sm font-semibold text-[#630a36] shadow-xs flex items-center gap-3">
          <span className="text-xl">🎉</span>
          <span>Your order <strong>{placedOrderId}</strong> has been successfully placed! Thanks for shopping with Fastbuy.</span>
        </div>
      )}

      {!orders.length ? (
        <div className="rounded-3xl bg-white/70 border border-[#D49A9A]/60 py-16 px-6 text-center shadow-sm max-w-lg mx-auto">
          <p className="text-xl font-bold text-[#381E29]">No orders yet</p>
          <p className="mt-2 text-sm text-[#6E4154]">Your completed orders will show up here.</p>
          <Link
            to="/collection"
            className="mt-6 inline-block bg-[#7C0E44] text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.16em] shadow-md hover:bg-[#630A36] transition-colors"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => {
            const orderKey = order.id || order._id || `order-${index}`;
            const orderDate = order.date || order.createdAt || '';
            return (
              <article
                key={orderKey}
                className="rounded-3xl bg-white/80 border border-[#D49A9A]/60 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col justify-between gap-3 border-b border-[#D49A9A]/30 pb-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#AA5E7A]">
                      Order #{order.id || order._id}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#5E2F44]">
                      {orderDate
                        ? new Date(orderDate).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Recent'}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-[#AA5E7A] px-4 py-1.5 text-xs font-bold text-white shadow-xs">
                    {order.status || 'Processing'} · {order.paymentMethod || 'COD'}
                  </span>
                </div>

                <div className="divide-y divide-[#D49A9A]/20">
                  {order.items &&
                    order.items.map((item, idx) => {
                      const product = productsById.get(item.productId);
                      const itemName = item.name || (product ? product.name : 'Product');
                      const itemImage = item.image || (product ? product.image : '');
                      const itemPrice =
                        item.price !== undefined ? item.price : product ? getSellingPrice(product) : 0;

                      return (
                        <div
                          key={`${item.productId}-${item.size || 'One size'}-${idx}`}
                          className="flex items-center gap-4 py-4"
                        >
                          <div className="h-16 w-14 overflow-hidden rounded-xl bg-[#F2DACE]/60 p-1 flex items-center justify-center border border-[#D49A9A]/30">
                            <img
                              src={resolveProductImage(itemImage)}
                              alt={itemName}
                              className="h-full w-full object-cover rounded-lg"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-[#381E29]">{itemName}</p>
                            <p className="mt-1 text-xs font-medium text-[#AA5E7A]">
                              Size {item.size || 'One size'} · Qty {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-[#7C0E44]">
                            ₹{(Number(itemPrice) * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      );
                    })}
                </div>

                <div className="flex justify-between border-t border-[#D49A9A]/30 pt-4 text-base font-extrabold text-[#381E29]">
                  <span>Order total</span>
                  <span className="text-[#7C0E44]">₹{Number(order.total).toLocaleString('en-IN')}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
