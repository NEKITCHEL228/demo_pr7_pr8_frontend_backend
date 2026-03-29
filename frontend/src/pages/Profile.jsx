import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, logoutUser } from "../api/authApi";
import { } from "../api/apiClient";

export default function Profile({ me, setMe }) {
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await getMe();
        setMe(data);
      } catch {
        navigate("/auth");
      }
    }
    load();
  }, []);

  function onLogout() {
    logoutUser();
    setMe(null);
    navigate("/auth");
  }

  if (!me) return <p>Загрузка...</p>;

  return (
    <div className="page">
      <h1 className="page__title">Профиль</h1>

      <section className="navigation profile">
        <p>
          {me.first_name} {me.last_name}
        </p>
        <p>{me.email}</p>

        <button className="button" onClick={() => navigate("/")}>
          На главную
        </button>

        <button className="button" onClick={onLogout}>
          Выйти
        </button>
      </section>
    </div>
  );
}
