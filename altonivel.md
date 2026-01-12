CarroClaude - Prompt Completo para DesenvolvimentoDe Zero a Produção na Vercel (Next.js + Supabase + WPPConnect + IA)📋 RESUMO EXECUTIVOVocê vai criar uma plataforma SaaS profissional de CRM para oficinas mecânicas com:✅ Frontend: Next.js 14 (TypeScript) + Tailwind CSS + Vercel
✅ Backend: Next.js API Routes (sem servidor separado)
✅ Banco de Dados: Supabase (PostgreSQL gerenciado)
✅ WhatsApp: WPPConnect (automação de mensagens)
✅ IA: Integração Groq (LLaMA 3) com persona Virginia Fonseca
✅ Autenticação: JWT + Supabase Auth
✅ Multi-tenant: Suporte a 10 oficinas diferentes (fase 1)
✅ Dashboard: Painel profissional com estatísticas
✅ Escalável: Pronto para crescimento e novos serviçosPARTE 1: SETUP COMPLETO DO SUPABASE1.1 Criar Conta SupabaseAcesse: https://supabase.comClique em "Start your project" ou faça login com GitHubClique em "New project"Preencha:Organization Name: Sua organizaçãoProject Name: carroclaudeDatabase Password: Salve em local seguro! (será usado depois)Region: South America (São Paulo) sa-east-1Aguarde criação (2-3 minutos)1.2 Obter CredenciaisApós criar, você estará no Dashboard do Supabase.Vá para: Settings → API → Project SettingsVocê verá:Project URL: https://[seu-project-id].supabase.co
anon (public) key: pk_[sua-chave-publica]
service_role (secret) key: sk_[sua-chave-privada]Salve em um arquivo seguro:SUPABASE_URL=https://[seu-project-id].supabase.co
SUPABASE_ANON_KEY=pk_...
SUPABASE_SERVICE_KEY=sk_...
SUPABASE_DB_PASSWORD=[sua-senha-do-banco]1.3 Criar Tabelas no Banco de DadosNo Supabase Dashboard, vá para: SQL EditorExecute cada query abaixo uma por vez, clicando em "Run":QUERY 1: Tabela de Oficinas (Tenants)CREATE TABLE oficinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  numero_whatsapp VARCHAR(20),
  whatsapp_conectado BOOLEAN DEFAULT FALSE,
  whatsapp_qrcode TEXT,
  plano VARCHAR(50) DEFAULT 'gratuito',
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_oficinas_email ON oficinas(email);
CREATE INDEX idx_oficinas_ativo ON oficinas(ativo);QUERY 2: Tabela de ClientesCREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  carro VARCHAR(255) NOT NULL,
  ano_carro INTEGER,
  km_carro INTEGER,
  placa VARCHAR(10),
  cor VARCHAR(50),
  combustivel VARCHAR(50),
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_clientes_oficina ON clientes(oficina_id);
CREATE INDEX idx_clientes_whatsapp ON clientes(whatsapp);QUERY 3: Tabela de ServiçosCREATE TABLE servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  tipo_servico VARCHAR(255) NOT NULL,
  data_servico DATE NOT NULL,
  km_na_data INTEGER,
  descricao TEXT,
  valor DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'realizado',
  proxima_manutencao_km INTEGER,
  proxima_manutencao_dias INTEGER,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_servicos_cliente ON servicos(cliente_id);
CREATE INDEX idx_servicos_oficina ON servicos(oficina_id);
CREATE INDEX idx_servicos_data ON servicos(data_servico);QUERY 4: Tabela de Mensagens WhatsAppCREATE TABLE mensagens_whatsapp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  numero_destino VARCHAR(20) NOT NULL,
  numero_whatsapp_origem VARCHAR(20) NOT NULL,
  mensagem TEXT NOT NULL,
  tipo_mensagem VARCHAR(50) DEFAULT 'notificacao',
  status VARCHAR(50) DEFAULT 'pendente',
  tentativas INTEGER DEFAULT 0,
  erro_mensagem TEXT,
  enviado_em TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mensagens_oficina ON mensagens_whatsapp(oficina_id);
CREATE INDEX idx_mensagens_status ON mensagens_whatsapp(status);
CREATE INDEX idx_mensagens_cliente ON mensagens_whatsapp(cliente_id);QUERY 5: Tabela de Logs e AuditoriaCREATE TABLE logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  usuario_id UUID,
  acao VARCHAR(255) NOT NULL,
  tabela_afetada VARCHAR(100),
  registro_id UUID,
  dados_antigos JSONB,
  dados_novos JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_oficina ON logs_auditoria(oficina_id);
CREATE INDEX idx_logs_acao ON logs_auditoria(acao);QUERY 6: Tabela de Configurações por OficinaCREATE TABLE configuracoes_oficina (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oficina_id UUID NOT NULL UNIQUE REFERENCES oficinas(id) ON DELETE CASCADE,
  ia_habilitada BOOLEAN DEFAULT TRUE,
  ia_modelo VARCHAR(100) DEFAULT 'groq-llama3',
  hora_envio_manha VARCHAR(5) DEFAULT '08:00',
  hora_envio_tarde VARCHAR(5) DEFAULT '14:00',
  hora_envio_noite VARCHAR(5) DEFAULT '19:00',
  dias_antecedencia_notificacao INTEGER DEFAULT 7,
  ativar_notificacoes_automaticas BOOLEAN DEFAULT TRUE,
  tema_interface VARCHAR(50) DEFAULT 'light',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_config_oficina ON configuracoes_oficina(oficina_id);PARTE 2: CRIAR PROJETO NEXT.JS2.1 Estrutura do Projeto# Criar projeto
npx create-next-app@latest carroclaude --typescript --tailwind --eslint

# Respostas:
# ✅ Use TypeScript? → Yes
# ✅ Use ESLint? → Yes
# ✅ Use Tailwind CSS? → Yes
# ✅ Use src/ directory? → No
# ✅ Use App Router? → Yes
# ✅ Would you like to customize the import alias? → No

# Entrar no diretório
cd carroclaude

# Instalar dependências adicionais
npm install @supabase/supabase-js
npm install zustand
npm install date-fns
npm install jsonwebtoken
npm install bcryptjs
npm install axios
npm install dotenv
npm install next-auth
npm install qrcode.react
npm install chart.js react-chartjs-2
npm install framer-motion
npm install react-icons
npm install react-hot-toast2.2 Estrutura de Pastas (Criar Manualmente)carroclaude/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── clientes/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── servicos/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── mensagens/
│   │   │   ├── route.ts
│   │   │   └── enviar/route.ts
│   │   ├── whatsapp/
│   │   │   ├── conectar/route.ts
│   │   │   ├── status/route.ts
│   │   │   └── desconectar/route.ts
│   │   ├── ia/
│   │   │   └── gerar-mensagem/route.ts
│   │   └── dashboard/
│   │       └── stats/route.ts
│   ├── layout.tsx
│   ├── page.tsx (Home Pública)
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── dashboard/
│       ├── layout.tsx
│       ├── page.tsx (Dashboard Principal)
│       ├── clientes/
│       │   ├── page.tsx (Lista)
│       │   ├── novo/page.tsx
│       │   └── [id]/
│       │       ├── page.tsx (Detalhes)
│       │       └── editar/page.tsx
│       ├── servicos/
│       │   ├── page.tsx
│       │   ├── novo/page.tsx
│       │   └── [id]/page.tsx
│       ├── mensagens/
│       │   ├── page.tsx
│       │   └── nova/page.tsx
│       ├── whatsapp/
│       │   └── page.tsx
│       ├── configuracoes/
│       │   └── page.tsx
│       └── relatorios/
│           └── page.tsx
├── lib/
│   ├── supabase.ts (Cliente Supabase)
│   ├── auth.ts (Funções de autenticação)
│   ├── jwt.ts (Gerenciar JWT)
│   ├── whatsapp.ts (WPPConnect)
│   ├── ia.ts (Integração Groq/Mistral)
│   └── utils.ts (Utilitários)
├── store/
│   ├── useAuthStore.ts (Estado de autenticação)
│   └── useAppStore.ts (Estado global da app)
├── components/
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── DashboardStats.tsx
│   ├── ClienteForm.tsx
│   ├── ServicoForm.tsx
│   ├── MensagemForm.tsx
│   ├── ClienteList.tsx
│   ├── ServicoList.tsx
│   └── (componentes reutilizáveis)
├── styles/
│   └── globals.css
├── types/
│   └── index.ts (Tipos TypeScript)
├── middleware.ts (Autenticação)
├── .env.local (Variáveis de ambiente)
├── .env.example (Template de variáveis)
└── next.config.jsPARTE 3: VARIÁVEIS DE AMBIENTE3.1 Criar .env.local na raiz# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[seu-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=pk_[sua-chave-publica]
SUPABASE_SERVICE_KEY=sk_[sua-chave-privada]
SUPABASE_DB_PASSWORD=[sua-senha-do-banco]

# JWT
JWT_SECRET=sua-chave-secreta-super-segura-32-caracteres-aleatorios

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3000

# IA - Groq
GROQ_API_KEY=sua-chave-groq-aqui

# IA - Mistral (opcional)
MISTRAL_API_KEY=sua-chave-mistral-aqui

# WPPConnect (será configurado depois)
WPPCONNECT_VERSION=2.1.03.2 Criar .env.example (para versionamento)NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
SUPABASE_DB_PASSWORD=
JWT_SECRET=
NEXT_PUBLIC_API_URL=
GROQ_API_KEY=
MISTRAL_API_KEY=
WPPCONNECT_VERSION=2.1.0PARTE 4: TIPOS TYPESCRIPT4.1 Arquivo: types/index.ts// Oficina (Tenant)
export interface Oficina {
  id: string;
  nome: string;
  email: string;
  numero_whatsapp?: string;
  whatsapp_conectado: boolean;
  whatsapp_qrcode?: string;
  plano: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

// Cliente da Oficina
export interface Cliente {
  id: string;
  oficina_id: string;
  nome: string;
  whatsapp: string;
  carro: string;
  ano_carro?: number;
  km_carro?: number;
  placa?: string;
  cor?: string;
  combustivel?: string;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

// Serviço Realizado
export interface Servico {
  id: string;
  cliente_id: string;
  oficina_id: string;
  tipo_servico: string;
  data_servico: string;
  km_na_data?: number;
  descricao?: string;
  valor?: number;
  status: 'realizado' | 'pendente' | 'cancelado';
  proxima_manutencao_km?: number;
  proxima_manutencao_dias?: number;
  criado_em: string;
}

// Mensagem WhatsApp
export interface MensagemWhatsApp {
  id: string;
  oficina_id: string;
  cliente_id: string;
  numero_destino: string;
  numero_whatsapp_origem: string;
  mensagem: string;
  tipo_mensagem: 'notificacao' | 'lembrete' | 'promocao' | 'customizada';
  status: 'pendente' | 'enviado' | 'falha';
  tentativas: number;
  erro_mensagem?: string;
  enviado_em?: string;
  criado_em: string;
}

// Configurações da Oficina
export interface ConfiguracaoOficina {
  id: string;
  oficina_id: string;
  ia_habilitada: boolean;
  ia_modelo: string;
  hora_envio_manha: string;
  hora_envio_tarde: string;
  hora_envio_noite: string;
  dias_antecedencia_notificacao: number;
  ativar_notificacoes_automaticas: boolean;
  tema_interface: string;
  criado_em: string;
  atualizado_em: string;
}

// JWT Token
export interface JWTToken {
  id: string;
  email: string;
  nome: string;
  oficina_id: string;
  iat: number;
  exp: number;
}

// Response API Padrão
export interface ApiResponse<T = any> {
  sucesso: boolean;
  mensagem?: string;
  dados?: T;
  erro?: string;
  codigo?: string;
}

// Stats do Dashboard
export interface DashboardStats {
  total_clientes: number;
  total_servicos_mes: number;
  receita_mes: number;
  taxa_reintegracao: number;
  mensagens_enviadas_mes: number;
  mensagens_falhadas: number;
  clientes_proximo_vencimento: number;
  whatsapp_conectado: boolean;
  ultimos_clientes: Cliente[];
  ultimos_servicos: Servico[];
}PARTE 5: FUNÇÕES PRINCIPAIS5.1 Arquivo: lib/supabase.tsimport { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Cliente público (para chamadas autenticadas)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente serviço (para operações do servidor - use com cuidado!)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

// Função auxiliar para tratamento de erros
export const handleSupabaseError = (error: any) => {
  const mensagem = error?.message || 'Erro desconhecido no banco de dados';
  console.error('[Supabase Error]', error);
  return mensagem;
};5.2 Arquivo: lib/jwt.tsimport jwt from 'jsonwebtoken';
import { JWTToken } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRATION = '7d';

export const gerarToken = (payload: Omit<JWTToken, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
};

export const verificarToken = (token: string): JWTToken | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTToken;
    return decoded;
  } catch (erro) {
    console.error('[JWT Error]', erro);
    return null;
  }
};

export const extrairTokenDoCookie = (cookieHeader?: string): string | null => {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader
    .split(';')
    .map(c => c.trim())
    .filter(c => c.startsWith('auth_token='));
  
  if (cookies.length === 0) return null;
  
  return cookies[0].split('=')[1];
};5.3 Arquivo: lib/auth.tsimport { supabase } from './supabase';
import { Oficina } from '@/types';
import bcryptjs from 'bcryptjs';
import { gerarToken } from './jwt';

export const registrarOficina = async (
  nome: string,
  email: string,
  senha: string
): Promise<{ oficina: Oficina; token: string }> => {
  // Validar inputs
  if (!nome || !email || !senha) {
    throw new Error('Nome, email e senha são obrigatórios');
  }

  if (senha.length < 6) {
    throw new Error('A senha deve ter no mínimo 6 caracteres');
  }

  // Verificar se email já existe
  const { data: oficinasExistentes } = await supabase
    .from('oficinas')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (oficinasExistentes) {
    throw new Error('Este email já está cadastrado');
  }

  // Hash da senha
  const senhaHash = await bcryptjs.hash(senha, 10);

  // Criar oficina
  const { data, error } = await supabase
    .from('oficinas')
    .insert([
      {
        nome,
        email: email.toLowerCase(),
        senha_hash: senhaHash,
        ativo: true,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(Erro ao criar oficina: ${error.message});
  }

  // Criar configurações padrão
  await supabase
    .from('configuracoes_oficina')
    .insert([
      {
        oficina_id: data.id,
        ia_habilitada: true,
        ia_modelo: 'groq-llama3',
      },
    ]);

  // Gerar token
  const token = gerarToken({
    id: data.id,
    email: data.email,
    nome: data.nome,
    oficina_id: data.id,
  });

  // Remover hash da resposta
  const { senha_hash, ...oficinaSemSenha } = data;

  return {
    oficina: oficinaSemSenha,
    token,
  };
};

export const loginOficina = async (
  email: string,
  senha: string
): Promise<{ oficina: Oficina; token: string }> => {
  // Buscar oficina
  const { data, error } = await supabase
    .from('oficinas')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !data) {
    throw new Error('Email ou senha incorretos');
  }

  if (!data.ativo) {
    throw new Error('Esta conta foi desativada');
  }

  // Verificar senha
  const senhaCorreta = await bcryptjs.compare(senha, data.senha_hash);

  if (!senhaCorreta) {
    throw new Error('Email ou senha incorretos');
  }

  // Gerar token
  const token = gerarToken({
    id: data.id,
    email: data.email,
    nome: data.nome,
    oficina_id: data.id,
  });

  // Remover hash da resposta
  const { senha_hash, ...oficinaSemSenha } = data;

  return {
    oficina: oficinaSemSenha,
    token,
  };
};

export const obterOficinaAtual = async (
  oficina_id: string
): Promise<Oficina> => {
  const { data, error } = await supabase
    .from('oficinas')
    .select('*')
    .eq('id', oficina_id)
    .single();

  if (error || !data) {
    throw new Error('Oficina não encontrada');
  }

  const { senha_hash, ...oficinaSemSenha } = data;
  return oficinaSemSenha;
};5.4 Arquivo: lib/ia.tsimport { Groq } from 'groq-sdk';
import { Cliente, Servico } from '@/types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface ContextoIA {
  cliente: Cliente;
  ultimoServico?: Servico;
  tipoServico?: string;
}

export const gerarMensagemPersonalizada = async (
  contexto: ContextoIA
): Promise<string> => {
  const { cliente, ultimoServico, tipoServico } = contexto;

  // Construir contexto para IA
  const kmMedioMensal = ultimoServico?.km_na_data
    ? Math.floor(ultimoServico.km_na_data / 12)
    : 1000;

  const proximoVencimento = ultimoServico?.proxima_manutencao_km
    ? ultimoServico.proxima_manutencao_km
    : 5000;

  const prompt = `
Você é Virginia Fonseca, uma assistente virtual de uma oficina mecânica profissional.
Sua tarefa é gerar uma mensagem WhatsApp personalizada para lembrar sobre manutenção de veículo.

DADOS DO CLIENTE:
- Nome: ${cliente.nome}
- Veículo: ${cliente.ano_carro} ${cliente.carro}
- KM Atual: ${cliente.km_carro || 'não informado'}
- Último Serviço: ${ultimoServico?.tipo_servico || 'não encontrado'}
- Data do Último Serviço: ${ultimoServico?.data_servico || 'não encontrada'}
- Próxima Manutenção em: ${proximoVencimento} KM
- KM Médio Mensal: ${kmMedioMensal} KM

REGRAS OBRIGATÓRIAS:
1. A mensagem deve ser profissional, amigável e persuasiva
2. Máximo 180 caracteres (limite WhatsApp)
3. Incluir nome do cliente
4. Mencionar o tipo de veículo
5. Usar tom consultivo, não agressivo
6. Usar emojis com moderação (máximo 2)
7. Pode incluir urgência natural (ex: "em breve")

Gere APENAS a mensagem, sem explicações adicionais.
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 256,
    });

    const mensagem =
      response.choices[0]?.message?.content || 'Mensagem padrão';
    return mensagem.trim().substring(0, 160); // Garantir limite
  } catch (erro) {
    console.error('[IA Error]', erro);
    // Retornar mensagem padrão em caso de erro
    return Olá ${cliente.nome}! É hora de revisar seu ${cliente.carro}. Entre em contato conosco! 🚗;
  }
};

// Função auxiliar para validar se a mensagem está no padrão
export const validarMensagem = (mensagem: string): boolean => {
  return (
    mensagem.length > 0 &&
    mensagem.length <= 160 &&
    !mensagem.includes('[') &&
    !mensagem.includes(']')
  );
};5.5 Arquivo: lib/whatsapp.tsimport { supabase } from './supabase';
import { MensagemWhatsApp } from '@/types';

// Esta é uma interface com WPPConnect
// Você rodará WPPConnect em um servidor separado
// e fará chamadas HTTP para enviar mensagens

const WPPCONNECT_URL = process.env.PUBLIC_WPPCONNECT_URL || 'http://localhost:8080';

export interface StatusWhatsApp {
  conectado: boolean;
  numero?: string;
  qrcode?: string;
  ultima_atualizacao?: string;
}

// Obter status de conexão
export const obterStatusWhatsApp = async (oficina_id: string): Promise<StatusWhatsApp> => {
  try {
    const { data } = await supabase
      .from('oficinas')
      .select('whatsapp_conectado, numero_whatsapp, whatsapp_qrcode')
      .eq('id', oficina_id)
      .single();

    return {
      conectado: data?.whatsapp_conectado || false,
      numero: data?.numero_whatsapp,
      qrcode: data?.whatsapp_qrcode,
    };
  } catch (erro) {
    console.error('[WhatsApp Status Error]', erro);
    return { conectado: false };
  }
};

// Enviar mensagem via WhatsApp
export const enviarMensagemWhatsApp = async (
  oficina_id: string,
  numero_destino: string,
  numero_origem: string,
  mensagem: string
): Promise<{ sucesso: boolean; mensagem_id?: string; erro?: string }> => {
  try {
    // Salvar mensagem como pendente no banco
    const { data, error } = await supabase
      .from('mensagens_whatsapp')
      .insert([
        {
          oficina_id,
          numero_destino,
          numero_whatsapp_origem: numero_origem,
          mensagem,
          status: 'pendente',
          tentativas: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Chamar WPPConnect para enviar (implementação será feita na parte de setup)
    // Por enquanto, retornamos sucesso
    // Na produção, você faria uma chamada POST para:
    // POST http://localhost:8080/api/send-message
    // { numero, mensagem, session: oficina_id }

    return {
      sucesso: true,
      mensagem_id: data.id,
    };
  } catch (erro) {
    console.error('[WhatsApp Send Error]', erro);
    return {
      sucesso: false,
      erro: erro instanceof Error ? erro.message : 'Erro ao enviar mensagem',
    };
  }
};

// Conectar WhatsApp (gerar QR Code)
export const conectarWhatsApp = async (
  oficina_id: string
): Promise<{ qrcode: string; sessao: string }> => {
  // Esta função seria chamada quando o usuário quer conectar o WhatsApp
  // WPPConnect geraria um QR Code que seria exibido na interface
  // Por enquanto, retornamos dados mock
  return {
    qrcode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    sessao: oficina_id,
  };
};PARTE 6: API ROUTES (Backend)6.1 Arquivo: app/api/auth/register/route.tsimport { NextRequest, NextResponse } from 'next/server';
import { registrarOficina } from '@/lib/auth';
import { gerarToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, email, senha } = body;

    if (!nome || !email || !senha) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: 'Nome, email e senha são obrigatórios',
        },
        { status: 400 }
      );
    }

    const { oficina, token } = await registrarOficina(nome, email, senha);

    // Definir cookie com token
    const response = NextResponse.json(
      {
        sucesso: true,
        mensagem: 'Oficina registrada com sucesso',
        dados: { oficina, token },
      },
      { status: 201 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return response;
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'Erro interno';
    return NextResponse.json(
      {
        sucesso: false,
        erro: mensagem,
      },
      { status: 400 }
    );
  }
}6.2 Arquivo: app/api/auth/login/route.tsimport { NextRequest, NextResponse } from 'next/server';
import { loginOficina } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: 'Email e senha são obrigatórios',
        },
        { status: 400 }
      );
    }

    const { oficina, token } = await loginOficina(email, senha);

    // Definir cookie com token
    const response = NextResponse.json(
      {
        sucesso: true,
        mensagem: 'Login realizado com sucesso',
        dados: { oficina, token },
      },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'Erro interno';
    return NextResponse.json(
      {
        sucesso: false,
        erro: mensagem,
      },
      { status: 401 }
    );
  }
}6.3 Arquivo: app/api/auth/logout/route.tsimport { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    {
      sucesso: true,
      mensagem: 'Logout realizado com sucesso',
    },
    { status: 200 }
  );

  response.cookies.delete('auth_token');
  return response;
}6.4 Arquivo: app/api/clientes/route.tsimport { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verificarToken, extrairTokenDoCookie } from '@/lib/jwt';
import { Cliente } from '@/types';

// GET: Listar clientes da oficina
export async function GET(request: NextRequest) {
  try {
    const token = extrairTokenDoCookie(request.headers.get('cookie'));
    
    if (!token) {
      return NextResponse.json(
        { sucesso: false, erro: 'Não autenticado' },
        { status: 401 }
      );
    }

    const decoded = verificarToken(token);
    if (!decoded) {
      return NextResponse.json(
        { sucesso: false, erro: 'Token inválido' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('oficina_id', decoded.oficina_id)
      .order('criado_em', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      sucesso: true,
      dados: data,
    });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'Erro ao listar clientes';
    return NextResponse.json(
      { sucesso: false, erro: mensagem },
      { status: 500 }
    );
  }
}

// POST: Criar novo cliente
export async function POST(request: NextRequest) {
  try {
    const token = extrairTokenDoCookie(request.headers.get('cookie'));
    
    if (!token) {
      return NextResponse.json(
        { sucesso: false, erro: 'Não autenticado' },
        { status: 401 }
      );
    }

    const decoded = verificarToken(token);
    if (!decoded) {
      return NextResponse.json(
        { sucesso: false, erro: 'Token inválido' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nome, whatsapp, carro, ano_carro, km_carro } = body;

    if (!nome || !whatsapp || !carro) {
      return NextResponse.json(
        { sucesso: false, erro: 'Nome, WhatsApp e carro são obrigatórios' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert([
        {
          oficina_id: decoded.oficina_id,
          nome,
          whatsapp,
          carro,
          ano_carro,
          km_carro,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        sucesso: true,
        mensagem: 'Cliente criado com sucesso',
        dados: data,
      },
      { status: 201 }
    );
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'Erro ao criar cliente';
    return NextResponse.json(
      { sucesso: false, erro: mensagem },
      { status: 500 }
    );
  }
}PARTE 7: COMPONENTS PRINCIPAIS7.1 Arquivo: store/useAuthStore.tsimport { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Oficina } from '@/types';

interface AuthState {
  oficina: Oficina | null;
  token: string | null;
  carregando: boolean;
  setOficina: (oficina: Oficina | null) => void;
  setToken: (token: string | null) => void;
  setCarregando: (carregando: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      oficina: null,
      token: null,
      carregando: false,

      setOficina: (oficina) => set({ oficina }),
      setToken: (token) => set({ token }),
      setCarregando: (carregando) => set({ carregando }),

      logout: () => {
        set({ oficina: null, token: null });
        // Limpar localStorage (será feito automaticamente pelo persist)
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);7.2 Arquivo: components/Navbar.tsx'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { oficina, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-xl">
            🚗 CarroClaude
          </Link>

          {oficina ? (
            <div className="flex items-center gap-4">
              <span>{oficina.nome}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link href="/login" className="hover:bg-blue-700 px-4 py-2 rounded">
                Login
              </Link>
              <Link href="/register" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
                Registrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}PARTE 8: PÁGINAS PRINCIPAIS8.1 Arquivo: app/register/page.tsx'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { setOficina, setToken } = useAuthStore();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmSenha: '',
  });

  const [estado, setEstado] = useState({
    erro: '',
    carregando: false,
    sucesso: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstado({ erro: '', carregando: true, sucesso: false });

    try {
      if (formData.senha !== formData.confirmSenha) {
        throw new Error('As senhas não conferem');
      }

      if (formData.senha.length < 6) {
        throw new Error('A senha deve ter no mínimo 6 caracteres');
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
        }),
      });

      const { sucesso, dados, erro } = await response.json();

      if (!sucesso) {
        throw new Error(erro);
      }

      setOficina(dados.oficina);
      setToken(dados.token);
      setEstado({ erro: '', carregando: false, sucesso: true });

      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao registrar';
      setEstado({ erro: mensagem, carregando: false, sucesso: false });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          🚗 CarroClaude
        </h1>
        <p className="text-center text-gray-600 mb-6 text-sm">
          Registre sua oficina e comece a gerenciar clientes
        </p>

        {estado.erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {estado.erro}
          </div>
        )}

        {estado.sucesso && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
            ✅ Oficina criada com sucesso! Redirecionando...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              Nome da Oficina
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Oficina do João"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={estado.carregando}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={estado.carregando}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              Senha
            </label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={estado.carregando}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              Confirmar Senha
            </label>
            <input
              type="password"
              name="confirmSenha"
              value={formData.confirmSenha}
              onChange={handleChange}
              placeholder="Repita a senha"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={estado.carregando}
            />
          </div>

          <button
            type="submit"
            disabled={estado.carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 mt-6"
          >
            {estado.carregando ? '⏳ Registrando...' : '📝 Registrar Oficina'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Já tem conta?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-semibold">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}8.2 Arquivo: app/login/page.tsx'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { setOficina, setToken } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });

  const [estado, setEstado] = useState({
    erro: '',
    carregando: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstado({ erro: '', carregando: true });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const { sucesso, dados, erro } = await response.json();

      if (!sucesso) {
        throw new Error(erro);
      }

      setOficina(dados.oficina);
      setToken(dados.token);
      router.push('/dashboard');
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao fazer login';
      setEstado({ erro: mensagem, carregando: false });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          🚗 CarroClaude
        </h1>
        <p className="text-center text-gray-600 mb-6 text-sm">
          Faça login na sua oficina
        </p>

        {estado.erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {estado.erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={estado.carregando}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              Senha
            </label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              placeholder="Sua senha"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={estado.carregando}
            />
          </div>

          <button
            type="submit"
            disabled={estado.carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 mt-6"
          >
            {estado.carregando ? '⏳ Entrando...' : '🔓 Fazer Login'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Não tem conta?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-semibold">
            Registre-se aqui
          </Link>
        </p>
      </div>
    </div>
  );
}PARTE 9: DEPLOY NA VERCEL9.1 Preparar Projeto# 1. Criar repositório Git
git init
git add .
git commit -m "Initial commit"

# 2. Criar repositório no GitHub
# Acesse: https://github.com/new
# Crie um repo chamado "carroclaude"

# 3. Fazer push
git remote add origin https://github.com/seu-usuario/carroclaude.git
git branch -M main
git push -u origin main9.2 Deploy na VercelAcesse: https://vercel.comClique em "New Project"Selecione seu repositório do GitHubPreencha variáveis de ambiente:NEXT_PUBLIC_SUPABASE_URLNEXT_PUBLIC_SUPABASE_ANON_KEYSUPABASE_SERVICE_KEYJWT_SECRET (gere uma nova chave segura!)GROQ_API_KEYNODE_ENV=productionClique em "Deploy"Seu app estará em: https://carroclaude.vercel.appPARTE 10: CHECKLIST DE IMPLEMENTAÇÃOVocê vai implementar nesta ordem:�1. Setup Supabase (banco de dados)�2. Criar projeto Next.js (estrutura base)�3. Instalar dependências (libs necessárias)�4. Criar tipos TypeScript (lib/supabase.ts, types/index.ts)�5. Funções de autenticação (lib/auth.ts, lib/jwt.ts)�6. API de autenticação (auth/register, auth/login)�7. API de clientes (clientes/route.ts)�8. Store Zustand (useAuthStore.ts)�9. Componentes (Navbar.tsx)�10. Páginas (login/page.tsx, register/page.tsx)�11. Dashboard (dashboard/page.tsx)�12. CRUD completo (clientes, serviços)�13. Integração IA (gerar mensagens personalizadas)�14. Integração WhatsApp (WPPConnect)�15. Deploy VercelPARTE 11: COMO EXECUTAR LOCALMENTEDesenvolvimento Local# 1. Instalar Node.js (v18+)
# Baixar em: https://nodejs.org

# 2. Clonar/abrir projeto
cd carroclaude

# 3. Instalar dependências
npm install

# 4. Criar .env.local (com credenciais Supabase)
# Copiar de .env.example e preencher

# 5. Rodar servidor de desenvolvimento
npm run dev

# 6. Acessar no navegador
# http://localhost:3000Testar Fluxo CompletoAcessar home: http://localhost:3000Registrar nova oficina:Nome: "Oficina Wilcar"Email: "wilcar@oficina.com"Senha: "Senha123"Será redirecionado para dashboardCadastrar clientes (próxima parte)Registrar serviçosTestar WhatsApp (quando implementado)TROUBLESHOOTINGPRÓXIMAS ETAPASApós implementar as partes 1-10, você terá:✅ Autenticação funcionando
✅ Banco de dados configurado
✅ Estrutura Next.js pronta
✅ Trae.ai conseguirá implementar facilmenteEntão implementaremos:Dashboard com EstatísticasCRUD Completo de ClientesCRUD de ServiçosIntegração IA (Groq)Integração WhatsApp (WPPConnect)Sistema de Notificações AutomáticasRelatórios e AnálisesCHAVES API NECESSÁRIASVocê precisará de (gratuitas):Supabase: https://supabase.com (grátis)Groq API: https://console.groq.com (grátis com limites)GitHub: Para versionamentoVercel: Para deploy (grátis)RESUMO FINALEste prompt é completo, profissional e pronto para o Trae.ai implementar.Ele cobre:Setup completo Supabase (passo a passo)Estrutura Next.js modernaAutenticação segura (JWT + bcrypt)Tipagem TypeScriptAPI Routes robustasComponentes React reutilizáveisDeploy VercelMulti-tenant (1 a 10 oficinas)Copie este arquivo inteiro, cole no Trae.ai e mande implementar!Boa sorte! 🚀
