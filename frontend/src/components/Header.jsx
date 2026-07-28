import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Header() {
  const { count } = useCart();
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">СтройМаркет</Link>
        <nav className="nav">
          <Link to="/">Каталог</Link>
          <Link to="/cart">Корзина{count > 0 ? ` (${count})` : ''}</Link>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Переключить тему"
            title="Переключить тему"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  );
}
