import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// 🎨 FUNÇÃO PARA COMBINAR CLASSES TAILWIND
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 📋 FORMATADORES DE DADOS
export const formatters = {
  // 📄 CPF
  cpf: (cpf: string | undefined | null): string => {
    if (!cpf) return '';
    const cleanCpf = cpf.replace(/\D/g, '');
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  // 📞 TELEFONE
  telefone: (telefone: string | undefined | null): string => {
    if (!telefone) return '';
    const cleanTelefone = telefone.replace(/\D/g, '');
    if (cleanTelefone.length === 10) {
      return cleanTelefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return cleanTelefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  },

  // 📅 DATA
  data: (data: string | Date | undefined | null): string => {
    if (!data) return '';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  },

  // 🕐 DATA E HORA
  dataHora: (data: string | Date | undefined | null): string => {
    if (!data) return '';
    try {
      return new Date(data).toLocaleString('pt-BR');
    } catch {
      return '';
    }
  },

  // 📊 NOTA
  nota: (nota: number | undefined | null): string => {
    if (nota === null || nota === undefined) return '-';
    return nota.toFixed(1).replace('.', ',');
  },

  // 📈 PERCENTUAL
  percentual: (valor: number | undefined | null): string => {
    if (valor === null || valor === undefined) return '-';
    return `${valor.toFixed(1).replace('.', ',')}%`;
  },

  // 💰 MOEDA (caso precise)
  moeda: (valor: number | undefined | null): string => {
    if (valor === null || valor === undefined) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  },

  // 🔢 NÚMERO
  numero: (numero: number | undefined | null): string => {
    if (numero === null || numero === undefined) return '0';
    return numero.toLocaleString('pt-BR');
  }
};

// ✅ VALIDADORES
export const validators = {
  // 📄 CPF
  cpf: (cpf: string | undefined | null): boolean => {
    if (!cpf) return false;
    const cleanCpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCpf.length !== 11) return false;
    
    // Verifica se não são todos iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
    
    // Algoritmo de validação do CPF
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cleanCpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cleanCpf.charAt(10))) return false;
    
    return true;
  },

  // 📧 EMAIL
  email: (email: string | undefined | null): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 📞 TELEFONE
  telefone: (telefone: string | undefined | null): boolean => {
    if (!telefone) return false;
    const cleanTelefone = telefone.replace(/\D/g, '');
    return cleanTelefone.length >= 10 && cleanTelefone.length <= 11;
  },

  // 📊 NOTA (0 a 10)
  nota: (nota: number | undefined | null): boolean => {
    if (nota === null || nota === undefined) return false;
    return nota >= 0 && nota <= 10;
  },

  // 📅 DATA (não pode ser futura)
  dataNascimento: (data: string | Date | undefined | null): boolean => {
    if (!data) return false;
    try {
      const dataObj = new Date(data);
      const hoje = new Date();
      return dataObj <= hoje;
    } catch {
      return false;
    }
  },

  // 📝 CAMPO OBRIGATÓRIO
  obrigatorio: (valor: any): boolean => {
    if (valor === null || valor === undefined) return false;
    if (typeof valor === 'string') return valor.trim().length > 0;
    if (Array.isArray(valor)) return valor.length > 0;
    return true;
  }
};

// 💾 SISTEMA DE CACHE INTELIGENTE
class CacheService {
  private cache = new Map<string, any>();
  private timestamps = new Map<string, number>();

  // 📥 DEFINIR CACHE
  set(key: string, data: any, ttl = 300000): void { // 5 minutos padrão
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now() + ttl);
  }

  // 📤 OBTER CACHE
  get(key: string): any | null {
    const timestamp = this.timestamps.get(key);
    if (timestamp && timestamp > Date.now()) {
      return this.cache.get(key);
    }
    this.delete(key);
    return null;
  }

  // 🗑️ DELETAR CACHE
  delete(key: string): void {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  // 🧹 LIMPAR TODO CACHE
  clear(): void {
    this.cache.clear();
    this.timestamps.clear();
  }

  // 📊 ESTATÍSTICAS DO CACHE
  stats(): { keys: number; size: number } {
    // Limpar expirados primeiro
    this.cleanup();
    return {
      keys: this.cache.size,
      size: JSON.stringify([...this.cache.values()]).length
    };
  }

  // 🧹 LIMPEZA AUTOMÁTICA (remove expirados)
  private cleanup(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (timestamp <= now) {
        this.delete(key);
      }
    }
  }
}

// 🌍 INSTÂNCIA GLOBAL DO CACHE
export const cache = new CacheService();

// 🛠️ UTILITÁRIOS DIVERSOS
export const utils = {
  // ⏱️ DEBOUNCE (evitar muitas execuções seguidas)
  debounce: <T extends (...args: any[]) => any>(
    func: T, 
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => func.apply(null, args), delay);
    };
  },

  // 🎲 GERAR ID ÚNICO
  generateId: (): string => {
    return Math.random().toString(36).substr(2, 9);
  },

  // 📱 DETECTAR MOBILE
  isMobile: (): boolean => {
    return window.innerWidth <= 768;
  },

  // 📋 COPIAR PARA CLIPBOARD
  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  },

  // 🌙 DETECTAR TEMA ESCURO
  isDarkMode: (): boolean => {
    return window.matchMedia && 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  // 📥 DOWNLOAD DE ARQUIVO
  downloadFile: (data: any, filename: string, type = 'application/json'): void => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // 🎯 SCROLL SUAVE PARA ELEMENTO
  scrollToElement: (elementId: string, offset = 0): void => {
    const element = document.getElementById(elementId);
    if (element) {
      const top = element.offsetTop - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  },

  // 🔄 SLEEP (aguardar um tempo)
  sleep: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// 🎯 STATUS E BADGES
export const statusConfig = {
  aluno: {
    ativo: { label: 'Ativo', color: 'bg-green-100 text-green-800', emoji: '✅' },
    inativo: { label: 'Inativo', color: 'bg-gray-100 text-gray-800', emoji: '⏸️' },
    transferido: { label: 'Transferido', color: 'bg-blue-100 text-blue-800', emoji: '🔄' }
  },
  matricula: {
    ativa: { label: 'Ativa', color: 'bg-green-100 text-green-800', emoji: '✅' },
    inativa: { label: 'Inativa', color: 'bg-gray-100 text-gray-800', emoji: '⏸️' },
    transferida: { label: 'Transferida', color: 'bg-blue-100 text-blue-800', emoji: '🔄' }
  },
  situacao: {
    Aprovado: { label: 'Aprovado', color: 'bg-green-100 text-green-800', emoji: '✅' },
    Reprovado: { label: 'Reprovado', color: 'bg-red-100 text-red-800', emoji: '❌' },
    'Em Andamento': { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800', emoji: '⏳' },
    Recuperação: { label: 'Recuperação', color: 'bg-orange-100 text-orange-800', emoji: '🔄' }
  }
};

// 📱 BREAKPOINTS RESPONSIVOS
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

// 🎨 VARIÁVEIS DE ESTILO COMUNS
export const styles = {
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  },
  rounded: {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl'
  },
  spacing: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }
};
