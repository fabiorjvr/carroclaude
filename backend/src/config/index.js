require('dotenv').config();

module.exports = {
  // Servidor
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Banco de dados
  database: {
    path: process.env.DATABASE_PATH || './database/oficina.db'
  },

  // WhatsApp WPPConnect
  whatsapp: {
    session: process.env.WPPCONNECT_SESSION || 'oficina-session',
    port: process.env.WPPCONNECT_PORT || 3001,
    webhookUrl: process.env.WPPCONNECT_WEBHOOK_URL || 'http://localhost:3000/webhook/whatsapp',
    deviceName: 'Oficina SaaS',
    headless: false,
    logQR: true
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
    troca_oleo: parseInt(process.env.INTERVAL_TROCA_OLEO) || 5000,
    filtro_oleo: parseInt(process.env.INTERVAL_FILTRO_OLEO) || 10000,
    correia_dentada: parseInt(process.env.INTERVAL_CORREIA_DENTADA) || 60000,
    filtro_ar: parseInt(process.env.INTERVAL_FILTRO_AR) || 15000,
    filtro_combustivel: parseInt(process.env.INTERVAL_FILTRO_COMBUSTIVEL) || 20000
  },

  // Limites e segurança
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // máximo de requisições por janela
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }
};
