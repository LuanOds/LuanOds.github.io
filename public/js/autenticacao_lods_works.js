// Funcionalidade para mostrar/ocultar senha
document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('togglePassword');
    const senhaInput = document.getElementById('senha');
    
    if (togglePassword && senhaInput) {
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
    }

    // Recupera usuário e senha salvos se existir
    const usuarioSalvo = localStorage.getItem('usuarioLembrado');
    const senhaSalva = localStorage.getItem('senhaLembrada');

    if (usuarioSalvo) {
        document.getElementById('usuario').value = usuarioSalvo;
        document.querySelector('input[name="remember"]').checked = true;
    }

    if (senhaSalva) {
        document.getElementById('senha').value = senhaSalva;
        document.querySelector('input[name="remember"]').checked = true;
    }
});

// Função para mostrar alerta personalizado de sucesso
function showSuccessAlert() {
    const alertOverlay = document.createElement('div');
    alertOverlay.id = 'success-alert-overlay';
    alertOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    const alertBox = document.createElement('div');
    alertBox.style.cssText = `
        background: linear-gradient(135deg, #1a2a6c 0%, #121212 100%);
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(0, 255, 204, 0.3);
        max-width: 400px;
        width: 80%;
        animation: scaleIn 0.3s ease;
    `;
    
    alertBox.innerHTML = `
        <div style="font-size: 50px; color: #00ffcc; margin-bottom: 15px;">
            <i class="fas fa-check-circle"></i>
        </div>
        <h2 style="color: white; margin-bottom: 15px;">Login Bem-Sucedido!</h2>
        <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 25px;">Você será redirecionado para o painel em instantes.</p>
        <button id="alert-ok-btn" style="
            background-color: #00ffcc;
            color: #121212;
            border: none;
            padding: 12px 25px;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        ">OK</button>
    `;
    
    alertOverlay.appendChild(alertBox);
    document.body.appendChild(alertOverlay);
    
    document.getElementById('alert-ok-btn').addEventListener('click', function() {
        document.body.removeChild(alertOverlay);
    });
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        
        #alert-ok-btn:hover {
            background-color: #00e6b8 !important;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 230, 184, 0.4);
        }
        
        #alert-ok-btn:active {
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
}

// Função de login principal
document.getElementById("loginBtn").addEventListener("click", login);

function login() {
    const usuarioDigitado = document.getElementById("usuario").value; // mantém como digitado
    const usuario = usuarioDigitado.toUpperCase(); // usado só para validar
    const senha = document.getElementById("senha").value;
    const message = document.getElementById("message");
    const remember = document.querySelector('input[name="remember"]').checked;

    // Lista de usuários
    const usuarios = [
        {usuario:"EDUARDO", senha:"Temp@ea82", ativo:true},
        {usuario:"KETLYN", senha:"Temp@ea82", ativo:true},
        {usuario:"CLARA", senha:"123456", ativo:true},
        {usuario:"LUAN", senha:"123456", ativo:true}
    ];

    const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);

    if(user) {
        if(user.ativo){
            message.style.display = "none";
            showSuccessAlert();

            localStorage.setItem('usuarioLogado', JSON.stringify(user));

            // Salva ou remove usuário e senha lembrados
            if (remember) {
                localStorage.setItem('usuarioLembrado', usuarioDigitado); // mantém como digitado
                localStorage.setItem('senhaLembrada', senha);
            } else {
                localStorage.removeItem('usuarioLembrado');
                localStorage.removeItem('senhaLembrada');
            }

            const urlParams = new URLSearchParams(window.location.search);
            const callback = urlParams.get('callback');
            
            if(callback) {
                fetch(callback)
                    .then(() => {
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 2500);
                    })
                    .catch(() => {
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1500);
                    });
            } else {
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }

        } else {
            message.style.color = "red";
            message.innerHTML = "❌ Conta inativa. Entre em contato com o suporte.<br><button onclick='window.location.reload()'>Tentar novamente</button> <button onclick='window.open(\"\", \"_self\"); window.close();'>Fechar</button>";
            message.className = "message error";
            message.style.display = "block";
        }
    } else {
        message.style.color = "red";
        message.textContent = "❌ Usuário ou senha incorretos.";
        message.className = "message error";
        message.style.display = "block";
    }
}

// Submit com Enter
document.getElementById("senha").addEventListener("keypress", function(event) {
        
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("loginBtn").click();
    }
});

// Submit pelo form
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    document.getElementById("loginBtn").click();
});