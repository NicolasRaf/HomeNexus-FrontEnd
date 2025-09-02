import { getCasaSelecionadaId } from './house.js';
import { buscarDispositivosDoComodo } from './device.js';

const listaComodosContainer = document.getElementById('lista-comodos-container');
const formAddComodo = document.getElementById('form-add-comodo');

// Cria o card de um cômodo e busca seus dispositivos.
function renderizarComodo(comodo) {
    const comodoCard = document.createElement('div');
    comodoCard.className = 'room-card';
    comodoCard.innerHTML = `
        <div class="room-header">
            <h4>${comodo.nome}</h4>
            <button class="btn-delete">Deletar</button>
        </div>
        <ul class="device-list" id="devices-of-room-${comodo.comodo_id}"></ul>
        <form class="add-form-inline add-device-form" data-comodo-id="${comodo.comodo_id}">
             <input type="text" placeholder="Novo dispositivo" required />
             <button type="submit">Adicionar</button>
        </form>
    `;
    listaComodosContainer.appendChild(comodoCard);
    
    comodoCard.querySelector('.btn-delete').addEventListener('click', () => {
        fetch(`http://localhost:3000/api/room/${comodo.comodo_id}`, { method: 'DELETE' })
            .then(res => { if(res.ok) comodoCard.remove(); });
    });

    const formAddDevice = comodoCard.querySelector('.add-device-form');
    formAddDevice.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = formAddDevice.querySelector('input');
        const comodoId = formAddDevice.dataset.comodoId;

        fetch('http://localhost:3000/api/device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: input.value, comodo_id: comodoId })
        })
        .then(res => res.json())
        .then(() => {
            input.value = '';
            buscarDispositivosDoComodo(comodoId); 
        });
    });

    buscarDispositivosDoComodo(comodo.comodo_id);
}

// Busca e renderiza todos os cômodos de uma casa específica.
export function buscarComodosDaCasa(casaId) {
    fetch(`http://localhost:3000/api/room?casa_id=${casaId}`)
        .then(res => res.json())
        .then(comodos => {
            listaComodosContainer.innerHTML = '';
            comodos.forEach(renderizarComodo);
        }).catch(err => {
            listaComodosContainer.innerHTML = '<p>API de cômodos em desenvolvimento.</p>';
        });
}

// Configura o formulário para adicionar um novo cômodo.
export function initComodos() {
    formAddComodo.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = document.getElementById('nome-novo-comodo');
        const casaId = getCasaSelecionadaId();

        fetch('http://localhost:3000/api/room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: input.value, casa_id: casaId })
        })
        .then(response => response.json())
        .then(comodoCriado => {
            renderizarComodo(comodoCriado); 
            input.value = '';
        });
    });
}