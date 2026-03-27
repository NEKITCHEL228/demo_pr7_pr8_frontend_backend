import { BrowserRouter, Routes, Route } from "react-router-dom";
import { me } from "./api/authApi";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ShopUnauthorized from "./pages/ShopUnauthorized";
import Shop from "./pages/Shop";
import "./styles/main.scss";
import { useState, useEffect } from "react";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    async function check() {
      try {
        const data = await me();
        setUser(data);
      } catch {
        localStorage.removeItem("accessToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    check();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token ? <Shop /> : <ShopUnauthorized />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
}
