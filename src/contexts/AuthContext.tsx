import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Usuario } from '../types/api';
import { authService } from '../services/authService';

// 🎯 TIPO DO CONTEXT - o que ele vai fornecer
interface AuthContextType {
  usuario: Usuario | null;        // Dados do usuário logado (ou null)
  token: string | null;           // Token JWT (ou null)
  isAuthenticated: boolean;       // Está logado? true/false  
  isLoading: boolean;            // Está carregando? true/false
  login: (email: string, senha: string) => Promise<void>;  // Função para fazer login
  logout: () => void;            // Função para fazer logout
}

// 🏗️ CRIANDO O CONTEXT
const AuthContext = createContext<AuthContextType | null>(null);

// 🪝 HOOK personalizado para usar o context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// 📦 PROVIDER - componente que vai "envolver" a aplicação
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // 📊 ESTADOS do contexto
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ⚡ EFFECT - roda quando o componente carrega
  useEffect(() => {
    // Função assíncrona para verificar o token
    const verificarTokenSalvo = async () => {
      // Verifica se já tem token salvo no localStorage
      const savedToken = localStorage.getItem('authToken');
      const savedUsuario = localStorage.getItem('authUsuario');

      if (savedToken && savedUsuario) {
        try {
          // Verifica se o token é válido fazendo uma requisição ao backend
          const tokenValido = await authService.verifyToken(savedToken);
          
          if (tokenValido) {
            // Token válido, restaura o estado
            setToken(savedToken);
            setUsuario(JSON.parse(savedUsuario));
          } else {
            // Token inválido ou expirado, remove do localStorage
            console.log('🔒 Token expirado ou inválido, removendo do localStorage');
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUsuario');
            setToken(null);
            setUsuario(null);
          }
        } catch (error) {
          // Se der erro ao fazer parse ou verificar, limpa o localStorage
          console.error('❌ Erro ao verificar token:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUsuario');
          setToken(null);
          setUsuario(null);
        }
      }

      setIsLoading(false);
    };

    verificarTokenSalvo();
  }, []);

  // 🔑 FUNÇÃO LOGIN
  const login = async (email: string, senha: string) => {
    try {
      setIsLoading(true);
      
      // Remove qualquer token antigo do localStorage antes de fazer novo login
      // Isso garante que tokens expirados não causem problemas
      const tokenAntigo = localStorage.getItem('authToken');
      if (tokenAntigo) {
        console.log('🧹 Removendo token antigo antes do login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUsuario');
        setToken(null);
        setUsuario(null);
      }
      
      // Chama o serviço de autenticação
      const response = await authService.login({ email, senha });
      
      if (response.status === 'sucesso' && response.dados) {
        const { token: newToken, usuario: newUsuario } = response.dados;
        
        // Log para debug - mostra o que está sendo salvo
        console.log('🔍 [AuthContext] Dados recebidos do authService:', {
          token: newToken ? 'Token presente' : 'Token ausente',
          usuario: newUsuario
        });
        
        // Salva no estado
        setToken(newToken);
        setUsuario(newUsuario);
        
        // Salva no localStorage para persistir
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUsuario', JSON.stringify(newUsuario));
        
        // Log para confirmar o que foi salvo
        console.log('✅ [AuthContext] Dados salvos no estado e localStorage:', {
          usuario_salvo: newUsuario,
          tipo_usuario_id: newUsuario?.tipo_usuario_id
        });
      } else {
        // Se a API retornou erro, lança exceção
        throw new Error(response.mensagem || 'Erro no login');
      }
    } catch (error) {
      // Repassa o erro para quem chamou
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 🚪 FUNÇÃO LOGOUT
  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUsuario');
  };

  // 📋 VALOR que será fornecido pelo context
  const value: AuthContextType = {
    usuario,
    token,
    isAuthenticated: !!token && !!usuario,  // true se tem token E usuário
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
