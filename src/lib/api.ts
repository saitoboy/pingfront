import axios from 'axios';

// Configuração base da API
// Usa a variável de ambiente VITE_API_URL ou fallback para localhost em desenvolvimento
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

// Log da URL da API em desenvolvimento (ajuda no debug)
if (import.meta.env.DEV) {
  console.log('🔗 API conectando em:', baseURL);
}

const api = axios.create({
  baseURL,
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
    // Se o token expirou (401) e não estamos na página de login, limpa o localStorage
    // mas não redireciona automaticamente - deixa o componente tratar
    if (error.response?.status === 401 && !window.location.pathname.includes('login')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUsuario');
      localStorage.removeItem('userData');
    }
    
    // Rejeita a promise para que o erro seja tratado onde a API foi chamada
    return Promise.reject(error);
  }
);

export default api;
