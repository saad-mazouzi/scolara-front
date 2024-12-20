import axios from 'axios';
import { Cookies } from 'react-cookie';

const cookies = new Cookies();
const axiosInstance = axios.create({
    baseURL: 'https://scolara-backend.onrender.com/api/',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,  
});

axiosInstance.interceptors.request.use(
    config => {
        const token = cookies.get('jwtToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = cookies.get('refreshToken');

            if (refreshToken) {
                try {
                    const response = await axios.post('https://scolara-backend.onrender.com/api/token/refresh/', {
                        refresh: refreshToken,
                    });
                    const { access } = response.data;
                    cookies.set('jwtToken', access, { path: '/' });
                    axiosInstance.defaults.headers['Authorization'] = `Bearer ${access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${access}`;
                    console.log('Token refreshed');
                    console.log(response.data);
                    return axiosInstance(originalRequest);
                } catch (err) {
                    console.log('Le token de rafraîchissement a expiré', err);
                    cookies.remove('jwtToken', { path: '/' });
                    cookies.remove('refreshToken', { path: '/' });
                    window.location.href = '/';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;