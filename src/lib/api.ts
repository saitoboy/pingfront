import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: 'http://localhost:3003',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    // Se a resposta foi bem-sucedida, apenas retorna
    return response;
  },
  (error) => {
    // Se o token expirou (401), redireciona para login
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUsuario');
      window.location.href = '/login';
    }
    
    // Rejeita a promise para que o erro seja tratado onde a API foi chamada
    return Promise.reject(error);
  }
);

export default api;
