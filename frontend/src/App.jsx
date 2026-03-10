import { useEffect, useMemo, useState } from "react";
import { createProduct, deleteProduct, getProducts, updateProduct } from "./api/productsApi";
import { register, login, me } from "./api/authApi";
import ProductCard from "./elements/ProductCard";
import "../styles/main.scss";

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [rating, setRating] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Auth states
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const canSubmit = useMemo(() => title.trim() !== "" && price !== "" && Number(price) > 0 && stock !== "", [title, price, stock]);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await getProducts();
      setItems(data);
    } catch (e) {
      setError(e?.response?.data?.message || e?.response?.data?.error || String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function checkAuth() {
    if (token) {
      try {
        const userData = await me();
        setUser(userData);
      } catch (e) {
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
      }
    }
  }

  useEffect(() => {
    load();
    checkAuth();
  }, []);

  async function onLogin(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await login({ email: loginEmail, password: loginPassword });
      setToken(res.accessToken);
      localStorage.setItem('token', res.accessToken);
      await checkAuth();
      setLoginEmail('');
      setLoginPassword('');
    } catch (e) {
      setError(e?.response?.data?.message || e?.response?.data?.error || String(e?.message || e));
    }
  }

  async function onRegister(e) {
    e.preventDefault();
    setError("");
    try {
      await register({
        email: regEmail,
        first_name: regFirstName,
        last_name: regLastName,
        password: regPassword
      });
      // После регистрации можно автоматически войти
      const res = await login({ email: regEmail, password: regPassword });
      setToken(res.accessToken);
      localStorage.setItem('token', res.accessToken);
      await checkAuth();
      setRegEmail('');
      setRegFirstName('');
      setRegLastName('');
      setRegPassword('');
    } catch (e) {
      setError(e?.response?.data?.message || e?.response?.data?.error || String(e?.message || e));
    }
  }

  function onLogout() {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
  }

  async function onAdd(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setError("");
    try {
      if (editingId) {
        await updateProduct(editingId, {
          title: title.trim(),
          price: Number(price),
          category: category.trim(),
          description: description.trim(),
          stock: Number(stock),
          rating: Number(rating),
          imageUrl: imageUrl.trim()
        });
      } else {
        await createProduct({
          title: title.trim(),
          price: Number(price),
          category: category.trim(),
          description: description.trim(),
          stock: Number(stock),
          rating: Number(rating),
          imageUrl: imageUrl.trim()
        });
      }
      // clear
      setTitle("");
      setPrice("");
      setCategory("");
      setDescription("");
      setStock("");
      setRating("");
      setImageUrl("");
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || e?.response?.data?.error || String(e?.message || e));
    }
  }

  async function onDelete(id) {
    setError("");
    try {
      await deleteProduct(id);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || e?.response?.data?.error || String(e?.message || e));
    }
  }

  async function onPricePlus(id, currentPrice) {
    setError("");
    try {
      await updateProduct(id, { price: Number(currentPrice) + 10 });
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || e?.response?.data?.error || String(e?.message || e));
    }
  }

  return (
    <div className="page">
      <h1 className="page__title">Практика 4 — React + Express API</h1>

      {/* Auth Section */}
      <section className="navigation">
        {user ? (
          <div className="profile">
            <h2 className="navigation__title">Профиль</h2>
            <p>Привет, {user.first_name} {user.last_name}!</p>
            <p>Email: {user.email}</p>
            <button onClick={onLogout} className="button">Выйти</button>
          </div>
        ) : (
          <>
            <h2 className="navigation__title">
              {authMode === 'login' ? 'Вход' : 'Регистрация'}
            </h2>
            <div className="auth-tabs">
              <button
                onClick={() => setAuthMode('login')}
                className={`button-small ${authMode === 'login' ? 'button--active' : ''}`}
              >
                Вход
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`button-small ${authMode === 'register' ? 'button--active' : ''}`}
              >
                Регистрация
              </button>
            </div>
            {authMode === 'login' ? (
              <form onSubmit={onLogin} className="navigation__form">
                <input
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                  className="input-title"
                />
                <input
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Пароль"
                  type="password"
                  className="input-price"
                />
                <div className="navigation__buttons">
                  <button className="button">Войти</button>
                </div>
              </form>
            ) : (
              <form onSubmit={onRegister} className="navigation__form">
                <input
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                  className="input-title"
                />
                <input
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  placeholder="Имя"
                  className="input-price"
                />
                <input
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  placeholder="Фамилия"
                  className="input-stock"
                />
                <input
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Пароль"
                  type="password"
                  className="input-category"
                />
                <div className="navigation__buttons">
                  <button className="button">Зарегистрироваться</button>
                </div>
              </form>
            )}
          </>
        )}
      </section>

      <section className="navigation">
        <h2 className="navigation__title">Добавить товар</h2>

        <form onSubmit={onAdd} className="navigation__form">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название"
            className="input-title"
          />

          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Цена"
            type="number"
            className="input-price"
          />

          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Остаток на складе"
            type="number"
            className="input-stock"
          />

          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Категория"
            className="input-category"
          />

          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            className="input-description"
          />

          <input
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="Рейтинг"
            type="number"
            className="input-rating"
          />

          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL изображения"
            className="input-image-url"
          />

          <div className="navigation__buttons">
            <button disabled={!canSubmit} className="button">
              {editingId ? "Сохранить" : "Добавить"}
            </button>

            <button type="button" onClick={load} className="button">
              Обновить список
            </button>

          </div>
        </form>
      </section>

      <section className="section">
        <h2 className="section__title">Список товаров</h2>

        <div className="container">
          {loading && <p className="loading-text">Загрузка...</p>}

          {error && (
            <p className="error">
              Ошибка: {error}
            </p>
          )}

          <ul className="list">
            {items.map((p) => {
              return (
                <li key={p.id} className="list-item">
                    {ProductCard({ product: p })}

                    <div className="list-item__buttons">
                      {
                        <button
                          onClick={() => {
                            setEditingId(p.id);
                            setTitle(p.title);
                            setPrice(p.price);
                            setCategory(p.category);
                            setDescription(p.description);
                            setStock(p.stock);
                            setRating(p.rating);
                            setImageUrl(p.imageUrl);
                          }}
                          className="button-small"
                        >
                          Редактировать
                        </button>
                      }

                      <button
                        onClick={() => onDelete(p.id)}
                        className={`button-small ${editingId === p.id ? "button-small--disabled" : ""}`}
                        disabled={editingId === p.id}
                      >
                        Удалить
                      </button>
                    </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}