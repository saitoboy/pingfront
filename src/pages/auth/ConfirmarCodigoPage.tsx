import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Key, ArrowLeft, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { logger } from '../../lib/logger';
import bgAzul from '../../assets/images/bg azul.png';

export default function ConfirmarCodigoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [codigo, setCodigo] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Se não tiver email, redireciona para esqueci senha
  useEffect(() => {
    if (!email) {
      navigate('/auth/esqueci-senha');
    }
  }, [email, navigate]);

  // Foca no primeiro input ao montar
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Aceita apenas números
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCodigo = [...codigo];
    newCodigo[index] = value;
    setCodigo(newCodigo);
    setError(null);

    // Move para o próximo input se digitou um número
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Se preencheu todos os campos, verifica automaticamente
    if (newCodigo.every(digit => digit !== '') && newCodigo.join('').length === 6) {
      handleVerify(newCodigo.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace: volta para o input anterior se estiver vazio
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Arrow keys: navega entre inputs
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Aceita apenas 6 dígitos
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newCodigo = [...codigo];
      
      digits.forEach((digit, index) => {
        if (index < 6) {
          newCodigo[index] = digit;
        }
      });
      
      setCodigo(newCodigo);
      
      // Foca no último input
      inputRefs.current[5]?.focus();
      
      // Verifica automaticamente
      setTimeout(() => {
        handleVerify(newCodigo.join(''));
      }, 100);
    }
  };

  const handleVerify = async (codigoCompleto?: string) => {
    const codigoFinal = codigoCompleto || codigo.join('');
    
    if (codigoFinal.length !== 6) {
      setError('Por favor, preencha todos os 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.info('Verificando código de redefinição...');
      
      const response = await authService.verifyResetCode(email, codigoFinal);
      
      // A API retorna { sucesso: boolean, mensagem: string, reset_code_id: string }
      // Mas o tipo ApiResponse espera { status, mensagem, dados }
      // Vamos tratar ambos os formatos
      const resetCodeId = (response as any).reset_code_id || (response.dados as any)?.reset_code_id;
      const sucesso = (response as any).sucesso || response.status === 'sucesso';
      
      if (sucesso && resetCodeId) {
        logger.success('Código verificado com sucesso!');
        
        // Redireciona para página de redefinição
        navigate('/auth/redefinir-senha', {
          state: { reset_code_id: resetCodeId }
        });
      } else {
        throw new Error('Código inválido');
      }
      
    } catch (error: any) {
      logger.error('Erro ao verificar código');
      
      if (error.response?.data?.mensagem) {
        setError(error.response.data.mensagem);
      } else {
        setError('Código inválido ou expirado. Tente novamente.');
      }
      
      // Limpa os campos em caso de erro
      setCodigo(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
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
            onClick={() => navigate('/auth/esqueci-senha')}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-300 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        </div>

        {/* Card do formulário */}
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 lg:p-10 border border-white/20">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Verificar Código
            </h2>
            <p className="text-gray-600">
              Digite o código de 6 dígitos enviado para
            </p>
            <p className="text-gray-900 font-semibold mt-1">
              {email}
            </p>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-fade-in">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Formulário */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Campos de código */}
            <div className="flex justify-center gap-3">
              {codigo.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Botão de verificação */}
            <button
              type="submit"
              disabled={isLoading || codigo.some(d => !d)}
              className="group relative w-full flex items-center justify-center py-3.5 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </>
              ) : (
                <>
                  <Key className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Verificar Código
                </>
              )}
            </button>
          </form>

          {/* Link para reenviar código */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth/esqueci-senha', { state: { email } })}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
            >
              Não recebeu o código? Reenviar
            </button>
          </div>

          {/* Rodapé */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              O código expira em 15 minutos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
