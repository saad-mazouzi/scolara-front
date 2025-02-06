import axios from 'axios';
import { Cookies } from 'react-cookie';

const cookies = new Cookies();

const axiosInstance = axios.create({
    baseURL: 'https://scolara-backend.onrender.com/api/',
    timeout: 20000,
    headers: {
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// ✅ Intercepteur des requêtes : Ajout automatique du JWT dans l'en-tête
axiosInstance.interceptors.request.use(
    (config) => {
        const token = cookies.get('jwtToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Intercepteur des réponses : Gestion du refresh token et de la déconnexion
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
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

                    console.log('Token rafraîchi avec succès');
                    return axiosInstance(originalRequest);
                } catch (err) {
                    console.log('Le token de rafraîchissement a expiré. Déconnexion en cours...');

                    // ✅ Suppression des cookies
                    cookies.remove('jwtToken', { path: '/' });
                    cookies.remove('refreshToken', { path: '/' });

                    // ✅ Redirection vers la page de login
                    window.location.href = '/login';
                }
            } else {
                // ✅ Si pas de refresh token, rediriger vers la page de login
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
