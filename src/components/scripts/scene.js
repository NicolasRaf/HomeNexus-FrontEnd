// Em NexusHome-Front-End/src/components/scripts/scene.js

import { currentUser, apiRequest } from './user.js';
import { getCasaSelecionadaId } from './house.js';

// --- ELEMENTOS DA PÁGINA ---
const listaCenas = document.getElementById("lista-cenas");
const formAddCena = document.getElementById("form-add-cena"); // Botão "Adicionar Cena"

// --- ELEMENTOS DO MODAL ---
const modalContainer = document.getElementById('modal-container');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal-btn');

let acoesDaCenaAtual = [];
let cenaEmEdicaoId = null; // Guarda o ID da cena que está sendo editada

// --- LÓGICA DO MODAL (CRIAR E EDITAR) ---

function abrirModalCena(cenaParaEditar = null) {
    const casaId = getCasaSelecionadaId();
    acoesDaCenaAtual = []; // Reseta as ações

    if (!currentUser || !casaId) {
        alert("Selecione uma casa para gerenciar cenas.");
        return;
    }

    // Apenas popule a lista de ações se estiver editando
    if (cenaParaEditar) {
        acoesDaCenaAtual = [...cenaParaEditar.acoes];
    }

    cenaEmEdicaoId = cenaParaEditar ? cenaParaEditar.cena_id : null;

    apiRequest(`/user/${currentUser.user_id}/house/${casaId}/device`)
        .then(dispositivos => {
            modalBody.innerHTML = ''; 
            
            // A função abaixo agora será responsável por preencher o nome
            renderizarFormularioNoModal(dispositivos, cenaParaEditar);
            
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
    cenaEmEdicaoId = null; // Limpa o ID da edição
}

function renderizarFormularioNoModal(dispositivos, cena) {
    const isEditing = !!cena;

    const deviceOptions = dispositivos.length > 0
        ? dispositivos.map(d => `<option value="${d.dispos_id}">${d.nome}</option>`).join('')
        : '<option value="" disabled>Nenhum dispositivo encontrado</option>';
    
    if (isEditing) {
        acoesDaCenaAtual = cena.acoes || [];
    }

    document.getElementById("modal-title").textContent = isEditing ? 'Editar Cena' : 'Criar Cena';

    modalBody.innerHTML = `
        <form id="form-add-scene-modal">
            <input type="text" id="scene-name-input" placeholder="Nome da cena" required class="form-input" value="${isEditing ? cena.nome : ''}">
            
            <fieldset class="fieldset-actions">
                <legend>Adicionar Ação</legend>
                <div class="action-inputs-container">
                    <select id="device-select" class="form-select" placeholder="Dispositivo">${deviceOptions}</select>
                    <select id="state-select" class="form-select">
                        <option value="true">Ligar</option>
                        <option value="false">Desligar</option>
                    </select>
                    <input type="number" id="delay-input" placeholder="Delay (ms)" value="0" min="0" class="form-input">
                    <button type="button" id="add-action-btn" class="btn-secondary">Adicionar Ação</button>
                </div>
            </fieldset>
            
            <ul id="actions-list"></ul>
            
            <button type="submit" class="btn-primary">${isEditing ? 'Salvar Alterações' : 'Salvar Cena'}</button>
        </form>
    `;

    renderizarListaDeAcoes(); 

    document.getElementById('add-action-btn').addEventListener('click', adicionarAcao);
    document.getElementById('form-add-scene-modal').addEventListener('submit', salvarCena);
}

function adicionarAcao() {
    const deviceelect = document.getElementById('device-select');
    if (!deviceelect.value) {
        alert("Não há dispositivos para adicionar.");
        return;
    }
    const stateSelect = document.getElementById('state-select');
    const delayInput = document.getElementById('delay-input');

    const novaAcao = {
        dispos_id: parseInt(deviceelect.value),
        ligado_desejado: stateSelect.value === 'true',
        delay_ms: parseInt(delayInput.value) || 0, // <<< CORREÇÃO AQUI
    };
    acoesDaCenaAtual.push(novaAcao);
    renderizarListaDeAcoes();
}

function renderizarListaDeAcoes() {
    const actionsList = document.getElementById('actions-list');
    actionsList.innerHTML = '';
    acoesDaCenaAtual.forEach((acao, index) => {
        const deviceName = document.querySelector(`#device-select option[value="${acao.dispos_id}"]`)?.textContent || `Dispositivo ID ${acao.dispos_id}`;
        const actionText = acao.ligado_desejado ? 'Ligar' : 'Desligar';
        const li = document.createElement('li');
        li.className = 'action-item';
        li.innerHTML = `
            <span>${actionText} ${deviceName} (Delay: ${acao.delay_ms}ms)</span> 
            <button type="button" class="btn-delete-action" data-index="${index}">&times;</button>`;
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

    const cenaData = { nome, acoes: acoesDaCenaAtual };
    let request;

    if (cenaEmEdicaoId) {
        // --- EDITANDO UMA CENA ---
        cenaData.ativa = document.querySelector(`.scene-card[data-cena-id="${cenaEmEdicaoId}"] .toggle-switch input`).checked;
        request = apiRequest(`/user/${currentUser.user_id}/house/${casaId}/scene/${cenaEmEdicaoId}`, {
            method: "PUT",
            body: JSON.stringify(cenaData),
        });
    } else {
        // --- CRIANDO UMA NOVA CENA ---
        cenaData.ativa = true; // Cenas novas são ativas por padrão
        request = apiRequest(`/user/${currentUser.user_id}/house/${casaId}/scene`, {
            method: "POST",
            body: JSON.stringify(cenaData),
        });
    }

    request.then(() => {
        fecharModalCena();
        loadCenas(); // Recarrega todas as cenas para mostrar as alterações
    }).catch(err => {
        console.error("Erro ao salvar cena:", err);
        alert("Não foi possível salvar a cena.");
    });
}

// --- LÓGICA PRINCIPAL DA PÁGINA ---

function adicionarCenaNaTela(cena) {
    const card = document.createElement("div");
    card.className = "scene-card";
    card.dataset.cenaId = cena.cena_id;

    const estaAtiva = cena.ativa;

    const acoesHtml = cena.acoes?.length > 0
        ? `<ul class="actions-preview-list">${cena.acoes.map(acao => `<li><span class="action-state" Style="color: ${acao.ligado_desejado ? 'green' : 'red'}">${acao.ligado_desejado ? 'Ligar' : 'Desligar'}</span> <span class="action-device">${acao.dispositivo_nome}</span> <span class="action-room">(${acao.comodo_nome})</span></li>`).join('')}</ul>`
        : '<p class="no-actions">Nenhuma ação definida.</p>';

    card.innerHTML = `
        <div class="scene-card-header">
            <h3>${cena.nome}</h3>
            <div class="status-container">
                <label class="toggle-switch">
                    <input type="checkbox" ${estaAtiva ? 'checked' : ''}>
                    <span class="slider-scene"></span>
                </label>
            </div>
        </div>
        <div class="scene-card-body">
            ${acoesHtml}
        </div>
        <div class="scene-card-footer">
            <button class="btn-execute">Executar</button>
            <button class="btn-edit">Editar</button>
            <button class="btn-delete">Deletar</button>
        </div>
    `;
    
    // --- Event Listeners para os botões do card ---
    const casaId = getCasaSelecionadaId();
    
    // Botão de TOGGLE (Ativar/Desativar)
    card.querySelector('.toggle-switch input').addEventListener('change', (e) => {
        apiRequest(`/user/${currentUser.user_id}/house/${casaId}/scene/${cena.cena_id}/toggle`, { method: "PATCH" })
            .then(cenaAtualizada => {
                const ativa = cenaAtualizada.ativa;
                // Atualiza o texto do status que agora está no card
                const statusSpan = card.querySelector('.status-text');
                statusSpan.textContent = ativa ? 'Ativa' : 'Inativa';
                statusSpan.classList.toggle('status-on', ativa);
                statusSpan.classList.toggle('status-off', !ativa);
            });
    });

    // Botão EXECUTAR
    card.querySelector('.btn-execute').addEventListener('click', () => {
        if (!card.querySelector('.toggle-switch input').checked) {
            alert("A cena está inativa. Ative-a para poder executar.");
            return;
        }
        apiRequest(`/user/${currentUser.user_id}/house/${casaId}/scene/${cena.cena_id}/execute`, { method: "POST" })
            .then(() => alert(`Executando a cena "${cena.nome}"!`))
            .catch(err => alert(`Erro ao executar a cena: ${err.message}`));
    });

    // Botão EDITAR
    card.querySelector('.btn-edit').addEventListener('click', () => {
        apiRequest(`/user/${currentUser.user_id}/house/${casaId}/scene/${cena.cena_id}`)
            .then(cenaCompleta => {
                abrirModalCena(cenaCompleta);
            });
    });

    // Botão DELETAR
    card.querySelector('.btn-delete').addEventListener('click', () => {
        if (confirm(`Tem certeza que deseja deletar a cena "${cena.nome}"?`)) {
            apiRequest(`/user/${currentUser.user_id}/house/${casaId}/scene/${cena.cena_id}`, { method: "DELETE" })
                .then(() => card.remove());
        }
    });


    listaCenas.appendChild(card);
}

export function loadCenas() {
    const casaId = getCasaSelecionadaId();
    if (!currentUser || !casaId) {
        listaCenas.innerHTML = "<p>Selecione uma casa para ver as cenas.</p>";
        return;
    }

    listaCenas.innerHTML = ""; // Limpa a lista antes de carregar

    // 1. Busca a lista SIMPLES de cenas
    apiRequest(`/user/${currentUser.user_id}/house/${casaId}/scene`)
        .then(cenas => {
            if (cenas.length === 0) {
                listaCenas.innerHTML = "<p>Nenhuma cena cadastrada para esta casa.</p>";
                return;
            }

            // 2. Para cada cena, busca seus detalhes completos (com ações)
            cenas.forEach(cenaInfo => {
                apiRequest(`/user/${currentUser.user_id}/house/${casaId}/scene/${cenaInfo.cena_id}`)
                    .then(cenaCompleta => {
                        adicionarCenaNaTela(cenaCompleta); 
                    });
            });
        })
        .catch(err => {
            console.error("Erro ao carregar cenas:", err);
            listaCenas.innerHTML = "<p>Não foi possível carregar as cenas.</p>";
        });
}

export function initCenas() {
    formAddCena.addEventListener("submit", (event) => {
        event.preventDefault();
        abrirModalCena(); // Abre o modal para criar uma nova cena
    });
    closeModalBtn.addEventListener('click', fecharModalCena);
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) fecharModalCena();
    });
}