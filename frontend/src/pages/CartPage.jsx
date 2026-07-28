import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../components/ProductCard.jsx';

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container">
        <h1>Корзина</h1>
        <p>Корзина пуста. <Link to="/">Перейти в каталог</Link></p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Корзина</h1>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Товар</th>
            <th>Цена</th>
            <th>Кол-во</th>
            <th>Сумма</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{formatPrice(item.price_cents)}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10) || 1)}
                />
              </td>
              <td>{formatPrice(item.price_cents * item.quantity)}</td>
              <td>
                <button className="btn-link" onClick={() => removeItem(item.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cart-total">Итого: {formatPrice(total)}</div>
      <button className="btn" onClick={() => navigate('/checkout')}>
        Оформить заказ
      </button>
    </div>
  );
}
