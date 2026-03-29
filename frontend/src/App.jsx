import { BrowserRouter, Routes, Route } from "react-router-dom";
import { getMe } from "./api/authApi";
import { clearTokens, getAccessToken } from "./api/apiClient";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ShopUnauthorized from "./pages/ShopUnauthorized";
import Shop from "./pages/Shop";
import Admin from "./pages/Admin";
import "./styles/main.scss";
import { useState, useEffect } from "react";

export default function App() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await getMe();
      setMe(data);
    } catch {
      clearTokens();
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={me ? <Shop me={me}/> : <ShopUnauthorized />} />
        <Route path="/profile" element={<Profile me={me} setMe={setMe}/>} />
        <Route path="/auth" element={<Auth  setMe={setMe} />} />
        <Route path="/admin" element={<Admin me={me} />} />
      </Routes>
    </BrowserRouter>
  );
}
