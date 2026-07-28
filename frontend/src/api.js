const BASE = '/api';
const ADMIN_TOKEN_KEY = 'stroymarket_admin_token';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.detail || 'Ошибка запроса');
  return data;
}

async function adminRequest(path, options = {}) {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });
  if (res.status === 401) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    throw new Error('Сессия истекла, войдите заново');
  }
  const data = await (res.status === 204 ? {} : res.json().catch(() => ({})));
  if (!res.ok) throw new Error(data.error || data.detail || 'Ошибка запроса');
  return data;
}

export const api = {
  getCategories: () => request('/categories'),
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (slug) => request(`/products/${slug}`),
  createOrder: (payload) =>
    request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getOrder: (id) => request(`/orders/${id}`),

  admin: {
    isLoggedIn: () => !!localStorage.getItem(ADMIN_TOKEN_KEY),
    login: async (password) => {
      const { token } = await request('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password })
      });
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    },
    logout: () => localStorage.removeItem(ADMIN_TOKEN_KEY),

    getCategories: () => adminRequest('/admin/categories'),
    createCategory: (data) => adminRequest('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
    deleteCategory: (id) => adminRequest(`/admin/categories/${id}`, { method: 'DELETE' }),

    getProducts: () => adminRequest('/admin/products'),
    createProduct: (data) => adminRequest('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct: (id, data) => adminRequest(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProduct: (id) => adminRequest(`/admin/products/${id}`, { method: 'DELETE' }),

    getOrders: () => adminRequest('/admin/orders'),
    updateOrderStatus: (id, status) =>
      adminRequest(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
  }
};
