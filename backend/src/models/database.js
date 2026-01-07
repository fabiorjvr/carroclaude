const Database = require('better-sqlite3');
const path = require('path');
const config = require('../config');

class DatabaseModel {
  constructor() {
    const dbPath = path.resolve(config.database.path);
    this.db = new Database(dbPath);
    this.db.pragma('foreign_keys = ON');
  }

  // ==================== CLIENTES ====================
  
  criarCliente(data) {
    const stmt = this.db.prepare(`
      INSERT INTO clientes (nome, telefone, carro, placa, km_media_mensal)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(data.nome, data.telefone, data.carro, data.placa, data.km_media_mensal || 1000);
  }

  listarClientes(filtros = {}) {
    let query = 'SELECT * FROM clientes WHERE ativo = 1';
    const params = [];

    if (filtros.nome) {
      query += ' AND nome LIKE ?';
      params.push(`%${filtros.nome}%`);
    }

    if (filtros.telefone) {
      query += ' AND telefone = ?';
      params.push(filtros.telefone);
    }

    query += ' ORDER BY nome';

    return this.db.prepare(query).all(...params);
  }

  buscarClientePorId(id) {
    return this.db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
  }

  buscarClientePorTelefone(telefone) {
    return this.db.prepare('SELECT * FROM clientes WHERE telefone = ?').get(telefone);
  }

  atualizarCliente(id, data) {
    const stmt = this.db.prepare(`
      UPDATE clientes 
      SET nome = ?, telefone = ?, carro = ?, placa = ?, km_media_mensal = ?,
          atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(data.nome, data.telefone, data.carro, data.placa, data.km_media_mensal, id);
  }

  deletarCliente(id) {
    const stmt = this.db.prepare('UPDATE clientes SET ativo = 0 WHERE id = ?');
    return stmt.run(id);
  }

  // ==================== TIPOS DE SERVIÇO ====================

  listarTiposServico() {
    return this.db.prepare('SELECT * FROM tipos_servico WHERE ativo = 1 ORDER BY nome').all();
  }

  buscarTipoServicoPorCodigo(codigo) {
    return this.db.prepare('SELECT * FROM tipos_servico WHERE codigo = ?').get(codigo);
  }

  // ==================== SERVIÇOS ====================

  criarServico(data) {
    const stmt = this.db.prepare(`
      INSERT INTO servicos (cliente_id, tipo_servico_id, km_realizado, valor, observacoes, data_servico)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.cliente_id,
      data.tipo_servico_id,
      data.km_realizado,
      data.valor || null,
      data.observacoes || null,
      data.data_servico
    );
  }

  listarServicos(filtros = {}) {
    let query = `
      SELECT s.*, c.nome as cliente_nome, c.telefone, c.carro, 
             ts.nome as tipo_servico_nome, ts.codigo as tipo_servico_codigo
      FROM servicos s
      JOIN clientes c ON s.cliente_id = c.id
      JOIN tipos_servico ts ON s.tipo_servico_id = ts.id
      WHERE 1=1
    `;
    const params = [];

    if (filtros.cliente_id) {
      query += ' AND s.cliente_id = ?';
      params.push(filtros.cliente_id);
    }

    if (filtros.tipo_servico_id) {
      query += ' AND s.tipo_servico_id = ?';
      params.push(filtros.tipo_servico_id);
    }

    query += ' ORDER BY s.data_servico DESC';

    return this.db.prepare(query).all(...params);
  }

  buscarUltimoServico(clienteId, tipoServicoId) {
    return this.db.prepare(`
      SELECT * FROM servicos
      WHERE cliente_id = ? AND tipo_servico_id = ?
      ORDER BY data_servico DESC, km_realizado DESC
      LIMIT 1
    `).get(clienteId, tipoServicoId);
  }

  buscarHistoricoCliente(clienteId) {
    return this.db.prepare(`
      SELECT s.*, ts.nome as tipo_servico_nome, ts.codigo as tipo_servico_codigo, ts.intervalo_km
      FROM servicos s
      JOIN tipos_servico ts ON s.tipo_servico_id = ts.id
      WHERE s.cliente_id = ?
      ORDER BY s.data_servico DESC
    `).all(clienteId);
  }

  // ==================== NOTIFICAÇÕES ====================

  criarNotificacao(data) {
    const stmt = this.db.prepare(`
      INSERT INTO notificacoes (cliente_id, servico_id, tipo_servico_id, mensagem, km_previsto)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.cliente_id,
      data.servico_id || null,
      data.tipo_servico_id,
      data.mensagem,
      data.km_previsto || null
    );
  }

  listarNotificacoesPendentes() {
    return this.db.prepare(`
      SELECT n.*, c.nome as cliente_nome, c.telefone, c.carro,
             ts.nome as tipo_servico_nome, ts.codigo as tipo_servico_codigo
      FROM notificacoes n
      JOIN clientes c ON n.cliente_id = c.id
      JOIN tipos_servico ts ON n.tipo_servico_id = ts.id
      WHERE n.enviada = 0 AND n.tentativas < 3
      ORDER BY n.criado_em ASC
    `).all();
  }

  marcarNotificacaoEnviada(id) {
    const stmt = this.db.prepare(`
      UPDATE notificacoes 
      SET enviada = 1, data_envio = CURRENT_TIMESTAMP, tentativas = tentativas + 1
      WHERE id = ?
    `);
    return stmt.run(id);
  }

  registrarErroNotificacao(id, erro) {
    const stmt = this.db.prepare(`
      UPDATE notificacoes 
      SET erro = ?, tentativas = tentativas + 1
      WHERE id = ?
    `);
    return stmt.run(erro, id);
  }

  listarHistoricoNotificacoes(clienteId = null) {
    let query = `
      SELECT n.*, c.nome as cliente_nome, c.telefone,
             ts.nome as tipo_servico_nome
      FROM notificacoes n
      JOIN clientes c ON n.cliente_id = c.id
      JOIN tipos_servico ts ON n.tipo_servico_id = ts.id
      WHERE n.enviada = 1
    `;

    if (clienteId) {
      query += ' AND n.cliente_id = ?';
      return this.db.prepare(query + ' ORDER BY n.data_envio DESC').all(clienteId);
    }

    return this.db.prepare(query + ' ORDER BY n.data_envio DESC').all();
  }

  // ==================== CONFIGURAÇÕES ====================

  buscarConfiguracao(chave) {
    return this.db.prepare('SELECT * FROM configuracoes WHERE chave = ?').get(chave);
  }

  atualizarConfiguracao(chave, valor) {
    const stmt = this.db.prepare(`
      INSERT INTO configuracoes (chave, valor) VALUES (?, ?)
      ON CONFLICT(chave) DO UPDATE SET valor = ?, atualizado_em = CURRENT_TIMESTAMP
    `);
    return stmt.run(chave, valor, valor);
  }

  // ==================== ESTATÍSTICAS ====================

  obterEstatisticas() {
    return {
      total_clientes: this.db.prepare('SELECT COUNT(*) as total FROM clientes WHERE ativo = 1').get().total,
      total_servicos: this.db.prepare('SELECT COUNT(*) as total FROM servicos').get().total,
      total_notificacoes_enviadas: this.db.prepare('SELECT COUNT(*) as total FROM notificacoes WHERE enviada = 1').get().total,
      notificacoes_pendentes: this.db.prepare('SELECT COUNT(*) as total FROM notificacoes WHERE enviada = 0').get().total,
      ultima_notificacao: this.db.prepare('SELECT data_envio FROM notificacoes WHERE enviada = 1 ORDER BY data_envio DESC LIMIT 1').get()
    };
  }

  close() {
    this.db.close();
  }
}

module.exports = new DatabaseModel();
