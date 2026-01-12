const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

// Configuração do cliente Supabase (usando Role Key para backend)
// Em produção, isso deve ser o Service Role Key para ignorar RLS ou ter as policies corretas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ CRÍTICO: Variáveis do Supabase não configuradas no backend.');
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

class DatabaseModel {
  constructor() {
    this.client = supabase;
    console.log('🔌 Conectado ao Supabase (PostgreSQL)');
  }

  // ==================== CLIENTES ====================

  async criarCliente(data) {
    const { data: cliente, error } = await this.client
      .from('clientes')
      .insert({
        nome: data.nome,
        telefone: data.telefone,
        carro: data.carro,
        placa: data.placa,
        km_media_mensal: data.km_media_mensal || 1000,
        ativo: true
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar cliente: ${error.message}`);

    // Retornar estrutura similar ao SQLite (lastInsertRowid/objeto)
    return { lastInsertRowid: cliente.id, ...cliente };
  }

  async listarClientes(filtros = {}) {
    let query = this.client
      .from('clientes')
      .select('*')
      .eq('ativo', true);

    if (filtros.nome) {
      query = query.ilike('nome', `%${filtros.nome}%`);
    }

    if (filtros.telefone) {
      query = query.eq('telefone', filtros.telefone);
    }

    query = query.order('nome');

    const { data, error } = await query;
    if (error) throw new Error(`Erro ao listar clientes: ${error.message}`);
    return data;
  }

  async buscarClientePorId(id) {
    const { data, error } = await this.client
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 é "não encontrado"
      throw new Error(`Erro ao buscar cliente: ${error.message}`);
    }
    return data;
  }

  async buscarClientePorTelefone(telefone) {
    const { data, error } = await this.client
      .from('clientes')
      .select('*')
      .eq('telefone', telefone)
      .single();

    if (error && error.code !== 'PGRST116') return null;
    return data;
  }

  async atualizarCliente(id, data) {
    const { error } = await this.client
      .from('clientes')
      .update({
        nome: data.nome,
        telefone: data.telefone,
        carro: data.carro,
        placa: data.placa,
        km_media_mensal: data.km_media_mensal,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw new Error(`Erro ao atualizar cliente: ${error.message}`);
    return true;
  }

  async deletarCliente(id) {
    // Soft delete
    const { error } = await this.client
      .from('clientes')
      .update({ ativo: false })
      .eq('id', id);

    if (error) throw new Error(`Erro ao deletar cliente: ${error.message}`);
    return true;
  }

  // ==================== TIPOS DE SERVIÇO ====================

  async listarTiposServico() {
    const { data, error } = await this.client
      .from('tipos_servico')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) throw new Error(error.message);
    return data;
  }

  // ==================== SERVIÇOS ====================

  async criarServico(data) {
    const { data: servico, error } = await this.client
      .from('servicos')
      .insert({
        cliente_id: data.cliente_id,
        tipo_servico_id: data.tipo_servico_id,
        km_realizado: data.km_realizado,
        valor: data.valor || null,
        observacoes: data.observacoes || null,
        data_servico: data.data_servico
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar serviço: ${error.message}`);
    return { lastInsertRowid: servico.id, ...servico };
  }

  async listarServicos(filtros = {}) {
    let query = this.client
      .from('servicos')
      .select(`
        *,
        clientes:cliente_id (nome, telefone, carro),
        tipos_servico:tipo_servico_id (nome, codigo)
      `);

    if (filtros.cliente_id) {
      query = query.eq('cliente_id', filtros.cliente_id);
    }

    if (filtros.tipo_servico_id) {
      query = query.eq('tipo_servico_id', filtros.tipo_servico_id);
    }

    query = query.order('data_servico', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(`Erro ao listar serviços: ${error.message}`);

    // Flatten structure to match old API if needed
    return data.map(s => ({
      ...s,
      cliente_nome: s.clientes?.nome,
      telefone: s.clientes?.telefone,
      carro: s.clientes?.carro,
      tipo_servico_nome: s.tipos_servico?.nome,
      tipo_servico_codigo: s.tipos_servico?.codigo
    }));
  }

  async buscarUltimoServico(clienteId, tipoServicoId) {
    const { data, error } = await this.client
      .from('servicos')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('tipo_servico_id', tipoServicoId)
      .order('data_servico', { ascending: false })
      .order('km_realizado', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  }

  async buscarHistoricoCliente(clienteId) {
    const { data, error } = await this.client
      .from('servicos')
      .select(`
        *,
        tipos_servico:tipo_servico_id (nome, codigo, intervalo_km)
      `)
      .eq('cliente_id', clienteId)
      .order('data_servico', { ascending: false });

    if (error) throw new Error(error.message);

    return data.map(s => ({
      ...s,
      tipo_servico_nome: s.tipos_servico?.nome,
      tipo_servico_codigo: s.tipos_servico?.codigo,
      intervalo_km: s.tipos_servico?.intervalo_km
    }));
  }

  // ==================== NOTIFICAÇÕES ====================

  async criarNotificacao(data) {
    const { data: notif, error } = await this.client
      .from('notificacoes')
      .insert({
        cliente_id: data.cliente_id,
        servico_id: data.servico_id || null,
        tipo_servico_id: data.tipo_servico_id,
        mensagem: data.mensagem,
        km_previsto: data.km_previsto || null,
        enviada: false
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar notificação: ${error.message}`);
    return { lastInsertRowid: notif.id, ...notif };
  }

  async listarNotificacoesPendentes() {
    const { data, error } = await this.client
      .from('notificacoes')
      .select(`
        *,
        clientes:cliente_id (nome, telefone, carro),
        tipos_servico:tipo_servico_id (nome, codigo)
      `)
      .eq('enviada', false)
      .lt('tentativas', 3)
      .order('criado_em', { ascending: true });

    if (error) throw new Error(error.message);

    return data.map(n => ({
      ...n,
      cliente_nome: n.clientes?.nome,
      telefone: n.clientes?.telefone,
      carro: n.clientes?.carro,
      tipo_servico_nome: n.tipos_servico?.nome,
      tipo_servico_codigo: n.tipos_servico?.codigo
    }));
  }

  async marcarNotificacaoEnviada(id) {
    await this.client
      .from('notificacoes')
      .update({
        enviada: true,
        data_envio: new Date().toISOString(),
        tentativas: this.client.rpc('increment', { x: 1 }) // OU buscar e atualizar
      })
      .eq('id', id);

    // Simplificando o incremento, Supabase não tem incremento atômico direto no update simples sem RPC
    // Vamos fazer um update simples
    const { error } = await this.client.rpc('incrementar_tentativa_enviada', { row_id: id });
    // Fallback se RPC não existir (vamos criar depois ou fazer read+write)
    if (error) {
      // Fallback simples
      const { data } = await this.client.from('notificacoes').select('tentativas').eq('id', id).single();
      if (data) {
        await this.client
          .from('notificacoes')
          .update({
            enviada: true,
            data_envio: new Date().toISOString(),
            tentativas: (data.tentativas || 0) + 1
          })
          .eq('id', id);
      }
    }
    return true;
  }

  async registrarErroNotificacao(id, erro) {
    const { data } = await this.client.from('notificacoes').select('tentativas').eq('id', id).single();

    await this.client
      .from('notificacoes')
      .update({
        erro: erro,
        tentativas: (data?.tentativas || 0) + 1
      })
      .eq('id', id);
    return true;
  }

  async listarHistoricoNotificacoes(clienteId = null) {
    let query = this.client
      .from('notificacoes')
      .select(`
        *,
        clientes:cliente_id (nome, telefone),
        tipos_servico:tipo_servico_id (nome)
      `)
      .eq('enviada', true);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    query = query.order('data_envio', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return data.map(n => ({
      ...n,
      cliente_nome: n.clientes?.nome,
      telefone: n.clientes?.telefone,
      tipo_servico_nome: n.tipos_servico?.nome
    }));
  }

  // ==================== ESTATÍSTICAS ====================

  async obterEstatisticas() {
    const { count: totalClientes } = await this.client
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true);

    const { count: totalServicos } = await this.client
      .from('servicos')
      .select('*', { count: 'exact', head: true });

    const { count: notificacoesEnviadas } = await this.client
      .from('notificacoes')
      .select('*', { count: 'exact', head: true })
      .eq('enviada', true);

    const { count: notificacoesPendentes } = await this.client
      .from('notificacoes')
      .select('*', { count: 'exact', head: true })
      .eq('enviada', false);

    return {
      total_clientes: totalClientes || 0,
      total_servicos: totalServicos || 0,
      total_notificacoes_enviadas: notificacoesEnviadas || 0,
      notificacoes_pendentes: notificacoesPendentes || 0
    };
  }

  close() {
    // Supabase JS client handles connection management automatically
  }
}

module.exports = new DatabaseModel();
