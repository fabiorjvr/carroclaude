const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const path = require('path');

// Importar rotas
const clientesRoutes = require('./routes/clientes.routes');
const servicosRoutes = require('./routes/servicos.routes');
const notificacoesRoutes = require('./routes/notificacoes.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');

const dashboardRoutes = require('./routes/dashboard.routes');

// Criar app Express
const app = express();

// Middlewares de segurança e performance
app.use(helmet({
  contentSecurityPolicy: false // Necessário para QR Code base64
}));
app.use(compression());
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// Servir frontend estático (nova estrutura)
app.use(express.static(path.join(__dirname, '../../frontend')));

// Rotas da API
app.use('/api/clientes', clientesRoutes);
app.use('/api/servicos', servicosRoutes);
app.use('/api/notificacoes', notificacoesRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  const db = require('./models/database');
  const stats = db.obterEstatisticas();
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    versao: '1.0.0',
    ambiente: config.nodeEnv,
    estatisticas: stats
  });
});

// Rota raiz - Redirecionar para index.html do frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    erro: 'Rota não encontrada',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  res.status(err.status || 500).json({
    sucesso: false,
    erro: config.nodeEnv === 'development' ? err.message : 'Erro interno do servidor',
    stack: config.nodeEnv === 'development' ? err.stack : undefined
  });
});

// Iniciar servidor
const PORT = config.port;

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚗  OFICINA SAAS - Sistema de Notificações');
  console.log('='.repeat(60));
  console.log(`\n✅ Servidor rodando em: http://localhost:${PORT}`);
  console.log(`📱 WhatsApp QR Code: http://localhost:${PORT}/api/whatsapp/qrcode`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📚 Ambiente: ${config.nodeEnv}`);
  console.log('\n' + '='.repeat(60) + '\n');
});

// Tratamento de sinais
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando graciosamente...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT recebido, encerrando graciosamente...');
  process.exit(0);
});

module.exports = app;
