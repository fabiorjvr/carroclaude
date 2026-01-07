const axios = require('axios');

const API_URL = 'http://localhost:3000/api/notificacoes/executar';

/**
 * Dispara a notificação chamando a API do servidor local
 */
async function triggerNotification(label) {
  try {
    console.log(`\n🔔 [${new Date().toLocaleTimeString()}] Iniciando disparo: ${label}`);
    const response = await axios.post(API_URL);
    
    console.log(`✅ Comando enviado com sucesso! (Status: ${response.status})`);
    
    const data = response.data;
    if (data.sucesso) {
      console.log(`📊 Resultado: ${data.geradas} geradas, ${data.enviadas} enviadas, ${data.falhas} falhas.`);
    } else {
      console.log(`⚠️  Retorno da API:`, data);
    }
    
  } catch (error) {
    console.error(`❌ Falha ao executar ${label}:`, error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('🔴 O servidor backend não está respondendo.');
      console.error('💡 DICA: Verifique se você rodou "npm run dev" em outro terminal.');
    }
  }
}

async function main() {
  console.log('🚗 AGENDADOR DE ENVIOS - OFICINA DO DIVAL');
  console.log('=========================================');
  console.log('Configurado para: Imediato, 13:00 e 17:00');

  const now = new Date();

  // --- 1. Envio Imediato ---
  await triggerNotification('Envio Imediato (Teste Inicial)');

  // --- 2. Agendamento 13:00 ---
  const target13 = new Date(now);
  target13.setHours(13, 0, 0, 0);
  
  let delay13 = target13.getTime() - Date.now();
  
  if (delay13 > 0) {
    console.log(`\n⏳ Agendado envio para as 13:00 (aguardando ${Math.round(delay13/60000)} min)`);
    setTimeout(() => triggerNotification('Envio Agendado (13:00)'), delay13);
  } else {
    console.log('\nℹ️  Horário das 13:00 já passou. Ignorando este envio.');
  }

  // --- 3. Agendamento 17:00 ---
  const target17 = new Date(now);
  target17.setHours(17, 0, 0, 0);
  
  let delay17 = target17.getTime() - Date.now();
  
  if (delay17 > 0) {
    console.log(`⏳ Agendado envio para as 17:00 (aguardando ${Math.round(delay17/60000)} min)`);
    setTimeout(() => {
      triggerNotification('Envio Agendado (17:00)');
      // Se for o último, podemos avisar que acabou, mas o processo pode ficar aberto
      console.log('\n✅ Último envio do dia realizado.');
    }, delay17);
  } else {
    console.log('ℹ️  Horário das 17:00 já passou. Ignorando este envio.');
  }

  // Manter processo vivo
  if (delay13 > 0 || delay17 > 0) {
    console.log('\n👀 Agendador rodando em segundo plano...');
    console.log('⚠️  NÃO FECHE ESTA JANELA até o último envio ser concluído.');
  } else {
    console.log('\n✅ Tarefas concluídas. Encerrando agendador.');
  }
}

main();
