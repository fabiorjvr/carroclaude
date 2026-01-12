require('dotenv').config();

// Validação de variáveis de ambiente críticas
const requiredEnvVars = ['DATABASE_PATH'];
const missingVars = requiredEnvVars.filter(v => !process.env[v] && v !== 'DATABASE_PATH');

if (missingVars.length > 0) {
  console.warn(`⚠️ Variáveis de ambiente faltando: ${missingVars.join(', ')}`);
}

// Lista de origens permitidas para CORS
const getAllowedOrigins = () => {
  const origins = process.env.CORS_ORIGINS;
  if (origins) {
    return origins.split(',').map(o => o.trim());
  }
  // Padrão para desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    return ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];
  }
  // Em produção, exigir configuração explícita
  console.warn('⚠️ CORS_ORIGINS não configurada. Usando localhost apenas.');
  return ['http://localhost:3000'];
};

module.exports = {
  // Servidor
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Banco de dados
  database: {
    path: process.env.DATABASE_PATH || './database/oficina.db'
  },

  // WhatsApp WPPConnect
  whatsapp: {
    session: process.env.WPPCONNECT_SESSION || 'oficina-session',
    port: parseInt(process.env.WPPCONNECT_PORT, 10) || 3001,
    webhookUrl: process.env.WPPCONNECT_WEBHOOK_URL || 'http://localhost:3000/webhook/whatsapp',
    deviceName: 'Oficina SaaS',
    headless: process.env.NODE_ENV === 'production',
    logQR: process.env.NODE_ENV !== 'production'
  },

  // APIs de IA
  ai: {
    provider: process.env.AI_PROVIDER || 'groq',
    groq: {
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.AI_MODEL_GROQ || 'llama-3.1-70b-versatile',
      baseURL: 'https://api.groq.com/openai/v1'
    },
    mistral: {
      apiKey: process.env.MISTRAL_API_KEY,
      model: process.env.AI_MODEL_MISTRAL || 'mistral-small-latest',
      baseURL: 'https://api.mistral.ai/v1'
    }
  },

  // Notificações
  notifications: {
    hours: process.env.NOTIFICATION_HOURS?.split(',') || ['09:00', '14:00', '20:00'],
    timezone: process.env.NOTIFICATION_TIMEZONE || 'America/Sao_Paulo',
    maxTentativas: 3,
    intervaloTentativas: 60000 // 1 minuto
  },

  // Intervalos de manutenção (em quilômetros)
  maintenance: {
    troca_oleo: parseInt(process.env.INTERVAL_TROCA_OLEO, 10) || 5000,
    filtro_oleo: parseInt(process.env.INTERVAL_FILTRO_OLEO, 10) || 10000,
    correia_dentada: parseInt(process.env.INTERVAL_CORREIA_DENTADA, 10) || 60000,
    filtro_ar: parseInt(process.env.INTERVAL_FILTRO_AR, 10) || 15000,
    filtro_combustivel: parseInt(process.env.INTERVAL_FILTRO_COMBUSTIVEL, 10) || 20000
  },

  // Rate Limiting - Mais restritivo em produção
  rateLimit: {
    windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 5 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 100 : 500,
    message: {
      sucesso: false,
      erro: 'Muitas requisições. Tente novamente em alguns minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false
  },

  // CORS - Configuração segura
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = getAllowedOrigins();
      // Permitir requisições sem origin (como mobile apps ou curl)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Origem não permitida pelo CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // Segurança adicional
  security: {
    bcryptRounds: 12,
    sessionTimeout: 7 * 24 * 60 * 60 * 1000, // 7 dias
    maxLoginAttempts: 5,
    lockoutTime: 15 * 60 * 1000 // 15 minutos
  }
};

