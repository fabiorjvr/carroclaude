const axios = require('axios');
const config = require('../config');

class AIService {
  constructor() {
    this.provider = config.ai.provider;
  }

  /**
   * Gera mensagem personalizada de notificação usando IA
   */
  async gerarMensagemNotificacao(cliente, servico, tipoServico) {
    const prompt = this._construirPrompt(cliente, servico, tipoServico);

    try {
      if (this.provider === 'groq') {
        return await this._gerarComGroq(prompt);
      } else {
        return await this._gerarComMistral(prompt);
      }
    } catch (error) {
      console.error('Erro ao gerar mensagem com IA:', error.message);
      // Fallback para mensagem padrão
      return this._gerarMensagemPadrao(cliente, tipoServico);
    }
  }

  /**
   * Constrói o prompt para a IA
   */
  _construirPrompt(cliente, servico, tipoServico) {
    const diasDesdeServico = servico ? this._calcularDias(servico.data_servico) : 0;
    const kmEstimado = servico ? servico.km_realizado + (cliente.km_media_mensal * (diasDesdeServico / 30)) : 0;
    const dataFormatada = servico ? this._formatarData(servico.data_servico) : 'N/A';

    return `Você é Virginia Fonseca, assistente virtual da OFICINA DO DIVAL. Gere uma mensagem de WhatsApp ESTRUTURADA, PROFISSIONAL e IMPACTANTE para notificar o cliente.

INFORMAÇÕES DO CLIENTE:
- Nome Completo: ${cliente.nome}
- Veículo: ${cliente.carro}
- Placa: ${cliente.placa || 'N/A'}
- Último serviço: ${tipoServico.nome}
${servico ? `- Data da realização: ${dataFormatada}` : ''}
${servico ? `- Quilometragem na época: ${servico.km_realizado} km` : ''}
- Quilometragem atual (estimada): ${Math.round(kmEstimado)} km
- Próxima troca recomendada: ${servico ? servico.km_realizado + tipoServico.intervalo_km : tipoServico.intervalo_km} km

INSTRUÇÕES OBRIGATÓRIAS:
1. Apresente-se como Virginia Fonseca da Oficina do Dival.
2. Use o nome completo do cliente na saudação.
3. Coloque o modelo do veículo em NEGRITO (entre asteriscos, ex: *Honda Civic*).
4. Liste as informações de forma estruturada (bullet points):
   - Serviço Realizado
   - Data da realização
   - KM na época
5. Informe que, baseado na média de uso, chegou o momento da nova manutenção.
6. JAMAIS use termos como "rapidinho" ou linguagem informal demais. Seja extremamente profissional.
7. Finalize oferecendo agendamento de forma cortês.
8. Assinatura: "Virginia Fonseca | Assistente Virtual - Oficina do Dival".

Gere APENAS o texto da mensagem.`;
  }

  /**
   * Gera mensagem usando Groq (LLaMA)
   */
  async _gerarComGroq(prompt) {
    const response = await axios.post(
      `${config.ai.groq.baseURL}/chat/completions`,
      {
        model: config.ai.groq.model,
        messages: [
          {
            role: 'system',
            content: 'Você é Virginia Fonseca, uma assistente virtual sênior e altamente profissional da Oficina do Dival. Você preza pela precisão, educação e clareza.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5, // Reduzido para ser mais determinístico e profissional
        max_tokens: 400
      },
      {
        headers: {
          'Authorization': `Bearer ${config.ai.groq.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  }

  /**
   * Gera mensagem usando Mistral AI
   */
  async _gerarComMistral(prompt) {
    const response = await axios.post(
      `${config.ai.mistral.baseURL}/chat/completions`,
      {
        model: config.ai.mistral.model,
        messages: [
          {
            role: 'system',
            content: 'Você é Virginia Fonseca, uma assistente virtual sênior e altamente profissional da Oficina do Dival.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 400
      },
      {
        headers: {
          'Authorization': `Bearer ${config.ai.mistral.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  }

  /**
   * Gera mensagem padrão como fallback
   */
  _gerarMensagemPadrao(cliente, tipoServico) {
    return `Olá ${cliente.nome}, como vai?

Aqui é Virginia Fonseca, da OFICINA DO DIVAL.

Gostaria de informar que, de acordo com nossos registros, chegou o momento da manutenção do seu *${cliente.carro}*.

📌 **Detalhes do Serviço:**
- Serviço: ${tipoServico.nome}
- Veículo: *${cliente.carro}*

Recomendamos agendar uma visita para garantir o melhor desempenho do seu veículo.

Fico à disposição para agendarmos o melhor horário.

Atenciosamente,
Virginia Fonseca | Assistente Virtual - Oficina do Dival`;
  }

  /**
   * Calcula diferença em dias
   */
  _calcularDias(dataServico) {
    const data = new Date(dataServico);
    const hoje = new Date();
    const diff = hoje - data;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Formata data
   */
  _formatarData(data) {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  /**
   * Testa conexão com a API
   */
  async testarConexao() {
    try {
      const prompt = 'Responda apenas com "OK" se você está funcionando.';
      
      if (this.provider === 'groq') {
        const response = await this._gerarComGroq(prompt);
        return { sucesso: true, provider: 'Groq', resposta: response };
      } else {
        const response = await this._gerarComMistral(prompt);
        return { sucesso: true, provider: 'Mistral', resposta: response };
      }
    } catch (error) {
      return { 
        sucesso: false, 
        provider: this.provider, 
        erro: error.message 
      };
    }
  }
}

module.exports = new AIService();
