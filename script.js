import { initUsers, addUserMenu } from './src/components/scripts/user.js';
import { initCasas, getCasaSelecionadaId } from './src/components/scripts/house.js'; 
import { initComodos, buscarComodosDaCasa } from './src/components/scripts/room.js';
import { initCenas, loadCenas } from './src/components/scripts/scene.js';


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

            // Sempre que uma aba for clicada, o conteúdo correspondente será recarregado.
            const casaId = getCasaSelecionadaId();
            if (casaId) {
                if (viewId === 'comodos-dispositivos-view') {
                    // Se a aba de cômodos for clicada, chama a sua função para buscar os cômodos.
                    console.log("Aba de cômodos clicada, atualizando...");
                    buscarComodosDaCasa(casaId);
                } else if (viewId === 'cenas-view') {
                    // Se a aba de cenas for clicada, recarrega a lista de cenas.
                    console.log("Aba de cenas clicada, atualizando...");
                    loadCenas();
                }
            }
        });
    });

    // Garante que a primeira aba seja ativada e seu conteúdo carregado ao iniciar
    if (tabs.length > 0) {
        tabs[0].click();
    }
}

// Ponto de partida da aplicação.
document.addEventListener('DOMContentLoaded', () => {
    // A função initUsers agora é a "porteira". Ela decide o que mostrar.
    initUsers(startApp);
});