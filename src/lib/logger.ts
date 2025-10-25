// 🎨 CORES E EMOJIS PARA OS LOGS
const logStyles = {
  success: { color: '#10B981', emoji: '✅' },    // Verde
  error: { color: '#EF4444', emoji: '❌' },      // Vermelho
  warning: { color: '#F59E0B', emoji: '⚠️' },    // Amarelo
  info: { color: '#3B82F6', emoji: 'ℹ️' },       // Azul
  debug: { color: '#8B5CF6', emoji: '🔍' },      // Roxo
  api: { color: '#06B6D4', emoji: '🌐' },        // Ciano
  auth: { color: '#F97316', emoji: '🔐' },       // Laranja
  component: { color: '#EC4899', emoji: '🧩' },  // Rosa
  service: { color: '#10B981', emoji: '⚙️' },    // Verde claro
  ui: { color: '#F59E0B', emoji: '🎨' },         // Amarelo
  route: { color: '#8B5CF6', emoji: '🛣️' },      // Roxo claro
  form: { color: '#EC4899', emoji: '📋' },       // Rosa claro
  cache: { color: '#06B6D4', emoji: '💾' },      // Ciano claro
  general: { color: '#6B7280', emoji: '📝' },    // Cinza
  default: { color: '#6B7280', emoji: '📝' }     // Cinza
};

// 🏷️ CATEGORIAS DE LOGS
type LogCategory = 'api' | 'auth' | 'component' | 'service' | 'ui' | 'route' | 'form' | 'cache' | 'general';
type LogLevel = 'success' | 'error' | 'warning' | 'info' | 'debug';

interface LogConfig {
  enabled: boolean;
  environment: 'development' | 'production';
  showTimestamp: boolean;
  showCategory: boolean;
}

class Logger {
  private config: LogConfig;

  constructor() {
    this.config = {
      enabled: import.meta.env.DEV, // Vite usa import.meta.env.DEV
      environment: import.meta.env.PROD ? 'production' : 'development',
      showTimestamp: true,
      showCategory: true
    };
  }

  // 🔧 CONFIGURAÇÃO
  configure(newConfig: Partial<LogConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // 📝 LOG BASE
  private log(level: LogLevel, message: string, category: LogCategory = 'general', data?: any) {
    if (!this.config.enabled) return;

    const levelStyle = logStyles[level] || logStyles.default;
    const categoryStyle = logStyles[category] || logStyles.default;
    
    const timestamp = this.config.showTimestamp 
      ? `[${new Date().toLocaleTimeString('pt-BR')}]` 
      : '';
    
    const categoryLabel = this.config.showCategory 
      ? `[${category.toUpperCase()}]` 
      : '';

    const prefix = `${timestamp} ${categoryLabel}`.trim();

    // Console com estilos
    console.log(
      `%c${prefix} %c${levelStyle.emoji} ${message}`,
      `color: ${categoryStyle.color}; font-weight: bold;`,
      `color: ${levelStyle.color}; font-weight: normal;`
    );

    // Se tem dados extras, mostra
    if (data !== undefined) {
      console.log('%cDados:', 'color: #6B7280; font-style: italic;', data);
    }
  }

  // ✅ SUCESSO
  success(message: string, category: LogCategory = 'general', data?: any) {
    this.log('success', message, category, data);
  }

  // ❌ ERRO
  error(message: string, category: LogCategory = 'general', data?: any) {
    this.log('error', message, category, data);
    
    // Em desenvolvimento, também mostra stack trace se for um Error
    if (this.config.environment === 'development' && data instanceof Error) {
      console.trace(data);
    }
  }

  // ⚠️ AVISO
  warning(message: string, category: LogCategory = 'general', data?: any) {
    this.log('warning', message, category, data);
  }

  // ℹ️ INFORMAÇÃO
  info(message: string, category: LogCategory = 'general', data?: any) {
    this.log('info', message, category, data);
  }

  // 🔍 DEBUG
  debug(message: string, category: LogCategory = 'general', data?: any) {
    this.log('debug', message, category, data);
  }

  // 🌐 LOGS ESPECÍFICOS PARA API
  apiRequest(method: string, url: string, data?: any) {
    this.info(`${method.toUpperCase()} ${url}`, 'api', data);
  }

  apiResponse(status: number, url: string, data?: any) {
    if (status >= 200 && status < 300) {
      this.success(`${status} ${url}`, 'api', data);
    } else if (status >= 400) {
      this.error(`${status} ${url}`, 'api', data);
    } else {
      this.info(`${status} ${url}`, 'api', data);
    }
  }

  // 🔐 LOGS ESPECÍFICOS PARA AUTH
  loginAttempt(email: string) {
    this.info(`Tentativa de login: ${email}`, 'auth');
  }

  loginSuccess(user: any) {
    this.success(`Login realizado com sucesso`, 'auth', { 
      id: user?.id || user?.usuario_id || 'N/A', 
      email: user?.email || 'N/A' 
    });
  }

  loginError(error: string) {
    this.error(`Falha no login: ${error}`, 'auth');
  }

  logout() {
    this.info(`Logout realizado`, 'auth');
  }

  // 🧩 LOGS ESPECÍFICOS PARA COMPONENTES
  componentMounted(componentName: string) {
    this.debug(`Componente montado: ${componentName}`, 'component');
  }

  componentUnmounted(componentName: string) {
    this.debug(`Componente desmontado: ${componentName}`, 'component');
  }

  // 📋 LOGS ESPECÍFICOS PARA FORMULÁRIOS
  formSubmit(formName: string, data?: any) {
    this.info(`Formulário enviado: ${formName}`, 'form', data);
  }

  formValidationError(formName: string, errors: any) {
    this.warning(`Erro de validação no formulário: ${formName}`, 'form', errors);
  }

  // 💾 LOGS ESPECÍFICOS PARA CACHE
  cacheHit(key: string) {
    this.debug(`Cache hit: ${key}`, 'cache');
  }

  cacheMiss(key: string) {
    this.debug(`Cache miss: ${key}`, 'cache');
  }

  cacheSet(key: string, ttl?: number) {
    this.debug(`Cache set: ${key}${ttl ? ` (TTL: ${ttl}ms)` : ''}`, 'cache');
  }

  // 🚨 LOG DE GRUPO (para agrupar logs relacionados)
  group(title: string, callback: () => void) {
    if (!this.config.enabled) return;
    
    console.group(`%c🔸 ${title}`, 'color: #3B82F6; font-weight: bold;');
    callback();
    console.groupEnd();
  }

  // 📊 PERFORMANCE TIMING
  time(label: string) {
    if (this.config.enabled) {
      console.time(`⏱️ ${label}`);
    }
  }

  timeEnd(label: string) {
    if (this.config.enabled) {
      console.timeEnd(`⏱️ ${label}`);
    }
  }
}

// 🌍 INSTÂNCIA GLOBAL
export const logger = new Logger();

// 🎯 EXPORTS PARA FACILITAR O USO
export const {
  success: logSuccess,
  error: logError,
  warning: logWarning,
  info: logInfo,
  debug: logDebug
} = logger;

export default logger;
