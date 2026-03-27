import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { me } from "../api/authApi";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await me();
        setUser(data);
      } catch {
        navigate("/auth");
      }
    }
    load();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    navigate("/auth");
  }

  if (!user) return <p>Загрузка...</p>;

  return (
    <div className="page">
      <h1 className="page__title">Профиль</h1>

      <section className="navigation profile">
        <p>
          {user.first_name} {user.last_name}
        </p>
        <p>{user.email}</p>

        <button className="button" onClick={() => navigate("/")}>
          На главную
        </button>

        <button className="button" onClick={logout}>
          Выйти
        </button>
      </section>
    </div>
  );
}
