import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const client = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

let handleUnauthorized = () => {};

export function setUnauthorizedHandler(handler) {
    handleUnauthorized = handler || (() => {});
}

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const isLoginRequest = url.includes('/login');
        if (error.response?.status === 401 && !isLoginRequest) {
            localStorage.removeItem('token');
            handleUnauthorized();
        }
        return Promise.reject(error);
    }
);

async function request(method, url, data, config = {}) {
    const response = await client.request({
        method,
        url,
        ...(data !== undefined ? { data } : {}),
        ...config
    });
    return response.data?.data;
}

const api = {
    get: (url, config) => request('get', url, undefined, config),
    post: (url, data, config) => request('post', url, data, config),
    put: (url, data, config) => request('put', url, data, config),
    delete: (url, config) => request('delete', url, undefined, config)
};

export default api;
