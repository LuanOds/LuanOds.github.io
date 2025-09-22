        document.addEventListener('DOMContentLoaded', function() {
            // Load users from the server
            loadUsers();
            
            // Toggle password visibility
            const togglePassword = document.getElementById('togglePassword');
            const senhaInput = document.getElementById('senha');
            
            togglePassword.addEventListener('click', function() {
                const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
                senhaInput.setAttribute('type', type);

                const icon = this.querySelector('i');
                if (type === 'text') {
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });

            // Check for saved credentials
            const usuarioSalvo = localStorage.getItem('usuarioLembrado');
            const senhaSalva = localStorage.getItem('senhaLembrada');

            if (usuarioSalvo) {
                document.getElementById('usuario').value = usuarioSalvo;
                document.getElementById('remember').checked = true;
            }

            if (senhaSalva) {
                document.getElementById('senha').value = senhaSalva;
                document.getElementById('remember').checked = true;
            }

            // Form submission
            document.getElementById('loginForm').addEventListener('submit', function(e) {
                e.preventDefault();
                login();
            });

            // Enter key to submit
            document.getElementById('senha').addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    login();
                }
            });
        });

        // Load users from the server
        async function loadUsers() {
            try {
                const response = await fetch('/api/users');
                const users = await response.json();
                
                const usersContainer = document.getElementById('usersContainer');
                usersContainer.innerHTML = '';
                
                users.forEach(user => {
                    const userElement = document.createElement('div');
                    userElement.className = 'user-item';
                    userElement.innerHTML = `
                        <div>
                            <span class="user-status ${user.ativo ? 'status-active' : 'status-inactive'}"></span>
                            ${user.usuario}
                        </div>
                        <div>${user.ativo ? 'Ativo' : 'Inativo'}</div>
                    `;
                    usersContainer.appendChild(userElement);
                });
            } catch (error) {
                console.error('Erro ao carregar usuários:', error);
            }
        }

        // Login function
        async function login() {
            const usuarioDigitado = document.getElementById('usuario').value;
            const usuario = usuarioDigitado.toUpperCase();
            const senha = document.getElementById('senha').value;
            const message = document.getElementById('message');
            const remember = document.getElementById('remember').checked;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ usuario, senha })
                });

                const data = await response.json();

                if (data.success) {
                    message.style.display = 'block';
                    message.className = 'message success';
                    message.textContent = '✅ Login bem-sucedido! Redirecionando...';

                    // Save user data
                    localStorage.setItem('usuarioLogado', JSON.stringify(data.user));

                    // Save credentials if remember me is checked
                    if (remember) {
                        localStorage.setItem('usuarioLembrado', usuarioDigitado);
                        localStorage.setItem('senhaLembrada', senha);
                    } else {
                        localStorage.removeItem('usuarioLembrado');
                        localStorage.removeItem('senhaLembrada');
                    }

                    // Redirect after a short delay
                    setTimeout(() => {
                        window.location.href = '/landing.html';
                    }, 1500);
                } else {
                    message.style.display = 'block';
                    message.className = 'message error';
                    message.textContent = `❌ ${data.message}`;
                }
            } catch (error) {
                message.style.display = 'block';
                message.className = 'message error';
                message.textContent = '❌ Erro de conexão com o servidor.';
            }
        }

        // Function to show success alert (for demonstration)
        function showSuccessAlert() {
            alert('Login bem-sucedido! Em uma implementação real, isso redirecionaria para o painel.');
        }