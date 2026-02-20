
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Don't redirect if we are on a login page or trying to login
            const isLoginRequest = error.config.url.includes('/auth/login') ||
                error.config.url.includes('/teachers/login');

            if (isLoginRequest) {
                return Promise.reject(error);
            }

            // Clear local storage
            const role = localStorage.getItem('userRole');
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');

            // Redirect to appropriate login page
            if (role === 'teacher') {
                window.location.href = '/teacher-login';
            } else {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
