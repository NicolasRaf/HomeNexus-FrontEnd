// API base URL - ajuste conforme necessário
const API_BASE_URL = "http://localhost:3000/api"

// Estado global do usuário atual
let currentUser = null

// Função para fazer requisições à API
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erro na requisição:", error)
    throw error
  }
}

// Função para cadastrar usuário
async function cadastrarUsuario(userData) {
  try {
    const response = await apiRequest("/user", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    alert("Usuário cadastrado com sucesso!")
    return response
  } catch (error) {
    alert("Erro ao cadastrar usuário: " + error.message)
    throw error
  }
}

// Função para fazer login (buscar usuário por email)
async function fazerLogin(email, senha) {
    try {
        // Chama o endpoint de login, enviando os dados
        const user = await apiRequest("/user/login", { 
            method: "POST",
            body: JSON.stringify({ email, senha }), 
        });
        if (user) {
            currentUser = user;
            localStorage.setItem("currentUser", JSON.stringify(user));
            showMainApp();
            alert(`Bem-vindo, ${user.nome}!`);
            return user;
        }
    } catch (error) {
        alert("Erro ao fazer login: Email ou senha incorretos.");
        console.error("Falha no login:", error);
    }
}

// Função para atualizar usuário
async function atualizarUsuario(userId, userData) {
  try {
    const response = await apiRequest(`/user/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })

    currentUser = response
    localStorage.setItem("currentUser", JSON.stringify(response))
    alert("Dados atualizados com sucesso!")
    return response
  } catch (error) {
    alert("Erro ao atualizar usuário: " + error.message)
    throw error
  }
}

// Função para deletar usuário
async function deletarUsuario(userId) {
  if (!confirm("Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.")) {
    return
  }

  try {
    await apiRequest(`/user/${userId}`, {
      method: "DELETE",
    })

    logout()
    alert("Conta deletada com sucesso!")
  } catch (error) {
    alert("Erro ao deletar conta: " + error.message)
    throw error
  }
}

// Função para fazer logout
function logout() {
  currentUser = null
  localStorage.removeItem("currentUser")
  showLoginScreen()
}

// Função para mostrar tela de login
function showLoginScreen() {
    document.body.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <h1>Home Nexus</h1>
                <p>Sistema de Automação Residencial</p>
                
                <div class="auth-tabs">
                    <button class="auth-tab active" data-tab="login">Login</button>
                    <button class="auth-tab" data-tab="cadastro">Cadastro</button>
                </div>
                
                <div id="login-form" class="auth-form active">
                    <h2>Fazer Login</h2>
                    <form id="form-login">
                        <input type="email" id="login-email" placeholder="Email" required>
                        <input type="password" id="login-senha" placeholder="Senha" required>  <button type="submit">Entrar</button>
                    </form>
                </div>
                
                <div id="cadastro-form" class="auth-form">
                    <h2>Criar Conta</h2>
                    <form id="form-cadastro">
                        <input type="text" id="cadastro-name" placeholder="Nome completo" required>
                        <input type="email" id="cadastro-email" placeholder="Email" required>
                        <input type="password" id="cadastro-senha" placeholder="Senha" required>
                        <button type="submit">Cadastrar</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    addAuthStyles();
    setupAuthEventListeners();
}

// Função para mostrar aplicação principal
function showMainApp() {
  // Recarregar a página principal
  location.reload()
}

// Função para adicionar estilos da tela de autenticação
function addAuthStyles() {
  const style = document.createElement("style")
  style.textContent = `
        .auth-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            padding: 20px;
        }
        
        .auth-card {
            background: #fff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        
        .auth-card h1 {
            color: #1f2937;
            margin-bottom: 8px;
            font-size: 2rem;
            font-weight: 700;
        }
        
        .auth-card p {
            color: #6b7280;
            margin-bottom: 32px;
        }
        
        .auth-tabs {
            display: flex;
            margin-bottom: 24px;
            border-radius: 8px;
            background: #f3f4f6;
            padding: 4px;
        }
        
        .auth-tab {
            flex: 1;
            padding: 12px;
            border: none;
            background: transparent;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .auth-tab.active {
            background: #fff;
            color: #8b5cf6;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .auth-form {
            display: none;
        }
        
        .auth-form.active {
            display: block;
        }
        
        .auth-form h2 {
            margin-bottom: 24px;
            color: #1f2937;
        }
        
        .auth-form input {
            width: 100%;
            padding: 12px 16px;
            margin-bottom: 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.2s;
            box-sizing: border-box;
        }
        
        .auth-form input:focus {
            outline: none;
            border-color: #8b5cf6;
        }
        
        .auth-form button {
            width: 100%;
            padding: 12px;
            background: #8b5cf6;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .auth-form button:hover {
            background: #7c3aed;
        }
        
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .modal-content {
            background: white;
            border-radius: 12px;
            padding: 32px;
            width: 90%;
            max-width: 400px;
        }
        
        .modal-buttons {
            display: flex;
            gap: 12px;
            margin-top: 16px;
        }
        
        .modal-buttons button {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }
        
        .modal-buttons button[type="button"] {
            background: #e5e7eb;
            color: #374151;
        }
        
        .modal-buttons button[type="submit"] {
            background: #8b5cf6;
            color: white;
        }
        
        .user-menu {
            position: relative;
            margin-left: auto;
        }
        
        .user-info {
            cursor: pointer;
            padding: 8px 16px;
            background: #374151;
            color: white;
            border-radius: 8px;
            position: relative;
        }
        
        .user-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            min-width: 150px;
            display: none;
            z-index: 100;
        }
        
        .user-info:hover .user-dropdown {
            display: block;
        }
        
        .user-dropdown button {
            width: 100%;
            padding: 12px 16px;
            border: none;
            background: none;
            text-align: left;
            cursor: pointer;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .user-dropdown button:hover {
            background: #f3f4f6;
        }
        
        .user-dropdown button:last-child {
            border-bottom: none;
        }
    `
  document.head.appendChild(style)
}

// Função para configurar event listeners da autenticação
function setupAuthEventListeners() {
    // ... (código das abas continua o mesmo) ...
    const tabs = document.querySelectorAll(".auth-tab");
    const forms = document.querySelectorAll(".auth-form");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => t.classList.remove("active"));
            forms.forEach((f) => f.classList.remove("active"));
            tab.classList.add("active");
            const tabName = tab.dataset.tab;
            document.getElementById(`${tabName}-form`).classList.add("active");
        });
    });


    // Evento do Formulário de Login ATUALIZADO
    document.getElementById("form-login").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const senha = document.getElementById("login-senha").value; // Captura a senha aqui
        await fazerLogin(email, senha); // Envia para a função de login
    });

    // Evento do Formulário de Cadastro ATUALIZADO
    document.getElementById("form-cadastro").addEventListener("submit", async (e) => {
        e.preventDefault();
        const userData = {
            // O backend espera 'nome', 'email', 'senha'
            nome: document.getElementById("cadastro-name").value, 
            email: document.getElementById("cadastro-email").value,
            senha: document.getElementById("cadastro-senha").value, 
        };

        try {
            await cadastrarUsuario(userData);
            // Após cadastrar, faz o login automaticamente
            await fazerLogin(userData.email, userData.senha);
        } catch (error) {
            console.error("Erro no fluxo de cadastro:", error);
        }
    });
}

// Função para adicionar menu de usuário na aplicação principal
function addUserMenu() {
  if (!currentUser) return

  const header = document.querySelector(".main-header")
  if (header) {
    const userMenu = document.createElement("div")
    userMenu.className = "user-menu"
    userMenu.innerHTML = `
            <div class="user-info">
                <span>Olá, ${currentUser.name}</span>
                <div class="user-dropdown">
                    <button id="btn-edit-profile">Editar Perfil</button>
                    <button id="btn-delete-account">Deletar Conta</button>
                    <button id="btn-logout">Sair</button>
                </div>
            </div>
        `

    header.appendChild(userMenu)

    // Event listeners do menu
    document.getElementById("btn-edit-profile").addEventListener("click", showEditProfile)
    document.getElementById("btn-delete-account").addEventListener("click", () => deletarUsuario(currentUser.id))
    document.getElementById("btn-logout").addEventListener("click", logout)
  }
}

// Função para mostrar formulário de edição de perfil
function showEditProfile() {
  const modal = document.createElement("div")
  modal.className = "modal-overlay"
  modal.innerHTML = `
        <div class="modal-content">
            <h2>Editar Perfil</h2>
            <form id="form-edit-profile">
                <input type="text" id="edit-name" value="${currentUser.name}" placeholder="Nome completo" required>
                <input type="email" id="edit-email" value="${currentUser.email}" placeholder="Email" required>
                <input type="password" id="edit-senha" placeholder="Nova senha (deixe em branco para manter)">
                <div class="modal-buttons">
                    <button type="button" id="btn-cancel">Cancelar</button>
                    <button type="submit">Salvar</button>
                </div>
            </form>
        </div>
    `

  document.body.appendChild(modal)

  // Event listeners do modal
  document.getElementById("btn-cancel").addEventListener("click", () => modal.remove())
  document.getElementById("form-edit-profile").addEventListener("submit", async (e) => {
    e.preventDefault()
    const userData = {
        name: document.getElementById("edit-name").value,
        email: document.getElementById("edit-email").value,
        senha: document.getElementById("edit-senha").value
    }

    try {
      await atualizarUsuario(currentUser.id, userData)
      modal.remove()
      location.reload() // Recarregar para atualizar o nome no menu
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
    }
  })
}

// Função para verificar se há usuário logado
function checkAuthStatus() {
  const savedUser = localStorage.getItem("currentUser")
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    addUserMenu()
    return true
  }
  return false
}

// Inicializar sistema de usuários
function initUsers() {
  if (!checkAuthStatus()) {
    showLoginScreen()
  }
}

// Exportar funções para uso em outros módulos
export { initUsers, currentUser, cadastrarUsuario, fazerLogin, atualizarUsuario, deletarUsuario, logout, addUserMenu }
