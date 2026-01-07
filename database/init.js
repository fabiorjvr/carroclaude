const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Criar diretório do banco de dados se não existir
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'oficina.db');
const db = new Database(dbPath);

console.log('🗄️  Inicializando banco de dados...');

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Criar tabelas
const createTables = `
  -- Tabela de Clientes
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL UNIQUE,
    carro TEXT NOT NULL,
    placa TEXT UNIQUE,
    km_media_mensal INTEGER DEFAULT 1000,
    ativo INTEGER DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de Tipos de Serviço
  CREATE TABLE IF NOT EXISTS tipos_servico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    intervalo_km INTEGER NOT NULL,
    descricao TEXT,
    ativo INTEGER DEFAULT 1
  );

  -- Tabela de Serviços Realizados
  CREATE TABLE IF NOT EXISTS servicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    tipo_servico_id INTEGER NOT NULL,
    km_realizado INTEGER NOT NULL,
    valor REAL,
    observacoes TEXT,
    data_servico DATE NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_servico_id) REFERENCES tipos_servico(id)
  );

  -- Tabela de Notificações
  CREATE TABLE IF NOT EXISTS notificacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    servico_id INTEGER,
    tipo_servico_id INTEGER NOT NULL,
    mensagem TEXT NOT NULL,
    km_previsto INTEGER,
    enviada INTEGER DEFAULT 0,
    data_envio DATETIME,
    erro TEXT,
    tentativas INTEGER DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (servico_id) REFERENCES servicos(id),
    FOREIGN KEY (tipo_servico_id) REFERENCES tipos_servico(id)
  );

  -- Tabela de Configurações
  CREATE TABLE IF NOT EXISTS configuracoes (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    descricao TEXT,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Índices para melhor performance
  CREATE INDEX IF NOT EXISTS idx_servicos_cliente ON servicos(cliente_id);
  CREATE INDEX IF NOT EXISTS idx_servicos_data ON servicos(data_servico);
  CREATE INDEX IF NOT EXISTS idx_notificacoes_cliente ON notificacoes(cliente_id);
  CREATE INDEX IF NOT EXISTS idx_notificacoes_enviada ON notificacoes(enviada);
  CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone);
`;

try {
  db.exec(createTables);
  console.log('✅ Tabelas criadas com sucesso!');

  // Inserir tipos de serviço padrão
  const insertTiposServico = db.prepare(`
    INSERT OR IGNORE INTO tipos_servico (codigo, nome, intervalo_km, descricao)
    VALUES (?, ?, ?, ?)
  `);

  const tiposServico = [
    ['troca_oleo', 'Troca de Óleo do Motor', 5000, 'Troca de óleo lubrificante do motor'],
    ['filtro_oleo', 'Filtro de Óleo', 10000, 'Substituição do filtro de óleo'],
    ['correia_dentada', 'Correia Dentada', 60000, 'Substituição da correia dentada'],
    ['filtro_ar', 'Filtro de Ar', 15000, 'Substituição do filtro de ar do motor'],
    ['filtro_combustivel', 'Filtro de Combustível', 20000, 'Substituição do filtro de combustível'],
    ['velas', 'Velas de Ignição', 30000, 'Substituição das velas de ignição'],
    ['pastilhas_freio', 'Pastilhas de Freio', 40000, 'Troca das pastilhas de freio'],
    ['fluido_freio', 'Fluido de Freio', 20000, 'Troca do fluido de freio'],
    ['alinhamento', 'Alinhamento e Balanceamento', 10000, 'Alinhamento e balanceamento das rodas'],
    ['revisao_geral', 'Revisão Geral', 10000, 'Revisão completa do veículo']
  ];

  const insertConfig = db.prepare(`
    INSERT OR IGNORE INTO configuracoes (chave, valor, descricao)
    VALUES (?, ?, ?)
  `);

  const configs = [
    ['whatsapp_conectado', '0', 'Status de conexão do WhatsApp'],
    ['ultima_verificacao', new Date().toISOString(), 'Última verificação de notificações'],
    ['total_notificacoes_enviadas', '0', 'Total de notificações enviadas'],
    ['oficina_nome', 'Minha Oficina', 'Nome da oficina'],
    ['oficina_telefone', '', 'Telefone da oficina']
  ];

  const insertMany = db.transaction(() => {
    tiposServico.forEach(tipo => insertTiposServico.run(...tipo));
    configs.forEach(config => insertConfig.run(...config));
  });

  insertMany();
  
  console.log('✅ Tipos de serviço cadastrados!');
  console.log('✅ Configurações iniciais definidas!');
  
  // Verificar se há dados
  const countClientes = db.prepare('SELECT COUNT(*) as total FROM clientes').get();
  console.log(`\n📊 Estatísticas do Banco:`);
  console.log(`   - Clientes: ${countClientes.total}`);
  console.log(`   - Tipos de Serviço: ${tiposServico.length}`);
  
  console.log('\n✅ Banco de dados inicializado com sucesso!');
  console.log(`📁 Localização: ${dbPath}\n`);

} catch (error) {
  console.error('❌ Erro ao criar tabelas:', error);
  process.exit(1);
} finally {
  db.close();
}
