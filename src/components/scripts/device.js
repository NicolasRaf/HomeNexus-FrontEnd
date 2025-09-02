// Renderiza um dispositivo na sua respectiva lista.
function adicionarDispositivoNaTela(dispositivo, deviceListElement) {
    const itemLista = document.createElement('li');
    itemLista.className = 'device-list-item';
    
    const estaLigado = dispositivo.ligado;
    itemLista.innerHTML = `
        <span>${dispositivo.nome}</span>
        <div class="device-status">
            <span class="status-indicator ${estaLigado ? 'on' : 'off'}"></span>
            <span>${estaLigado ? 'Ligado' : 'Desligado'}</span>
            <button class="btn-toggle">Alterar</button>
        </div>
    `;

    const btnToggle = itemLista.querySelector('.btn-toggle');
    btnToggle.addEventListener('click', () => {
        const novoEstado = !dispositivo.ligado;
        fetch(`http://localhost:3000/api/device/${dispositivo.dispos_id}/estado`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ligado: novoEstado })
        })
        .then(() => buscarDispositivosDoComodo(dispositivo.comodo_id));
    });

    deviceListElement.appendChild(itemLista);
}

// Busca os dispositivos de um cômodo e os renderiza na tela.
export function buscarDispositivosDoComodo(comodoId) {
    const deviceListElement = document.getElementById(`devices-of-room-${comodoId}`);
    if (!deviceListElement) return;

    fetch(`http://localhost:3000/api/device?comodo_id=${comodoId}`)
        .then(res => res.json())
        .then(dispositivos => {
            deviceListElement.innerHTML = '';
            dispositivos.forEach(dispositivo => {
                adicionarDispositivoNaTela(dispositivo, deviceListElement);
            });
        }).catch(err => {
            deviceListElement.innerHTML = '<li>API de dispositivos indisponível.</li>';
        });
}