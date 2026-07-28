import React, { useState } from 'react';
import { api } from '../../api.js';

export default function AdminLoginPage({ onLoggedIn }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.admin.login(password);
      onLoggedIn();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 360, marginTop: 60 }}>
      <h1>Вход в админку</h1>
      <form className="form" onSubmit={submit}>
        <label>
          Пароль
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Проверка...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
