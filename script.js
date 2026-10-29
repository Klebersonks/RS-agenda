// ===== CONFIGURAÇÃO DO EMAILJS =====
const EMAILJS_SERVICE = 'service_ax6jcd6';
const EMAILJS_TEMPLATE = 'template_733wcth';
const EMAILJS_PUBLIC_KEY = 'cJkWVR336wwhaUE8A';
const EMAIL_DONA = 'COLOQUE_SEU_EMAIL_AQUI'; // e-mail que vai receber a notificação

// Dados Inicializados
let trancas = JSON.parse(localStorage.getItem('silvia_trancas')) || [
    { id: 1, nome: "Tranças nagô topo simples - com até 6 tranças", preco: 30 },
    { id: 2, nome: "Nagô lateral simples com até 4 tranças", preco: 25 },
    { id: 3, nome: "Nagô tiara simples com até 2 tranças", preco: 25 },
    { id: 4, nome: "Nagô topo desenhada, desenho simples com até 6 tranças", preco: 40 },
    { id: 5, nome: "Nagô lateral desenhada, desenho simples com até 4 tranças", preco: 35 },
    { id: 6, nome: "Nagô tiara desenhada simples até 3 tranças", preco: 35 },
    { id: 7, nome: "Nagô topo desenhada, coração", preco: 35 },
    { id: 8, nome: "Nagô lateral desenhada coração", preco: 30 },
    { id: 9, nome: "Nagô tiara coração", preco: 30 },
    { id: 10, nome: "Boxeadora simples", preco: 40 },
    { id: 11, nome: "Boxeadora desenhada simples", preco: 45 },
    { id: 12, nome: "Boxeadora desenhada coração", preco: 50 },
    { id: 13, nome: "Cabeça toda com até 8 tranças", preco: 80 },
    { id: 14, nome: "Frente toda simples", preco: 50 },
    { id: 15, nome: "Frente toda desenhada simples", preco: 60 }
];

let agendamentos = JSON.parse(localStorage.getItem('silvia_agendamentos')) || [];
let historicoAtendimentos = JSON.parse(localStorage.getItem('silvia_historico')) || [];

const feriados2026 = {
    "01-01": "Ano Novo",
    "02-17": "Carnaval",
    "04-03": "Sexta-feira Santa",
    "04-21": "Tiradentes",
    "05-01": "Dia do Trabalho",
    "06-04": "Corpus Christi",
    "09-07": "Independência",
    "10-12": "Nossa Sra Aparecida",
    "11-02": "Finados",
    "11-15": "Proclamação da República",
    "11-20": "Consciência Negra",
    "12-25": "Natal"
};

let dataAtualCalendario = new Date();

document.addEventListener("DOMContentLoaded", () => {
    // Inicializa o EmailJS (a biblioteca precisa estar carregada no HTML)
    if (typeof emailjs !== 'undefined') {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    } else {
        console.error('Biblioteca do EmailJS não foi carregada no HTML.');
    }

    renderTrancas();
    renderAgendamentos();
    renderHistorico();
    renderCalendario();

    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.style.display = 'none';
    }, 3300);
});

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if(tabId === 'calendario') renderCalendario();
}

/* MODAL DE AGENDAMENTO */
function abrirModalAgendamento() {
    document.getElementById('modal-agendamento').style.display = 'flex';
    preencherClientesExistentesSelect();
}

function fecharModalAgendamento() {
    document.getElementById('modal-agendamento').style.display = 'none';
}

function alternarTipoClienteToggle() {
    const isExistente = document.getElementById('toggle-tipo-cliente').checked;
    const groupNovo = document.getElementById('group-cliente-novo');
    const groupExistente = document.getElementById('group-cliente-existente');
    const inputNome = document.getElementById('nome-cliente');

    if (isExistente) {
        groupNovo.style.display = 'none';
        groupExistente.style.display = 'block';
        inputNome.removeAttribute('required');
    } else {
        groupNovo.style.display = 'block';
        groupExistente.style.display = 'none';
        inputNome.setAttribute('required', 'required');
    }
}

function preencherClientesExistentesSelect() {
    const select = document.getElementById('select-cliente-existente');
    select.innerHTML = '<option value="">-- Selecione uma cliente --</option>';
    
    // Obter lista única de clientes a partir do histórico
    const nomesUnicos = [...new Set(historicoAtendimentos.map(h => h.cliente))];
    nomesUnicos.forEach(nome => {
        select.innerHTML += `<option value="${nome}">${nome}</option>`;
    });
}

/* GERENCIAMENTO DE TRANÇAS */
function renderTrancas() {
    localStorage.setItem('silvia_trancas', JSON.stringify(trancas));
    
    const selectAgendar = document.getElementById('tranca-select');
    selectAgendar.innerHTML = '';
    trancas.forEach(t => {
        selectAgendar.innerHTML += `<option value="${t.id}">${t.nome} - R$ ${t.preco.toFixed(2)}</option>`;
    });

    const tbody = document.getElementById('lista-trancas-config');
    tbody.innerHTML = '';
    trancas.forEach(t => {
        tbody.innerHTML += `
            <tr>
                <td>${t.nome}</td>
                <td>R$ ${t.preco.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="editarTranca(${t.id})">Editar</button>
                    <button class="btn btn-sm" onclick="removerTranca(${t.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function adicionarTranca(e) {
    e.preventDefault();
    const nome = document.getElementById('novo-tranca-nome').value;
    const preco = parseFloat(document.getElementById('novo-tranca-preco').value);
    trancas.push({ id: Date.now(), nome, preco });
    renderTrancas();
    document.getElementById('form-add-tranca').reset();
}

function removerTranca(id) {
    trancas = trancas.filter(t => t.id !== id);
    renderTrancas();
}

function editarTranca(id) {
    const tranca = trancas.find(t => t.id === id);
    const novoNome = prompt("Novo nome da trança:", tranca.nome);
    const novoPreco = prompt("Novo preço (R$):", tranca.preco);
    if (novoNome && novoPreco) {
        tranca.nome = novoNome;
        tranca.preco = parseFloat(novoPreco);
        renderTrancas();
    }
}

/* AGENDAMENTOS */
function salvarAgendamento(e) {
    e.preventDefault();
    
    const isExistente = document.getElementById('toggle-tipo-cliente').checked;
    let nomeCliente = "";

    if (isExistente) {
        nomeCliente = document.getElementById('select-cliente-existente').value;
        if (!nomeCliente) {
            alert("Por favor, selecione uma cliente existente.");
            return;
        }
    } else {
        nomeCliente = document.getElementById('nome-cliente').value.trim();
    }

    const telefone = document.getElementById('telefone-cliente').value;
    const email = document.getElementById('email-cliente').value.trim();
    const trancaId = parseInt(document.getElementById('tranca-select').value);
    const data = document.getElementById('data-agendamento').value;
    const hora = document.getElementById('hora-agendamento').value;
    const prioridade = parseInt(document.getElementById('prioridade-select').value);

    const trancaObj = trancas.find(t => t.id === trancaId);

    const novoAgendamento = {
        id: Date.now(),
        cliente: nomeCliente,
        telefone,
        email,
        tranca: trancaObj.nome,
        valor: trancaObj.preco,
        data,
        hora,
        prioridade,
        status: 'Agendado'
    };

    agendamentos.push(novoAgendamento);
    localStorage.setItem('silvia_agendamentos', JSON.stringify(agendamentos));

    const dataFmt = data.split('-').reverse().join('/');
    fecharModalAgendamento();
    document.getElementById('form-agendar').reset();
    renderAgendamentos();

    // Envio da notificação por e-mail
    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
        to_email: email || EMAIL_DONA,
        email: email || 'não informado',
        cliente: nomeCliente,
        telefone: telefone,
        data: dataFmt,
        hora: hora,
        tranca: trancaObj.nome,
        valor: `R$ ${trancaObj.preco.toFixed(2)}`
    }, { publicKey: EMAILJS_PUBLIC_KEY })
    .then(() => {
        alert('Agendamento salvo e notificação enviada com sucesso!');
    })
    .catch((erro) => {
        console.error('Erro ao enviar e-mail:', erro);
        const detalheErro = erro?.text || erro?.message || `Código ${erro?.status || 'desconhecido'}`;
        alert(`Agendamento salvo, mas o e-mail não foi enviado.\n\nErro do EmailJS: ${detalheErro}`);
    });
}

function renderAgendamentos() {
    agendamentos.sort((a, b) => {
        const dataA = new Date(`${a.data}T${a.hora}`);
        const dataB = new Date(`${b.data}T${b.hora}`);
        if (dataA - dataB !== 0) return dataA - dataB;
        return a.prioridade - b.prioridade;
    });

    const tbody = document.getElementById('lista-agendamentos');
    tbody.innerHTML = '';

    const textoPrioridade = { 1: 'Prioritário', 2: 'Comum', 3: 'Desurgente' };
    const classePrioridade = { 1: 'priority-prioritaria', 2: 'priority-comum', 3: 'priority-desurgente' };

    agendamentos.forEach(item => {
        const dataFmt = item.data.split('-').reverse().join('/');
        tbody.innerHTML += `
            <tr>
                <td>${dataFmt} ${item.hora}</td>
                <td><strong>${item.cliente}</strong></td>
                <td>${item.telefone}</td>
                <td>${item.tranca}</td>
                <td>R$ ${item.valor.toFixed(2)}</td>
                <td class="${classePrioridade[item.prioridade]}">${textoPrioridade[item.prioridade]}</td>
                <td class="status-${item.status}">${item.status}</td>
                <td class="actions-btn">
                    <button class="btn btn-sm btn-concluir" onclick="abrirModalFinalizar(${item.id}, 'Concluído')">Concluir</button>
                    <button class="btn btn-sm btn-cancelar" onclick="abrirModalFinalizar(${item.id}, 'Cancelado')">Cancelar</button>
                </td>
            </tr>
        `;
    });
}

/* FINALIZAR E AVALIAR ATENDIMENTO */
function abrirModalFinalizar(id, status) {
    const item = agendamentos.find(a => a.id === id);
    if(!item) return;

    document.getElementById('finalizar-id').value = id;
    document.getElementById('finalizar-status').value = status;
    document.getElementById('subtitulo-finalizar').innerText = `${status} agendamento de ${item.cliente}`;
    document.getElementById('modal-finalizar').style.display = 'flex';
}

function fecharModalFinalizar() {
    document.getElementById('modal-finalizar').style.display = 'none';
    document.getElementById('form-finalizar').reset();
}

function confirmarFinalizacao(e) {
    e.preventDefault();

    const id = parseInt(document.getElementById('finalizar-id').value);
    const status = document.getElementById('finalizar-status').value;
    const nota = parseInt(document.querySelector('input[name="star-rating"]:checked').value);
    const obs = document.getElementById('finalizar-obs').value;

    const index = agendamentos.findIndex(a => a.id === id);
    if (index >= 0) {
        const item = agendamentos[index];
        
        // Mover para o histórico
        historicoAtendimentos.push({id: item.id,data: item.data,cliente: item.cliente,tranca: item.tranca,status: status,nota: nota, observacoes: obs});

        // Remover da lista de agendamentos ativos
        agendamentos.splice(index, 1);localStorage.setItem('silvia_agendamentos', JSON.stringify(agendamentos));
        localStorage.setItem('silvia_historico', JSON.stringify(historicoAtendimentos));

        fecharModalFinalizar();
        renderAgendamentos();
        renderHistorico();
        showTab('clientes');
    }
}

function renderHistorico() {
    const tbody = document.getElementById('lista-clientes-hist');
    tbody.innerHTML = '';

    historicoAtendimentos.forEach(h => {
        const dataFmt = h.data.split('-').reverse().join('/');
        const estrelas = '★'.repeat(h.nota) + '☆'.repeat(5 - h.nota);

        tbody.innerHTML += `
            <tr>
                <td>${dataFmt}</td>
                <td><strong>${h.cliente}</strong></td>
                <td>${h.tranca}</td>
                <td class="status-${h.status}">${h.status}</td>
                <td><span class="star-rating-display">${estrelas}</span></td>
                <td>${h.observacoes || '-'}</td>
            </tr>
        `;
    });
}

/* CALENDÁRIO */
function renderCalendario() {
    const monthYearText = document.getElementById('calendar-month-year');
    const daysContainer = document.getElementById('calendar-days');
    
    const ano = dataAtualCalendario.getFullYear();
    const mes = dataAtualCalendario.getMonth();

    const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    monthYearText.innerText = `${nomesMeses[mes]} ${ano}`;

    daysContainer.innerHTML = '';

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();

    for (let i = 0; i < primeiroDia; i++) {
        daysContainer.innerHTML += `<div></div>`;
    }

    for (let dia = 1; dia <= totalDias; dia++) {
        const diaPad = String(dia).padStart(2, '0');
        const mesPad = String(mes + 1).padStart(2, '0');
        const chaveData = `${mesPad}-${diaPad}`;
        const dataCompleta = `${ano}-${mesPad}-${diaPad}`;

        const ehFeriado = feriados2026[chaveData];
        const temAgendamento = agendamentos.some(a => a.data === dataCompleta && a.status === 'Agendado');

        let classeDia = 'calendar-day';
        if (ehFeriado) classeDia += ' holiday';
        if (temAgendamento) classeDia += ' has-event';

        daysContainer.innerHTML += `
            <div class="${classeDia}" title="${ehFeriado || ''}">
                <span>${dia}</span>
                ${ehFeriado ? `<span class="holiday-name">${ehFeriado}</span>` : ''}
                ${temAgendamento ? `<div class="event-dot"></div>` : ''}
            </div>
        `;
    }
}

function mudarMês(delta) {
    dataAtualCalendario.setMonth(dataAtualCalendario.getMonth() + delta);
    renderCalendario();
}
