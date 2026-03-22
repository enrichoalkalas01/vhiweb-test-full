import axios from "axios";

const BASE_URL = '/portofolio/show/vhiweb-test-full/api/v1'

const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user_data");
            window.location.href = "/portofolio/show/vhiweb-test-full/login";
        }
        return Promise.reject(error);
    },
);

export default api;
