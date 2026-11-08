// dados.js - Cérebro Global e Sincronização via API Cloud (JSONBin)

// Chaves da API Pública Temporária para o Protótipo
// NOTA: Para um sistema em produção real, substitui-se isto por Firebase, Supabase ou backend próprio.
const BIN_ID = '672ec1ebacd3cb34a8a43588'; // Bin ID criado para este teste
const API_KEY = '$2a$10$3m/r8z2P/s2.2/c.tH/s0umT.lT/3/wX/u.1.1.1.1.1.1.1.1.1'; // Substitua pela Master Key do JSONBin caso crie um próprio

const dbGlobal = {
    frota: [
        { id: "12", modelo: "Volvo FH 540", motorista: "João Estradeiro", placa: "ABC-1234", kml: 2.2 },
        { id: "05", modelo: "Scania R450", motorista: "Maria Oliveira", placa: "XYZ-9876", kml: 2.5 }
    ],
    rotas: [
        { id: "R1", origem: "São Paulo (SP)", destino: "Recife (PE)", rodovia: "BR-101", dist: 2600 },
        { id: "R2", origem: "Salvador (BA)", destino: "São Paulo (SP)", rodovia: "BR-116", dist: 1950 }
    ],
    ppds: [
        { id: 1, nome: "Auto Posto Pioneiro", local: "Rio Largo (AL)", km: "BR-101 km 75" },
        { id: 2, nome: "Graal Ribeirão", local: "Registro (SP)", km: "BR-116 km 510" },
        { id: 3, nome: "Posto Alpino", local: "Campina Grande do Sul (PR)", km: "BR-116 km 42" }
    ],
    servicos: [
        { name: "Posto PRF - BR 116 (Km 42)", type: "Polícia Federal / Segurança", dist: 8, icon: "fas fa-shield-alt", color: "#ff3366" },
        { name: "Hospital Regional", type: "Pronto Socorro 24h", dist: 15, icon: "fas fa-hospital", color: "#ff3366" },
        { name: "SEST SENAT - Apoio", type: "Apoio Social / Saúde", dist: 32, icon: "fas fa-hands-helping", color: "#2962ff" }
    ],
    parametros: { precoDiesel: 6.18, custoPedagioKm: 0.12 }
};

// ==========================================
// FUNÇÕES DE COMUNICAÇÃO COM A NUVEM
// ==========================================

// Variável de estado em memória (cache)
let cloudState = {
    status_app_motorista: 'sem_viagem',
    os_ativa: null,
    panico_ativo: false,
    chat_global: []
};

// 1. LER DADOS DA NUVEM (Polling)
async function fetchCloudData() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Access-Key': API_KEY }
        });
        if (response.ok) {
            const data = await response.json();
            cloudState = data.record;
            return cloudState;
        }
    } catch (error) {
        console.error("Erro de conexão. A operar em cache.", error);
        return cloudState;
    }
}

// 2. ESCREVER DADOS NA NUVEM
async function updateCloudData(newState) {
    try {
        const mergedState = { ...cloudState, ...newState }; // Funde o novo com o antigo
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Key': API_KEY
            },
            body: JSON.stringify(mergedState)
        });
        if(response.ok) {
            cloudState = mergedState;
        }
    } catch (error) {
        console.error("Erro ao sincronizar com a nuvem.", error);
    }
}

// ==========================================
// FUNÇÕES UTILITÁRIAS PARA AS APPS CHAMAREM
// ==========================================

// Logística despacha a OS (Sobe para a nuvem)
async function despacharOrdemServico(dadosOS) {
    await updateCloudData({
        status_app_motorista: 'nova_rota_pendente',
        os_ativa: dadosOS
    });
}

// Motorista aceita a viagem (Avisa a nuvem)
async function aceitarViagemCloud() {
    await updateCloudData({ status_app_motorista: 'viagem_iniciada' });
}

// Motorista encerra a viagem (Avisa a nuvem)
async function encerrarViagemCloud() {
    await updateCloudData({ status_app_motorista: 'sem_viagem', os_ativa: null });
}

// Motorista aciona Pânico (Avisa a nuvem)
async function acionarPanicoCloud(isPanic) {
    await updateCloudData({ panico_ativo: isPanic });
}

// Enviar mensagem para o chat/rádio global (Sobe para a nuvem)
async function enviarMensagem(remetente, msg) {
    await fetchCloudData(); // Garante que tem a lista atualizada
    let chatHistory = cloudState.chat_global || [];
    chatHistory.push({ remetente, msg, time: new Date().toLocaleTimeString('pt-BR').slice(0,5) });
    
    // Guarda apenas as últimas 30 mensagens para não pesar o banco
    if(chatHistory.length > 30) chatHistory = chatHistory.slice(-30);
    
    await updateCloudData({ chat_global: chatHistory });
}