import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api.js';
import { useShop } from '../context/use-shop.js';
import { resolveProductImage } from '../utils/image-helper.js';

const sections = [
  ['overview', 'Dashboard Overview', '◫'],
  ['products', 'Products', '▧'],
  ['categories', 'Categories', '◇'],
  ['orders', 'Orders', '▤'],
  ['customers', 'Customers', '♙'],
  ['offers', 'Offers & Discounts', '%'],
  ['support', 'Customer Support', '✉'],
];

const orderStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const supportStatuses = ['Pending', 'In Progress', 'Resolved'];

const emptyProduct = {
  name: '',
  sku: '',
  description: '',
  price: '',
  discountPrice: '',
  category: '',
  image: '',
  countInStock: 0,
  bestseller: false,
  status: 'active',
};

const toDateInput = (date) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '' : new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const emptyOffer = () => ({
  name: '',
  code: '',
  type: 'percentage',
  amount: '',
  minimumOrderValue: 0,
  startsAt: toDateInput(new Date()),
  expiresAt: toDateInput(Date.now() + 7 * 24 * 60 * 60 * 1000),
  active: true,
});

const currency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}

export default function Admin() {
  const { user, loginAdmin, logout, refreshProducts } = useShop();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [verifiedAdmin, setVerifiedAdmin] = useState(false);
  const [authId, setAuthId] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [notice, setNotice] = useState('');

  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [productImageFile, setProductImageFile] = useState(null);
  const [productSaving, setProductSaving] = useState(false);
  const [productError, setProductError] = useState('');

  const [newCategory, setNewCategory] = useState('');
  const [categoryEdit, setCategoryEdit] = useState(null);
  const [categorySaving, setCategorySaving] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerOrdersLoading, setCustomerOrdersLoading] = useState(false);

  const [offerModal, setOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerForm, setOfferForm] = useState(emptyOffer);
  const [offerSaving, setOfferSaving] = useState(false);
  const [offerError, setOfferError] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [clockNow] = useState(() => Date.now());

  const isAdmin = user?.role === 'admin';

  const notify = useCallback((message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3500);
  }, []);

  const loadSection = useCallback(async (section) => {
    setLoading(true);
    setPageError('');
    try {
      if (section === 'overview') {
        setOverview(await api.getAdminOverview());
      } else if (section === 'products') {
        const [productData, categoryData] = await Promise.all([
          api.getAdminProducts(),
          api.getAdminCategories(),
        ]);
        setProducts(productData);
        setCategories(categoryData);
      } else if (section === 'categories') {
        const [categoryData, productData] = await Promise.all([
          api.getAdminCategories(),
          api.getAdminProducts(),
        ]);
        setCategories(categoryData);
        setProducts(productData);
      } else if (section === 'orders') {
        setOrders(await api.getAllOrdersAdmin());
      } else if (section === 'customers') {
        setCustomers(await api.getAdminCustomers());
      } else if (section === 'offers') {
        setOffers(await api.getAdminOffers());
      } else if (section === 'support') {
        setTickets(await api.getAdminSupportTickets());
      }
    } catch (error) {
      setPageError(error.message || 'Could not load this dashboard section.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return undefined;
    let active = true;
    api.getProfile()
      .then((profile) => {
        if (active && profile.role === 'admin') {
          setVerifiedAdmin(true);
          loadSection('overview');
        } else if (active) {
          logout();
        }
      })
      .catch(() => {
        if (active) logout();
      });
    return () => {
      active = false;
    };
  }, [isAdmin, loadSection, logout]);

  const selectSection = (section) => {
    setActiveSection(section);
    loadSection(section);
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await loginAdmin({ email: authId.trim(), password: authPassword });
      setAuthPassword('');
      setActiveSection('overview');
      navigate('/admin', { replace: true });
    } catch (error) {
      setAuthError(error.message || 'Administrator sign in failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setVerifiedAdmin(false);
    navigate('/admin', { replace: true });
  };

  const visibleProducts = useMemo(() => products.filter((product) => {
    const query = productSearch.trim().toLowerCase();
    const matchesText =
      !query ||
      String(product.name || '').toLowerCase().includes(query) ||
      String(product.sku || '').toLowerCase().includes(query) ||
      String(product.description || '').toLowerCase().includes(query);
    return matchesText && (!productCategory || product.category === productCategory);
  }), [productCategory, productSearch, products]);

  const visibleCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    return customers.filter((customer) =>
      !query ||
      String(customer.name || '').toLowerCase().includes(query) ||
      String(customer.email || '').toLowerCase().includes(query)
    );
  }, [customerSearch, customers]);

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm({ ...emptyProduct, category: categories[0] || '' });
    setProductImageFile(null);
    setProductError('');
    setProductModal(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      sku: product.sku || '',
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice ?? '',
      category: product.category,
      image: product.image,
      countInStock: product.countInStock ?? 0,
      bestseller: Boolean(product.bestseller),
      status: product.status === 'unavailable' ? 'unavailable' : 'active',
    });
    setProductImageFile(null);
    setProductError('');
    setProductModal(true);
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setProductError('');
    setProductSaving(true);
    try {
      let image = productForm.image;
      if (productImageFile) {
        image = (await api.uploadProductImage(await readFileAsDataUrl(productImageFile))).image;
      }
      const payload = {
        ...productForm,
        image,
        price: Number(productForm.price),
        discountPrice: productForm.discountPrice === '' ? null : Number(productForm.discountPrice),
        countInStock: Number(productForm.countInStock),
        sku: productForm.sku.trim(),
      };
      if (editingProduct) {
        await api.updateProduct(editingProduct._id || editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setProductModal(false);
      await loadSection('products');
      await refreshProducts();
      notify(editingProduct ? 'Product updated.' : 'Product created.');
    } catch (error) {
      setProductError(error.message || 'Could not save product.');
    } finally {
      setProductSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteProduct(product._id || product.id);
      await loadSection('products');
      await refreshProducts();
      notify('Product deleted.');
    } catch (error) {
      setPageError(error.message || 'Could not delete product.');
    }
  };

  const addCategory = async (event) => {
    event.preventDefault();
    setCategorySaving(true);
    setPageError('');
    try {
      await api.createCategory(newCategory);
      setNewCategory('');
      await loadSection('categories');
      notify('Category added.');
    } catch (error) {
      setPageError(error.message || 'Could not add category.');
    } finally {
      setCategorySaving(false);
    }
  };

  const saveCategoryName = async (oldName) => {
    if (!categoryEdit?.trim()) return;
    setCategorySaving(true);
    try {
      await api.updateCategory(oldName, categoryEdit.trim());
      setCategoryEdit(null);
      await loadSection('categories');
      await refreshProducts();
      notify('Category and associated products updated.');
    } catch (error) {
      setPageError(error.message || 'Could not update category.');
    } finally {
      setCategorySaving(false);
    }
  };

  const deleteCategory = async (name) => {
    const productCount = products.filter((product) => product.category === name).length;
    let options = {};
    if (productCount > 0) {
      const existingCategories = categories.filter((category) => category !== name);
      const response = window.prompt(
        `This category has ${productCount} product(s). Enter another category to reassign them, or type DELETE to remove those products.`,
        existingCategories[0] || ''
      );
      if (!response) return;
      if (response.trim().toUpperCase() === 'DELETE') {
        if (!window.confirm(`Permanently delete all ${productCount} products in "${name}"?`)) return;
        options = { confirmDelete: true };
      } else {
        options = { reassignTo: response.trim() };
      }
    } else if (!window.confirm(`Delete category "${name}"?`)) {
      return;
    }

    try {
      await api.deleteCategory(name, options);
      await loadSection('categories');
      await refreshProducts();
      notify('Category deleted.');
    } catch (error) {
      setPageError(error.message || 'Could not delete category.');
    }
  };

  const changeOrderStatus = async (order, status) => {
    try {
      await api.updateOrderStatusAdmin(order.id || order._id, status);
      await loadSection('orders');
      notify('Order status updated.');
    } catch (error) {
      setPageError(error.message || 'Could not update order.');
    }
  };

  const openCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setCustomerOrders([]);
    setCustomerOrdersLoading(true);
    try {
      const result = await api.getCustomerOrdersAdmin(customer._id);
      setSelectedCustomer(result.customer);
      setCustomerOrders(result.orders);
    } catch (error) {
      setPageError(error.message || 'Could not load customer orders.');
    } finally {
      setCustomerOrdersLoading(false);
    }
  };

  const openOffer = (offer = null) => {
    setEditingOffer(offer);
    setOfferForm(
      offer
        ? {
            name: offer.name,
            code: offer.code,
            type: offer.type,
            amount: offer.amount,
            minimumOrderValue: offer.minimumOrderValue,
            startsAt: toDateInput(offer.startsAt),
            expiresAt: toDateInput(offer.expiresAt),
            active: offer.active,
          }
        : emptyOffer()
    );
    setOfferError('');
    setOfferModal(true);
  };

  const saveOffer = async (event) => {
    event.preventDefault();
    setOfferError('');
    setOfferSaving(true);
    try {
      const payload = {
        ...offerForm,
        amount: Number(offerForm.amount),
        minimumOrderValue: Number(offerForm.minimumOrderValue),
        startsAt: new Date(offerForm.startsAt).toISOString(),
        expiresAt: new Date(offerForm.expiresAt).toISOString(),
      };
      if (editingOffer) await api.updateOffer(editingOffer._id, payload);
      else await api.createOffer(payload);
      setOfferModal(false);
      await loadSection('offers');
      notify(editingOffer ? 'Offer updated.' : 'Offer created.');
    } catch (error) {
      setOfferError(error.message || 'Could not save offer.');
    } finally {
      setOfferSaving(false);
    }
  };

  const toggleOffer = async (offer) => {
    try {
      await api.updateOffer(offer._id, { ...offer, active: !offer.active });
      await loadSection('offers');
      notify(offer.active ? 'Offer deactivated.' : 'Offer activated.');
    } catch (error) {
      setPageError(error.message || 'Could not update offer.');
    }
  };

  const removeOffer = async (offer) => {
    if (!window.confirm(`Delete coupon "${offer.code}"?`)) return;
    try {
      await api.deleteOffer(offer._id);
      await loadSection('offers');
      notify('Offer deleted.');
    } catch (error) {
      setPageError(error.message || 'Could not delete offer.');
    }
  };

  const removeExpiredOffers = async () => {
    if (!window.confirm('Delete all expired offers?')) return;
    try {
      const result = await api.deleteExpiredOffers();
      await loadSection('offers');
      notify(`${result.deletedCount} expired offer(s) deleted.`);
    } catch (error) {
      setPageError(error.message || 'Could not delete expired offers.');
    }
  };

  const updateTicket = async (ticket) => {
    const reply = (replyDrafts[ticket._id] || '').trim();
    try {
      await api.updateSupportTicket(ticket._id, {
        status: ticket.status,
        ...(reply ? { reply } : {}),
      });
      setReplyDrafts((drafts) => ({ ...drafts, [ticket._id]: '' }));
      await loadSection('support');
      notify(reply ? 'Support reply saved.' : 'Ticket status updated.');
    } catch (error) {
      setPageError(error.message || 'Could not update support request.');
    }
  };

  if (!isAdmin) {
    return (
      <section className="mx-auto max-w-md py-12 sm:py-20">
        <div className="rounded-3xl border border-[#D49A9A] bg-white/85 p-8 shadow-xl backdrop-blur-sm sm:p-10">
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#AA5E7A] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              Restricted Area
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#381E29]">Admin Portal</h1>
            <p className="mt-2 text-sm leading-6 text-[#5E2F44]">
              Sign in to manage your store. Administrator access is provisioned securely by the backend.
            </p>
          </div>
          <form onSubmit={handleAdminLogin} className="mt-7 space-y-4">
            <label className="field-label" htmlFor="admin-login-id">
              Administrator email or configured username
              <input
                id="admin-login-id"
                required
                autoComplete="username"
                value={authId}
                onChange={(event) => setAuthId(event.target.value)}
                className="field-input"
              />
            </label>
            <label className="field-label" htmlFor="admin-login-password">
              Password
              <input
                id="admin-login-password"
                required
                type="password"
                autoComplete="current-password"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                className="field-input"
              />
            </label>
            {authError && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">{authError}</p>}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-xl bg-[#7C0E44] px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md transition-all hover:bg-[#630A36] disabled:opacity-50"
            >
              {authLoading ? 'Verifying…' : 'Sign in to Admin Portal'}
            </button>
          </form>
        </div>
      </section>
    );
  }

  if (!verifiedAdmin) {
    return <div className="rounded-3xl bg-white/80 p-12 text-center font-semibold text-[#5E2F44]">Verifying administrator access…</div>;
  }

  const sectionTitle = sections.find(([id]) => id === activeSection)?.[1] || 'Admin Dashboard';

  return (
    <section className="py-3 sm:py-6">
      {notice && (
        <div role="status" className="fixed right-4 top-24 z-[70] rounded-xl border border-green-300 bg-green-50 px-5 py-3 text-sm font-semibold text-green-800 shadow-lg">
          {notice}
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-[#D49A9A]/60 bg-white/80 p-4 shadow-sm lg:sticky lg:top-24">
          <div className="px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#AA5E7A]">Fastbuy</p>
            <h1 className="mt-1 text-lg font-extrabold text-[#381E29]">Admin Dashboard</h1>
          </div>
          <nav aria-label="Admin dashboard navigation" className="mt-2 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {sections.map(([id, label, icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => selectSection(id)}
                aria-current={activeSection === id ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold transition-colors lg:w-full ${
                  activeSection === id
                    ? 'bg-[#7C0E44] text-white shadow-sm'
                    : 'text-[#5E2F44] hover:bg-[#AA5E7A]/15 hover:text-[#7C0E44]'
                }`}
              >
                <span aria-hidden="true" className="w-5 text-center text-base">{icon}</span>
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold text-red-700 transition-colors hover:bg-red-50 lg:w-full"
            >
              <span className="w-5 text-center text-base" aria-hidden="true">↪</span> Logout
            </button>
          </nav>
          <div className="mt-5 hidden rounded-2xl bg-[#F2DACE]/70 p-3 text-xs text-[#5E2F44] lg:block">
            <p className="font-bold text-[#7C0E44]">Administrator session</p>
            <p className="mt-1">Protected by the store API.</p>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <header className="flex flex-col justify-between gap-3 rounded-3xl border border-[#D49A9A]/60 bg-white/80 p-5 shadow-sm sm:flex-row sm:items-center sm:p-7">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#AA5E7A]">Store control</p>
              <h2 className="mt-1 text-2xl font-extrabold text-[#381E29]">{sectionTitle}</h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => loadSection(activeSection)}
                disabled={loading}
                className="rounded-xl border border-[#D49A9A] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#7C0E44] hover:bg-[#AA5E7A]/15 disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Refresh'}
              </button>
              {activeSection === 'products' && (
                <button type="button" onClick={openNewProduct} className="rounded-xl bg-[#7C0E44] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#630A36]">
                  Add product
                </button>
              )}
              {activeSection === 'offers' && (
                <button type="button" onClick={() => openOffer()} className="rounded-xl bg-[#7C0E44] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#630A36]">
                  Create offer
                </button>
              )}
            </div>
          </header>

          {pageError && (
            <div role="alert" className="flex items-start justify-between gap-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
              <span>{pageError}</span>
              <button type="button" onClick={() => setPageError('')} aria-label="Dismiss error" className="font-bold">×</button>
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl border border-[#D49A9A]/60 bg-white/80 p-14 text-center text-sm font-semibold text-[#5E2F44]">
              Loading live store data…
            </div>
          ) : (
            <>
              {activeSection === 'overview' && <Overview data={overview} onNavigate={selectSection} />}
              {activeSection === 'products' && (
                <ProductsPanel
                  products={visibleProducts}
                  categories={categories}
                  search={productSearch}
                  setSearch={setProductSearch}
                  category={productCategory}
                  setCategory={setProductCategory}
                  onEdit={openEditProduct}
                  onDelete={deleteProduct}
                />
              )}
              {activeSection === 'categories' && (
                <CategoriesPanel
                  categories={categories}
                  products={products}
                  newCategory={newCategory}
                  setNewCategory={setNewCategory}
                  categoryEdit={categoryEdit}
                  setCategoryEdit={setCategoryEdit}
                  saving={categorySaving}
                  onAdd={addCategory}
                  onSave={saveCategoryName}
                  onDelete={deleteCategory}
                />
              )}
              {activeSection === 'orders' && <OrdersPanel orders={orders} onStatusChange={changeOrderStatus} />}
              {activeSection === 'customers' && (
                <CustomersPanel
                  customers={visibleCustomers}
                  search={customerSearch}
                  setSearch={setCustomerSearch}
                  onOpen={openCustomer}
                />
              )}
              {activeSection === 'offers' && (
                <OffersPanel offers={offers} now={clockNow} onEdit={openOffer} onToggle={toggleOffer} onDelete={removeOffer} onDeleteExpired={removeExpiredOffers} />
              )}
              {activeSection === 'support' && (
                <SupportPanel
                  tickets={tickets}
                  replyDrafts={replyDrafts}
                  setReplyDrafts={setReplyDrafts}
                  onUpdate={updateTicket}
                />
              )}
            </>
          )}
        </div>
      </div>

      {productModal && (
        <Modal title={editingProduct ? 'Edit product' : 'Add product'} onClose={() => setProductModal(false)}>
          <form onSubmit={saveProduct} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field-label sm:col-span-2">Product name
                <input required maxLength="160" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} className="field-input" />
              </label>
              <label className="field-label">SKU
                <input required maxLength="50" value={productForm.sku} onChange={(event) => setProductForm({ ...productForm, sku: event.target.value.toUpperCase() })} className="field-input" />
              </label>
              <label className="field-label">Category
                {categories.length ? (
                  <select required value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} className="field-input">
                    <option value="" disabled>Select category</option>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                ) : (
                  <input required value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} className="field-input" />
                )}
              </label>
              <label className="field-label">Original price (₹)
                <input required type="number" min="0" step="0.01" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} className="field-input" />
              </label>
              <label className="field-label">Discounted price (₹)
                <input type="number" min="0" max={productForm.price || undefined} step="0.01" value={productForm.discountPrice} onChange={(event) => setProductForm({ ...productForm, discountPrice: event.target.value })} className="field-input" placeholder="Leave blank for no discount" />
              </label>
              <label className="field-label">Stock quantity
                <input required type="number" min="0" step="1" value={productForm.countInStock} onChange={(event) => setProductForm({ ...productForm, countInStock: event.target.value })} className="field-input" />
              </label>
              <label className="field-label">Availability
                <select value={productForm.status} onChange={(event) => setProductForm({ ...productForm, status: event.target.value })} className="field-input">
                  <option value="active">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </label>
              <label className="field-label sm:col-span-2">Product image
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setProductImageFile(event.target.files?.[0] || null)} className="field-input file:mr-3 file:rounded-lg file:border-0 file:bg-[#AA5E7A]/20 file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#7C0E44]" />
                <span className="mt-1 block text-[11px] text-[#6E5260]">PNG, JPEG, or WebP; up to 5 MB.</span>
              </label>
              <label className="field-label sm:col-span-2">Image path (or uploaded image)
                <input required={!productImageFile} value={productForm.image} onChange={(event) => setProductForm({ ...productForm, image: event.target.value })} className="field-input" placeholder="/images/product-image.png" />
              </label>
              <label className="field-label sm:col-span-2">Description
                <textarea required rows="3" maxLength="3000" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} className="field-input" />
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-[#381E29]">
                <input type="checkbox" checked={productForm.bestseller} onChange={(event) => setProductForm({ ...productForm, bestseller: event.target.checked })} className="h-4 w-4 accent-[#7C0E44]" />
                Featured product
              </label>
              {Number(productForm.price) > 0 && Number(productForm.discountPrice) > 0 && Number(productForm.discountPrice) <= Number(productForm.price) && (
                <p className="self-center text-xs font-bold text-[#7C0E44]">
                  {Math.round(((Number(productForm.price) - Number(productForm.discountPrice)) / Number(productForm.price)) * 100)}% discount
                </p>
              )}
            </div>
            {productError && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">{productError}</p>}
            <ModalActions onCancel={() => setProductModal(false)} loading={productSaving} submitLabel={editingProduct ? 'Save changes' : 'Create product'} />
          </form>
        </Modal>
      )}

      {offerModal && (
        <Modal title={editingOffer ? 'Edit offer' : 'Create offer'} onClose={() => setOfferModal(false)}>
          <form onSubmit={saveOffer} className="space-y-4">
            <label className="field-label">Offer name
              <input required maxLength="100" value={offerForm.name} onChange={(event) => setOfferForm({ ...offerForm, name: event.target.value })} className="field-input" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field-label">Coupon code
                <input required minLength="3" maxLength="30" pattern="[A-Za-z0-9_-]+" value={offerForm.code} onChange={(event) => setOfferForm({ ...offerForm, code: event.target.value.toUpperCase() })} className="field-input" />
              </label>
              <label className="field-label">Discount type
                <select value={offerForm.type} onChange={(event) => setOfferForm({ ...offerForm, type: event.target.value })} className="field-input">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                </select>
              </label>
              <label className="field-label">{offerForm.type === 'percentage' ? 'Percentage off' : 'Amount off (₹)'}
                <input required type="number" min="0.01" max={offerForm.type === 'percentage' ? 100 : undefined} step="0.01" value={offerForm.amount} onChange={(event) => setOfferForm({ ...offerForm, amount: event.target.value })} className="field-input" />
              </label>
              <label className="field-label">Minimum order (₹)
                <input type="number" min="0" step="0.01" value={offerForm.minimumOrderValue} onChange={(event) => setOfferForm({ ...offerForm, minimumOrderValue: event.target.value })} className="field-input" />
              </label>
              <label className="field-label">Starts at
                <input required type="datetime-local" value={offerForm.startsAt} onChange={(event) => setOfferForm({ ...offerForm, startsAt: event.target.value })} className="field-input" />
              </label>
              <label className="field-label">Expires at
                <input required type="datetime-local" value={offerForm.expiresAt} onChange={(event) => setOfferForm({ ...offerForm, expiresAt: event.target.value })} className="field-input" />
              </label>
            </div>
            <label className="flex items-center gap-3 text-sm font-semibold text-[#381E29]">
              <input type="checkbox" checked={offerForm.active} onChange={(event) => setOfferForm({ ...offerForm, active: event.target.checked })} className="h-4 w-4 accent-[#7C0E44]" />
              Active
            </label>
            {offerError && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">{offerError}</p>}
            <ModalActions onCancel={() => setOfferModal(false)} loading={offerSaving} submitLabel={editingOffer ? 'Save offer' : 'Create offer'} />
          </form>
        </Modal>
      )}

      {selectedCustomer && (
        <Modal title="Customer account & order history" onClose={() => setSelectedCustomer(null)}>
          <div className="mb-5 rounded-2xl bg-[#F2DACE]/60 p-4 text-sm text-[#381E29]">
            <p className="font-bold">{selectedCustomer.name}</p>
            <p>{selectedCustomer.email}</p>
            <p className="mt-1 text-xs text-[#6E5260]">Registered {new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
          {customerOrdersLoading ? <p className="py-6 text-center text-sm text-[#5E2F44]">Loading order history…</p> : (
            customerOrders.length ? (
              <div className="max-h-[50vh] space-y-3 overflow-y-auto">
                {customerOrders.map((order) => (
                  <div key={order._id} className="rounded-xl border border-[#D49A9A]/50 p-4 text-sm">
                    <div className="flex justify-between gap-3">
                      <strong>#{order.id || order._id}</strong>
                      <span className="text-[#7C0E44]">{order.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#6E5260]">{new Date(order.createdAt || order.date).toLocaleDateString('en-IN')}</p>
                    <p className="mt-2 text-xs">{order.items?.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</p>
                    <p className="mt-2 font-bold">{currency(order.total)}</p>
                  </div>
                ))}
              </div>
            ) : <EmptyState message="No orders recorded for this customer." />
          )}
        </Modal>
      )}
    </section>
  );
}

function Overview({ data, onNavigate }) {
  const cards = [
    ['Total Products', data?.totalProducts, 'products'],
    ['Total Orders', data?.totalOrders, 'orders'],
    ['Total Customers', data?.totalCustomers, 'customers'],
    ['Total Revenue', currency(data?.totalRevenue), 'orders'],
    ['Pending Orders', data?.pendingOrders, 'orders'],
    ['Low Stock Products', data?.lowStockProducts, 'products'],
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, section]) => (
          <button key={label} type="button" onClick={() => onNavigate(section)} className="rounded-3xl border border-[#D49A9A]/60 bg-white/80 p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-xs font-bold uppercase tracking-wider text-[#AA5E7A]">{label}</p>
            <p className="mt-3 text-3xl font-extrabold text-[#381E29]">{value ?? '—'}</p>
            <p className="mt-2 text-xs text-[#6E5260]">Live MongoDB data</p>
          </button>
        ))}
      </div>
      <div className="rounded-3xl border border-[#D49A9A]/60 bg-white/80 p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-bold text-[#381E29]">Store operations</h3>
        <p className="mt-2 text-sm leading-6 text-[#5E2F44]">
          Overview values are read from the current product, order, and customer collections. Revenue excludes cancelled orders.
        </p>
      </div>
    </div>
  );
}

function ProductsPanel({ products, categories, search, setSearch, category, setCategory, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-[#D49A9A]/60 bg-white/80 p-4 sm:flex-row">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, SKU, or description" className="field-input min-w-0 flex-1" />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="field-input sm:max-w-xs">
          <option value="">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div className="overflow-hidden rounded-3xl border border-[#D49A9A]/60 bg-white/85 shadow-sm">
        {products.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#D49A9A]/30 text-xs uppercase tracking-wider text-[#7C0E44]">
                <tr><th className="p-4">Product</th><th className="p-4">Category / SKU</th><th className="p-4">Pricing</th><th className="p-4">Stock</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-[#D49A9A]/20">
                {products.map((product) => (
                  <tr key={product._id || product.id}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={resolveProductImage(product.image)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        <div><p className="font-bold text-[#381E29]">{product.name}</p><p className="max-w-xs truncate text-xs text-[#6E5260]">{product.description}</p></div>
                      </div>
                    </td>
                    <td className="p-4 text-xs"><p>{product.category}</p><p className="mt-1 text-[#6E5260]">{product.sku || 'No SKU'}</p>{product.bestseller && <span className="mt-1 inline-block rounded-full bg-[#AA5E7A]/20 px-2 py-1 font-bold text-[#7C0E44]">Featured</span>}</td>
                    <td className="p-4 font-bold text-[#7C0E44]">{currency(product.discountPrice ?? product.price)}{product.discountPrice != null && <p className="text-xs font-medium text-[#8F707D] line-through">{currency(product.price)}</p>}</td>
                    <td className="p-4">{product.countInStock ?? 0}</td>
                    <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${product.status === 'unavailable' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}>{product.status === 'unavailable' ? 'Unavailable' : 'Available'}</span></td>
                    <td className="space-x-2 p-4 text-right">
                      <button type="button" onClick={() => onEdit(product)} className="rounded-lg border border-[#D49A9A] px-3 py-1.5 text-xs font-bold text-[#7C0E44] hover:bg-[#AA5E7A]/10">Edit</button>
                      <button type="button" onClick={() => onDelete(product)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState message="No products match your search." />}
      </div>
    </div>
  );
}

function CategoriesPanel({ categories, products, newCategory, setNewCategory, categoryEdit, setCategoryEdit, saving, onAdd, onSave, onDelete }) {
  return (
    <div className="space-y-5">
      <form onSubmit={onAdd} className="flex flex-col gap-3 rounded-2xl border border-[#D49A9A]/60 bg-white/80 p-4 sm:flex-row">
        <input required maxLength="80" value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="New category name" className="field-input min-w-0 flex-1" />
        <button disabled={saving} className="rounded-xl bg-[#7C0E44] px-5 py-3 text-xs font-bold uppercase text-white disabled:opacity-50">Add category</button>
      </form>
      <div className="space-y-3">
        {categories.length ? categories.map((category) => {
          const count = products.filter((product) => product.category === category).length;
          return (
            <div key={category} className="flex flex-col gap-3 rounded-2xl border border-[#D49A9A]/60 bg-white/85 p-4 sm:flex-row sm:items-center">
              {categoryEdit !== null && categoryEdit.startsWith(`${category}\n`) ? (
                <>
                  <input value={categoryEdit.split('\n')[1]} onChange={(event) => setCategoryEdit(`${category}\n${event.target.value}`)} className="field-input min-w-0 flex-1" />
                  <button type="button" onClick={() => onSave(category)} disabled={saving} className="rounded-lg bg-[#7C0E44] px-4 py-2 text-xs font-bold text-white">Save</button>
                  <button type="button" onClick={() => setCategoryEdit(null)} className="rounded-lg border border-[#D49A9A] px-4 py-2 text-xs font-bold text-[#5E2F44]">Cancel</button>
                </>
              ) : (
                <>
                  <div className="min-w-0 flex-1"><p className="font-bold text-[#381E29]">{category}</p><p className="text-xs text-[#6E5260]">{count} product(s) assigned</p></div>
                  <button type="button" onClick={() => setCategoryEdit(`${category}\n${category}`)} className="rounded-lg border border-[#D49A9A] px-4 py-2 text-xs font-bold text-[#7C0E44]">Rename</button>
                  <button type="button" onClick={() => onDelete(category)} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700">Delete</button>
                </>
              )}
            </div>
          );
        }) : <EmptyState message="No categories found. Add one to organize your products." />}
      </div>
    </div>
  );
}

function OrdersPanel({ orders, onStatusChange }) {
  return (
    <div className="space-y-4">
      {orders.length ? orders.map((order) => (
        <article key={order._id || order.id} className="space-y-4 rounded-3xl border border-[#D49A9A]/60 bg-white/85 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-3 border-b border-[#D49A9A]/30 pb-4 sm:flex-row sm:items-center">
            <div><p className="text-xs font-bold uppercase tracking-wider text-[#AA5E7A]">Order #{order.id || order._id}</p><p className="mt-1 text-xs text-[#6E5260]">{new Date(order.date || order.createdAt).toLocaleString('en-IN')}</p></div>
            <select value={order.status || 'Pending'} onChange={(event) => onStatusChange(order, event.target.value)} className="field-input sm:max-w-48">
              {orderStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div><p className="font-bold text-[#381E29]">Customer</p><p>{order.customer?.firstName} {order.customer?.lastName}</p><p className="text-xs text-[#6E5260]">{order.customer?.email} · {order.customer?.phone}</p></div>
            <div><p className="font-bold text-[#381E29]">Payment</p><p>{order.paymentMethod || 'COD'} · {order.paymentStatus || 'Pending'}</p><p className="text-xs text-[#6E5260]">{order.customer?.address}, {order.customer?.city}, {order.customer?.state}</p></div>
          </div>
          <div className="rounded-2xl bg-[#F2DACE]/40 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#7C0E44]">Items ({order.items?.length || 0})</p>
            <ul className="space-y-1 text-sm text-[#381E29]">{order.items?.map((item, index) => <li key={`${item.productId}-${index}`} className="flex justify-between gap-3"><span>{item.name} × {item.quantity}</span><span>{currency(item.price * item.quantity)}</span></li>)}</ul>
          </div>
          <div className="flex flex-wrap justify-between gap-3 border-t border-[#D49A9A]/30 pt-3 text-sm">
            <span className="text-[#5E2F44]">{order.couponCode ? `Coupon ${order.couponCode} · −${currency(order.discount)}` : 'No coupon'}</span>
            <strong className="text-[#7C0E44]">Total {currency(order.total)}</strong>
          </div>
        </article>
      )) : <EmptyState message="No orders have been placed yet." />}
    </div>
  );
}

function CustomersPanel({ customers, search, setSearch, onOpen }) {
  return (
    <div className="space-y-4">
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customers by name or email" className="field-input w-full bg-white/90" />
      <div className="overflow-hidden rounded-3xl border border-[#D49A9A]/60 bg-white/85">
        {customers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-[#D49A9A]/30 text-xs uppercase tracking-wider text-[#7C0E44]"><tr><th className="p-4">Customer</th><th className="p-4">Joined</th><th className="p-4">Orders</th><th className="p-4">Purchases</th><th className="p-4" /></tr></thead>
              <tbody className="divide-y divide-[#D49A9A]/20">
                {customers.map((customer) => <tr key={customer._id}>
                  <td className="p-4"><p className="font-bold">{customer.name}</p><p className="text-xs text-[#6E5260]">{customer.email}</p></td>
                  <td className="p-4 text-xs">{new Date(customer.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="p-4">{customer.orderCount}</td>
                  <td className="p-4 font-semibold">{currency(customer.totalSpent)}</td>
                  <td className="p-4 text-right"><button type="button" onClick={() => onOpen(customer)} className="rounded-lg border border-[#D49A9A] px-3 py-2 text-xs font-bold text-[#7C0E44]">View history</button></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        ) : <EmptyState message="No registered customers match your search." />}
      </div>
    </div>
  );
}

function OffersPanel({ offers, now, onEdit, onToggle, onDelete, onDeleteExpired }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button type="button" onClick={onDeleteExpired} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100">Delete expired offers</button></div>
      <div className="overflow-hidden rounded-3xl border border-[#D49A9A]/60 bg-white/85">
        {offers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#D49A9A]/30 text-xs uppercase tracking-wider text-[#7C0E44]"><tr><th className="p-4">Offer / Code</th><th className="p-4">Discount</th><th className="p-4">Minimum</th><th className="p-4">Expires</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-[#D49A9A]/20">
                {offers.map((offer) => {
                  const expired = Date.parse(offer.expiresAt) <= now;
                  return <tr key={offer._id}>
                    <td className="p-4"><p className="font-bold">{offer.name}</p><p className="text-xs font-bold tracking-wider text-[#7C0E44]">{offer.code}</p></td>
                    <td className="p-4">{offer.type === 'percentage' ? `${offer.amount}%` : currency(offer.amount)}</td>
                    <td className="p-4">{currency(offer.minimumOrderValue)}</td>
                    <td className="p-4 text-xs">{new Date(offer.expiresAt).toLocaleString('en-IN')}</td>
                    <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${expired ? 'bg-stone-100 text-stone-600' : offer.active ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{expired ? 'Expired' : offer.active ? 'Active' : 'Inactive'}</span></td>
                    <td className="space-x-2 p-4 text-right">
                      <button type="button" onClick={() => onEdit(offer)} className="rounded-lg border border-[#D49A9A] px-3 py-1.5 text-xs font-bold text-[#7C0E44]">Edit</button>
                      {!expired && <button type="button" onClick={() => onToggle(offer)} className="rounded-lg border border-[#D49A9A] px-3 py-1.5 text-xs font-bold text-[#5E2F44]">{offer.active ? 'Deactivate' : 'Activate'}</button>}
                      <button type="button" onClick={() => onDelete(offer)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">Delete</button>
                    </td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        ) : <EmptyState message="No offers exist yet. Create an offer to add coupon codes to checkout." />}
      </div>
    </div>
  );
}

function SupportPanel({ tickets, replyDrafts, setReplyDrafts, onUpdate }) {
  return (
    <div className="space-y-4">
      {tickets.length ? tickets.map((ticket) => (
        <article key={ticket._id} className="space-y-4 rounded-3xl border border-[#D49A9A]/60 bg-white/85 p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div><h3 className="font-bold text-[#381E29]">{ticket.subject}</h3><p className="mt-1 text-xs text-[#6E5260]">{ticket.name} · {ticket.email} · {new Date(ticket.createdAt).toLocaleString('en-IN')}</p></div>
            <select value={ticket.status} onChange={(event) => onUpdate({ ...ticket, status: event.target.value })} className="field-input sm:max-w-48">
              {supportStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
          <p className="whitespace-pre-wrap rounded-2xl bg-[#F2DACE]/40 p-4 text-sm leading-6 text-[#381E29]">{ticket.message}</p>
          {ticket.replies?.map((reply, index) => <p key={`${reply.createdAt}-${index}`} className="rounded-xl border border-[#D49A9A]/40 p-3 text-sm"><strong>{reply.author === 'admin' ? 'Support reply' : 'Customer'}:</strong> {reply.message}</p>)}
          <div className="flex flex-col gap-3 sm:flex-row">
            <textarea rows="2" value={replyDrafts[ticket._id] || ''} onChange={(event) => setReplyDrafts((drafts) => ({ ...drafts, [ticket._id]: event.target.value }))} placeholder="Write a reply (stored for the customer to view with their ticket reference)" className="field-input min-w-0 flex-1" />
            <button type="button" onClick={() => onUpdate(ticket)} className="rounded-xl bg-[#7C0E44] px-5 py-3 text-xs font-bold uppercase text-white hover:bg-[#630A36]">Save status / reply</button>
          </div>
        </article>
      )) : <EmptyState message="No customer support requests have been submitted." />}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#D49A9A] bg-white p-5 shadow-2xl sm:p-8">
        <div className="mb-5 flex items-center justify-between border-b border-[#D49A9A]/30 pb-4">
          <h2 className="text-xl font-bold text-[#381E29]">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg px-2 text-xl font-bold text-[#AA5E7A] hover:bg-[#AA5E7A]/10">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, loading, submitLabel }) {
  return (
    <div className="flex justify-end gap-3 border-t border-[#D49A9A]/30 pt-4">
      <button type="button" onClick={onCancel} className="rounded-xl border border-[#D49A9A] px-5 py-2.5 text-xs font-bold uppercase text-[#5E2F44]">Cancel</button>
      <button type="submit" disabled={loading} className="rounded-xl bg-[#7C0E44] px-5 py-2.5 text-xs font-bold uppercase text-white disabled:opacity-50">{loading ? 'Saving…' : submitLabel}</button>
    </div>
  );
}

function EmptyState({ message }) {
  return <div className="rounded-3xl border border-dashed border-[#D49A9A] bg-white/70 p-10 text-center text-sm font-medium text-[#6E5260]">{message}</div>;
}
