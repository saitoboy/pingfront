import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { logger } from '../../lib/logger';
import bgAzul from '../../assets/images/bg azul.png';

export default function EsqueciSenhaPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      logger.info('Solicitando redefinição de senha...');
      
      const response = await authService.forgotPassword(email);
      
      // Verifica se a resposta indica sucesso
      // A API pode retornar { sucesso: boolean } ou { status: 'sucesso' | 'erro' }
      const sucesso = (response as any).sucesso || response.status === 'sucesso';
      
      if (sucesso) {
        setSuccess(true);
        logger.success('Código de redefinição enviado com sucesso!');
        
        // Redireciona para página de confirmação após 2 segundos
        setTimeout(() => {
          navigate('/auth/confirmar-codigo', { 
            state: { email } 
          });
        }, 2000);
      } else {
        // Se não foi sucesso, mostra erro
        const mensagem = response.mensagem || (response as any).mensagem || 'Erro ao solicitar redefinição.';
        setError(mensagem);
        logger.error('Erro ao solicitar redefinição de senha');
      }
      
    } catch (error: any) {
      logger.error('Erro ao solicitar redefinição de senha');
      
      // Trata diferentes tipos de erro
      if (error.response?.status === 404) {
        // Email não encontrado
        setError(error.response?.data?.mensagem || 'Email não cadastrado no sistema.');
      } else if (error.response?.data?.mensagem) {
        setError(error.response.data.mensagem);
      } else if (error.message?.includes('Network') || error.message?.includes('ERR_NETWORK')) {
        setError('Erro de conexão. Verifique se o servidor está rodando.');
      } else {
        setError('Erro ao solicitar redefinição. Tente novamente.');
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
              Esqueceu sua senha?
            </h2>
            <p className="text-gray-600">
              Digite seu email e enviaremos um código de redefinição
            </p>
          </div>

          {/* Mensagem de sucesso */}
          {success && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 animate-fade-in">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-green-800 font-medium">
                    Código enviado com sucesso!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Verifique sua caixa de entrada. Redirecionando...
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
              {/* Campo Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="seu@email.com"
                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  />
                </div>
              </div>

              {/* Botão de envio */}
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
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    Enviar Código
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
