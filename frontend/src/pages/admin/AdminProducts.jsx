import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { formatPrice } from '../../components/ProductCard.jsx';

const emptyForm = { category_id: '', name: '', slug: '', description: '', price: '', unit: '', stock: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([api.admin.getProducts(), api.admin.getCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, category_id: categories[0]?.id || '' });
    setShowForm(true);
  }

  function openEdit(p) {
    setEditingId(p.id);
    setForm({
      category_id: p.category_id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: (p.price_cents / 100).toString(),
      unit: p.unit,
      stock: p.stock.toString()
    });
    setShowForm(true);
  }

  async function submit(e) {
    e.preventDefault();
    const payload = {
      category_id: parseInt(form.category_id, 10),
      name: form.name,
      slug: form.slug,
      description: form.description,
      price_cents: Math.round(parseFloat(form.price) * 100),
      unit: form.unit,
      stock: parseInt(form.stock, 10)
    };
    try {
      if (editingId) {
        await api.admin.updateProduct(editingId, payload);
      } else {
        await api.admin.createProduct(payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function remove(id) {
    if (!confirm('Удалить товар?')) return;
    try {
      await api.admin.deleteProduct(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Товары ({products.length})</h2>
        <button className="btn" onClick={openCreate}>+ Добавить товар</button>
      </div>

      {showForm && (
        <form className="form" onSubmit={submit} style={{ margin: '16px 0', maxWidth: 420 }}>
          <label>Название <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Slug (уникальный, латиницей) <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></label>
          <label>
            Категория
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label>Цена, ₽ <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
          <label>Единица измерения <input required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></label>
          <label>Остаток <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label>
          <label>Описание <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">Сохранить</button>
            <button className="btn" type="button" style={{ background: '#888' }} onClick={() => setShowForm(false)}>Отмена</button>
          </div>
        </form>
      )}

      <table className="cart-table">
        <thead>
          <tr><th>Товар</th><th>Категория</th><th>Цена</th><th>Остаток</th><th></th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.category_name}</td>
              <td>{formatPrice(p.price_cents)}</td>
              <td>{p.stock}</td>
              <td>
                <button className="btn-link" onClick={() => openEdit(p)}>Изменить</button>{' '}
                <button className="btn-link" onClick={() => remove(p.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
