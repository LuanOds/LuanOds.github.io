// Variáveis globais
let currentUser = null;
let isAdmin = false;

// Carregar dados quando a página for carregada
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado
    const loggedUser = localStorage.getItem('usuarioLogado');
    if (!loggedUser) {
        window.location.href = '/';
        return;
    }
    
    currentUser = JSON.parse(loggedUser);
    loadUserData();
    checkAdminStatus();
    updateActivityTimes();
});

// Carregar dados do usuário
function loadUserData() {
    document.getElementById('userName').textContent = currentUser.usuario;
    document.getElementById('welcomeTitle').textContent = `Bem-vindo, ${currentUser.usuario}!`;
}

// Verificar se o usuário é administrador
async function checkAdminStatus() {
    try {
        const adminButton = document.getElementById('adminButton');
        console.log('Verificando status de admin para:', currentUser.usuario);
        
        const response = await fetch('/api/check-admin', {
            headers: {
                'Authorization': currentUser.usuario
            }
        });
        
        console.log('Resposta da API:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Dados recebidos:', data);
            
            isAdmin = data.isAdmin;
            console.log('É admin?', isAdmin);
            
            // Controle preciso da visibilidade do botão
            if (isAdmin) {
                adminButton.style.display = 'flex';
                adminButton.classList.remove('hidden');
                console.log('Botão de admin mostrado');
            } else {
                adminButton.style.display = 'none';
                adminButton.classList.add('hidden');
                console.log('Botão de admin ocultado');
            }
        } else {
            console.log('Resposta não OK, ocultando botão');
            adminButton.style.display = 'none';
            adminButton.classList.add('hidden');
        }
    } catch (error) {
        console.error('Erro ao verificar status de admin:', error);
        const adminButton = document.getElementById('adminButton');
        adminButton.style.display = 'none';
        adminButton.classList.add('hidden');
    }
    
    // Carregar estatísticas
    loadStats();
}

// Carregar estatísticas do sistema
async function loadStats() {
    try {
        const response = await fetch('/api/usuarios');
        if (response.ok) {
            const users = await response.json();
            document.getElementById('totalUsers').textContent = users.length;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Atualizar tempos de atividade
function updateActivityTimes() {
    const now = new Date();
    
    // Atualizar a cada minuto
    setInterval(() => {
        // Atualizar hora da sessão se necessário
    }, 60000);
}

// Formatar data e hora
function formatDateTime(date) {
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Logout
function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = '/';
}

// Mostrar mensagem
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}