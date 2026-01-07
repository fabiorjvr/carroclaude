# 📋 Guia de Instalação - Oficina SaaS

## 🎯 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** (recomendado 20+)
  - Baixe em: https://nodejs.org/
  - Verifique: `node --version`

- **npm** (vem com Node.js)
  - Verifique: `npm --version`

- **Git** (para clonar repositório)
  - Baixe em: https://git-scm.com/
  - Verifique: `git --version`

## 🚀 Instalação Passo a Passo

### Passo 1: Navegar até o diretório do projeto

```bash
cd oficina-saas
```

### Passo 2: Instalar dependências

```bash
npm install
```

Este comando irá instalar todas as dependências necessárias:
- Express (servidor web)
- SQLite (banco de dados)
- WPPConnect (WhatsApp)
- Groq/Mistral (IA)
- E outras bibliotecas auxiliares

**⏱️ Tempo estimado:** 2-5 minutos (depende da sua conexão)

### Passo 3: Configurar variáveis de ambiente

O arquivo `.env` já está configurado com suas chaves de API. Verifique:

```bash
# Ver conteúdo do .env
cat .env
```

**Importante:** As seguintes variáveis já estão configuradas:
- ✅ `GROQ_API_KEY` - Sua chave da API Groq
- ✅ `MISTRAL_API_KEY` - Sua chave da API Mistral
- ✅ Outras configurações do sistema

### Passo 4: Inicializar o banco de dados

```bash
npm run db:init
```

Este comando irá:
- ✅ Criar o arquivo `database/oficina.db`
- ✅ Criar todas as tabelas necessárias
- ✅ Inserir tipos de serviço padrão
- ✅ Configurar índices para performance

**Saída esperada:**
```
🗄️  Inicializando banco de dados...
✅ Tabelas criadas com sucesso!
✅ Tipos de serviço cadastrados!
✅ Configurações iniciais definidas!
✅ Banco de dados inicializado com sucesso!
```

### Passo 5: Popular com dados de teste (OPCIONAL)

```bash
npm run db:seed
```

Este comando adiciona 5 clientes fictícios com histórico de serviços. Útil para testes!

**Saída esperada:**
```
🌱 Populando banco de dados com dados de teste...
✅ Cliente cadastrado: João Silva
✅ Cliente cadastrado: Maria Santos
...
✅ Banco de dados populado com sucesso!
```

### Passo 6: Iniciar o servidor

```bash
npm run dev
```

**Saída esperada:**
```
============================================================
🚗  OFICINA SAAS - Sistema de Notificações
============================================================

✅ Servidor rodando em: http://localhost:3000
📱 WhatsApp QR Code: http://localhost:3000/api/whatsapp/qrcode
🏥 Health Check: http://localhost:3000/api/health
📚 Ambiente: development
============================================================
```

## 📱 Conectar WhatsApp

### Passo 7: Abrir página de conexão

1. Com o servidor rodando, abra seu navegador
2. Acesse: http://localhost:3000/api/whatsapp/qrcode
3. Você verá uma página com um QR Code

### Passo 8: Escanear QR Code

1. Abra o WhatsApp no seu celular
2. Toque em **⋮ Menu** (3 pontinhos) > **Aparelhos conectados**
3. Toque em **Conectar um aparelho**
4. Aponte a câmera para o QR Code na tela

**✅ Sucesso:** Você verá "WhatsApp conectado!" no terminal

**⚠️ QR Code expirou?** Apenas recarregue a página (F5)

## 🧪 Testar o Sistema

### Passo 9: Verificar se há notificações para enviar

```bash
npm run notification:test
```

Este comando mostra:
- Quais clientes precisam de manutenção
- Quais serviços estão vencidos
- Prévia das mensagens que seriam enviadas

### Passo 10: Enviar notificações de teste

```bash
npm run notification:send
```

Este comando:
1. Conecta ao WhatsApp (se ainda não conectado)
2. Verifica clientes que precisam de notificação
3. Gera mensagens personalizadas com IA
4. Envia via WhatsApp
5. Registra no banco de dados

## 🌐 Acessar Interface Web

Com o servidor rodando, acesse:

- **Dashboard:** http://localhost:3000
- **API Health:** http://localhost:3000/api/health
- **WhatsApp Status:** http://localhost:3000/api/whatsapp/status

## 📊 Endpoints da API

### Clientes
```bash
# Listar todos os clientes
curl http://localhost:3000/api/clientes

# Cadastrar novo cliente
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "telefone": "5511999999999",
    "carro": "Honda Civic 2020",
    "placa": "ABC1D23",
    "km_media_mensal": 1500
  }'
```

### Serviços
```bash
# Registrar serviço realizado
curl -X POST http://localhost:3000/api/servicos \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 1,
    "servicos": ["troca_oleo", "filtro_oleo"],
    "km_realizado": 45000,
    "data_servico": "2026-01-07",
    "valor": 200.00
  }'
```

### Notificações
```bash
# Verificar notificações pendentes
curl http://localhost:3000/api/notificacoes/pendentes

# Executar processo completo (gerar + enviar)
curl -X POST http://localhost:3000/api/notificacoes/executar
```

## ⚙️ Agendamento Automático

### Opção 1: GitHub Actions (Recomendado)

1. Faça push do código para o GitHub
2. Vá em: **Settings** > **Secrets and variables** > **Actions**
3. Adicione os secrets:
   - `GROQ_API_KEY`: `sua_chave_aqui`
   - `MISTRAL_API_KEY`: `sua_chave_aqui`

O sistema enviará notificações automaticamente 3x ao dia: 9h, 14h, 20h

### Opção 2: Cron Local (Linux/Mac)

```bash
# Editar crontab
crontab -e

# Adicionar linhas (ajuste o caminho):
0 9 * * * cd /caminho/para/oficina-saas && node scripts/send-notifications.js
0 14 * * * cd /caminho/para/oficina-saas && node scripts/send-notifications.js
0 20 * * * cd /caminho/para/oficina-saas && node scripts/send-notifications.js
```

### Opção 3: Task Scheduler (Windows)

1. Abra "Agendador de Tarefas"
2. Criar Tarefa Básica
3. Nome: "Oficina SaaS - Notificações"
4. Gatilho: Diariamente
5. Ação: Iniciar programa
   - Programa: `node`
   - Argumentos: `scripts/send-notifications.js`
   - Diretório: `C:\caminho\para\oficina-saas`
6. Repetir a cada: 5 horas

## 🔧 Comandos Úteis

```bash
# Iniciar servidor (modo desenvolvimento com auto-reload)
npm run dev

# Iniciar servidor (modo produção)
npm start

# Inicializar banco de dados
npm run db:init

# Popular com dados de teste
npm run db:seed

# Testar notificações (sem enviar)
npm run notification:test

# Enviar notificações
npm run notification:send

# Rodar testes
npm test

# Verificar erros de código
npm run lint
```

## ❗ Solução de Problemas

### Erro: "Cannot find module"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Database locked"
```bash
# Fechar todas as conexões com o banco
# Reiniciar o servidor
```

### WhatsApp não conecta
```bash
# Limpar sessão antiga
rm -rf tokens/
# Reiniciar servidor e tentar conectar novamente
```

### Erro na API de IA
```bash
# Verificar se as chaves estão corretas no .env
cat .env | grep API_KEY

# Testar conexão
node -e "require('dotenv').config(); console.log(process.env.GROQ_API_KEY)"
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no terminal
2. Consulte a documentação completa no README.md
3. Abra uma issue no GitHub
4. Entre em contato: suporte@oficina-saas.com

## ✅ Checklist de Instalação

- [ ] Node.js 18+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo .env configurado
- [ ] Banco de dados inicializado
- [ ] Servidor rodando
- [ ] WhatsApp conectado
- [ ] Teste de notificação executado
- [ ] Agendamento configurado (opcional)

## 🎉 Próximos Passos

Agora que o sistema está instalado:

1. **Cadastre seus clientes reais** via API ou interface
2. **Registre os serviços realizados** para cada cliente
3. **Configure o agendamento** para envio automático
4. **Monitore as notificações** pelo dashboard

**Bom uso do Oficina SaaS! 🚗🔧**
