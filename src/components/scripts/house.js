import { buscarComodosDaCasa } from './room.js';
import { loadCenas } from './scene.js';

const listaCasasSidebar = document.getElementById('lista-casas-sidebar');
const formAddCasa = document.getElementById('form-add-casa');
const headerTitulo = document.getElementById('header-titulo');
const headerSubtitulo = document.getElementById('header-subtitulo');
const contentArea = document.getElementById('content-area');

let casaSelecionadaId = null;

// Exporta o ID da casa atualmente selecionada.
export const getCasaSelecionadaId = () => casaSelecionadaId;

// Atualiza a UI e carrega os dados da casa selecionada.
function selecionarCasa(casa, itemLista) {
    casaSelecionadaId = casa.casa_id;

    headerTitulo.textContent = casa.nome;
    headerSubtitulo.textContent = "";
    contentArea.classList.remove('hidden');

    document.querySelectorAll('.house-list-item').forEach(item => item.classList.remove('active'));
    itemLista.classList.add('active');
    
    buscarComodosDaCasa(casa.casa_id);
    loadCenas();
}

// Cria e adiciona o HTML de uma casa na sidebar.
function adicionarCasaNaSidebar(casa) {
    const itemLista = document.createElement('li');
    itemLista.className = 'house-list-item';
    itemLista.innerHTML = `
        <span>${casa.nome}</span>
        <button class="btn-delete">X</button>
    `;
    
    itemLista.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            selecionarCasa(casa, itemLista);
        }
    });

    itemLista.querySelector('.btn-delete').addEventListener('click', () => {
        fetch(`http://localhost:3000/api/house/${casa.casa_id}`, { method: 'DELETE' })
            .then(res => { if(res.ok) itemLista.remove() });
    });

    listaCasasSidebar.appendChild(itemLista);
}

// Busca as casas iniciais e configura o formulário de adição.
export function initCasas() {
    fetch('http://localhost:3000/api/house')
        .then(res => res.json())
        .then(casas => {
            listaCasasSidebar.innerHTML = '';
            casas.forEach(adicionarCasaNaSidebar);
        }).catch(err => console.error("Falha ao buscar casas:", err));

    formAddCasa.addEventListener('submit', (event) => {
        event.preventDefault();
        const nome = document.getElementById('nome-nova-casa').value;
        const endereco = document.getElementById('endereco-nova-casa').value;
        const user_id = 1; // Assumindo um usuário fixo

        fetch('http://localhost:3000/api/house', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, endereco, user_id })
        })
        .then(res => res.json())
        .then(novaCasa => {
            adicionarCasaNaSidebar(novaCasa);
            formAddCasa.reset();
        });
    });
}