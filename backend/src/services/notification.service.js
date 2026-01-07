const db = require('../models/database');
const aiService = require('./ai.service');
const whatsappService = require('./whatsapp.service');
const { differenceInDays, parseISO } = require('date-fns');

class NotificationService {
  /**
   * Verifica quais clientes precisam de notificação
   */
  async verificarClientesParaNotificar() {
    console.log('🔍 Verificando clientes para notificar...');

    const clientes = db.listarClientes();
    const clientesParaNotificar = [];

    for (const cliente of clientes) {
      const notificacoes = await this._verificarManutencoesPendentes(cliente);
      
      if (notificacoes.length > 0) {
        clientesParaNotificar.push({
          cliente,
          notificacoes
        });
      }
    }

    console.log(`✅ Encontrados ${clientesParaNotificar.length} clientes para notificar`);
    return clientesParaNotificar;
  }

  /**
   * Verifica manutenções pendentes de um cliente
   */
  async _verificarManutencoesPendentes(cliente) {
    const tiposServico = db.listarTiposServico();
    const notificacoesPendentes = [];

    for (const tipoServico of tiposServico) {
      const ultimoServico = db.buscarUltimoServico(cliente.id, tipoServico.id);
      
      if (!ultimoServico) {
        // Cliente nunca fez este serviço, considerar notificação inicial
        continue;
      }

      const precisaNotificar = this._precisaNotificar(
        ultimoServico,
        tipoServico,
        cliente.km_media_mensal
      );

      if (precisaNotificar) {
        notificacoesPendentes.push({
          tipoServico,
          ultimoServico,
          kmAtual: this._estimarKmAtual(ultimoServico, cliente.km_media_mensal),
          kmProximaTroca: ultimoServico.km_realizado + tipoServico.intervalo_km
        });
      }
    }

    return notificacoesPendentes;
  }

  /**
   * Verifica se precisa notificar baseado em km e tempo
   */
  _precisaNotificar(ultimoServico, tipoServico, kmMediaMensal) {
    const diasDesdeServico = differenceInDays(new Date(), parseISO(ultimoServico.data_servico));
    const kmPercorrido = (diasDesdeServico / 30) * kmMediaMensal;
    const kmAtual = ultimoServico.km_realizado + kmPercorrido;
    const kmProximaTroca = ultimoServico.km_realizado + tipoServico.intervalo_km;
    
    // Notificar quando estiver a 80% do intervalo ou mais
    const percentual = ((kmAtual - ultimoServico.km_realizado) / tipoServico.intervalo_km) * 100;
    
    return percentual >= 80;
  }

  /**
   * Estima quilometragem atual
   */
  _estimarKmAtual(ultimoServico, kmMediaMensal) {
    const diasDesdeServico = differenceInDays(new Date(), parseISO(ultimoServico.data_servico));
    const kmPercorrido = (diasDesdeServico / 30) * kmMediaMensal;
    return Math.round(ultimoServico.km_realizado + kmPercorrido);
  }

  /**
   * Gera e salva notificações no banco
   */
  async gerarNotificacoes() {
    console.log('📝 Gerando notificações...');

    const clientesParaNotificar = await this.verificarClientesParaNotificar();
    let totalNotificacoes = 0;

    for (const { cliente, notificacoes } of clientesParaNotificar) {
      for (const notif of notificacoes) {
        try {
          // Verificar se já existe notificação pendente
          const notificacoesPendentes = db.listarNotificacoesPendentes();
          const jaExiste = notificacoesPendentes.some(
            n => n.cliente_id === cliente.id && n.tipo_servico_id === notif.tipoServico.id
          );

          if (jaExiste) {
            console.log(`⏭️  Notificação já existe para ${cliente.nome} - ${notif.tipoServico.nome}`);
            continue;
          }

          // Gerar mensagem com IA
          const mensagem = await aiService.gerarMensagemNotificacao(
            cliente,
            notif.ultimoServico,
            notif.tipoServico
          );

          // Salvar no banco
          db.criarNotificacao({
            cliente_id: cliente.id,
            servico_id: notif.ultimoServico.id,
            tipo_servico_id: notif.tipoServico.id,
            mensagem: mensagem,
            km_previsto: notif.kmProximaTroca
          });

          totalNotificacoes++;
          console.log(`✅ Notificação gerada para ${cliente.nome} - ${notif.tipoServico.nome}`);

        } catch (error) {
          console.error(`❌ Erro ao gerar notificação para ${cliente.nome}:`, error.message);
        }
      }
    }

    console.log(`\n📊 Total de notificações geradas: ${totalNotificacoes}`);
    return totalNotificacoes;
  }

  /**
   * Envia notificações pendentes via WhatsApp
   */
  async enviarNotificacoesPendentes() {
    console.log('\n📤 Enviando notificações pendentes...');

    // Verificar se WhatsApp está conectado
    const statusWhatsApp = await whatsappService.verificarStatus();
    if (!statusWhatsApp.conectado) {
      console.log('❌ WhatsApp não está conectado. Conectando...');
      try {
        await whatsappService.inicializar();
      } catch (error) {
        console.error('❌ Não foi possível conectar ao WhatsApp:', error.message);
        return { sucesso: false, erro: 'WhatsApp desconectado' };
      }
    }

    const notificacoes = db.listarNotificacoesPendentes();
    
    if (notificacoes.length === 0) {
      console.log('ℹ️  Nenhuma notificação pendente para enviar');
      return { total: 0, enviadas: 0, falhas: 0 };
    }

    console.log(`📋 ${notificacoes.length} notificações para enviar`);

    const destinatarios = notificacoes.map(n => ({
      clienteId: n.cliente_id,
      notificacaoId: n.id,
      telefone: n.telefone,
      mensagem: n.mensagem
    }));

    const resultados = await whatsappService.enviarMensagemEmLote(destinatarios);

    // Atualizar banco de dados
    let enviadas = 0;
    let falhas = 0;

    for (const resultado of resultados) {
      if (resultado.sucesso) {
        db.marcarNotificacaoEnviada(resultado.notificacaoId);
        enviadas++;
        console.log(`✅ Notificação enviada: ID ${resultado.notificacaoId}`);
      } else {
        db.registrarErroNotificacao(resultado.notificacaoId, resultado.erro);
        falhas++;
        console.log(`❌ Falha no envio: ID ${resultado.notificacaoId} - ${resultado.erro}`);
      }
    }

    console.log(`\n📊 Resumo do envio:`);
    console.log(`   ✅ Enviadas: ${enviadas}`);
    console.log(`   ❌ Falhas: ${falhas}`);
    console.log(`   📱 Total: ${notificacoes.length}\n`);

    return {
      total: notificacoes.length,
      enviadas,
      falhas,
      resultados
    };
  }

  /**
   * Processo completo: gerar e enviar notificações
   */
  async executarProcessoCompleto() {
    console.log('\n🚀 Iniciando processo completo de notificações...\n');
    console.log('=' .repeat(50));

    try {
      // Passo 1: Gerar notificações
      const totalGeradas = await this.gerarNotificacoes();
      
      // Passo 2: Enviar notificações
      const resultado = await this.enviarNotificacoesPendentes();

      console.log('=' .repeat(50));
      console.log('\n✅ Processo completo finalizado!');
      
      return {
        sucesso: true,
        geradas: totalGeradas,
        ...resultado
      };

    } catch (error) {
      console.error('\n❌ Erro no processo de notificações:', error);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  }

  /**
   * Envia notificação manual para um cliente
   */
  async enviarNotificacaoManual(clienteId, tipoServicoId, mensagemCustomizada = null) {
    const cliente = db.buscarClientePorId(clienteId);
    const tipoServico = db.listarTiposServico().find(t => t.id === tipoServicoId);

    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    if (!tipoServico) {
      throw new Error('Tipo de serviço não encontrado');
    }

    // Usar mensagem customizada ou gerar com IA
    let mensagem = mensagemCustomizada;
    
    if (!mensagem) {
      const ultimoServico = db.buscarUltimoServico(clienteId, tipoServicoId);
      mensagem = await aiService.gerarMensagemNotificacao(cliente, ultimoServico, tipoServico);
    }

    // Criar notificação
    const notif = db.criarNotificacao({
      cliente_id: clienteId,
      tipo_servico_id: tipoServicoId,
      mensagem: mensagem,
      servico_id: null
    });

    // Enviar imediatamente
    try {
      await whatsappService.enviarMensagem(cliente.telefone, mensagem);
      db.marcarNotificacaoEnviada(notif.lastInsertRowid);
      
      return {
        sucesso: true,
        mensagem: 'Notificação enviada com sucesso',
        notificacaoId: notif.lastInsertRowid
      };
    } catch (error) {
      db.registrarErroNotificacao(notif.lastInsertRowid, error.message);
      throw error;
    }
  }

  /**
   * Obtém relatório de notificações
   */
  async obterRelatorio(periodo = 30) {
    const stats = db.obterEstatisticas();
    const historico = db.listarHistoricoNotificacoes();

    return {
      estatisticas: stats,
      historico: historico.slice(0, 20), // Últimas 20
      pendentes: db.listarNotificacoesPendentes()
    };
  }
}

module.exports = new NotificationService();
