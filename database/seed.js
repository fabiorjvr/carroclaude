const Database = require('better-sqlite3');
const path = require('path');
const { subDays, format } = require('date-fns');

const dbPath = path.join(__dirname, 'oficina.db');
const db = new Database(dbPath);

console.log('🌱 Populando banco de dados com dados de teste...\n');

// Dados de exemplo
const clientes = [
  {
    nome: 'João Silva',
    telefone: '5511999999999',
    carro: 'Honda Civic 2020',
    placa: 'ABC1D23',
    km_media_mensal: 1500
  },
  {
    nome: 'Maria Santos',
    telefone: '5511988888888',
    carro: 'Toyota Corolla 2019',
    placa: 'XYZ9W87',
    km_media_mensal: 1200
  },
  {
    nome: 'Pedro Oliveira',
    telefone: '5511977777777',
    carro: 'Volkswagen Gol 2018',
    placa: 'DEF4G56',
    km_media_mensal: 800
  },
  {
    nome: 'Ana Costa',
    telefone: '5511966666666',
    carro: 'Chevrolet Onix 2021',
    placa: 'GHI7J89',
    km_media_mensal: 2000
  },
  {
    nome: 'Carlos Pereira',
    telefone: '5511955555555',
    carro: 'Fiat Argo 2022',
    placa: 'JKL0M12',
    km_media_mensal: 1000
  }
];

try {
  // Inserir clientes
  const insertCliente = db.prepare(`
    INSERT INTO clientes (nome, telefone, carro, placa, km_media_mensal)
    VALUES (?, ?, ?, ?, ?)
  `);

  const clientesIds = [];
  for (const cliente of clientes) {
    const result = insertCliente.run(
      cliente.nome,
      cliente.telefone,
      cliente.carro,
      cliente.placa,
      cliente.km_media_mensal
    );
    clientesIds.push(result.lastInsertRowid);
    console.log(`✅ Cliente cadastrado: ${cliente.nome}`);
  }

  // Inserir serviços realizados (histórico)
  const insertServico = db.prepare(`
    INSERT INTO servicos (cliente_id, tipo_servico_id, km_realizado, valor, data_servico, observacoes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const servicosExemplo = [
    // Cliente 1 - João Silva (última troca há 60 dias)
    { clienteId: 1, tipoId: 1, km: 40000, valor: 150.00, dias: 60, obs: 'Troca de óleo sintético' },
    { clienteId: 1, tipoId: 2, km: 40000, valor: 50.00, dias: 60, obs: 'Filtro original' },
    { clienteId: 1, tipoId: 9, km: 40000, valor: 100.00, dias: 60, obs: null },
    
    // Cliente 2 - Maria Santos (última troca há 90 dias - precisa notificar)
    { clienteId: 2, tipoId: 1, km: 35000, valor: 140.00, dias: 90, obs: 'Óleo semissintético' },
    { clienteId: 2, tipoId: 4, km: 35000, valor: 60.00, dias: 90, obs: null },
    
    // Cliente 3 - Pedro Oliveira (última troca há 45 dias)
    { clienteId: 3, tipoId: 1, km: 48000, valor: 120.00, dias: 45, obs: null },
    { clienteId: 3, tipoId: 2, km: 48000, valor: 45.00, dias: 45, obs: null },
    
    // Cliente 4 - Ana Costa (última troca há 30 dias - ainda ok)
    { clienteId: 4, tipoId: 1, km: 25000, valor: 160.00, dias: 30, obs: 'Óleo sintético premium' },
    { clienteId: 4, tipoId: 2, km: 25000, valor: 55.00, dias: 30, obs: null },
    { clienteId: 4, tipoId: 7, km: 25000, valor: 200.00, dias: 30, obs: 'Pastilhas dianteiras' },
    
    // Cliente 5 - Carlos Pereira (última troca há 120 dias - urgente!)
    { clienteId: 5, tipoId: 1, km: 30000, valor: 130.00, dias: 120, obs: null },
    { clienteId: 5, tipoId: 3, km: 30000, valor: 800.00, dias: 180, obs: 'Correia + tensor' }
  ];

  for (const servico of servicosExemplo) {
    const dataServico = format(subDays(new Date(), servico.dias), 'yyyy-MM-dd');
    insertServico.run(
      servico.clienteId,
      servico.tipoId,
      servico.km,
      servico.valor,
      dataServico,
      servico.obs
    );
  }

  console.log(`\n✅ ${servicosExemplo.length} serviços registrados!`);

  // Estatísticas
  const stats = {
    clientes: db.prepare('SELECT COUNT(*) as total FROM clientes').get(),
    servicos: db.prepare('SELECT COUNT(*) as total FROM servicos').get(),
    tipos: db.prepare('SELECT COUNT(*) as total FROM tipos_servico').get()
  };

  console.log('\n📊 Estatísticas do Banco:');
  console.log(`   - Clientes: ${stats.clientes.total}`);
  console.log(`   - Serviços realizados: ${stats.servicos.total}`);
  console.log(`   - Tipos de serviço: ${stats.tipos.total}`);

  console.log('\n✅ Banco de dados populado com sucesso!\n');
  console.log('💡 Dica: Execute "npm run notification:send" para testar o envio de notificações\n');

} catch (error) {
  console.error('❌ Erro ao popular banco:', error);
  process.exit(1);
} finally {
  db.close();
}
