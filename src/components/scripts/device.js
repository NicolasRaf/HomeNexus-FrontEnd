import { currentUser } from './user.js';

// Renderiza um dispositivo na sua respectiva lista.
function adicionarDispositivoNaTela(dispositivo, houseId, deviceListElement) {
    const itemLista = document.createElement('li');
    itemLista.className = 'device-list-item';
    
    const estaLigado = dispositivo.ligado;
    itemLista.innerHTML = `
        <span>${dispositivo.nome}</span>
        <div class="device-status">
            <span class="on-off-style ${estaLigado ? 'status-on' : 'status-off'}">${estaLigado ? 'Ligado' : 'Desligado'}</span>
            <button class="btn-toggle">Alterar</button>
        </div>
    `;

    const btnToggle = itemLista.querySelector('.btn-toggle');
    btnToggle.addEventListener('click', () => {
        const novoEstado = !dispositivo.ligado;
        // Rota aninhada para alterar o estado do dispositivo
        fetch(`http://localhost:3000/api/user/${currentUser.user_id}/house/${houseId}/room/${dispositivo.comodo_id}/device/${dispositivo.dispos_id}/state`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ligado: novoEstado })
        })
        .then(res => {
            if(res.ok) {
                 // Recarrega os dispositivos para refletir a mudança
                buscarDispositivosDoComodo(houseId, dispositivo.comodo_id);
            }
        });
    });

    deviceListElement.appendChild(itemLista);
}

// Busca os dispositivos de um cômodo e os renderiza na tela.
export function buscarDispositivosDoComodo(houseId, comodoId) {
    const deviceListElement = document.getElementById(`devices-of-room-${comodoId}`);
    if (!deviceListElement || !currentUser) return;

    // Rota aninhada para buscar os dispositivos de um cômodo
    fetch(`http://localhost:3000/api/user/${currentUser.user_id}/house/${houseId}/room/${comodoId}/device`)
        .then(res => res.json())
        .then(dispositivos => {
            deviceListElement.innerHTML = '';
            dispositivos.forEach(dispositivo => {
                // Passa o houseId para a função de renderização
                adicionarDispositivoNaTela(dispositivo, houseId, deviceListElement);
            });
        }).catch(err => {
            console.error("Erro ao buscar dispositivos:", err);
            deviceListElement.innerHTML = '<li>Não foi possível carregar os dispositivos.</li>';
        });
}