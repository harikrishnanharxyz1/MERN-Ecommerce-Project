const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getAuthToken = () => {
  return localStorage.getItem('fastbuy-token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('fastbuy-token', token);
  } else {
    localStorage.removeItem('fastbuy-token');
  }
};

export async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        'Cannot reach the Fastbuy API. Make sure the backend is running and allows this frontend origin.',
      );
    }
    throw error;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data && data.message ? data.message : `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);
    if (params.bestseller !== undefined) query.append('bestseller', params.bestseller);

    const queryString = query.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    return await apiFetch(endpoint);
  },

  async getProductById(id) {
    return await apiFetch(`/products/${id}`);
  },

  async getCategories() {
    return await apiFetch('/products/categories');
  },

  // Admin Product Management
  async createProduct(productData) {
    return await apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async updateProduct(id, productData) {
    return await apiFetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  async deleteProduct(id) {
    return await apiFetch(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminOverview() {
    return await apiFetch('/admin/overview');
  },

  async getAdminProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    const queryString = query.toString();
    return await apiFetch(`/admin/products${queryString ? `?${queryString}` : ''}`);
  },

  async uploadProductImage(dataUrl) {
    return await apiFetch('/admin/product-images', {
      method: 'POST',
      body: JSON.stringify({ dataUrl }),
    });
  },

  async getAdminCategories() {
    return await apiFetch('/admin/categories');
  },

  async createCategory(name) {
    return await apiFetch('/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async updateCategory(oldName, name) {
    return await apiFetch('/admin/categories', {
      method: 'PUT',
      body: JSON.stringify({ oldName, name }),
    });
  },

  async deleteCategory(name, options = {}) {
    const query = new URLSearchParams();
    if (options.reassignTo) query.set('reassignTo', options.reassignTo);
    if (options.confirmDelete) query.set('confirmDelete', 'true');
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return await apiFetch(`/admin/categories/${encodeURIComponent(name)}${suffix}`, {
      method: 'DELETE',
    });
  },

  async getAdminCustomers(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return await apiFetch(`/admin/customers${query}`);
  },

  async getCustomerOrdersAdmin(id) {
    return await apiFetch(`/admin/customers/${id}/orders`);
  },

  async getAdminOffers() {
    return await apiFetch('/admin/offers');
  },

  async createOffer(offer) {
    return await apiFetch('/admin/offers', {
      method: 'POST',
      body: JSON.stringify(offer),
    });
  },

  async updateOffer(id, offer) {
    return await apiFetch(`/admin/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(offer),
    });
  },

  async deleteOffer(id) {
    return await apiFetch(`/admin/offers/${id}`, { method: 'DELETE' });
  },

  async deleteExpiredOffers() {
    return await apiFetch('/admin/offers/expired', { method: 'DELETE' });
  },

  async getAdminSupportTickets() {
    return await apiFetch('/admin/support');
  },

  async updateSupportTicket(id, data) {
    return await apiFetch(`/admin/support/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Admin Order Management
  async getAllOrdersAdmin() {
    return await apiFetch('/orders/admin/all');
  },

  async updateOrderStatusAdmin(id, status) {
    return await apiFetch(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Auth
  async login(credentials) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data && data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async adminLogin(credentials) {
    const data = await apiFetch('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setAuthToken(null);
    return data;
  },

  async adminLogout() {
    return await apiFetch('/auth/admin/logout', { method: 'POST' });
  },

  async register(userData) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data && data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async getProfile() {
    return await apiFetch('/auth/profile');
  },

  async updateProfile(userData) {
    return await apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Orders
  async createOrder(orderData) {
    return await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getOrders(email) {
    const endpoint = email ? `/orders?email=${encodeURIComponent(email)}` : '/orders';
    return await apiFetch(endpoint);
  },

  async getOrderById(id) {
    return await apiFetch(`/orders/${id}`);
  },

  async getActiveOffers() {
    return await apiFetch('/offers/active');
  },

  async validateCoupon(code, subtotal) {
    return await apiFetch('/offers/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  },

  async submitSupportTicket(ticket) {
    return await apiFetch('/support', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  },

  async getSupportTicket(id, email) {
    return await apiFetch(`/support/${encodeURIComponent(id)}?email=${encodeURIComponent(email)}`);
  },

  // Cart (for authenticated users)
  async getCart() {
    return await apiFetch('/cart');
  },

  async addToCart(item) {
    return await apiFetch('/cart', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async updateCartItem(item) {
    return await apiFetch('/cart', {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  async removeFromCart(productId, size) {
    return await apiFetch(`/cart/${productId}/${encodeURIComponent(size)}`, {
      method: 'DELETE',
    });
  },

  async clearCart() {
    return await apiFetch('/cart', {
      method: 'DELETE',
    });
  },

  async syncCart(localItems) {
    return await apiFetch('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ localItems }),
    });
  },
};
