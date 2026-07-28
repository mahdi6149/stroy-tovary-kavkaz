import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { api } from '../api.js';
import { formatPrice } from '../components/ProductCard.jsx';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer_name: '', phone: '', address: '', comment: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const order = await api.createOrder({
        ...form,
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity }))
      });
      clearCart();
      navigate(`/order/${order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <div className="container"><p>Корзина пуста</p></div>;
  }

  return (
    <div className="container">
      <h1>Оформление заказа</h1>
      <form className="form" onSubmit={submit}>
        <label>
          Имя
          <input required value={form.customer_name} onChange={(e) => update('customer_name', e.target.value)} />
        </label>
        <label>
          Телефон
          <input required value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        </label>
        <label>
          Адрес доставки
          <input required value={form.address} onChange={(e) => update('address', e.target.value)} />
        </label>
        <label>
          Комментарий
          <textarea value={form.comment} onChange={(e) => update('comment', e.target.value)} />
        </label>

        <div className="cart-total">Итого к оплате: {formatPrice(total)}</div>

        {error && <p className="error">{error}</p>}

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Отправка...' : 'Подтвердить заказ'}
        </button>
      </form>
    </div>
  );
}
