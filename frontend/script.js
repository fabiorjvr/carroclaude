const API_URL = 'http://localhost:3000/api';

// Elementos
const whatsappStatus = document.getElementById('whatsapp-status');
const statusText = document.getElementById('status-text');
const clientesTableBody = document.getElementById('clientes-table-body');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarDashboard();
    verificarStatusWhatsApp();
    
    // Atualizar a cada 30 segundos
    setInterval(carregarDashboard, 30000);
    setInterval(verificarStatusWhatsApp, 15000);
});

// Funções principais
async function carregarDashboard() {
    try {
        const response = await fetch(`${API_URL}/dashboard`);
        const data = await response.json();
        
        if (data.sucesso) {
            atualizarStats(data.stats);
            atualizarTabela(data.clientes);
            atualizarAgendamentos(data.agendamentos);
        }
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

async function verificarStatusWhatsApp() {
    try {
        const response = await fetch(`${API_URL}/whatsapp/status`);
        const data = await response.json();
        
        const indicator = whatsappStatus.querySelector('.status-indicator');
        
        if (data.conectado) {
            indicator.className = 'status-indicator connected';
            statusText.textContent = 'WhatsApp Conectado';
        } else {
            indicator.className = 'status-indicator disconnected';
            statusText.textContent = 'Desconectado';
        }
    } catch (error) {
        console.error('Erro ao verificar WhatsApp:', error);
    }
}

function atualizarStats(stats) {
    document.getElementById('total-clientes').textContent = stats.total_clientes;
    document.getElementById('enviadas-hoje').textContent = stats.total_notificacoes_enviadas; // Ajustar se tiver filtro diário
    document.getElementById('pendentes').textContent = stats.notificacoes_pendentes;
}

function atualizarAgendamentos(agendamentos) {
    // Encontrar próximo horário
    const agora = new Date();
    const horaAtual = agora.getHours();
    
    // Converter "09:00" para número 9 e filtrar os futuros
    const proximos = agendamentos
        .map(h => parseInt(h.split(':')[0]))
        .filter(h => h > horaAtual)
        .sort((a, b) => a - b);
        
    const proximo = proximos.length > 0 ? `${proximos[0]}:00` : 'Amanhã 09:00';
    document.getElementById('proximo-envio').textContent = proximo;
}

function atualizarTabela(clientes) {
    clientesTableBody.innerHTML = '';
    
    if (clientes.length === 0) {
        clientesTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum cliente encontrado.</td></tr>';
        return;
    }

    clientes.forEach(cliente => {
        const tr = document.createElement('tr');
        
        // Formatar datas
        const dataUltimoServico = cliente.ultimo_servico 
            ? new Date(cliente.ultimo_servico.data).toLocaleDateString('pt-BR') 
            : '-';
            
        const previsaoEnvio = cliente.proxima_previsao 
            ? `${cliente.proxima_previsao} km` 
            : '-';

        tr.innerHTML = `
            <td>
                <div class="cliente-info">
                    <span class="cliente-nome">${cliente.nome}</span>
                    <span class="cliente-tel">${formatarTelefone(cliente.telefone)}</span>
                </div>
            </td>
            <td>${cliente.carro}</td>
            <td>
                <div class="cliente-info">
                    <span class="cliente-nome">${cliente.ultimo_servico?.tipo || '-'}</span>
                    <span class="cliente-tel">${dataUltimoServico}</span>
                </div>
            </td>
            <td>${previsaoEnvio}</td>
            <td>
                <span class="status-badge ${cliente.status_class}">
                    ${cliente.status}
                </span>
            </td>
            <td>
                <button class="action-btn" onclick="enviarIndividual(${cliente.id})" title="Enviar notificação">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </td>
        `;
        
        clientesTableBody.appendChild(tr);
    });
}

// Ações
async function conectarWhatsapp() {
    window.open(`${API_URL}/whatsapp/qrcode`, '_blank');
}

async function executarNotificacoes() {
    if (!confirm('Deseja gerar e enviar notificações para todos os clientes pendentes?')) return;
    
    showToast('Iniciando processo de envio...', 'info');
    
    try {
        const response = await fetch(`${API_URL}/notificacoes/executar`, { method: 'POST' });
        const data = await response.json();
        
        if (data.sucesso) {
            showToast(`Sucesso! ${data.enviadas} mensagens enviadas.`);
            carregarDashboard();
        } else {
            showToast('Erro ao enviar notificações.', 'error');
        }
    } catch (error) {
        showToast('Erro de conexão.', 'error');
    }
}

async function enviarIndividual(clienteId) {
    // Implementação futura para envio individual específico
    alert('Funcionalidade de envio individual em desenvolvimento. Use o "Enviar Agora" para processar a fila.');
}

// Helpers
function formatarTelefone(tel) {
    // Formato simples: (11) 99999-9999
    const ddd = tel.slice(2, 4);
    const parte1 = tel.slice(4, 9);
    const parte2 = tel.slice(9);
    return `(${ddd}) ${parte1}-${parte2}`;
}

function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Filtro de busca
document.getElementById('search-input').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = clientesTableBody.getElementsByTagName('tr');
    
    Array.from(rows).forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
});
