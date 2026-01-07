#!/usr/bin/env node

/**
 * Script de envio de notificações
 * Usado pelo agendador (cron/GitHub Actions)
 */

require('dotenv').config();
const notificationService = require('../backend/src/services/notification.service');
const whatsappService = require('../backend/src/services/whatsapp.service');

async function main() {
  console.log('\n🔔 INICIANDO PROCESSO DE NOTIFICAÇÕES');
  console.log('Data/Hora:', new Date().toLocaleString('pt-BR'));
  console.log('='.repeat(60));

  try {
    // Passo 1: Conectar WhatsApp
    console.log('\n📱 Etapa 1: Conectando ao WhatsApp...');
    
    const statusWhatsApp = await whatsappService.verificarStatus();
    
    if (!statusWhatsApp.conectado) {
      console.log('⚠️  WhatsApp não está conectado');
      console.log('💡 Dica: Acesse http://localhost:3000/api/whatsapp/qrcode para conectar');
      
      // Tentar inicializar (pode falhar em modo headless se não houver sessão salva)
      try {
        await whatsappService.inicializar();
        console.log('✅ WhatsApp conectado com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao conectar WhatsApp:', error.message);
        console.log('\n⚠️  Execute o servidor e conecte via QR Code primeiro');
        process.exit(1);
      }
    } else {
      console.log('✅ WhatsApp já está conectado');
    }

    // Passo 2: Executar processo de notificações
    console.log('\n📝 Etapa 2: Gerando e enviando notificações...');
    
    const resultado = await notificationService.executarProcessoCompleto();

    // Exibir resultados
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DO PROCESSO');
    console.log('='.repeat(60));
    console.log(`✨ Notificações geradas: ${resultado.geradas}`);
    console.log(`✅ Enviadas com sucesso: ${resultado.enviadas}`);
    console.log(`❌ Falhas no envio: ${resultado.falhas}`);
    console.log(`📊 Total processado: ${resultado.total}`);
    console.log('='.repeat(60));

    if (resultado.sucesso) {
      console.log('\n✅ Processo concluído com sucesso!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Processo concluído com ressalvas');
      console.log('Erro:', resultado.erro);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar
main();
