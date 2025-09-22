document.addEventListener('DOMContentLoaded', function () {
  const loginModal = document.getElementById('loginModal');
  const openLoginModal = document.getElementById('openLoginModal');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');

  // Configuração da API base URL
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://lodsworks.com.br';

  // Mostrar modal
  openLoginModal.addEventListener('click', function (e) {
    e.preventDefault();
    loginModal.style.display = 'flex';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  });

  // Fechar modal
  closeLoginModal.addEventListener('click', function () {
    loginModal.style.display = 'none';
  });

  // Fechar clicando fora do conteúdo
  window.addEventListener('click', function (e) {
    if (e.target === loginModal) {
      loginModal.style.display = 'none';
    }
  });

  // Alternar login/registro
  showRegister.addEventListener('click', function (e) {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  });

  showLogin.addEventListener('click', function (e) {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
  });

  // Login
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      // Verificar se a resposta é JSON válido
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Resposta não é JSON:', text);
        showMessage('Erro inesperado do servidor.', 'error');
        return;
      }

      if (!res.ok) {
        showMessage(data.message || 'Erro no login', 'error');
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(data.user));
      showMessage(data.message, 'success');
      setTimeout(() => window.location.href = 'profile.html', 1000);

    } catch (err) {
      console.error('Erro de conexão:', err);
      showMessage('Erro ao conectar com o servidor. Verifique sua conexão.', 'error');
    }
  });

  // Registro
  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (password !== confirmPassword) {
      showMessage('As senhas não coincidem.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      // Verificar se a resposta é JSON válido
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Resposta não é JSON:', text);
        showMessage('Erro inesperado do servidor.', 'error');
        return;
      }

      if (!res.ok) {
        showMessage(data.message || 'Erro no registro', 'error');
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(data.user));
      showMessage(data.message, 'success');
      setTimeout(() => window.location.href = 'profile.html', 1000);

    } catch (err) {
      console.error('Erro de conexão:', err);
      showMessage('Erro ao conectar com o servidor. Verifique sua conexão.', 'error');
    }
  });
});

// Mostrar mensagens
function showMessage(message, type) {
  const existingMessages = document.querySelectorAll('.auth-message');
  existingMessages.forEach(msg => msg.remove());

  const messageDiv = document.createElement('div');
  messageDiv.className = `auth-message ${type}-message`;
  messageDiv.textContent = message;

  const activeForm = document.querySelector('#loginForm').style.display === 'block'
    ? document.querySelector('#loginForm')
    : document.querySelector('#registerForm');

  activeForm.insertBefore(messageDiv, activeForm.firstChild);
  messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}