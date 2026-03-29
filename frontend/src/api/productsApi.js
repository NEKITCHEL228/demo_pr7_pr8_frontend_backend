import { api } from "./apiClient";

export async function getProducts() {
    return (await api.get("/products")).data;
}

export async function createProduct(payload) {
    return (await api.post("/products", payload)).data;
}

export async function updateProduct(id, patch) {
    return (await api.patch(`/products/${id}`, patch)).data;
}

export async function deleteProduct(id) {
    return (await api.delete(`/products/${id}`)).data;
}
