// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function () {
    console.log('Login JS cargado correctamente.');

    // Elementos del DOM
    const loginForm = document.getElementById('adminLoginForm');
    const adminEmail = document.getElementById('adminEmail');
    const adminPassword = document.getElementById('adminPassword');
    const togglePassword = document.getElementById('togglePassword');
    const loginBtn = document.getElementById('loginBtn');
    const twoFactorModal = document.getElementById('twoFactorModal');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const codeInputs = document.querySelectorAll('.code-input');
    const verify2FABtn = document.getElementById('verify2FA');
    const cancel2FABtn = document.getElementById('cancel2FA');
    const googleAuthBtn = document.getElementById('googleAuth');
    const forgotPasswordLink = document.querySelector('.forgot-password');
    const cancelRecoveryBtn = document.getElementById('cancelRecovery');
    const loadingOverlay = document.getElementById('loadingOverlay');


    // Inicializar funcionalidades
    initializeEventListeners();
    initializeCodeInputs();

    function initializeEventListeners() {
        // Toggle password visibility
        togglePassword.addEventListener('click', function () {
            const type = adminPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            adminPassword.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });

        // Login form submission
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleLogin();
        });

        // Two Factor Authentication
        verify2FABtn.addEventListener('click', function () {
            verifyTwoFactorCode();
        });

        cancel2FABtn.addEventListener('click', function () {
            closeTwoFactorModal();
            resetForm();
        });

        // Google Authenticator
        googleAuthBtn.addEventListener('click', function () {
            simulateGoogleAuth();
        });

        // Forgot password
        forgotPasswordLink.addEventListener('click', function (e) {
            e.preventDefault();
            openForgotPasswordModal();
        });

        cancelRecoveryBtn.addEventListener('click', function () {
            closeForgotPasswordModal();
        });

        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', function (event) {
            if (event.target === twoFactorModal) {
                closeTwoFactorModal();
                resetForm();
            }
            if (event.target === forgotPasswordModal) {
                closeForgotPasswordModal();
            }
        });

        // Validación en tiempo real
        adminEmail.addEventListener('blur', validateEmail);
        adminPassword.addEventListener('blur', validatePassword);
    }

    function initializeCodeInputs() {
        codeInputs.forEach((input, index) => {
            // Solo permitir números
            input.addEventListener('input', function (e) {
                this.value = this.value.replace(/[^0-9]/g, '');

                // Mover al siguiente input si se ingresa un número
                if (this.value.length === 1 && index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                }

                // Verificar si todos los campos están llenos
                checkCodeCompletion();
            });

            // Manejar tecla de retroceso
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Backspace' && this.value === '' && index > 0) {
                    codeInputs[index - 1].focus();
                }
            });

            // Pegar código completo
            input.addEventListener('paste', function (e) {
                e.preventDefault();
                const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
                if (pasteData.length === 6) {
                    pasteData.split('').forEach((char, charIndex) => {
                        if (codeInputs[charIndex]) {
                            codeInputs[charIndex].value = char;
                        }
                    });
                    checkCodeCompletion();
                    codeInputs[5].focus();
                }
            });
        });
    }

    function handleLogin() {
        showLoading("Verificando credenciales...");

        const data = {
            email: adminEmail.value.trim(),
            password: adminPassword.value
        };

        fetch("/admins/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.redirected) {
                    window.location.href = response.url; // Redirige al dashboard
                } else {
                    hideLoading();
                    showError("Credenciales incorrectas o usuario no encontrado.");
                }
            })
            .catch(err => {
                hideLoading();
                showError("Error en el servidor. Intenta nuevamente.");
                console.error(err);
            });
    }

    function validateForm() {
        let isValid = true;

        // Limpiar errores previos
        clearErrors();

        // Validar email
        if (!validateEmail()) {
            isValid = false;
        }

        // Validar contraseña
        if (!validatePassword()) {
            isValid = false;
        }

        return isValid;
    }

    function validateEmail() {
        const email = adminEmail.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            showFieldError(adminEmail, 'El email es requerido');
            return false;
        } else if (!emailRegex.test(email)) {
            showFieldError(adminEmail, 'Ingresa un email válido');
            return false;
        } else {
            clearFieldError(adminEmail);
            return true;
        }
    }

    function validatePassword() {
        const password = adminPassword.value;

        if (!password) {
            showFieldError(adminPassword, 'La contraseña es requerida');
            return false;
        } else if (password.length < 8) {
            showFieldError(adminPassword, 'La contraseña debe tener al menos 8 caracteres');
            return false;
        } else {
            clearFieldError(adminPassword);
            return true;
        }
    }

    function showFieldError(field, message) {
        field.classList.add('error');

        // Remover mensaje de error existente
        const existingError = field.parentNode.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Agregar nuevo mensaje de error
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        field.parentNode.parentNode.appendChild(errorElement);
    }

    function clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(error => error.remove());
        document.querySelectorAll('.input-group input').forEach(input => input.classList.remove('error'));
    }

    function showError(message) {
        // Crear elemento de error global
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.cssText = `
            background: rgba(229, 62, 62, 0.1);
            border: 1px solid var(--error-color);
            color: var(--error-color);
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

        // Insertar antes del formulario
        loginForm.insertBefore(errorElement, loginForm.firstChild);

        // Remover después de 5 segundos
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
        }, 5000);
    }

    function showSuccess(message) {
        // Crear elemento de éxito
        const successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.style.cssText = `
            background: rgba(56, 161, 105, 0.1);
            border: 1px solid var(--success-color);
            color: var(--success-color);
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        successElement.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

        // Insertar antes del formulario
        loginForm.insertBefore(successElement, loginForm.firstChild);

        // Remover después de 3 segundos
        setTimeout(() => {
            if (successElement.parentNode) {
                successElement.remove();
            }
        }, 3000);
    }

    function openTwoFactorModal() {
        twoFactorModal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Enfocar el primer input
        setTimeout(() => {
            codeInputs[0].focus();
        }, 100);

        // Simular envío de código (en producción esto se enviaría por email/SMS)
        console.log('Código 2FA simulado: 123456');
    }

    function closeTwoFactorModal() {
        twoFactorModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetCodeInputs();
    }

    function resetCodeInputs() {
        codeInputs.forEach(input => {
            input.value = '';
        });
    }

    function checkCodeCompletion() {
        const code = Array.from(codeInputs).map(input => input.value).join('');
        verify2FABtn.disabled = code.length !== 6;
    }

    function verifyTwoFactorCode() {
        const enteredCode = Array.from(codeInputs).map(input => input.value).join('');

        // En producción, aquí se verificaría contra el servidor
        // Por ahora, usamos un código fijo para la demo
        const validCode = '123456';

        if (enteredCode === validCode) {
            completeLogin();
        } else {
            // Mostrar error
            codeInputs.forEach(input => {
                input.style.borderColor = 'var(--error-color)';
            });

            // Agregar mensaje de error
            const existingError = document.querySelector('.code-error');
            if (existingError) {
                existingError.remove();
            }

            const errorElement = document.createElement('div');
            errorElement.className = 'error-message code-error';
            errorElement.style.marginTop = '1rem';
            errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> Código incorrecto. Inténtalo de nuevo.`;

            twoFactorModal.querySelector('.two-factor-form').appendChild(errorElement);

            // Limpiar inputs y volver a enfocar el primero
            resetCodeInputs();
            codeInputs[0].focus();
        }
    }

    function completeLogin() {
        showLoading('Accediendo al panel de administración...');

        // Simular redirección después del login exitoso
        setTimeout(() => {
            hideLoading();
            showSuccess('¡Acceso concedido! Redirigiendo...');

            // En producción, aquí se redirigiría al dashboard
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1500);
        }, 2000);
    }

    function simulateGoogleAuth() {
        showLoading('Iniciando autenticación con Google...');

        setTimeout(() => {
            hideLoading();
            openTwoFactorModal();
        }, 1500);
    }

    function openForgotPasswordModal() {
        forgotPasswordModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeForgotPasswordModal() {
        forgotPasswordModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    function resetForm() {
        loginForm.reset();
        clearErrors();
    }

    function showLoading(message = 'Cargando...') {
        const loadingText = loadingOverlay.querySelector('h3');
        if (loadingText) {
            loadingText.textContent = message;
        }
        loadingOverlay.style.display = 'flex';
        loginBtn.disabled = true;
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
        loginBtn.disabled = false;
    }

    // Demo: Auto-completar credenciales para testing (remover en producción)
    function demoAutoFill() {
        if (window.location.search.includes('demo=true')) {
            adminEmail.value = validCredentials.email;
            adminPassword.value = validCredentials.password;
            showSuccess('Credenciales de demo cargadas. Haz clic en "Ingresar al Panel" para continuar.');
        }
    }

    // Ejecutar auto-fill para demo
    demoAutoFill();

    // Prevenir inspección del código (medida básica de seguridad)
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
            e.preventDefault();
        }
    });
});

// Agregar estilos dinámicos para feedback
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .pulse {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(dynamicStyles);