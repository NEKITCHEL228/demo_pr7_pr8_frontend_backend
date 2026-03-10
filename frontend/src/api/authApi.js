import { api } from "./apiClient";

export async function register(payload) {
    return (await api.post("/auth/register", payload)).data;
}

export async function login(payload) {
    return (await api.post("/auth/login", payload)).data;
}

export async function me(id) {
    return (await api.get("/auth/me")).data;
}