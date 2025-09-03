import { initUsers, addUserMenu } from './src/components/scripts/user.js';
import { initCasas } from './src/components/scripts/house.js';
import { initComodos } from './src/components/scripts/room.js';
import { initCenas } from './src/components/scripts/scene.js';

// Esta função só será chamada DEPOIS que o login for bem-sucedido.
function startApp() {
    initCasas();
    initComodos();
    initCenas();
    initTabs();
    addUserMenu();
}

// Lógica de navegação por abas
function initTabs() {
    const tabs = document.querySelectorAll('.tab-button');
    const views = document.querySelectorAll('.tab-view');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));
            tab.classList.add('active');
            const viewId = tab.dataset.view;
            document.getElementById(viewId).classList.add('active');
        });
    });
}

// Ponto de partida da aplicação.
document.addEventListener('DOMContentLoaded', () => {
    // A função initUsers agora é a "porteira". Ela decide o que mostrar.
    initUsers(startApp);
});