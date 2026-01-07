const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Listar tipos de serviço disponíveis
router.get('/tipos', (req, res) => {
  try {
    const tipos = db.listarTiposServico();
    
    res.json({
      sucesso: true,
      total: tipos.length,
      tipos
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

// Listar serviços realizados
router.get('/', (req, res) => {
  try {
    const filtros = {
      cliente_id: req.query.cliente_id,
      tipo_servico_id: req.query.tipo_servico_id
    };

    const servicos = db.listarServicos(filtros);
    
    res.json({
      sucesso: true,
      total: servicos.length,
      servicos
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

// Buscar histórico de um cliente
router.get('/cliente/:clienteId', (req, res) => {
  try {
    const cliente = db.buscarClientePorId(req.params.clienteId);
    
    if (!cliente) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Cliente não encontrado'
      });
    }

    const historico = db.buscarHistoricoCliente(req.params.clienteId);

    res.json({
      sucesso: true,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        carro: cliente.carro
      },
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

// Registrar novo serviço
router.post('/', (req, res) => {
  try {
    const { cliente_id, servicos, km_realizado, valor, observacoes, data_servico } = req.body;

    // Validações
    if (!cliente_id || !servicos || !km_realizado || !data_servico) {
      return res.status(400).json({
        sucesso: false,
        erro: 'cliente_id, servicos (array), km_realizado e data_servico são obrigatórios'
      });
    }

    // Verificar se cliente existe
    const cliente = db.buscarClientePorId(cliente_id);
    if (!cliente) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Cliente não encontrado'
      });
    }

    // Servicos deve ser array de códigos ou IDs
    if (!Array.isArray(servicos) || servicos.length === 0) {
      return res.status(400).json({
        sucesso: false,
        erro: 'servicos deve ser um array com pelo menos um item'
      });
    }

    const servicosCriados = [];
    const tiposServico = db.listarTiposServico();

    // Registrar cada serviço
    for (const servicoCodigo of servicos) {
      // Buscar tipo de serviço por código ou ID
      const tipoServico = tiposServico.find(
        t => t.codigo === servicoCodigo || t.id === parseInt(servicoCodigo)
      );

      if (!tipoServico) {
        console.warn(`Tipo de serviço não encontrado: ${servicoCodigo}`);
        continue;
      }

      const resultado = db.criarServico({
        cliente_id,
        tipo_servico_id: tipoServico.id,
        km_realizado,
        valor: valor || null,
        observacoes: observacoes || null,
        data_servico
      });

      servicosCriados.push({
        id: resultado.lastInsertRowid,
        tipo_servico: tipoServico.nome,
        codigo: tipoServico.codigo
      });
    }

    res.status(201).json({
      sucesso: true,
      mensagem: `${servicosCriados.length} serviço(s) registrado(s) com sucesso`,
      servicos: servicosCriados,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        carro: cliente.carro
      }
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

// Buscar último serviço de um tipo específico para um cliente
router.get('/ultimo/:clienteId/:tipoServicoId', (req, res) => {
  try {
    const ultimoServico = db.buscarUltimoServico(
      req.params.clienteId,
      req.params.tipoServicoId
    );

    if (!ultimoServico) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Nenhum serviço encontrado'
      });
    }

    res.json({
      sucesso: true,
      servico: ultimoServico
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

module.exports = router;
