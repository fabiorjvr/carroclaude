const express = require('express');
const router = express.Router();
const db = require('../models/database');
const notificationService = require('../services/notification.service');

// Listar notificações pendentes
router.get('/pendentes', (req, res) => {
  try {
    const notificacoes = db.listarNotificacoesPendentes();
    
    res.json({
      sucesso: true,
      total: notificacoes.length,
      notificacoes
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

// Histórico de notificações enviadas
router.get('/historico', (req, res) => {
  try {
    const clienteId = req.query.cliente_id;
    const historico = db.listarHistoricoNotificacoes(clienteId);
    
    res.json({
      sucesso: true,
      total: historico.length,
      historico
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

// Verificar clientes que precisam de notificação
router.get('/verificar', async (req, res) => {
  try {
    const clientes = await notificationService.verificarClientesParaNotificar();
    
    res.json({
      sucesso: true,
      total: clientes.length,
      clientes
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

// Gerar notificações (sem enviar)
router.post('/gerar', async (req, res) => {
  try {
    const total = await notificationService.gerarNotificacoes();
    
    res.json({
      sucesso: true,
      mensagem: `${total} notificação(ões) gerada(s)`,
      total
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

// Enviar notificações pendentes
router.post('/enviar', async (req, res) => {
  try {
    const resultado = await notificationService.enviarNotificacoesPendentes();
    
    res.json({
      sucesso: resultado.sucesso !== false,
      mensagem: `Enviadas: ${resultado.enviadas}, Falhas: ${resultado.falhas}`,
      ...resultado
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

// Processo completo: gerar e enviar
router.post('/executar', async (req, res) => {
  try {
    const resultado = await notificationService.executarProcessoCompleto();
    
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

// Enviar notificação manual para um cliente
router.post('/manual', async (req, res) => {
  try {
    const { cliente_id, tipo_servico_id, mensagem } = req.body;

    if (!cliente_id || !tipo_servico_id) {
      return res.status(400).json({
        sucesso: false,
        erro: 'cliente_id e tipo_servico_id são obrigatórios'
      });
    }

    const resultado = await notificationService.enviarNotificacaoManual(
      cliente_id,
      tipo_servico_id,
      mensagem
    );

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

// Obter relatório de notificações
router.get('/relatorio', async (req, res) => {
  try {
    const periodo = req.query.periodo || 30;
    const relatorio = await notificationService.obterRelatorio(periodo);
    
    res.json({
      sucesso: true,
      relatorio
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

module.exports = router;
