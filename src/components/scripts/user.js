const API_BASE_URL = "http://localhost:3000/api";

// A variável do usuário. Será exportada e atualizada.
let currentUser = null;

// --- Funções de API ---

export async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: { "Content-Type": "application/json", ...options.headers },
            ...options,
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorBody.message || `HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        }
        return {};
    } catch (error) {
        console.error("Erro na requisição:", error);
        throw error;
    }
}

async function cadastrarUsuario(userData) {
    return await apiRequest("/user", {
        method: "POST",
        body: JSON.stringify(userData),
    });
}

async function fazerLogin(email, senha, startAppCallback) {
    try {
        const user = await apiRequest("/user/login", {
            method: "POST",
            body: JSON.stringify({ email, senha }),
        });
        if (user && user.user_id) {
            currentUser = user; // Atualiza a variável
            localStorage.setItem("currentUser", JSON.stringify(user));
            showMainApp(startAppCallback);
            return user;
        }
    } catch (error) {
        alert("Erro ao fazer login: Email ou senha incorretos.");
        console.error("Falha no login:", error);
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem("currentUser");
    location.reload();
}

// --- Funções de Controle da UI ---

function showLoginScreen(startAppCallback) {
    document.getElementById('auth-container').classList.remove('hidden');
    document.querySelector('.app-container').classList.add('hidden');
    setupAuthEventListeners(startAppCallback);
}

function showMainApp(startAppCallback) {
    document.getElementById('auth-container').classList.add('hidden');
    document.querySelector('.app-container').classList.remove('hidden');
    startAppCallback();
}

function setupAuthEventListeners(startAppCallback) {
    const tabs = document.querySelectorAll(".auth-tab");
    const forms = document.querySelectorAll(".auth-form");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => t.classList.remove("active"));
            forms.forEach((f) => f.classList.remove("active"));
            tab.classList.add("active");
            document.getElementById(`${tab.dataset.tab}-form`).classList.add("active");
        });
    });

    document.getElementById("form-login").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const senha = document.getElementById("login-senha").value;
        await fazerLogin(email, senha, startAppCallback);
    });

    document.getElementById("form-cadastro").addEventListener("submit", async (e) => {
        e.preventDefault();
        const userData = {
            nome: document.getElementById("cadastro-nome").value,
            email: document.getElementById("cadastro-email").value,
            senha: document.getElementById("cadastro-senha").value,
        };
        try {
            await cadastrarUsuario(userData);
            alert("Cadastro realizado com sucesso! Fazendo login...");
            await fazerLogin(userData.email, userData.senha, startAppCallback);
        } catch (error) {
            alert("Erro ao cadastrar: " + error.message);
        }
    });
}

function addUserMenu() {
    if (!currentUser) return;
    const header = document.querySelector(".main-header-content");
    
    if (header.querySelector('.user-menu')) return;

    const userMenu = document.createElement("div");
    userMenu.className = "user-menu";
    userMenu.innerHTML = `
        <div class="user-info">
            <span>Olá, ${currentUser.nome}</span>
            <div class="user-dropdown">
                <button id="btn-logout">Sair</button>
            </div>
        </div>
    `;
    header.appendChild(userMenu);
    document.getElementById("btn-logout").addEventListener("click", logout);
}

// --- Função Principal de Inicialização ---

function initUsers(startAppCallback) {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp(startAppCallback);
    } else {
        showLoginScreen(startAppCallback);
    }
}

export { initUsers, currentUser, addUserMenu };