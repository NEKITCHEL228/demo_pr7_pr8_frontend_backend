import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api/productsApi";
import ProductList from "../elements/ProductsList";
import ProductForm from "../elements/ProductForm";

export default function Shop() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [editingId, setEditingId] = useState(null);

  const editBars = {setEditingId, setTitle, setPrice, setStock, setCategory, setDescription, setRating, setImageUrl};

  async function load() {
    const data = await getProducts();
    setProducts(data);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page">
      <h1 className="page__title">Магазин</h1>

      <section className="navigation">
        <button className="button" onClick={() => navigate("/profile")}>
          Перейти в профиль
        </button>
      </section>

      <section className="navigation">
        <h2 className="navigation__title">Добавить товар</h2>

        <ProductForm
          {...{
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
            setEditingId
          }}
        />
      </section>

      <section className="section">
        <h2 className="section__title">Список товаров</h2>

        <ProductList products={products} editBars={editBars} />
      </section>
    </div>
  );
}
