const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsapp.service');

// Status da conexão
router.get('/status', async (req, res) => {
  try {
    const status = await whatsappService.verificarStatus();
    
    res.json({
      sucesso: true,
      ...status
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

// Obter QR Code para conexão
router.get('/qrcode', async (req, res) => {
  try {
    const qrCode = whatsappService.obterQRCode();
    
    if (!qrCode) {
      // Iniciar conexão se não houver QR Code
      await whatsappService.inicializar();
      
      // Aguardar um pouco para gerar o QR Code
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const novoQR = whatsappService.obterQRCode();
      
      if (!novoQR) {
        return res.json({
          sucesso: true,
          mensagem: 'WhatsApp já está conectado',
          conectado: true
        });
      }

      // Retornar página HTML com QR Code
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>WhatsApp - Oficina SaaS</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              margin-bottom: 30px;
            }
            img {
              max-width: 300px;
              border: 3px solid #667eea;
              border-radius: 10px;
              padding: 10px;
              background: white;
            }
            .steps {
              text-align: left;
              margin-top: 30px;
              padding: 20px;
              background: #f5f5f5;
              border-radius: 10px;
            }
            .steps ol {
              margin: 0;
              padding-left: 20px;
            }
            .steps li {
              margin: 10px 0;
              color: #555;
            }
            .reload {
              margin-top: 20px;
              padding: 12px 30px;
              background: #25D366;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
            }
            .reload:hover {
              background: #128C7E;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚗 Conectar WhatsApp</h1>
            <p>Escaneie o QR Code com seu WhatsApp para começar</p>
            <img src="${novoQR}" alt="QR Code WhatsApp" />
            <div class="steps">
              <ol>
                <li>Abra o WhatsApp no seu celular</li>
                <li>Toque em <strong>Menu</strong> ou <strong>Configurações</strong></li>
                <li>Toque em <strong>Aparelhos conectados</strong></li>
                <li>Toque em <strong>Conectar um aparelho</strong></li>
                <li>Aponte seu celular para esta tela para escanear o código</li>
              </ol>
            </div>
            <button class="reload" onclick="location.reload()">🔄 Atualizar QR Code</button>
          </div>
          <script>
            // Auto-reload a cada 30 segundos
            setTimeout(() => location.reload(), 30000);
          </script>
        </body>
        </html>
      `);
    }

    // Retornar página HTML com QR Code existente
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WhatsApp - Oficina SaaS</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
          }
          h1 {
            color: #333;
            margin-bottom: 10px;
          }
          p {
            color: #666;
            margin-bottom: 30px;
          }
          img {
            max-width: 300px;
            border: 3px solid #667eea;
            border-radius: 10px;
            padding: 10px;
            background: white;
          }
          .steps {
            text-align: left;
            margin-top: 30px;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 10px;
          }
          .steps ol {
            margin: 0;
            padding-left: 20px;
          }
          .steps li {
            margin: 10px 0;
            color: #555;
          }
          .reload {
            margin-top: 20px;
            padding: 12px 30px;
            background: #25D366;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
          .reload:hover {
            background: #128C7E;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚗 Conectar WhatsApp</h1>
          <p>Escaneie o QR Code com seu WhatsApp para começar</p>
          <img src="${qrCode}" alt="QR Code WhatsApp" />
          <div class="steps">
            <ol>
              <li>Abra o WhatsApp no seu celular</li>
              <li>Toque em <strong>Menu</strong> ou <strong>Configurações</strong></li>
              <li>Toque em <strong>Aparelhos conectados</strong></li>
              <li>Toque em <strong>Conectar um aparelho</strong></li>
              <li>Aponte seu celular para esta tela para escanear o código</li>
            </ol>
          </div>
          <button class="reload" onclick="location.reload()">🔄 Atualizar QR Code</button>
        </div>
        <script>
          // Auto-reload a cada 30 segundos
          setTimeout(() => location.reload(), 30000);
        </script>
      </body>
      </html>
    `);

  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

// Iniciar conexão
router.post('/conectar', async (req, res) => {
  try {
    await whatsappService.inicializar();
    
    res.json({
      sucesso: true,
      mensagem: 'Conexão iniciada. Acesse /whatsapp/qrcode para escanear o QR Code'
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

// Desconectar
router.post('/desconectar', async (req, res) => {
  try {
    await whatsappService.desconectar();
    
    res.json({
      sucesso: true,
      mensagem: 'WhatsApp desconectado'
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

// Verificar número
router.post('/verificar-numero', async (req, res) => {
  try {
    const { telefone } = req.body;

    if (!telefone) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Telefone é obrigatório'
      });
    }

    const resultado = await whatsappService.verificarNumero(telefone);
    
    res.json({
      sucesso: true,
      ...resultado
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

// Enviar mensagem de teste
router.post('/teste', async (req, res) => {
  try {
    const { telefone } = req.body;

    if (!telefone) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Telefone é obrigatório'
      });
    }

    const resultado = await whatsappService.testarConexao(telefone);
    
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

module.exports = router;
