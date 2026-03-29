import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, setUserRole } from "../api/adminApi.js";

export default function Admin({ me }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (me?.role !== "admin") {
      navigate("/");
      return;
    }
    loadUsers();
  }, [me]);

  async function loadUsers() {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError("Не удалось загрузить пользователей");
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await setUserRole(userId, newRole);
      await loadUsers();
    } catch (err) {
      setError("Не удалось изменить роль");
    }
  }

  return (
    <div className="page">
      <h1 className="page__title">Управление пользователями</h1>

      <section className="navigation">
        <button className="button" onClick={() => navigate("/")}>
          На главную
        </button>
      </section>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <section className="section">
        <h2 className="section__title">Пользователи</h2>

        <div className="user-list">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <div>
                <p><strong>{user.first_name} {user.last_name}</strong></p>
                <p>{user.email}</p>
                <p>Роль: <strong>{user.role}</strong></p>
              </div>

              {user.id !== me?.id && (
                <div>
                  {user.role === "user" ? (
                    <button
                      className="button-small"
                      onClick={() => handleRoleChange(user.id, "admin")}
                    >
                      Сделать admin
                    </button>
                  ) : (
                    <button
                      className="button-small danger"
                      onClick={() => handleRoleChange(user.id, "user")}
                    >
                      Сделать user
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}