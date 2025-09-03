import { currentUser, apiRequest } from './user.js';

// Renderiza um dispositivo na sua respectiva lista.
function adicionarDispositivoNaTela(dispositivo, houseId, deviceListElement, roomId) {
    const itemLista = document.createElement('li');
    itemLista.className = 'device-list-item';
    itemLista.dataset.disposId = dispositivo.dispos_id;

    const estaLigado = dispositivo.ligado;

    // 1. O HTML foi MUDADO aqui para usar o slider
    itemLista.innerHTML = `
        <span class="device-name">${dispositivo.nome}</span>
        <div class="device-actions">
            <label class="switch">
                <input type="checkbox" class="toggle-switch" ${estaLigado ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
            <button class="btn-edit-device">Editar</button>
            <button class="btn-delete-device">X</button>
        </div>
    `;

    // 2. A LÓGICA foi MUDADA para o slider
    const toggleSwitch = itemLista.querySelector('.toggle-switch');
    toggleSwitch.addEventListener('change', () => {
        const novoEstado = toggleSwitch.checked;

        fetch(`http://localhost:3000/api/user/${currentUser.user_id}/house/${houseId}/room/${roomId}/device/${dispositivo.dispos_id}/state`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ligado: novoEstado })
        })
        .then(res => res.json())
        .then(dispositivoAtualizado => {
            dispositivo.ligado = dispositivoAtualizado.ligado;
        })
        .catch(err => {
            toggleSwitch.checked = !novoEstado; // Desfaz a ação visual em caso de erro
            console.error("Erro ao alterar estado do dispositivo:", err);
        });
    });

    // --- LÓGICA DE DELEÇÃO E EDIÇÃO (continua a mesma) ---
    itemLista.querySelector('.btn-delete-device').addEventListener('click', () => {
        fetch(`http://localhost:3000/api/user/${currentUser.user_id}/house/${houseId}/room/${roomId}/device/${dispositivo.dispos_id}`, {
            method: 'DELETE'
        }).then(res => { if(res.ok) itemLista.remove(); });
    });
    
    const btnEditDevice = itemLista.querySelector('.btn-edit-device');
    btnEditDevice.addEventListener('click', () => {
        const deviceNameSpan = itemLista.querySelector('.device-name');
        const isEditing = btnEditDevice.textContent === 'Salvar';

        if (isEditing) {
            const novoNome = itemLista.querySelector('.edit-input-device').value;
            fetch(`http://localhost:3000/api/user/${currentUser.user_id}/house/${houseId}/room/${roomId}/device/${dispositivo.dispos_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: novoNome })
            })
            .then(res => res.json())
            .then((dispositivoAtualizado) => {
                deviceNameSpan.textContent = dispositivoAtualizado.nome;
                btnEditDevice.textContent = 'Editar';
            });
        } else {
            const currentName = deviceNameSpan.textContent;
            deviceNameSpan.innerHTML = `<input type="text" class="edit-input-device" value="${currentName}" />`;
            btnEditDevice.textContent = 'Salvar';
        }
    });

    deviceListElement.appendChild(itemLista);
}

// Busca os dispositivos de um cômodo e os renderiza na tela.
export function buscarDispositivosDoComodo(houseId, roomId) {
    const deviceListElement = document.getElementById(`devices-of-room-${roomId}`);
    if (!deviceListElement || !currentUser) return;

    // Rota aninhada para buscar os dispositivos de um cômodo
    fetch(`http://localhost:3000/api/user/${currentUser.user_id}/house/${houseId}/room/${roomId}/device`)
        .then(res => res.json())
        .then(dispositivos => {
            deviceListElement.innerHTML = '';
            dispositivos.forEach(dispositivo => {
                // Passa o houseId para a função de renderização
                adicionarDispositivoNaTela(dispositivo, houseId, deviceListElement, roomId);
            });
        }).catch(err => {
            console.error("Erro ao buscar dispositivos:", err);
            deviceListElement.innerHTML = '<li>Não foi possível carregar os dispositivos.</li>';
        });
}