#!/usr/bin/env node

/**
 * Script de teste - verifica clientes que precisam de notificação
 */

require('dotenv').config();
const notificationService = require('../backend/src/services/notification.service');
const aiService = require('../backend/src/services/ai.service');

async function main() {
  console.log('\n🧪 TESTE DE NOTIFICAÇÕES - Modo Simulação');
  console.log('='.repeat(60));

  try {
    // Testar IA
    console.log('\n🤖 Testando conexão com IA...');
    const testeIA = await aiService.testarConexao();
    
    if (testeIA.sucesso) {
      console.log(`✅ IA conectada: ${testeIA.provider}`);
      console.log(`📝 Resposta: ${testeIA.resposta}`);
    } else {
      console.log(`❌ Erro na IA: ${testeIA.erro}`);
    }

    // Verificar clientes
    console.log('\n🔍 Verificando clientes que precisam de notificação...');
    const clientes = await notificationService.verificarClientesParaNotificar();

    if (clientes.length === 0) {
      console.log('ℹ️  Nenhum cliente precisa de notificação no momento');
      process.exit(0);
    }

    console.log(`\n✨ Encontrados ${clientes.length} cliente(s) para notificar:\n`);

    for (const { cliente, notificacoes } of clientes) {
      console.log('─'.repeat(60));
      console.log(`👤 Cliente: ${cliente.nome}`);
      console.log(`🚗 Veículo: ${cliente.carro}`);
      console.log(`📱 Telefone: ${cliente.telefone}`);
      console.log(`📏 KM média/mês: ${cliente.km_media_mensal} km`);
      console.log(`\n🔧 Manutenções pendentes (${notificacoes.length}):`);

      for (const notif of notificacoes) {
        console.log(`\n   • ${notif.tipoServico.nome}`);
        console.log(`     KM atual estimado: ${notif.kmAtual} km`);
        console.log(`     Próxima troca: ${notif.kmProximaTroca} km`);
        console.log(`     Último serviço: ${new Date(notif.ultimoServico.data_servico).toLocaleDateString('pt-BR')}`);
        
        // Gerar mensagem de exemplo
        try {
          const mensagemExemplo = await aiService.gerarMensagemNotificacao(
            cliente,
            notif.ultimoServico,
            notif.tipoServico
          );
          console.log(`\n     📤 Mensagem que seria enviada:`);
          console.log(`     ┌${'─'.repeat(50)}`);
          mensagemExemplo.split('\n').forEach(linha => {
            console.log(`     │ ${linha}`);
          });
          console.log(`     └${'─'.repeat(50)}`);
        } catch (error) {
          console.log(`     ⚠️  Erro ao gerar mensagem: ${error.message}`);
        }
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📊 RESUMO');
    console.log('═'.repeat(60));
    console.log(`Total de clientes: ${clientes.length}`);
    
    const totalNotificacoes = clientes.reduce((acc, c) => acc + c.notificacoes.length, 0);
    console.log(`Total de notificações: ${totalNotificacoes}`);
    
    console.log('\n💡 Para gerar e enviar as notificações, execute:');
    console.log('   npm run notification:send');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
