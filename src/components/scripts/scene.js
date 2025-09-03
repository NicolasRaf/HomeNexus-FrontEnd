import { currentUser, apiRequest } from './user.js';
import { getCasaSelecionadaId } from './house.js';

const listaCenas = document.getElementById("lista-cenas");
const formAddCena = document.getElementById("form-add-cena");

// Elementos do Modal
const modalContainer = document.getElementById('modal-container');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal-btn');

let acoesDaCenaAtual = [];

// --- Lógica do Modal ---

function abrirModalCena() {
    acoesDaCenaAtual = [];
    const casaId = getCasaSelecionadaId();

    if (!currentUser || !casaId) {
        alert("Selecione uma casa para criar uma cena.");
        return;
    }

    // ## CORREÇÃO PRINCIPAL AQUI ##
    apiRequest(`/user/${currentUser.user_id}/house/${casaId}/device`)
        .then(dispositivos => {
            renderizarFormularioNoModal(dispositivos);
            modalContainer.classList.remove('hidden');
            modalContainer.classList.add('visible');
        })
        .catch(err => {
            console.error("Não foi possível buscar os dispositivos da casa:", err);
            alert("Erro ao buscar dispositivos. Verifique o console.");
        });
}

function fecharModalCena() {
    modalContainer.classList.remove('visible');
    modalContainer.classList.add('hidden');
    modalBody.innerHTML = '';
}

function renderizarFormularioNoModal(dispositivos) {
    const deviceOptions = dispositivos.length > 0
        ? dispositivos.map(d => `<option value="${d.dispos_id}">${d.nome}</option>`).join('')
        : '<option value="" disabled>Nenhum dispositivo encontrado</option>';

      modalBody.innerHTML = `
        <form id="form-add-scene-modal">
            <input type="text" id="scene-name-input" placeholder="Nome da cena" required class="form-input">

            <fieldset class="fieldset-actions">
                <legend>Adicionar Ação</legend>
                <div class="action-inputs-container">
                    <select id="device-select" class="form-select">${deviceOptions}</select>
                    <select id="state-select" class="form-select">
                        <option value="true">Ligar</option>
                        <option value="false">Desligar</option>
                    </select>
                    <input type="number" id="delay-input" placeholder="Delay (ms)" value="0" min="0" class="form-input">
                    <button type="button" id="add-action-btn" class="btn-secondary">Adicionar Ação</button>
                </div>
            </fieldset>

            <ul id="actions-list"></ul>

            <button type="submit" class="btn-primary">Salvar Cena</button>
        </form>
    `;

    document.getElementById('add-action-btn').addEventListener('click', adicionarAcao);
    document.getElementById('form-add-scene-modal').addEventListener('submit', salvarCena);
}

function adicionarAcao() {
    const deviceSelect = document.getElementById('device-select');
    if (!deviceSelect.value) {
        alert("Não há dispositivos para adicionar.");
        return;
    }
    const stateSelect = document.getElementById('state-select');
    const delayInput = document.getElementById('delay-input');

    const novaAcao = {
        dispos_id: parseInt(deviceSelect.value),
        ligado_desejado: stateSelect.value === 'true',
        delay: parseInt(delayInput.value) || 0,
    };
    acoesDaCenaAtual.push(novaAcao);
    renderizarListaDeAcoes();
}

function renderizarListaDeAcoes() {
    const actionsList = document.getElementById('actions-list');
    actionsList.innerHTML = '';
    acoesDaCenaAtual.forEach((acao, index) => {
        const deviceName = document.querySelector(`#device-select option[value="${acao.dispos_id}"]`).textContent;
        const actionText = acao.ligado_desejado ? 'Ligar' : 'Desligar';
        const li = document.createElement('li');
        li.className = 'action-item';
        li.innerHTML = `
            <span>${actionText} ${deviceName} (Delay: ${acao.delay}ms)</span>
            <button type="button" class="btn-delete-action" data-index="${index}">&times;</button>
        `;
        actionsList.appendChild(li);
    });
    document.querySelectorAll('.btn-delete-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            acoesDaCenaAtual.splice(parseInt(e.target.dataset.index), 1);
            renderizarListaDeAcoes();
        });
    });
}

function salvarCena(event) {
    event.preventDefault();
    const nome = document.getElementById('scene-name-input').value;
    const casaId = getCasaSelecionadaId();
    if (!nome) {
        alert("Por favor, dê um nome para a cena.");
        return;
    }
    // O back-end para criar uma cena espera um array de 'acoes'
    const novaCena = { nome, ativa: true, acoes: acoesDaCenaAtual };

    apiRequest(`/user/${currentUser.user_id}/house/${casaId}/scene`, {
        method: "POST",
        body: JSON.stringify(novaCena),
    })
    .then(cenaCriada => {
        adicionarCenaNaTela(cenaCriada);
        fecharModalCena();
    })
    .catch(err => {
        console.error("Erro ao criar cena:", err);
        alert("Não foi possível criar a cena.");
    });
}

// --- Lógica Principal da Página ---

function adicionarCenaNaTela(cena) {
    const itemLista = document.createElement("li");
    itemLista.className = "entity-list-item";
    itemLista.innerHTML = `<span>${cena.nome}</span><button class="btn-delete">Deletar</button>`;
    
    itemLista.querySelector(".btn-delete").addEventListener("click", () => {
        const casaId = getCasaSelecionadaId();
        if (!currentUser || !casaId) return;
        apiRequest(`/user/${currentUser.user_id}/house/${casaId}/scene/${cena.cena_id}`, { method: "DELETE" })
            .then(() => itemLista.remove());
    });
    listaCenas.appendChild(itemLista);
}

export function loadCenas() {
    const casaId = getCasaSelecionadaId();
    if (!currentUser || !casaId) {
        listaCenas.innerHTML = "<li>Selecione uma casa para ver as cenas.</li>";
        return;
    }
    apiRequest(`/user/${currentUser.user_id}/house/${casaId}/scene`)
        .then(cenas => {
            listaCenas.innerHTML = "";
            cenas.forEach(adicionarCenaNaTela);
        })
        .catch(err => {
            console.error("Erro ao carregar cenas:", err);
            listaCenas.innerHTML = "<li>Não foi possível carregar as cenas.</li>";
        });
}

export function initCenas() {
    formAddCena.addEventListener("submit", (event) => {
        event.preventDefault();
        abrirModalCena();
    });
    closeModalBtn.addEventListener('click', fecharModalCena);
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) fecharModalCena();
    });
}