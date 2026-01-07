# ⚡ Início Rápido - Oficina SaaS

## 🚀 Para começar AGORA

Execute estes comandos em sequência:

```bash
# 1. Navegar para o diretório
cd oficina-saas

# 2. Instalar dependências (primeira vez apenas)
npm install

# 3. Inicializar banco de dados (primeira vez apenas)
npm run db:init

# 4. Popular com dados de teste (opcional)
npm run db:seed

```
# 5. Iniciar servidor
npm run dev
```

✅ **Acesse:** http://localhost:3000

---

## 📱 CONECTAR WHATSAPP (2 minutos)

1. Abrir: http://localhost:3000/api/whatsapp/qrcode
2. Escanear QR Code com WhatsApp
3. ✅ Conectado!

---

## 🔔 ENVIAR NOTIFICAÇÕES

```bash
# Testar (sem enviar)
npm run notification:test

# Enviar de verdade
npm run notification:send
```

---

## 📝 CADASTRAR CLIENTE (via API)

```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "telefone": "5511999999999",
    "carro": "Honda Civic 2020",
    "km_media_mensal": 1500
  }'
```

---

## 🔧 REGISTRAR SERVIÇO

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

---

## ⏰ AGENDAMENTO GITHUB ACTIONS

```bash
# 1. Push para GitHub
git init
git add .
git commit -m "Oficina SaaS"
git remote add origin https://github.com/seu-usuario/oficina-saas.git
git push -u origin main

# 2. Configurar Secrets no GitHub:
# Settings > Secrets and variables > Actions
# Adicionar:
# GROQ_API_KEY = sua_chave_aqui
# MISTRAL_API_KEY = sua_chave_aqui
```

✅ **Pronto!** Rodará automaticamente 3x ao dia

---

## 🆘 PROBLEMAS COMUNS

```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json && npm install

# Reiniciar banco
npm run db:init

# Limpar sessão WhatsApp
rm -rf tokens/ && npm run dev
```

---

## � ACESSOS RÁPIDOS

- Dashboard: http://localhost:3000
- WhatsApp: http://localhost:3000/api/whatsapp/qrcode
- Status: http://localhost:3000/api/health
- API Docs: Veja arquivo `API.md`

---

## � DOCUMENTAÇÃO

- **README.md** - Visão geral
- **INSTALACAO.md** - Guia completo
- **API.md** - Todos endpoints
- **EXECUCAO_COMPLETA.md** - Passo a passo detalhado

---

## ✅ PRONTO PARA USAR!

```bash
cd oficina-saas
npm install && npm run db:init && npm run db:seed && npm run dev
```

Depois: http://localhost:3000 🎉
