import { useMemo } from "react";
import { deleteProduct, updateProduct, createProduct } from "../api/productsApi";

export default function ProductForm({
  title,
  setTitle,
  price,
  setPrice,
  stock,
  setStock,
  category,
  setCategory,
  description,
  setDescription,
  rating,
  setRating,
  imageUrl,
  setImageUrl,
  editingId,
  setEditingId,
  onSaved
}) {
  const canSubmit = useMemo(() => {
    return title && price > 0 && stock !== "";
  }, [title, price, stock]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProduct(editingId, { title, price, stock, category, description, rating, imageUrl });
        setEditingId(null);
      } else {
        await createProduct({ title, price: Number(price), stock: Number(stock), category, description, rating: Number(rating), imageUrl });
      }
      setTitle(""); setPrice(""); setStock(""); setCategory("");
      setDescription(""); setRating(""); setImageUrl("");
      onSaved?.();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="navigation__form">
      <input
        className="input-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название"
      />

      <input
        className="input-price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Цена"
        type="number"
      />

      <input
        className="input-stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        placeholder="Остаток"
        type="number"
      />

      <input
        className="input-category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Категория"
      />

      <input
        className="input-description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание"
      />

      <input
        className="input-rating"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        placeholder="Рейтинг"
        type="number"
      />

      <input
        className="input-image-url"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="URL картинки"
      />

      <div className="navigation__buttons">
        <button className="button" disabled={!canSubmit}>
          {editingId ? "Сохранить" : "Добавить"}
        </button>
      </div>
    </form>
  );
}
