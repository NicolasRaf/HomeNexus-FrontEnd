import { currentUser } from './user.js';
import { getCasaSelecionadaId } from './house.js';
import { buscarDispositivosDoComodo } from './device.js';

const listaComodosContainer = document.getElementById('lista-comodos-container');
const formAddComodo = document.getElementById('form-add-comodo');

// Cria o card de um cômodo e busca seus dispositivos.
function renderizarComodo(comodo) {
    const comodoCard = document.createElement('div');
    comodoCard.className = 'room-card';
    // Corrigi um pequeno erro de sintaxe no seu <ul>
    comodoCard.innerHTML = `
        <div class="room-header">
            <h4 data-comodo-id="${comodo.comodo_id}">${comodo.nome}</h4>
            <div class="room-actions">
                <button class="btn-edit" data-comodo-id="${comodo.comodo_id}">Editar</button>
                <button class="btn-delete">Deletar</button>
            </div>
        </div> 
        <ul class="device-list" id="devices-of-room-${comodo.comodo_id}"></ul>

        <form class="add-form-inline add-device-form" data-comodo-id="${comodo.comodo_id}">
             <input type="text" placeholder="Novo dispositivo" required />
             <button type="submit">Adicionar</button>
        </form>
    `;
    listaComodosContainer.appendChild(comodoCard);
    
    const casaId = getCasaSelecionadaId();

    // --- LÓGICA DE DELEÇÃO (sem alterações) ---
    comodoCard.querySelector('.btn-delete').addEventListener('click', () => {
        fetch(`http://localhost:3000/api/user/${currentUser.user_id}/house/${casaId}/room/${comodo.comodo_id}`, { method: 'DELETE' })
            .then(res => { if(res.ok) comodoCard.remove(); });
    });

    // --- NOVA LÓGICA DE EDIÇÃO ---
    const btnEdit = comodoCard.querySelector('.btn-edit');
    btnEdit.addEventListener('click', () => {
        const roomHeader = comodoCard.querySelector('.room-header h4');
        const isEditing = btnEdit.textContent === 'Salvar';

        if (isEditing) {
            // --- MODO DE SALVAR ---
            const novoNome = comodoCard.querySelector('.edit-input').value;
            fetch(`http://localhost:3000/api/user/${currentUser.user_id}/house/${casaId}/room/${comodo.comodo_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: novoNome })
            })
            .then(res => res.json())
            .then(comodoAtualizado => {
                // Volta para o modo de visualização
                roomHeader.textContent = comodoAtualizado.nome;
                btnEdit.textContent = 'Editar';
            });

        } else {
            // --- MODO DE EDIÇÃO ---
            const currentName = roomHeader.textContent;
            // Substitui o <h4> por um <input>
            roomHeader.innerHTML = `<input type="text" class="edit-input" value="${currentName}" />`;
            btnEdit.textContent = 'Salvar';
        }
    });

    // --- LÓGICA DE ADICIONAR DISPOSITIVO (sem alterações) ---
    const formAddDevice = comodoCard.querySelector('.add-device-form');
    formAddDevice.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = formAddDevice.querySelector('input');
        const comodoId = formAddDevice.dataset.comodoId;

        fetch(`http://localhost:3000/api/user/${currentUser.user_id}/house/${casaId}/room/${comodoId}/device`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: input.value })
        })
        .then(res => res.json())
        .then(() => {
            input.value = '';
            buscarDispositivosDoComodo(casaId, comodoId); 
        });
    });

    buscarDispositivosDoComodo(casaId, comodo.comodo_id);
}

// Busca e renderiza todos os cômodos de uma casa específica.
export function buscarComodosDaCasa(houseId) {
    if (!currentUser) return; // Garante que há um usuário logado

    // Rota aninhada para buscar os cômodos da casa de um usuário
    fetch(`http://localhost:3000/api/user/${currentUser.user_id}/house/${houseId}/room`)
        .then(res => res.json())
        .then(comodos => {
            listaComodosContainer.innerHTML = '';
            comodos.forEach(renderizarComodo);
        }).catch(err => {
            console.error("Erro ao buscar cômodos:", err);
            listaComodosContainer.innerHTML = '<p>Não foi possível carregar os cômodos.</p>';
        });
}

// Configura o formulário para adicionar um novo cômodo.
export function initComodos() {
    formAddComodo.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = document.getElementById('nome-novo-comodo');
        const casaId = getCasaSelecionadaId();
        
        if (!currentUser || !casaId) {
            alert("Selecione uma casa primeiro.");
            return;
        }

        // Rota aninhada para criar um novo cômodo
        fetch(`http://localhost:3000/api/user/${currentUser.user_id}/house/${casaId}/room`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: input.value })
        })
        .then(response => response.json())
        .then(comodoCriado => {
            renderizarComodo(comodoCriado); 
            input.value = '';
        });
    });
}