# 📚 Documentação da API - Oficina SaaS

## 🌐 Base URL

```
http://localhost:3000/api
```

## 📋 Índice

1. [Clientes](#clientes)
2. [Serviços](#servicos)
3. [Notificações](#notificacoes)
4. [WhatsApp](#whatsapp)
5. [Sistema](#sistema)

---

## 👥 Clientes

### Listar todos os clientes

**GET** `/api/clientes`

**Query Parameters (opcionais):**
- `nome` - Filtrar por nome (busca parcial)
- `telefone` - Filtrar por telefone (busca exata)

**Exemplo:**
```bash
curl http://localhost:3000/api/clientes
```

**Resposta:**
```json
{
  "sucesso": true,
  "total": 5,
  "clientes": [
    {
      "id": 1,
      "nome": "João Silva",
      "telefone": "5511999999999",
      "carro": "Honda Civic 2020",
      "placa": "ABC1D23",
      "km_media_mensal": 1500,
      "ativo": 1,
      "criado_em": "2026-01-07 10:00:00"
    }
  ]
}
```

### Buscar cliente por ID

**GET** `/api/clientes/:id`

**Exemplo:**
```bash
curl http://localhost:3000/api/clientes/1
```

**Resposta:**
```json
{
  "sucesso": true,
  "cliente": {
    "id": 1,
    "nome": "João Silva",
    "telefone": "5511999999999",
    "carro": "Honda Civic 2020",
    "placa": "ABC1D23",
    "km_media_mensal": 1500
  },
  "historico": [
    {
      "id": 1,
      "tipo_servico_nome": "Troca de Óleo do Motor",
      "km_realizado": 40000,
      "data_servico": "2025-11-08",
      "valor": 150.00
    }
  ]
}
```

### Cadastrar novo cliente

**POST** `/api/clientes`

**Body (JSON):**
```json
{
  "nome": "Maria Santos",
  "telefone": "5511988888888",
  "carro": "Toyota Corolla 2019",
  "placa": "XYZ9W87",
  "km_media_mensal": 1200
}
```

**Campos obrigatórios:**
- `nome` (string)
- `telefone` (string)
- `carro` (string)

**Campos opcionais:**
- `placa` (string)
- `km_media_mensal` (number, padrão: 1000)

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Santos",
    "telefone": "5511988888888",
    "carro": "Toyota Corolla 2019",
    "placa": "XYZ9W87",
    "km_media_mensal": 1200
  }'
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "Cliente cadastrado com sucesso",
  "cliente": {
    "id": 6,
    "nome": "Maria Santos",
    "telefone": "5511988888888",
    "carro": "Toyota Corolla 2019",
    "placa": "XYZ9W87",
    "km_media_mensal": 1200
  }
}
```

### Atualizar cliente

**PUT** `/api/clientes/:id`

**Body (JSON):** (todos os campos são opcionais)
```json
{
  "nome": "Maria Santos Silva",
  "km_media_mensal": 1500
}
```

**Exemplo:**
```bash
curl -X PUT http://localhost:3000/api/clientes/6 \
  -H "Content-Type: application/json" \
  -d '{
    "km_media_mensal": 1500
  }'
```

### Deletar cliente

**DELETE** `/api/clientes/:id`

**Exemplo:**
```bash
curl -X DELETE http://localhost:3000/api/clientes/6
```

---

## 🔧 Serviços

### Listar tipos de serviço disponíveis

**GET** `/api/servicos/tipos`

**Exemplo:**
```bash
curl http://localhost:3000/api/servicos/tipos
```

**Resposta:**
```json
{
  "sucesso": true,
  "total": 10,
  "tipos": [
    {
      "id": 1,
      "codigo": "troca_oleo",
      "nome": "Troca de Óleo do Motor",
      "intervalo_km": 5000,
      "descricao": "Troca de óleo lubrificante do motor"
    },
    {
      "id": 2,
      "codigo": "filtro_oleo",
      "nome": "Filtro de Óleo",
      "intervalo_km": 10000
    }
  ]
}
```

**Códigos de serviço disponíveis:**
- `troca_oleo` - Troca de Óleo (5.000 km)
- `filtro_oleo` - Filtro de Óleo (10.000 km)
- `correia_dentada` - Correia Dentada (60.000 km)
- `filtro_ar` - Filtro de Ar (15.000 km)
- `filtro_combustivel` - Filtro de Combustível (20.000 km)
- `velas` - Velas de Ignição (30.000 km)
- `pastilhas_freio` - Pastilhas de Freio (40.000 km)
- `fluido_freio` - Fluido de Freio (20.000 km)
- `alinhamento` - Alinhamento e Balanceamento (10.000 km)
- `revisao_geral` - Revisão Geral (10.000 km)

### Registrar serviço realizado

**POST** `/api/servicos`

**Body (JSON):**
```json
{
  "cliente_id": 1,
  "servicos": ["troca_oleo", "filtro_oleo", "alinhamento"],
  "km_realizado": 45000,
  "data_servico": "2026-01-07",
  "valor": 350.00,
  "observacoes": "Óleo sintético premium"
}
```

**Campos obrigatórios:**
- `cliente_id` (number)
- `servicos` (array de strings - códigos dos serviços)
- `km_realizado` (number)
- `data_servico` (string - formato: YYYY-MM-DD)

**Campos opcionais:**
- `valor` (number)
- `observacoes` (string)

**Exemplo:**
```bash
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

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "2 serviço(s) registrado(s) com sucesso",
  "servicos": [
    {
      "id": 12,
      "tipo_servico": "Troca de Óleo do Motor",
      "codigo": "troca_oleo"
    },
    {
      "id": 13,
      "tipo_servico": "Filtro de Óleo",
      "codigo": "filtro_oleo"
    }
  ],
  "cliente": {
    "id": 1,
    "nome": "João Silva",
    "carro": "Honda Civic 2020"
  }
}
```

### Listar serviços realizados

**GET** `/api/servicos`

**Query Parameters (opcionais):**
- `cliente_id` - Filtrar por cliente
- `tipo_servico_id` - Filtrar por tipo de serviço

**Exemplo:**
```bash
curl http://localhost:3000/api/servicos?cliente_id=1
```

### Histórico de serviços de um cliente

**GET** `/api/servicos/cliente/:clienteId`

**Exemplo:**
```bash
curl http://localhost:3000/api/servicos/cliente/1
```

---

## 🔔 Notificações

### Listar notificações pendentes

**GET** `/api/notificacoes/pendentes`

**Exemplo:**
```bash
curl http://localhost:3000/api/notificacoes/pendentes
```

**Resposta:**
```json
{
  "sucesso": true,
  "total": 3,
  "notificacoes": [
    {
      "id": 5,
      "cliente_nome": "Maria Santos",
      "telefone": "5511988888888",
      "tipo_servico_nome": "Troca de Óleo do Motor",
      "mensagem": "Olá Maria! 🚗\n\nTudo bem? Aqui é da Oficina...",
      "km_previsto": 40000,
      "criado_em": "2026-01-07 10:30:00"
    }
  ]
}
```

### Histórico de notificações enviadas

**GET** `/api/notificacoes/historico`

**Query Parameters (opcionais):**
- `cliente_id` - Filtrar por cliente

**Exemplo:**
```bash
curl http://localhost:3000/api/notificacoes/historico
```

### Verificar clientes que precisam de notificação

**GET** `/api/notificacoes/verificar`

**Exemplo:**
```bash
curl http://localhost:3000/api/notificacoes/verificar
```

**Resposta:**
```json
{
  "sucesso": true,
  "total": 2,
  "clientes": [
    {
      "cliente": {
        "id": 2,
        "nome": "Maria Santos",
        "carro": "Toyota Corolla 2019"
      },
      "notificacoes": [
        {
          "tipoServico": {
            "nome": "Troca de Óleo do Motor",
            "intervalo_km": 5000
          },
          "kmAtual": 39600,
          "kmProximaTroca": 40000
        }
      ]
    }
  ]
}
```

### Gerar notificações (sem enviar)

**POST** `/api/notificacoes/gerar`

Gera as mensagens e salva no banco, mas não envia via WhatsApp.

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/notificacoes/gerar
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "3 notificação(ões) gerada(s)",
  "total": 3
}
```

### Enviar notificações pendentes

**POST** `/api/notificacoes/enviar`

Envia todas as notificações que estão pendentes no banco de dados.

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/notificacoes/enviar
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "Enviadas: 3, Falhas: 0",
  "total": 3,
  "enviadas": 3,
  "falhas": 0,
  "resultados": [...]
}
```

### Executar processo completo (gerar + enviar)

**POST** `/api/notificacoes/executar`

Executa o processo completo: verifica clientes, gera mensagens e envia.

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/notificacoes/executar
```

**Resposta:**
```json
{
  "sucesso": true,
  "geradas": 3,
  "total": 3,
  "enviadas": 3,
  "falhas": 0
}
```

### Enviar notificação manual

**POST** `/api/notificacoes/manual`

**Body (JSON):**
```json
{
  "cliente_id": 1,
  "tipo_servico_id": 1,
  "mensagem": "Olá! Mensagem customizada..." 
}
```

**Campos obrigatórios:**
- `cliente_id` (number)
- `tipo_servico_id` (number)

**Campos opcionais:**
- `mensagem` (string) - Se não fornecida, será gerada pela IA

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/notificacoes/manual \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 1,
    "tipo_servico_id": 1
  }'
```

### Obter relatório

**GET** `/api/notificacoes/relatorio`

**Query Parameters (opcionais):**
- `periodo` - Período em dias (padrão: 30)

**Exemplo:**
```bash
curl http://localhost:3000/api/notificacoes/relatorio
```

---

## 📱 WhatsApp

### Status da conexão

**GET** `/api/whatsapp/status`

**Exemplo:**
```bash
curl http://localhost:3000/api/whatsapp/status
```

**Resposta:**
```json
{
  "sucesso": true,
  "conectado": true,
  "estado": "CONNECTED",
  "sessao": "oficina-session"
}
```

### Obter QR Code para conexão

**GET** `/api/whatsapp/qrcode`

Retorna uma página HTML com o QR Code para escanear.

**Exemplo:**
Acesse no navegador: http://localhost:3000/api/whatsapp/qrcode

### Iniciar conexão

**POST** `/api/whatsapp/conectar`

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/whatsapp/conectar
```

### Desconectar

**POST** `/api/whatsapp/desconectar`

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/whatsapp/desconectar
```

### Verificar número

**POST** `/api/whatsapp/verificar-numero`

**Body (JSON):**
```json
{
  "telefone": "5511999999999"
}
```

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/whatsapp/verificar-numero \
  -H "Content-Type: application/json" \
  -d '{
    "telefone": "5511999999999"
  }'
```

**Resposta:**
```json
{
  "sucesso": true,
  "existe": true,
  "telefone": "5511999999999",
  "canReceiveMessage": true
}
```

### Enviar mensagem de teste

**POST** `/api/whatsapp/teste`

**Body (JSON):**
```json
{
  "telefone": "5511999999999"
}
```

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/whatsapp/teste \
  -H "Content-Type: application/json" \
  -d '{
    "telefone": "5511999999999"
  }'
```

---

## 🏥 Sistema

### Health Check

**GET** `/api/health`

**Exemplo:**
```bash
curl http://localhost:3000/api/health
```

**Resposta:**
```json
{
  "status": "OK",
  "timestamp": "2026-01-07T13:45:30.000Z",
  "versao": "1.0.0",
  "ambiente": "development",
  "estatisticas": {
    "total_clientes": 5,
    "total_servicos": 12,
    "total_notificacoes_enviadas": 8,
    "notificacoes_pendentes": 3
  }
}
```

---

## 🔐 Códigos de Resposta HTTP

- `200` - OK (sucesso)
- `201` - Created (recurso criado)
- `400` - Bad Request (erro nos dados enviados)
- `404` - Not Found (recurso não encontrado)
- `500` - Internal Server Error (erro no servidor)

---

## 📝 Exemplos Completos de Fluxo

### Fluxo 1: Cadastrar cliente e registrar serviço

```bash
# 1. Cadastrar cliente
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Pedro Oliveira",
    "telefone": "5511977777777",
    "carro": "Volkswagen Gol 2018",
    "placa": "DEF4G56",
    "km_media_mensal": 800
  }'

# Resposta: { "cliente": { "id": 7, ... } }

# 2. Registrar serviço
curl -X POST http://localhost:3000/api/servicos \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 7,
    "servicos": ["troca_oleo", "filtro_oleo"],
    "km_realizado": 30000,
    "data_servico": "2026-01-07",
    "valor": 180.00
  }'
```

### Fluxo 2: Processo completo de notificações

```bash
# 1. Verificar quem precisa de notificação
curl http://localhost:3000/api/notificacoes/verificar

# 2. Gerar notificações
curl -X POST http://localhost:3000/api/notificacoes/gerar

# 3. Verificar pendentes
curl http://localhost:3000/api/notificacoes/pendentes

# 4. Enviar
curl -X POST http://localhost:3000/api/notificacoes/enviar

# OU executar tudo de uma vez:
curl -X POST http://localhost:3000/api/notificacoes/executar
```

---

## 💡 Dicas

1. **Formato de telefone:** Use o formato internacional com código do país
   - Exemplo: `5511999999999` (55 = Brasil, 11 = São Paulo, 999999999 = número)

2. **Datas:** Use sempre o formato ISO: `YYYY-MM-DD`
   - Exemplo: `2026-01-07`

3. **IDs vs Códigos:** Você pode usar tanto o ID quanto o código do serviço
   - ID: `1`
   - Código: `"troca_oleo"`

4. **Rate Limiting:** A API tem limite de 100 requisições por 15 minutos

5. **Testes:** Use o endpoint `/api/health` para verificar se o sistema está funcionando
