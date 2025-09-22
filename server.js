const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsing de JSON
app.use(express.json());
app.use(express.static('public'));

// Rota principal - servir a página de autenticação
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'autenticacao.html'));
});

// Rota para a landing page após login
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// Rota para servir a página de admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Rota para API de login
app.post('/api/login', (req, res) => {
    const { usuario, senha } = req.body;
    
    try {
        // Ler o arquivo usuarios.json
        const usuariosData = fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf8');
        const usuarios = JSON.parse(usuariosData);
        
        // Buscar usuário
        const user = usuarios.find(u => 
            u.usuario.toUpperCase() === usuario.toUpperCase() && 
            u.senha === senha
        );

        if (user) {
            if (user.ativo) {
                res.json({
                    success: true,
                    message: 'Login bem-sucedido!',
                    user: {
                        usuario: user.usuario,
                        email: user.email || '',
                        admin: user.admin || false
                    }
                });
            } else {
                res.status(403).json({
                    success: false,
                    message: 'Conta inativa. Entre em contato com o suporte.'
                });
            }
        } else {
            res.status(401).json({
                success: false,
                message: 'Usuário ou senha incorretos.'
            });
        }
    } catch (error) {
        console.error('Erro ao ler arquivo de usuários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota para verificar se o usuário é admin
app.get('/api/check-admin', (req, res) => {
    try {
        // Verificação simplificada - em produção use um método seguro
        const userToken = req.headers.authorization;
        if (!userToken) {
            return res.json({ isAdmin: false });
        }
        
        const usuariosData = fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf8');
        const usuarios = JSON.parse(usuariosData);
        
        const user = usuarios.find(u => 
            u.usuario === userToken && u.admin && u.ativo
        );
        
        res.json({ isAdmin: !!user });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao verificar admin' });
    }
});

// Rota para obter lista de usuários
app.get('/api/usuarios', (req, res) => {
    try {
        const usuariosData = fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf8');
        const usuarios = JSON.parse(usuariosData);
        res.json(usuarios);
    } catch (error) {
        console.error('Erro ao ler arquivo de usuários:', error);
        res.status(500).json({ error: 'Erro ao carregar usuários' });
    }
});

// Rota para adicionar usuário
app.post('/api/usuarios', (req, res) => {
    try {
        const { usuario, senha, ativo, admin } = req.body;
        const usuariosData = fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf8');
        const usuarios = JSON.parse(usuariosData);
        
        // Verificar se o usuário já existe
        const usuarioExistente = usuarios.find(u => u.usuario.toUpperCase() === usuario.toUpperCase());
        if (usuarioExistente) {
            return res.status(400).json({ error: 'Usuário já existe' });
        }
        
        usuarios.push({ 
            usuario: usuario.toUpperCase(), 
            senha, 
            ativo: ativo === true || ativo === 'true',
            admin: admin === true || admin === 'true'
        });
        
        fs.writeFileSync(path.join(__dirname, 'usuarios.json'), JSON.stringify(usuarios, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao adicionar usuário:', error);
        res.status(500).json({ error: 'Erro ao adicionar usuário' });
    }
});

// Função para verificar se é o último admin ativo
function isLastActiveAdmin(usuarios, indexToExclude = null) {
    const activeAdmins = usuarios.filter((user, index) => 
        user.admin && user.ativo && index !== indexToExclude
    );
    return activeAdmins.length === 0;
}

// Rota para editar usuário (ATUALIZADA - permite autoedição)
app.put('/api/usuarios/:index', (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const { usuario, senha, ativo, admin } = req.body;
        const usuariosData = fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf8');
        const usuarios = JSON.parse(usuariosData);
        
        if (index >= 0 && index < usuarios.length) {
            const currentUser = usuarios[index];
            
            // Verificar se está tentando remover privilégios de admin de um admin ativo
            if (currentUser.admin && currentUser.ativo && admin === false) {
                if (isLastActiveAdmin(usuarios, index)) {
                    return res.status(403).json({ 
                        error: 'Não é permitido remover privilégios de administrador do último admin ativo.' 
                    });
                }
            }
            
            // Verificar se o novo nome de usuário já existe (exceto para o próprio usuário)
            const usuarioExistente = usuarios.find((u, i) => 
                i !== index && u.usuario.toUpperCase() === usuario.toUpperCase()
            );
            
            if (usuarioExistente) {
                return res.status(400).json({ error: 'Usuário já existe' });
            }
            
            usuarios[index] = { 
                usuario: usuario.toUpperCase(), 
                senha, 
                ativo: ativo === true || ativo === 'true',
                admin: admin === true || admin === 'true'
            };
            
            fs.writeFileSync(path.join(__dirname, 'usuarios.json'), JSON.stringify(usuarios, null, 2));
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Usuário não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao editar usuário:', error);
        res.status(500).json({ error: 'Erro ao editar usuário' });
    }
});

// Rota para alternar status do usuário (ATUALIZADA - impede auto-desativação de admins)
app.put('/api/usuarios/:index/toggle', (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const usuariosData = fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf8');
        const usuarios = JSON.parse(usuariosData);
        
        if (index >= 0 && index < usuarios.length) {
            const user = usuarios[index];
            
            // Obter o usuário que está fazendo a requisição (simplificado)
            // Em um sistema real, você usaria autenticação por token/sessão
            const requestingUser = req.headers['x-requesting-user'] || '';
            
            // Impedir que administradores se desativem
            if (user.admin && user.ativo && user.usuario === requestingUser) {
                return res.status(403).json({ 
                    error: 'Administradores não podem desativar a si mesmos.' 
                });
            }
            
            // Impedir que administradores desativem outros administradores
            if (user.admin && user.ativo && user.usuario !== requestingUser) {
                return res.status(403).json({ 
                    error: 'Não é permitido desativar outros administradores.' 
                });
            }
            
            // Verificar se é o último admin ativo ao tentar desativar
            if (user.admin && user.ativo && isLastActiveAdmin(usuarios, index)) {
                return res.status(403).json({ 
                    error: 'Não é permitido desativar o último administrador ativo.' 
                });
            }
            
            usuarios[index].ativo = !usuarios[index].ativo;
            fs.writeFileSync(path.join(__dirname, 'usuarios.json'), JSON.stringify(usuarios, null, 2));
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Usuário não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao alterar status do usuário:', error);
        res.status(500).json({ error: 'Erro ao alterar status' });
    }
});

// Rota para excluir usuário (ATUALIZADA)
app.delete('/api/usuarios/:index', (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const usuariosData = fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf8');
        const usuarios = JSON.parse(usuariosData);
        
        if (index >= 0 && index < usuarios.length) {
            const user = usuarios[index];
            
            // Impedir a exclusão de usuários admin
            if (user.admin) {
                return res.status(403).json({ 
                    error: 'Não é permitido excluir usuários administradores.' 
                });
            }
            
            usuarios.splice(index, 1);
            fs.writeFileSync(path.join(__dirname, 'usuarios.json'), JSON.stringify(usuarios, null, 2));
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Usuário não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
});

// Rota para verificar saúde do servidor
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware para tratamento de erros 404
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Middleware para tratamento de erros genéricos
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Verificação de integridade ao iniciar o servidor
function checkSystemIntegrity() {
    try {
        const usuariosData = fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf8');
        const usuarios = JSON.parse(usuariosData);
        
        // Verificar se há pelo menos um admin ativo
        const activeAdmins = usuarios.filter(user => user.admin && user.ativo);
        
        if (activeAdmins.length === 0) {
            console.error('⚠️  AVISO CRÍTICO: Não há administradores ativos no sistema!');
            console.error('   O sistema pode ficar inacessível para operações administrativas.');
            
            // Tentar auto-correção: ativar o primeiro admin encontrado
            const firstAdmin = usuarios.find(user => user.admin);
            if (firstAdmin) {
                firstAdmin.ativo = true;
                fs.writeFileSync(path.join(__dirname, 'usuarios.json'), JSON.stringify(usuarios, null, 2));
                console.log('✅ Auto-correção: Administrador ' + firstAdmin.usuario + ' reativado.');
            }
        } else {
            console.log('✅ Verificação de integridade: ' + activeAdmins.length + ' administrador(es) ativo(s).');
        }
    } catch (error) {
        console.error('Erro na verificação de integridade:', error);
    }
}

// Executar verificação ao iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
    checkSystemIntegrity();
});