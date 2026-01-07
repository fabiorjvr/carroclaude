const wppconnect = require('@wppconnect-team/wppconnect');
const config = require('../config');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.qrCode = null;
  }

  /**
   * Inicializa conexão com WhatsApp
   */
  async inicializar() {
    try {
      console.log('🔄 Iniciando WhatsApp...');

      this.client = await wppconnect.create({
        session: config.whatsapp.session,
        catchQR: (base64Qr, asciiQR, attempts, urlCode) => {
          console.log('📱 QR Code recebido (tentativa', attempts, ')');
          this.qrCode = base64Qr;
          
          // Exibir no terminal para teste local
          if (config.nodeEnv === 'development') {
            console.log(asciiQR);
          }
        },
        statusFind: (statusSession, session) => {
          console.log('Status:', statusSession);
          console.log('Session:', session);
        },
        headless: config.whatsapp.headless,
        devtools: false,
        useChrome: true,
        debug: false,
        logQR: config.whatsapp.logQR,
        browserArgs: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      // Configurar listeners
      this.client.onStateChange((state) => {
        console.log('🔔 Estado mudou:', state);
        this.isConnected = state === 'CONNECTED';
      });

      this.client.onMessage((message) => {
        this._handleIncomingMessage(message);
      });

      console.log('✅ WhatsApp conectado com sucesso!');
      this.isConnected = true;
      return true;

    } catch (error) {
      console.error('❌ Erro ao conectar WhatsApp:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Envia mensagem para um número
   */
  async enviarMensagem(telefone, mensagem) {
    if (!this.isConnected || !this.client) {
      throw new Error('WhatsApp não está conectado');
    }

    try {
      // Formatar número (remover caracteres especiais e adicionar @c.us)
      const numeroFormatado = this._formatarNumero(telefone);
      
      console.log(`📤 Enviando mensagem para ${telefone}...`);
      
      const result = await this.client.sendText(numeroFormatado, mensagem);
      
      console.log(`✅ Mensagem enviada com sucesso para ${telefone}`);
      return {
        sucesso: true,
        telefone,
        messageId: result.id
      };

    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem para ${telefone}:`, error.message);
      throw new Error(`Falha ao enviar: ${error.message}`);
    }
  }

  /**
   * Envia mensagem para múltiplos números
   */
  async enviarMensagemEmLote(destinatarios) {
    const resultados = [];

    for (const dest of destinatarios) {
      try {
        const result = await this.enviarMensagem(dest.telefone, dest.mensagem);
        resultados.push({
          ...result,
          clienteId: dest.clienteId,
          notificacaoId: dest.notificacaoId
        });

        // Aguardar 2 segundos entre mensagens para evitar bloqueio
        await this._aguardar(2000);

      } catch (error) {
        resultados.push({
          sucesso: false,
          telefone: dest.telefone,
          clienteId: dest.clienteId,
          notificacaoId: dest.notificacaoId,
          erro: error.message
        });
      }
    }

    return resultados;
  }

  /**
   * Verifica se número tem WhatsApp
   */
  async verificarNumero(telefone) {
    if (!this.isConnected || !this.client) {
      throw new Error('WhatsApp não está conectado');
    }

    try {
      const numeroFormatado = this._formatarNumero(telefone);
      const result = await this.client.checkNumberStatus(numeroFormatado);
      
      return {
        existe: result.numberExists,
        telefone: telefone,
        canReceiveMessage: result.canReceiveMessage
      };

    } catch (error) {
      console.error(`Erro ao verificar número ${telefone}:`, error.message);
      return {
        existe: false,
        telefone: telefone,
        erro: error.message
      };
    }
  }

  /**
   * Obtém QR Code atual
   */
  obterQRCode() {
    return this.qrCode;
  }

  /**
   * Verifica status da conexão
   */
  async verificarStatus() {
    if (!this.client) {
      return { conectado: false, mensagem: 'Cliente não inicializado' };
    }

    try {
      const state = await this.client.getConnectionState();
      const isConnected = state === 'CONNECTED';
      
      return {
        conectado: isConnected,
        estado: state,
        sessao: config.whatsapp.session
      };
    } catch (error) {
      return {
        conectado: false,
        erro: error.message
      };
    }
  }

  /**
   * Desconecta WhatsApp
   */
  async desconectar() {
    if (this.client) {
      try {
        await this.client.close();
        console.log('📴 WhatsApp desconectado');
        this.isConnected = false;
        this.client = null;
      } catch (error) {
        console.error('Erro ao desconectar:', error);
      }
    }
  }

  /**
   * Formata número de telefone
   */
  _formatarNumero(telefone) {
    // Remove todos os caracteres não numéricos
    let numero = telefone.replace(/\D/g, '');
    
    // Se não tem código do país, adiciona 55 (Brasil)
    if (!numero.startsWith('55')) {
      numero = '55' + numero;
    }
    
    return numero + '@c.us';
  }

  /**
   * Aguarda um tempo em ms
   */
  _aguardar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Processa mensagens recebidas
   */
  _handleIncomingMessage(message) {
    console.log('📩 Mensagem recebida:', {
      de: message.from,
      mensagem: message.body,
      timestamp: message.timestamp
    });

    // Aqui você pode adicionar lógica para responder mensagens
    // Por exemplo, responder com menu de opções
  }

  /**
   * Envia mensagem de teste
   */
  async testarConexao(telefone = null) {
    if (!telefone) {
      return {
        sucesso: this.isConnected,
        mensagem: this.isConnected ? 'WhatsApp conectado' : 'WhatsApp desconectado'
      };
    }

    try {
      const mensagemTeste = '🔧 Teste de conexão da Oficina SaaS!\n\nSe você recebeu esta mensagem, o sistema está funcionando perfeitamente! ✅';
      
      await this.enviarMensagem(telefone, mensagemTeste);
      
      return {
        sucesso: true,
        mensagem: 'Mensagem de teste enviada com sucesso!'
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: 'Erro ao enviar mensagem de teste',
        erro: error.message
      };
    }
  }
}

module.exports = new WhatsAppService();
