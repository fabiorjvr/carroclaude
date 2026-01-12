# ☁️ Como Usar o CarroClaude SaaS na Nuvem (Vercel)

Seu sistema agora está hospedado profissionalmente na Vercel. Isso significa que ele pode ser acessado de qualquer lugar do mundo, sem precisar que seu computador esteja ligado.

## 🌍 Links de Acesso
- **Aplicação (Produção):** [https://carroclaude.vercel.app](https://carroclaude.vercel.app)
- **Repositório GitHub:** [https://github.com/fabiorjvr/carroclaude](https://github.com/fabiorjvr/carroclaude)

---

## 🚀 Diferença: Local vs Nuvem

### 💻 Local (Seu Computador)
- **URL:** `http://localhost:3000`
- **Uso:** Desenvolvimento e testes rápidos.
- **Banco de Dados:** Conecta no mesmo Supabase da nuvem (se configurado igual).
- **Limitação:** Só você vê. Se desligar o PC, sai do ar.

### ☁️ Nuvem (Vercel)
- **URL:** `https://carroclaude.vercel.app`
- **Uso:** Produção real para clientes.
- **Banco de Dados:** Supabase (Produção).
- **Vantagem:** Sempre online, seguro (HTTPS), rápido e acessível via celular/tablet.

---

## 🛠️ Como Atualizar o Site?

Como o projeto está conectado ao GitHub, qualquer mudança que você fizer no código e enviar ("push") será publicada automaticamente.

1.  **Faça suas alterações** no código.
2.  **Abra o terminal** e digite:
    ```bash
    git add .
    git commit -m "Descrição da melhoria"
    git push
    ```
3.  **Aguarde:** A Vercel detecta a mudança e atualiza o site em ~1 minuto.

---

## ⚠️ Solução de Problemas Comuns

### "Erro 404" ou Página em Branco
- **Causa:** A Vercel não sabia qual pasta abrir (já corrigido com `vercel.json`).
- **Solução:** O arquivo `vercel.json` na raiz diz para a Vercel: "O site está dentro da pasta `carroclaude`".

### "Erro de Conexão com Banco"
- **Causa:** Variáveis de ambiente faltando na Vercel.
- **Solução:** Vá em `Vercel Dashboard > Settings > Environment Variables` e adicione as mesmas chaves do seu arquivo `.env` local (`NEXT_PUBLIC_SUPABASE_URL`, etc).

---

**Desenvolvido por Fabio**
*CarroClaude SaaS - V1.0*
