# 🚗 Oficina SaaS - Sistema de Notificação Inteligente

> **Desenvolvido por:** Fábio Rosestolato  
> **Status:** 🚀 Em Produção (Versão 1.0)

Sistema profissional de gestão de relacionamento com clientes (CRM) para oficinas mecânicas, focado na automação de lembretes de manutenção via WhatsApp utilizando Inteligência Artificial.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Dashboard+Oficina+SaaS)

---

## 📋 Sobre o Projeto

O **Oficina SaaS** é uma solução robusta projetada para aumentar a retenção de clientes e a recorrência de serviços em oficinas mecânicas. O sistema monitora automaticamente o histórico de serviços e, baseado em algoritmos preditivos e IA, notifica o cliente no momento exato em que uma nova manutenção é necessária.

### 🌟 Principais Funcionalidades

*   **🤖 IA Personalizada (Persona: Virginia Fonseca):** Utiliza modelos avançados (LLaMA/Mistral) para gerar mensagens humanizadas, profissionais e persuasivas, simulando uma assistente virtual sênior.
*   **📱 Automação WhatsApp:** Envio automático de mensagens sem intervenção manual, com suporte a QR Code e persistência de sessão.
*   **📊 Dashboard Gerencial:** Painel visual para acompanhamento de clientes, status de envios e previsões de faturamento.
*   **📅 Agendamento Inteligente:** Sistema de Cron Jobs para disparos em horários estratégicos (Manhã, Tarde, Noite).
*   **🔧 Gestão de Serviços:** Cadastro completo de histórico veicular para cálculo preciso de quilometragem estimada.

---

## 🛠️ Stack Tecnológica

O projeto foi construído seguindo as melhores práticas de Engenharia de Software, garantindo escalabilidade e manutenibilidade.

### Backend
*   **Runtime:** Node.js (v18+)
*   **Framework:** Express.js (API RESTful)
*   **Banco de Dados:** SQLite (Better-SQLite3) - *Migrável para PostgreSQL/MySQL*
*   **IA/LLM:** Integração com Groq (LLaMA 3) e Mistral AI
*   **WhatsApp:** WPPConnect (Engine de automação de navegador)
*   **Agendamento:** Node-Cron & Scripts customizados

### Frontend
*   **Tecnologia:** HTML5, CSS3 (Variáveis CSS, Flexbox/Grid), JavaScript ES6+
*   **Design:** Responsivo, clean e focado em UX (User Experience)
*   **Comunicação:** Fetch API para consumo dos endpoints do Backend

---

## 🚀 Instalação e Execução

### Pré-requisitos
*   Node.js instalado
*   Navegador Google Chrome (para o WPPConnect)

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/fabiorjvr/carroclaude.git
    cd carroclaude/oficina-saas
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz com as chaves de API:
    ```env
    GROQ_API_KEY=sua_chave_aqui
    MISTRAL_API_KEY=sua_chave_aqui
    ```

4.  **Inicialize o Banco de Dados:**
    ```bash
    npm run db:init
    ```

5.  **Inicie o Servidor:**
    ```bash
    npm run dev
    ```

6.  **Conecte o WhatsApp:**
    Acesse `http://localhost:3000` e clique em "Conectar WhatsApp". Escaneie o QR Code.

---

## 📖 Estrutura do Projeto

```
oficina-saas/
├── backend/
│   ├── src/
│   │   ├── config/         # Configurações globais
│   │   ├── models/         # Camada de Dados (SQLite)
│   │   ├── routes/         # Rotas da API (Express)
│   │   ├── services/       # Lógica de Negócio (IA, WhatsApp)
│   │   └── server.js       # Entry Point
├── frontend/               # Interface do Usuário
│   ├── index.html
│   ├── style.css
│   └── script.js
├── database/               # Scripts de Banco de Dados
├── scripts/                # Automação e Jobs
└── ...
```

---

## 🧠 Lógica de Inteligência Artificial

O "cérebro" do sistema reside em `backend/src/services/ai.service.js`.

1.  **Coleta de Contexto:** O sistema reúne dados do cliente, veículo, último serviço e data.
2.  **Engenharia de Prompt:** Um prompt estruturado é enviado para a LLM, definindo a persona "Virginia Fonseca" e regras estritas de formatação (negrito, bullet points, tom profissional).
3.  **Geração:** A IA gera uma mensagem única e personalizada.
4.  **Fallback:** Caso a API falhe, um template robusto garante que a comunicação não seja interrompida.

---

## 🔒 Segurança e Performance

*   **Rate Limiting:** Proteção contra abuso da API.
*   **Helmet:** Headers de segurança HTTP.
*   **Logs:** Monitoramento detalhado de operações.
*   **Tratamento de Erros:** Blocos try/catch robustos para evitar crashes.

---

## 📞 Suporte

Para dúvidas técnicas ou comerciais, entre em contato com o desenvolvedor:

**Fábio Rosestolato**
*   GitHub: [@fabiorjvr](https://github.com/fabiorjvr)

---
*Desenvolvido com ❤️ e Código.*
