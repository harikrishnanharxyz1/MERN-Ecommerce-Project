import { useCallback, useEffect, useMemo, useState } from 'react';
import { products as initialStaticProducts } from '../assets/assets.js';
import { ShopContext } from './shop-context.js';
import { api, getAuthToken, setAuthToken } from '../api/api.js';
import { getSellingPrice } from '../utils/pricing.js';

function readStorage(key, fallback = []) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }) {
  const [products, setProducts] = useState(initialStaticProducts);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [user, setUser] = useState(() => readStorage('fastbuy-user', null));
  const [cart, setCart] = useState(() => readStorage('fastbuy-cart', []));
  const [orders, setOrders] = useState(() => readStorage('fastbuy-orders', []));

  // Build a lookup map that keys on both product.id and product._id
  const productsById = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      if (p.id !== undefined) map.set(p.id, p);
      if (p.id !== undefined) map.set(String(p.id), p);
      if (p._id !== undefined) map.set(p._id, p);
      if (p._id !== undefined) map.set(String(p._id), p);
    }
    return map;
  }, [products]);

  // Persist cart to localStorage
  useEffect(() => {
    window.localStorage.setItem('fastbuy-cart', JSON.stringify(cart));
  }, [cart]);

  // Persist orders to localStorage
  useEffect(() => {
    window.localStorage.setItem('fastbuy-orders', JSON.stringify(orders));
  }, [orders]);

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      window.localStorage.setItem('fastbuy-user', JSON.stringify(user));
    } else {
      window.localStorage.removeItem('fastbuy-user');
    }
  }, [user]);

  useEffect(() => {
    const syncOtherTabState = (event) => {
      if (event.key === 'fastbuy-user') {
        setUser(readStorage('fastbuy-user', null));
      }
      if (event.key === 'fastbuy-cart') {
        setCart(readStorage('fastbuy-cart', []));
      }
      if (event.key === 'fastbuy-orders') {
        setOrders(readStorage('fastbuy-orders', []));
      }
      if (event.key === 'fastbuy-token') {
        if (!event.newValue) {
          setUser(readStorage('fastbuy-user', null));
        }
      }
    };

    window.addEventListener('storage', syncOtherTabState);
    return () => window.removeEventListener('storage', syncOtherTabState);
  }, []);

  // Fetch dynamic products from MongoDB backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        setLoadingProducts(true);
        const data = await api.getProducts();
        if (isMounted && Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        // Graceful fallback to initialStaticProducts if backend is offline
        console.warn('Backend products not loaded, using local catalog fallback:', err.message);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    }
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch user orders when logged in
  useEffect(() => {
    if (!user || user.role === 'admin') return;
    let isMounted = true;
    async function loadUserOrders() {
      try {
        const backendOrders = await api.getOrders(user.email);
        if (isMounted && Array.isArray(backendOrders) && backendOrders.length > 0) {
          // Merge with any unique local orders
          setOrders((current) => {
            const existingIds = new Set(backendOrders.map((o) => o.id || o._id));
            const uniqueLocal = current.filter((o) => !existingIds.has(o.id || o._id));
            return [...backendOrders, ...uniqueLocal];
          });
        }
      } catch (err) {
        console.warn('Could not fetch user orders from backend:', err.message);
      }
    }
    loadUserOrders();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const addToCart = useCallback((product, size = 'One size', quantity = 1) => {
    const prodId = product.id !== undefined ? product.id : product._id;
    setCart((current) => {
      const existing = current.find(
        (item) => String(item.productId) === String(prodId) && item.size === size,
      );
      if (existing) {
        return current.map((item) =>
          String(item.productId) === String(prodId) && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...current, { productId: prodId, size, quantity }];
    });

    // If user is authenticated, sync with backend cart
    if (getAuthToken()) {
      api.addToCart({ productId: String(prodId), size, quantity }).catch(() => {});
    }
  }, []);

  const updateQuantity = useCallback((productId, size, quantity) => {
    if (quantity < 1) {
      setCart((current) =>
        current.filter((item) => String(item.productId) !== String(productId) || item.size !== size),
      );
    } else {
      setCart((current) =>
        current.map((item) =>
          String(item.productId) === String(productId) && item.size === size
            ? { ...item, quantity }
            : item,
        ),
      );
    }

    if (getAuthToken()) {
      api.updateCartItem({ productId: String(productId), size, quantity }).catch(() => {});
    }
  }, []);

  const removeFromCart = useCallback((productId, size) => {
    setCart((current) =>
      current.filter((item) => String(item.productId) !== String(productId) || item.size !== size),
    );

    if (getAuthToken()) {
      api.removeFromCart(String(productId), size).catch(() => {});
    }
  }, []);

  const createOrder = useCallback(
    async (customer, couponCode = '') => {
      const subtotal = cart.reduce((sum, item) => {
        const product = productsById.get(item.productId);
        return sum + (product ? getSellingPrice(product) * item.quantity : 0);
      }, 0);
      const shipping = subtotal === 0 || subtotal >= 1500 ? 0 : 99;
      const orderPayload = {
        customer,
        items: cart.map((item) => {
          const product = productsById.get(item.productId);
          return {
            productId: String(item.productId),
            name: product ? product.name : 'Unknown Product',
            price: product ? getSellingPrice(product) : 0,
            image: product ? product.image : '',
            size: item.size,
            quantity: item.quantity,
          };
        }),
        subtotal,
        shipping,
        total: subtotal + shipping,
        paymentMethod: 'COD',
        couponCode,
      };

      const finalOrder = await api.createOrder(orderPayload);

      setOrders((current) => [finalOrder, ...current]);
      setCart([]);
      if (getAuthToken()) {
        api.clearCart().catch(() => {});
      }
      return finalOrder;
    },
    [cart, productsById],
  );

  const login = useCallback(async (credentials) => {
    const data = await api.login(credentials);
    setUser(data.user);
    // Sync guest cart items to user's backend cart
    const currentCart = readStorage('fastbuy-cart', []);
    if (currentCart.length > 0) {
      try {
        const synced = await api.syncCart(currentCart);
        if (Array.isArray(synced)) {
          setCart(synced);
        }
      } catch {}
    }
    return data;
  }, []);

  const loginAdmin = useCallback(async (credentials) => {
    const data = await api.adminLogin(credentials);
    if (!data.user || data.user.role !== 'admin') {
      setAuthToken(null);
      throw new Error('Administrator access is required.');
    }
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const data = await api.register(userData);
    setUser(data.user);
    const currentCart = readStorage('fastbuy-cart', []);
    if (currentCart.length > 0) {
      try {
        const synced = await api.syncCart(currentCart);
        if (Array.isArray(synced)) {
          setCart(synced);
        }
      } catch {}
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    api.adminLogout().catch((error) => {
      console.warn('Could not clear the server admin session:', error.message);
    });
    setAuthToken(null);
    setUser(null);
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const data = await api.getProducts();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.warn('Could not refresh products:', err.message);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      products,
      productsById,
      loadingProducts,
      refreshProducts,
      cart,
      orders,
      user,
      login,
      loginAdmin,
      register,
      logout,
      addToCart,
      updateQuantity,
      removeFromCart,
      createOrder,
      cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    }),
    [
      addToCart,
      cart,
      createOrder,
      loadingProducts,
      login,
      loginAdmin,
      logout,
      orders,
      products,
      productsById,
      refreshProducts,
      register,
      removeFromCart,
      updateQuantity,
      user,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
