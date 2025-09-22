        // Variáveis globais
        let users = [];
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
            checkAdminStatus();
        });

        // Verificar se o usuário é administrador
        async function checkAdminStatus() {
            try {
                const response = await fetch('/api/check-admin', {
                    headers: {
                        'Authorization': currentUser.usuario
                    }
                });
                
                if (!response.ok) throw new Error('Erro ao verificar status de admin');
                
                const data = await response.json();
                isAdmin = data.isAdmin;
                
                if (isAdmin) {
                    loadAdminContent();
                    loadUsers();
                } else {
                    showAccessDenied();
                }
            } catch (error) {
                showAccessDenied();
            }
        }

        // Carregar conteúdo administrativo
        function loadAdminContent() {
            const adminContent = document.getElementById('adminContent');
            
            adminContent.innerHTML = `
                <header>
                    <div class="header-content">
                        <h1><i class="fas fa-lock"></i> Painel de Administração</h1>
                        <div class="user-info">
                            <span>${currentUser.usuario}</span>
                            <span class="admin-badge">ADMIN</span>
                        </div>
                        <div class="header-buttons">
                            <a href="/home" class="back-btn">
                                <i class="fas fa-arrow-left"></i> Voltar
                            </a>
                            <button class="logout-btn" onclick="logout()">
                                <i class="fas fa-sign-out-alt"></i> Sair
                            </button>
                        </div>
                    </div>
                </header>

                <div class="dashboard">
                    <div class="sidebar">
                        <h2 class="section-title"><i class="fas fa-chart-bar"></i> Estatísticas</h2>
                        <div class="stats">
                            <div class="stat-card">
                                <h3>Usuários Totais</h3>
                                <div class="number" id="totalUsers">0</div>
                            </div>
                            <div class="stat-card">
                                <h3>Usuários Ativos</h3>
                                <div class="number" id="activeUsers">0</div>
                            </div>
                        </div>
                        
                        <h2 class="section-title"><i class="fas fa-cog"></i> Ações Rápidas</h2>
                        <button class="add-user-btn" onclick="openModal()">
                            <i class="fas fa-plus"></i> Adicionar Usuário
                        </button>
                    </div>

                    <div class="main-content">
                        <h2 class="section-title"><i class="fas fa-users"></i> Gerenciar Usuários</h2>
                        
                        <div id="message" class="message"></div>
                        
                        <div class="actions">
                            <div class="search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" id="searchInput" placeholder="Buscar usuários..." oninput="filterUsers()">
                            </div>
                        </div>

                        <!-- NOVO: Adicione esta div para a dica de deslize em mobile -->
                        <div class="swipe-hint">
                            <i class="fas fa-arrow-right"></i> Deslize para ver mais opções
                        </div>

                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Usuário</th>
                                        <th>Senha</th>
                                        <th>Status</th>
                                        <th>Tipo</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="usersTableBody">
                                    <!-- Os usuários serão carregados aqui -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        // Mostrar mensagem de acesso negado
        function showAccessDenied() {
            const adminContent = document.getElementById('adminContent');
            
            adminContent.innerHTML = `
                <div class="access-denied">
                    <i class="fas fa-ban"></i>
                    <h2>Acesso Negado</h2>
                    <p>Você não possui permissões de administrador para acessar esta página.</p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <a href="/home" class="back-btn">
                            <i class="fas fa-arrow-left"></i> Voltar
                        </a>
                        <button class="logout-btn" onclick="logout()">
                            <i class="fas fa-sign-out-alt"></i> Sair
                        </button>
                    </div>
                </div>
            `;
        }

        // Carregar usuários do servidor
        async function loadUsers() {
            try {
                const response = await fetch('/api/usuarios');
                if (!response.ok) throw new Error('Erro ao carregar usuários');
                
                users = await response.json();
                renderUsers();
                updateStats();
            } catch (error) {
                showMessage('Erro ao carregar usuários: ' + error.message, 'error');
            }
        }

        // Renderizar usuários na tabela
        function renderUsers() {
            const tableBody = document.getElementById('usersTableBody');
            tableBody.innerHTML = '';
            
            // Verificar quantos administradores ativos existem
            const activeAdmins = users.filter(user => user.admin && user.ativo);
            const isLastActiveAdmin = activeAdmins.length <= 1;
            
            users.forEach((user, index) => {
                const row = document.createElement('tr');
                const isCurrentUser = user.usuario === currentUser.usuario;
                
                // Desabilitar ações conforme as regras:
                // 1. Pode editar a si mesmo ✅
                // 2. Não pode desativar a si mesmo se for admin ❌
                // 3. Não pode desativar outros administradores ❌
                // 4. Não pode excluir a si mesmo ou outros admins ❌
                const disableEdit = false; // Todos podem se editar
                const disableToggle = (isCurrentUser && user.admin) || (!isCurrentUser && user.admin);
                const disableDelete = isCurrentUser || user.admin;
                
                row.innerHTML = `
                    <td>
                        ${user.usuario} 
                        ${isCurrentUser ? '<span class="current-user-tag">(Você)</span>' : ''}
                    </td>
                    <td>
                        <div class="password-field">
                            <span class="password-text" id="password-${index}">••••••••</span>
                            <button type="button" class="toggle-password" onclick="togglePasswordVisibility(${index})">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                    <td>
                        <span class="status ${user.ativo ? 'status-active' : 'status-inactive'}">
                            ${user.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                    <td>
                        ${user.admin ? '<span class="admin-tag">Administrador</span>' : 'Usuário'}
                    </td>
                    <td class="actions-cell">
                        <button class="action-btn edit-btn" onclick="editUser(${index})" ${disableEdit ? 'disabled' : ''}>
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="action-btn toggle-btn" onclick="toggleUserStatus(${index})" ${disableToggle ? 'disabled' : ''}>
                            <i class="fas ${user.ativo ? 'fa-toggle-on' : 'fa-toggle-off'}"></i> 
                            ${user.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteUser(${index})" ${disableDelete ? 'disabled' : ''}>
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                        <!-- NOVO: Botão de menu para mobile -->
                        <button class="mobile-actions-toggle" onclick="toggleMobileActions(this, event)">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <!-- NOVO: Menu de ações para mobile -->
                        <div class="mobile-actions-menu">
                            <button onclick="editUser(${index})" ${disableEdit ? 'disabled' : ''}>
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button onclick="toggleUserStatus(${index})" ${disableToggle ? 'disabled' : ''}>
                                <i class="fas ${user.ativo ? 'fa-toggle-on' : 'fa-toggle-off'}"></i> 
                                ${user.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                            <button onclick="deleteUser(${index})" ${disableDelete ? 'disabled' : ''}>
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    </td>
                `;
                
                // Adicionar tooltip para botões desabilitados
                if (disableToggle) {
                    const toggleBtn = row.querySelector('.toggle-btn');
                    const mobileToggleBtn = row.querySelector('.mobile-actions-menu button:nth-child(2)');
                    if (isCurrentUser && user.admin) {
                        toggleBtn.title = 'Administradores não podem desativar a si mesmos';
                        if (mobileToggleBtn) mobileToggleBtn.title = 'Administradores não podem desativar a si mesmos';
                    } else if (!isCurrentUser && user.admin) {
                        toggleBtn.title = 'Não é possível desativar outros administradores';
                        if (mobileToggleBtn) mobileToggleBtn.title = 'Não é possível desativar outros administradores';
                    }
                }
                
                if (disableDelete) {
                    const deleteBtn = row.querySelector('.delete-btn');
                    const mobileDeleteBtn = row.querySelector('.mobile-actions-menu button:nth-child(3)');
                    if (isCurrentUser) {
                        deleteBtn.title = 'Não é possível excluir a si mesmo';
                        if (mobileDeleteBtn) mobileDeleteBtn.title = 'Não é possível excluir a si mesmo';
                    } else if (user.admin) {
                        deleteBtn.title = 'Não é possível excluir administradores';
                        if (mobileDeleteBtn) mobileDeleteBtn.title = 'Não é possível excluir administradores';
                    }
                }
                
                tableBody.appendChild(row);
            });
        }

        // Alternar status do usuário (ATUALIZADA - com recarregamento de página)
        async function toggleUserStatus(index) {
            const user = users[index];
            
            try {
                const response = await fetch('/api/usuarios/' + index + '/toggle', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-requesting-user': currentUser.usuario // Enviar usuário que está fazendo a requisição
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao alterar status');
                }
                
                // Mostrar mensagem de sucesso
                showMessage('Status do usuário alterado com sucesso! Recarregando página...', 'success');
                
                // Recarregar a página após 1.5 segundos
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                
            } catch (error) {
                showMessage('Erro ao alterar status: ' + error.message, 'error');
            }
        }

        // Excluir usuário (ATUALIZADA - com recarregamento de página)
        async function deleteUser(index) {
            if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
            
            try {
                const response = await fetch('/api/usuarios/' + index, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao excluir usuário');
                }
                
                // Mostrar mensagem de sucesso
                showMessage('Usuário excluído com sucesso! Recarregando página...', 'success');
                
                // Recarregar a página após 1.5 segundos
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                
            } catch (error) {
                showMessage('Erro ao excluir usuário: ' + error.message, 'error');
            }
        }

        // Salvar usuário (ATUALIZADA - com recarregamento de página)
        async function saveUser(event) {
            event.preventDefault();
            
            const editIndex = document.getElementById('editIndex').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const active = document.getElementById('activeStatus').value === 'true';
            const admin = document.getElementById('adminStatus').value === 'true';
            
            try {
                let response;
                
                if (editIndex === '') {
                    // Adicionar novo usuário
                    response = await fetch('/api/usuarios', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            usuario: username,
                            senha: password,
                            ativo: active,
                            admin: admin
                        })
                    });
                } else {
                    // Editar usuário existente
                    response = await fetch('/api/usuarios/' + editIndex, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            usuario: username,
                            senha: password,
                            ativo: active,
                            admin: admin
                        })
                    });
                }
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao salvar usuário');
                }
                
                closeModal();
                
                // Mostrar mensagem de sucesso
                showMessage('Usuário salvo com sucesso! Recarregando página...', 'success');
                
                // Recarregar a página após 1.5 segundos
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                
            } catch (error) {
                showMessage('Erro ao salvar usuário: ' + error.message, 'error');
            }
        }

        // Alternar visibilidade da senha na tabela
        function togglePasswordVisibility(index) {
        const passwordElement = document.getElementById(`password-${index}`);
        const button = document.querySelector(`button[onclick="togglePasswordVisibility(${index})"]`);
        const icon = button.querySelector('i');
        
        if (passwordElement.textContent === '••••••••') {
            passwordElement.textContent = users[index].senha;
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
            button.style.color = '#1a2a6c'; // Cor diferente quando visível
        } else {
            passwordElement.textContent = '••••••••';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
            button.style.color = '#6c757d'; // Voltar à cor original
        }
    }

        // Alternar visibilidade da senha no modal
        function togglePasswordVisibilityModal(inputId) {
        const passwordInput = document.getElementById(inputId);
        const button = document.querySelector(`button[onclick="togglePasswordVisibilityModal('${inputId}')"]`);
        const icon = button.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
            button.style.color = '#1a2a6c'; // Cor diferente quando visível
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
            button.style.color = '#6c757d'; // Voltar à cor original
        }
    }

        // Atualizar estatísticas
        function updateStats() {
            const totalUsers = users.length;
            const activeUsers = users.filter(user => user.ativo).length;
            
            document.getElementById('totalUsers').textContent = totalUsers;
            document.getElementById('activeUsers').textContent = activeUsers;
        }

        // Filtrar usuários na tabela
        function filterUsers() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const rows = document.getElementById('usersTableBody').getElementsByTagName('tr');
            
            for (let row of rows) {
                const username = row.cells[0].textContent.toLowerCase();
                row.style.display = username.includes(searchTerm) ? '' : 'none';
            }
        }

        // Abrir modal para adicionar/editar usuário
        function openModal(index = null) {
        const modal = document.getElementById('userModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('userForm');
        const passwordInput = document.getElementById('password');
        const eyeButton = document.querySelector(`button[onclick="togglePasswordVisibilityModal('password')"]`);
        const eyeIcon = eyeButton.querySelector('i');
        
        if (index !== null) {
            // Modo edição
            modalTitle.textContent = 'Editar Usuário';
            const user = users[index];
            document.getElementById('editIndex').value = index;
            document.getElementById('username').value = user.usuario;
            document.getElementById('password').value = user.senha;
            document.getElementById('activeStatus').value = user.ativo;
            document.getElementById('adminStatus').value = user.admin;
            
            // Garantir que a senha esteja oculta ao abrir o modal
            passwordInput.type = 'password';
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
            eyeButton.style.color = '#6c757d';
            
        } else {
            // Modo adição
            modalTitle.textContent = 'Adicionar Usuário';
            form.reset();
            document.getElementById('editIndex').value = '';
            document.getElementById('adminStatus').value = 'false';
            
            // Garantir que a senha esteja oculta ao abrir o modal
            passwordInput.type = 'password';
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
            eyeButton.style.color = '#6c757d';
        }
        
        modal.style.display = 'flex';
    }

        // Fechar modal
        function closeModal() {
            document.getElementById('userModal').style.display = 'none';
        }

        // Salvar usuário (adicionar ou editar)
        async function saveUser(event) {
            event.preventDefault();
            
            const editIndex = document.getElementById('editIndex').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const active = document.getElementById('activeStatus').value === 'true';
            const admin = document.getElementById('adminStatus').value === 'true';
            
            try {
                let response;
                
                if (editIndex === '') {
                    // Adicionar novo usuário
                    response = await fetch('/api/usuarios', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            usuario: username,
                            senha: password,
                            ativo: active,
                            admin: admin
                        })
                    });
                } else {
                    // Editar usuário existente
                    response = await fetch('/api/usuarios/' + editIndex, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            usuario: username,
                            senha: password,
                            ativo: active,
                            admin: admin
                        })
                    });
                }
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao salvar usuário');
                }
                
                closeModal();
                loadUsers();
                showMessage('Usuário salvo com sucesso!', 'success');
            } catch (error) {
                showMessage('Erro ao salvar usuário: ' + error.message, 'error');
            }
        }

        // Editar usuário
        function editUser(index) {
            openModal(index);
        }

        // Alternar status do usuário
        async function toggleUserStatus(index) {
            const user = users[index];
            
            try {
                const response = await fetch('/api/usuarios/' + index + '/toggle', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao alterar status');
                }
                
                loadUsers();
                showMessage('Status do usuário alterado com sucesso!', 'success');
            } catch (error) {
                showMessage('Erro ao alterar status: ' + error.message, 'error');
            }
        }

        // Excluir usuário
        async function deleteUser(index) {
            if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
            
            try {
                const response = await fetch('/api/usuarios/' + index, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao excluir usuário');
                }
                
                loadUsers();
                showMessage('Usuário excluído com sucesso!', 'success');
            } catch (error) {
                showMessage('Erro ao excluir usuário: ' + error.message, 'error');
            }
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

        // Logout
        function logout() {
            localStorage.removeItem('usuarioLogado');
            window.location.href = '/';
        }

        // Adicionar event listener para o formulário
        document.getElementById('userForm').addEventListener('submit', saveUser);

        // NOVO: Função para mostrar/ocultar o menu de ações no mobile
        function toggleMobileActions(button, event) {
            // Prevenir que o clique se propague e feche o menu imediatamente
            if (event) event.stopPropagation();
            
            const menu = button.nextElementSibling;
            const allMenus = document.querySelectorAll('.mobile-actions-menu');
            
            // Fechar outros menus abertos
            allMenus.forEach(m => {
                if (m !== menu && m.style.display === 'block') {
                    m.style.display = 'none';
                }
            });
            
            // Alternar o menu atual
            if (menu.style.display === 'block') {
                menu.style.display = 'none';
            } else {
                menu.style.display = 'block';
            }
        }

        // NOVO: Fechar menus ao clicar em qualquer lugar da página
        document.addEventListener('click', function() {
            document.querySelectorAll('.mobile-actions-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        });

        // NOVO: Prevenir que cliques nos menus fechem imediatamente
        document.addEventListener('DOMContentLoaded', function() {
            // Adicionar event listener após o carregamento do conteúdo
            setTimeout(() => {
                document.querySelectorAll('.mobile-actions-menu').forEach(menu => {
                    menu.addEventListener('click', function(e) {
                        e.stopPropagation();
                    });
                });
            }, 500);
        });