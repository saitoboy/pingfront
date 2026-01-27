import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';
import { logger } from '../../lib/logger';
import bgAzul from '../../assets/images/bg azul.png';

export default function RedefinirSenhaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const resetCodeId = location.state?.reset_code_id || '';
  
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Se não tiver reset_code_id, redireciona
  useEffect(() => {
    if (!resetCodeId) {
      navigate('/auth/esqueci-senha');
    }
  }, [resetCodeId, navigate]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    const passwordError = validatePassword(novaSenha);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      logger.info('Redefinindo senha...');
      
      await authService.resetPassword(resetCodeId, novaSenha);
      
      setSuccess(true);
      logger.success('Senha redefinida com sucesso!');
      
      // Redireciona para login após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error: any) {
      logger.error('Erro ao redefinir senha');
      
      if (error.response?.data?.mensagem) {
        setError(error.response.data.mensagem);
      } else if (error.message?.includes('Network') || error.message?.includes('ERR_NETWORK')) {
        setError('Erro de conexão. Verifique se o servidor está rodando.');
      } else {
        setError('Erro ao redefinir senha. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center overflow-hidden p-8 lg:p-0 relative"
      style={{
        backgroundImage: `url(${bgAzul})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-md flex flex-col gap-8 items-center overflow-hidden relative z-10">
        
        {/* Botão Voltar */}
        <div className="w-full flex justify-start">
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-300 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao login</span>
          </button>
        </div>

        {/* Card do formulário */}
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 lg:p-10 border border-white/20">
          
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Nova Senha
            </h2>
            <p className="text-gray-600">
              Digite sua nova senha abaixo
            </p>
          </div>

          {/* Mensagem de sucesso */}
          {success && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 animate-fade-in">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-green-800 font-medium">
                    Senha redefinida com sucesso!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Redirecionando para o login...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem de erro */}
          {error && !success && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-fade-in">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Formulário */}
          {!success && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Campo Nova Senha */}
              <div>
                <label htmlFor="novaSenha" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="novaSenha"
                    name="novaSenha"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={novaSenha}
                    onChange={(e) => {
                      setNovaSenha(e.target.value);
                      setError(null);
                    }}
                    placeholder="Mínimo 6 caracteres"
                    className="block w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Campo Confirmar Senha */}
              <div>
                <label htmlFor="confirmarSenha" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmarSenha}
                    onChange={(e) => {
                      setConfirmarSenha(e.target.value);
                      setError(null);
                    }}
                    placeholder="Digite a senha novamente"
                    className="block w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-blue-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botão de redefinição */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center py-3.5 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Redefinindo...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Redefinir Senha
                  </>
                )}
              </button>
            </form>
          )}

          {/* Rodapé */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              Lembrou sua senha?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Voltar ao login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
