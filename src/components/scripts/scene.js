const listaCenas = document.getElementById('lista-cenas');
const formAddCena = document.getElementById('form-add-cena');

// Renderiza uma cena na sua respectiva lista.
function adicionarCenaNaTela(cena) {
    const itemLista = document.createElement('li');
    itemLista.className = 'list-item';
    itemLista.innerHTML = `
        <span>${cena.nome}</span>
        <button class="btn-delete">Deletar</button>
    `;
    
    itemLista.querySelector('.btn-delete').addEventListener('click', () => {
        fetch(`http://localhost:3000/api/scene/${cena.cena_id}`, { method: 'DELETE' })
            .then(res => { if(res.ok) itemLista.remove() });
    });

    listaCenas.appendChild(itemLista);
}

// Carrega as cenas na aba "Cenas".
export function loadCenas() {
    fetch('http://localhost:3000/api/scene')
        .then(res => res.json())
        .then(cenas => {
            listaCenas.innerHTML = '';
            cenas.forEach(adicionarCenaNaTela);
        }).catch(err => {
            listaCenas.innerHTML = '<li>API de cenas indisponível.</li>';
        });
}

// Inicializa o formulário de adicionar cena.
export function initCenas() {
    formAddCena.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = document.getElementById('nome-nova-cena');

        fetch('http://localhost:3000/api/scene', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: input.value, ativa: true, acoes: [] })
        })
        .then(response => response.json())
        .then(cenaCriada => {
            adicionarCenaNaTela(cenaCriada);
            input.value = '';
        });
    });
}