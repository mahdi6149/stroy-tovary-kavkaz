import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../components/ProductCard.jsx';

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    api
      .getProduct(slug)
      .then(setProduct)
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!product) return <div className="container"><p>Загрузка...</p></div>;

  return (
    <div className="container">
      <Link to="/">← Назад в каталог</Link>
      <h1>{product.name}</h1>
      <div className="card-category">{product.category_name}</div>
      <p>{product.description}</p>
      <div className="card-price large">
        {formatPrice(product.price_cents)} / {product.unit}
      </div>
      <div className="qty-row">
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
        />
        <button className="btn" onClick={() => addItem(product, quantity)}>
          Добавить в корзину
        </button>
      </div>
      <p className="stock">В наличии: {product.stock} {product.unit}</p>
    </div>
  );
}
