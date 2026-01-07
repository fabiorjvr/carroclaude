const express = require('express');
const router = express.Router();
const db = require('../models/database');
const config = require('../config');

// Dashboard unificado com todos os dados
router.get('/', (req, res) => {
  try {
    // 1. Estatísticas
    const stats = db.obterEstatisticas();
    
    // 2. Clientes com Último Serviço e Status Notificação
    // Esta query é mais complexa, vou buscar clientes e enriquecer
    const clientes = db.listarClientes();
    
    const dashboardData = clientes.map(cliente => {
      // Buscar histórico completo
      const historicoServicos = db.buscarHistoricoCliente(cliente.id);
      const ultimoServico = historicoServicos[0] || null;
      
      // Buscar histórico notificações
      const historicoNotificacoes = db.listarHistoricoNotificacoes(cliente.id);
      const ultimaNotificacao = historicoNotificacoes[0] || null;
      
      // Verificar se tem notificação pendente
      const pendentes = db.listarNotificacoesPendentes().filter(n => n.cliente_id === cliente.id);
      
      // Status atual
      let status = 'Em dia';
      let statusClass = 'success';
      
      if (pendentes.length > 0) {
        status = 'Pendente de Envio';
        statusClass = 'warning';
      } else if (ultimaNotificacao && new Date(ultimaNotificacao.data_envio).toDateString() === new Date().toDateString()) {
        status = 'Enviado Hoje';
        statusClass = 'info';
      }
      
      return {
        id: cliente.id,
        nome: cliente.nome,
        telefone: cliente.telefone,
        carro: cliente.carro,
        placa: cliente.placa,
        ultimo_servico: ultimoServico ? {
          tipo: ultimoServico.tipo_servico_nome,
          data: ultimoServico.data_servico,
          km: ultimoServico.km_realizado
        } : null,
        proxima_previsao: ultimaNotificacao ? ultimaNotificacao.km_previsto : 'Calculando...',
        status: status,
        status_class: statusClass,
        ultima_mensagem: ultimaNotificacao ? {
          data: ultimaNotificacao.data_envio,
          sucesso: ultimaNotificacao.enviada === 1,
          erro: ultimaNotificacao.erro
        } : null
      };
    });

    res.json({
      sucesso: true,
      stats,
      clientes: dashboardData,
      agendamentos: config.notifications.hours
    });

  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

module.exports = router;
