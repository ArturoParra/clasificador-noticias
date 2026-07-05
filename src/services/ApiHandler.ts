import axios, { AxiosError } from 'axios';
//import type { NewsArticle } from '../data/mockNews.ts';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json'
        
    }
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
    if (error.response?.status === 401) {
        console.error('Sesión expirada. Redirigiendo...')
    }
    return Promise.reject(error);
    }
);

export const ApiHandler = {

    getGreet: async () => {
        const response = await apiClient.get('/api/data');
        return response.data;
    },

    getNews: async () => {
        const response = await apiClient.get('/api/news');
        return response.data.map((item: any) => ({
            ...item,
            date: item.publish_date || item.publishedAt || '',
            classification: item.classification || 'none',
            credibilityScore: item.credibilityScore || 0
        }));
    },

    analyzeClaim: async (claim: string) => {
        const response = await apiClient.post('/api/analyze-claim', { claim });
        return response.data;
    },

   getClaims: async () => {
        const response = await apiClient.get('/api/claims');
        // Mapeamos los datos igual que las noticias para evitar errores en la interfaz
        return response.data.map((item: any) => ({
            ...item,
            date: item.publish_date || item.publishedAt || item.date || '',
            classification: item.classification || 'none',
            credibilityScore: item.credibilityScore || 0
        }));
    }

};
