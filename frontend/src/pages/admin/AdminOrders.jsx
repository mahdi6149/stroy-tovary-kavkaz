import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { formatPrice } from '../../components/ProductCard.jsx';

const STATUS_LABELS = { new: 'Новый', processing: 'В обработке', done: 'Выполнен', cancelled: 'Отменён' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.admin
      .getOrders()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function changeStatus(id, status) {
    try {
      await api.admin.updateOrderStatus(id, status);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h2>Заказы ({orders.length})</h2>
      <table className="cart-table">
        <thead>
          <tr>
            <th>№</th><th>Покупатель</th><th>Телефон</th><th>Адрес</th><th>Сумма</th><th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>№{o.id}</td>
              <td>{o.customer_name}</td>
              <td>{o.phone}</td>
              <td>{o.address}</td>
              <td>{formatPrice(o.total_cents)}</td>
              <td>
                <select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)}>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
