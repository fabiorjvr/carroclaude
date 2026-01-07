const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'oficina.db');
const db = new Database(dbPath);

console.log('🌱 Semeando banco de dados com dados reais para OFICINA DO DIVAL...');

try {
  // Limpar dados existentes para evitar duplicidade e garantir estado limpo
  db.exec('DELETE FROM servicos');
  db.exec('DELETE FROM clientes');
  db.exec('DELETE FROM notificacoes');
  // Resetar sequencias (IDs voltam para 1)
  db.exec("DELETE FROM sqlite_sequence WHERE name='clientes' OR name='servicos' OR name='notificacoes'");

  // Atualizar configurações da oficina
  const updateConfig = db.prepare('INSERT OR REPLACE INTO configuracoes (chave, valor, descricao) VALUES (?, ?, ?)');
  updateConfig.run('oficina_nome', 'OFICINA DO DIVAL', 'Nome da oficina');
  updateConfig.run('oficina_telefone', '11915022668', 'Telefone da oficina');

  console.log('✅ Configurações atualizadas: OFICINA DO DIVAL');

  // Preparar inserção de clientes
  const insertCliente = db.prepare(`
    INSERT INTO clientes (nome, telefone, carro, placa, km_media_mensal)
    VALUES (?, ?, ?, ?, ?)
  `);

  // --- Cliente 1: William ---
  // Carro: Honda City 2013
  // Serviço: Troca de óleo (Intervalo 5.000 km)
  // Situação: Fez há 6 meses com 100.000km. Média 1.000km/mês.
  // Hoje estimado: 106.000km. Próxima troca era 105.000km. -> Deve notificar (Atrasado)
  const william = insertCliente.run(
    'William',
    '5524981020007', 
    'Honda City 2013',
    'AAA1111', 
    1000
  );

  // --- Cliente 2: Fábio ---
  // Carro: Saveiro 2004
  // Serviço: Troca correia dentada (Intervalo 60.000 km)
  // Situação: Fez há 36 meses com 100.000km. Média 1.500km/mês.
  // Hoje estimado: 100k + 54k = 154.000km. Próxima troca 160.000km.
  // Progresso: 54k/60k = 90%. -> Deve notificar (Próximo)
  const fabio = insertCliente.run(
    'Fábio',
    '5521980306189',
    'Saveiro 2004',
    'BBB2222',
    1500
  );

  console.log('✅ Clientes cadastrados: William e Fábio');

  // Preparar inserção de serviços
  const insertServico = db.prepare(`
    INSERT INTO servicos (cliente_id, tipo_servico_id, km_realizado, data_servico, valor, observacoes)
    VALUES (?, (SELECT id FROM tipos_servico WHERE codigo = ?), ?, ?, ?, ?)
  `);

  // Serviço William (6 meses atrás)
  const dataWilliam = new Date();
  dataWilliam.setMonth(dataWilliam.getMonth() - 6);
  
  insertServico.run(
    william.lastInsertRowid,
    'troca_oleo',
    100000,
    dataWilliam.toISOString().split('T')[0],
    180.00,
    'Óleo 5W30 Sintético'
  );

  // Serviço Fábio (36 meses atrás)
  const dataFabio = new Date();
  dataFabio.setMonth(dataFabio.getMonth() - 36);

  insertServico.run(
    fabio.lastInsertRowid,
    'correia_dentada',
    100000,
    dataFabio.toISOString().split('T')[0],
    450.00,
    'Kit Correia + Tensor'
  );

  console.log('✅ Histórico de serviços inserido');
  console.log('🚀 Banco de dados pronto para execução!');

} catch (error) {
  console.error('❌ Erro ao semear banco:', error);
} finally {
  db.close();
}
