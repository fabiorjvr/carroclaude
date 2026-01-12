const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { validate, sanitizeBody } = require('../middleware/validation');

// Aplicar sanitização em todas as rotas
router.use(sanitizeBody);

// Listar todos os clientes
router.get('/', (req, res) => {
  try {
    const filtros = {
      nome: req.query.nome,
      telefone: req.query.telefone
    };

    const clientes = db.listarClientes(filtros);

    res.json({
      sucesso: true,
      total: clientes.length,
      clientes
    });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno ao buscar clientes'
    });
  }
});

// Buscar cliente por ID
router.get('/:id', validate('idParam', 'params'), (req, res) => {
  try {
    const cliente = db.buscarClientePorId(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Cliente não encontrado'
      });
    }

    // Buscar histórico de serviços
    const historico = db.buscarHistoricoCliente(cliente.id);

    res.json({
      sucesso: true,
      cliente,
      historico
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno ao buscar cliente'
    });
  }
});

// Criar novo cliente
router.post('/', validate('cliente'), (req, res) => {
  try {
    const { nome, telefone, carro, placa, km_media_mensal } = req.body;

    // Verificar se telefone já existe
    const clienteExistente = db.buscarClientePorTelefone(telefone);
    if (clienteExistente) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Já existe um cliente com este telefone'
      });
    }

    const resultado = db.criarCliente({
      nome,
      telefone,
      carro,
      placa,
      km_media_mensal: km_media_mensal || 1000
    });

    const novoCliente = db.buscarClientePorId(resultado.lastInsertRowid);

    res.status(201).json({
      sucesso: true,
      mensagem: 'Cliente cadastrado com sucesso',
      cliente: novoCliente
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno ao cadastrar cliente'
    });
  }
});

// Atualizar cliente
router.put('/:id', (req, res) => {
  try {
    const cliente = db.buscarClientePorId(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Cliente não encontrado'
      });
    }

    const { nome, telefone, carro, placa, km_media_mensal } = req.body;

    db.atualizarCliente(req.params.id, {
      nome: nome || cliente.nome,
      telefone: telefone || cliente.telefone,
      carro: carro || cliente.carro,
      placa: placa || cliente.placa,
      km_media_mensal: km_media_mensal || cliente.km_media_mensal
    });

    const clienteAtualizado = db.buscarClientePorId(req.params.id);

    res.json({
      sucesso: true,
      mensagem: 'Cliente atualizado com sucesso',
      cliente: clienteAtualizado
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

// Deletar cliente (soft delete)
router.delete('/:id', (req, res) => {
  try {
    const cliente = db.buscarClientePorId(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Cliente não encontrado'
      });
    }

    db.deletarCliente(req.params.id);

    res.json({
      sucesso: true,
      mensagem: 'Cliente removido com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

module.exports = router;
