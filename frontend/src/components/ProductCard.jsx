import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

function formatPrice(cents) {
  return (cents / 100).toLocaleString('ru-RU') + ' ₽';
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  return (
    <div className="card">
      <Link to={`/product/${product.slug}`} className="card-title">
        {product.name}
      </Link>
      <div className="card-category">{product.category_name}</div>
      <div className="card-price">
        {formatPrice(product.price_cents)} / {product.unit}
      </div>
      <button className="btn" onClick={() => addItem(product, 1)}>
        В корзину
      </button>
    </div>
  );
}

export { formatPrice };
