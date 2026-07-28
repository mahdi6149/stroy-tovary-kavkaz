import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { formatPrice } from '../components/ProductCard.jsx';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getOrder(id).then(setOrder).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!order) return <div className="container"><p>Загрузка...</p></div>;

  return (
    <div className="container">
      <h1>Заказ №{order.id} принят</h1>
      <p>Мы свяжемся с вами по телефону {order.phone} для подтверждения.</p>
      <ul>
        {order.items.map((i) => (
          <li key={i.id}>
            {i.product_name} × {i.quantity} — {formatPrice(i.price_cents * i.quantity)}
          </li>
        ))}
      </ul>
      <div className="cart-total">Итого: {formatPrice(order.total_cents)}</div>
      <Link to="/">Вернуться в каталог</Link>
    </div>
  );
}
