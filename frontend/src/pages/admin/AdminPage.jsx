import React, { useState } from 'react';
import { api } from '../../api.js';
import AdminLoginPage from './AdminLoginPage.jsx';
import AdminOrders from './AdminOrders.jsx';
import AdminProducts from './AdminProducts.jsx';
import AdminCategories from './AdminCategories.jsx';

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(api.admin.isLoggedIn());
  const [tab, setTab] = useState('orders');

  if (!loggedIn) {
    return <AdminLoginPage onLoggedIn={() => setLoggedIn(true)} />;
  }

  function logout() {
    api.admin.logout();
    setLoggedIn(false);
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
        <h1 style={{ margin: 0 }}>Админ-панель</h1>
        <button className="btn-link" onClick={logout}>Выйти</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button className="btn" style={{ background: tab === 'orders' ? '#1f3a2b' : '#888' }} onClick={() => setTab('orders')}>Заказы</button>
        <button className="btn" style={{ background: tab === 'products' ? '#1f3a2b' : '#888' }} onClick={() => setTab('products')}>Товары</button>
        <button className="btn" style={{ background: tab === 'categories' ? '#1f3a2b' : '#888' }} onClick={() => setTab('categories')}>Категории</button>
      </div>

      {tab === 'orders' && <AdminOrders />}
      {tab === 'products' && <AdminProducts />}
      {tab === 'categories' && <AdminCategories />}
    </div>
  );
}
