import { useMemo } from "react";
import { deleteProduct, updateProduct, createProduct } from "../api/productsApi";
import load from "../App"

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
  onSubmit,
  editingId,
  setEditingId
}) {
  const canSubmit = useMemo(() => {
    return title && price > 0 && stock !== "";
  }, [title, price, stock]);

  async function onSubmit(e) {
    e.preventDefault();

    const product = {
      title,
      price: Number(price),
      stock: Number(stock),
      category,
      description,
      rating: Number(rating),
      imageUrl,
    };

    if (editingId) {
      await updateProduct(editingId, product);
    } else {
      await createProduct(product);
    }

    setTitle("");
    setPrice("");
    setStock("");
    setCategory("");
    setDescription("");
    setRating("");
    setImageUrl("");
    setEditingId(null);

    load();
  }

  return (
    <form onSubmit={onSubmit} className="navigation__form">
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
