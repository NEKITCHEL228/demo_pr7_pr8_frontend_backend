import { useEffect, useMemo, useState } from "react";
import { createProduct, deleteProduct, getProducts, updateProduct } from "./api/productsApi";
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

  const canSubmit = useMemo(() => title.trim() !== "" && price !== "" && Number(price) > 0 && stock !== "", [title, price, stock]);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await getProducts();
      setItems(data);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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
      setError(String(e?.message || e));
    }
  }

  async function onDelete(id) {
    setError("");
    try {
      await deleteProduct(id);
      await load();
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  async function onPricePlus(id, currentPrice) {
    setError("");
    try {
      await updateProduct(id, { price: Number(currentPrice) + 10 });
      await load();
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  return (
    <div className="page">
      <h1 className="page__title">Практика 4 — React + Express API</h1>
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
              <br />
              Проверьте, что: (1) backend запущен на 3000, (2) CORS настроен, (3) TODO в productsApi.js реализованы.
            </p>
          )}

          <ul className="list">
            {items.map((p) => {
              // determine whether image URL is present and non-empty
              const hasImage = p.imageUrl && p.imageUrl.trim() !== "";
              return (
                <li
                  key={p.id}
                  className={`list-item ${hasImage ? "list-item__image" : "list-item__placeholder"}`}
                  style={
                    hasImage
                      ? { backgroundImage: `url(${p.imageUrl})` }
                      : undefined
                  }
                >
                  <div className="list-item__wrap">
                    <div className="list-item__text">
                      <p>{p.title} — {p.price} ₽</p>
                      <p>{p.description}</p>
                      <p>Остаток: {p.stock}</p>
                      <p>Рейтинг: {p.rating}</p>
                    </div>

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