import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, logoutUser, getMe } from "../api/authApi";
import { getAccessToken, clearTokens } from "../api/apiClient"

export default function Auth({ setMe }) {
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState("login");
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [authLoading, setAuthLoading] = useState(false);

  async function onLogin(e) {
    e.preventDefault();
    setAuthLoading(true);
    try {
      await loginUser({ email, password });
      const data = await getMe();
      setMe(data);
      navigate("/");
    } catch (e2) {
      setError(String(e2?.response?.data?.message || e2?.message || e2));
    }
    finally {
      setAuthLoading(false);
    }
  }

  async function onRegister(e) {
    e.preventDefault();
    setAuthLoading(true);
    try {
      await registerUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      await loginUser({ email, password });
      const data = await getMe();
      setMe(data);
      navigate("/");
    } catch (e2) {
      setError(String(e2?.response?.data?.message || e2?.message || e2));
    }
    finally {
      setAuthLoading(false);
    }
  }



  return (
    <div className="page">
      <h1 className="page__title">
        {authMode === "login" ? "Вход" : "Регистрация"}
      </h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <section className="navigation">
        <div className="auth-tabs">
          <button
            className={`button-small ${authMode === "login" ? "button--active" : ""
              }`}
            onClick={() => setAuthMode("login")}
          >
            Вход
          </button>

          <button
            className={`button-small ${authMode === "register" ? "button--active" : ""
              }`}
            onClick={() => setAuthMode("register")}
          >
            Регистрация
          </button>
        </div>

        {authMode === "login" ? (
          <form onSubmit={onLogin} className="navigation__form">
            <input
              className="input-title"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              className="input-price"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              type="password"
            />

            <div className="navigation__buttons">
              <button className="button" type="submit">
                Войти
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={onRegister} className="navigation__form">
            <input
              className="input-title"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              className="input-price"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Имя"
            />
            <input
              className="input-stock"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Фамилия"
            />
            <input
              className="input-category"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              type="password"
            />

            <div className="navigation__buttons">
              <button className="button" type="submit">
                Регистрация
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
