import { initCasas } from './src/components/scripts/house.js';
import { initComodos } from './src/components/scripts/room.js';
import { initCenas } from './src/components/scripts/scene.js';

// Adiciona os eventos de clique para alternar entre as abas.
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

// Garante que o DOM está carregado antes de executar os scripts.
document.addEventListener('DOMContentLoaded', () => {
    initCasas();
    initComodos();
    initCenas();
    initTabs();
});