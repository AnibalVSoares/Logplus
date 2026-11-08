// dados.js - Cérebro Global e Sincronização via LocalStorage

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

// Inicializa o Chat Global se não existir
if (!localStorage.getItem('chat_global')) {
    localStorage.setItem('chat_global', JSON.stringify([{ remetente: 'Central', msg: 'Sistema de comunicação iniciado. Rádio e Chat online.' }]));
}

// Enviar Mensagem Global
function enviarMensagem(remetente, msg) {
    let chat = JSON.parse(localStorage.getItem('chat_global')) || [];
    chat.push({ remetente, msg, time: new Date().toLocaleTimeString('pt-BR').slice(0,5) });
    localStorage.setItem('chat_global', JSON.stringify(chat));
}