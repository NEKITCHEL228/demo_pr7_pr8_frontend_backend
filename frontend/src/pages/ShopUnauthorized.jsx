import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api/productsApi";
import ProductList from "../elements/ProductsList";

export default function ShopUnauthorized() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    getProducts().then(setItems);
  }, []);

  return (
    <div className="page">
      <h1 className="page__title">🛍 Магазин</h1>

      <section className="navigation">
        <p>Вы не авторизованы</p>

        <button className="button" onClick={() => navigate("/auth")}>
          🔐 Войти
        </button>
      </section>

      <section className="section">
        <h2 className="section__title">📦 Товары</h2>

        <ProductList products={items} />
      </section>
    </div>
  );
}
