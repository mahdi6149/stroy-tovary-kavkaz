import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  function load() {
    setLoading(true);
    api.admin.getCategories().then(setCategories).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    try {
      await api.admin.createCategory({ name, slug });
      setName(''); setSlug('');
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function remove(id) {
    if (!confirm('Удалить категорию?')) return;
    try {
      await api.admin.deleteCategory(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h2>Категории ({categories.length})</h2>
      <form className="form" onSubmit={submit} style={{ flexDirection: 'row', gap: 8, maxWidth: 500, margin: '12px 0' }}>
        <input required placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} />
        <input required placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <button className="btn" type="submit">Добавить</button>
      </form>
      <table className="cart-table">
        <thead><tr><th>Название</th><th>Slug</th><th></th></tr></thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.slug}</td>
              <td><button className="btn-link" onClick={() => remove(c.id)}>Удалить</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
