// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('pago.js cargado correctamente');

    // Establecer año actual en el footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Elementos del DOM
    const completeOrderBtn = document.getElementById('completeOrderBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const successModal = document.getElementById('successModal');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    const trackOrderBtn = document.getElementById('trackOrderBtn');
    const loginBtn = document.getElementById('loginBtn');
    const supportBtn = document.getElementById('supportBtn');
    const tabHeaders = document.querySelectorAll('.tab-header');
    const acceptTerms = document.getElementById('acceptTerms');
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryDateInput = document.getElementById('expiryDate');
    const cvvInput = document.getElementById('cvv');

    // Inicializar formularios
    initializeForms();
    initializeEventListeners();

    const profileBtn = document.querySelector(".profile-settings");
    profileBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/perfil";
    });

    const logoutBtn = document.querySelector(".logout");
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/";
        localStorage.removeItem("user_id");
    });

    // Funciones de inicialización
    function initializeForms() {
        // Formatear número de tarjeta
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                let matches = value.match(/\d{4,16}/g);
                let match = matches && matches[0] || '';
                let parts = [];
                
                for (let i = 0, len = match.length; i < len; i += 4) {
                    parts.push(match.substring(i, i + 4));
                }
                
                if (parts.length) {
                    e.target.value = parts.join(' ');
                } else {
                    e.target.value = value;
                }
            });
        }

        // Formatear fecha de vencimiento
        if (expiryDateInput) {
            expiryDateInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
                } else {
                    e.target.value = value;
                }
            });
        }

        // Validar CVV
        if (cvvInput) {
            cvvInput.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
            });
        }
    }

    function initializeEventListeners() {
        // Tabs de pago
        tabHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                
                // Remover active de todos los tabs
                tabHeaders.forEach(h => h.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Agregar active al tab clickeado
                this.classList.add('active');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });

        // Validar términos y condiciones
        acceptTerms.addEventListener('change', function() {
            completeOrderBtn.disabled = !this.checked;
        });

        // Completar pedido
        completeOrderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!validateForms()) {
                showFeedback('Por favor completa todos los campos requeridos correctamente', 'error');
                return;
            }
            
            processOrder();
        });

        // Continuar comprando
        continueShoppingBtn.addEventListener('click', function() {
            window.location.href = 'catalog.html';
        });

        // Seguir pedido
        trackOrderBtn.addEventListener('click', function() {
            // En una aplicación real, redirigiría a la página de seguimiento
            showFeedback('Redirigiendo a la página de seguimiento...');
            setTimeout(() => {
                console.log('Redirigiendo a seguimiento de pedido...');
            }, 1000);
        });

        // Soporte
        supportBtn.addEventListener('click', function() {
            showFeedback('¿Necesitas ayuda? Contáctanos en soporte@vansebook.com', 'info');
        });

        // Login
        loginBtn.addEventListener('click', function() {
            showFeedback('Funcionalidad de login - En una app real mostraría un modal de login');
        });

        // Validación en tiempo real de formularios
        setupRealTimeValidation();
    }

    function setupRealTimeValidation() {
        // Validación de email
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                validateEmail(this);
            });
        }

        // Validación de teléfono
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('blur', function() {
                validatePhone(this);
            });
        }

        // Validación de campos requeridos
        const requiredInputs = document.querySelectorAll('input[required], select[required]');
        requiredInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateRequiredField(this);
            });
        });
    }

    function validateForms() {
        let isValid = true;
        
        // Validar dirección
        const addressFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
        addressFields.forEach(field => {
            const element = document.getElementById(field);
            if (element && !validateRequiredField(element)) {
                isValid = false;
            }
        });
        
        // Validar email
        if (!validateEmail(document.getElementById('email'))) {
            isValid = false;
        }
        
        // Validar teléfono
        if (!validatePhone(document.getElementById('phone'))) {
            isValid = false;
        }
        
        // Validar términos
        if (!acceptTerms.checked) {
            isValid = false;
            showFeedback('Debes aceptar los términos y condiciones', 'error');
        }
        
        // Validar método de pago
        const activeTab = document.querySelector('.tab-content.active').id;
        if (activeTab === 'card-tab') {
            if (!validateCardForm()) {
                isValid = false;
            }
        } else if (activeTab === 'pse-tab') {
            const bankSelect = document.getElementById('bank');
            if (!bankSelect.value) {
                isValid = false;
                showFieldError(bankSelect, 'Selecciona un banco');
            }
        }
        
        return isValid;
    }

    function validateRequiredField(field) {
        if (!field.value.trim()) {
            showFieldError(field, 'Este campo es requerido');
            return false;
        } else {
            clearFieldError(field);
            return true;
        }
    }

    function validateEmail(field) {
        const email = field.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            showFieldError(field, 'El email es requerido');
            return false;
        } else if (!emailRegex.test(email)) {
            showFieldError(field, 'Ingresa un email válido');
            return false;
        } else {
            clearFieldError(field);
            return true;
        }
    }

    function validatePhone(field) {
        const phone = field.value.trim();
        const phoneRegex = /^[0-9]{10,15}$/;
        
        if (!phone) {
            showFieldError(field, 'El teléfono es requerido');
            return false;
        } else if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
            showFieldError(field, 'Ingresa un teléfono válido');
            return false;
        } else {
            clearFieldError(field);
            return true;
        }
    }

    function validateCardForm() {
        let isValid = true;
        
        // Validar número de tarjeta
        const cardNumber = cardNumberInput.value.replace(/\s/g, '');
        if (!cardNumber || cardNumber.length < 16) {
            showFieldError(cardNumberInput, 'Número de tarjeta inválido');
            isValid = false;
        } else {
            clearFieldError(cardNumberInput);
        }
        
        // Validar nombre en tarjeta
        const cardName = document.getElementById('cardName').value.trim();
        if (!cardName) {
            showFieldError(document.getElementById('cardName'), 'Nombre en tarjeta requerido');
            isValid = false;
        } else {
            clearFieldError(document.getElementById('cardName'));
        }
        
        // Validar fecha de vencimiento
        const expiryDate = expiryDateInput.value;
        if (!expiryDate || !isValidExpiryDate(expiryDate)) {
            showFieldError(expiryDateInput, 'Fecha de vencimiento inválida');
            isValid = false;
        } else {
            clearFieldError(expiryDateInput);
        }
        
        // Validar CVV
        const cvv = cvvInput.value;
        if (!cvv || cvv.length < 3) {
            showFieldError(cvvInput, 'CVV inválido');
            isValid = false;
        } else {
            clearFieldError(cvvInput);
        }
        
        return isValid;
    }

    function isValidExpiryDate(date) {
        const [month, year] = date.split('/');
        if (!month || !year) return false;
        
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        const expMonth = parseInt(month);
        const expYear = parseInt(year);
        
        if (expMonth < 1 || expMonth > 12) return false;
        if (expYear < currentYear) return false;
        if (expYear === currentYear && expMonth < currentMonth) return false;
        
        return true;
    }

    function showFieldError(field, message) {
        field.classList.add('error');
        
        // Remover mensaje de error existente
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Agregar nuevo mensaje de error
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.cssText = `
            color: var(--error-color);
            font-size: 0.8rem;
            margin-top: 0.25rem;
        `;
        errorElement.textContent = message;
        field.parentNode.appendChild(errorElement);
    }

    function clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    function processOrder() {
        // Mostrar loading
        loadingOverlay.style.display = 'flex';
        
        // Simular procesamiento del pedido
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            successModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Actualizar steps
            document.querySelectorAll('.step')[2].classList.add('active');
            
            // En una aplicación real, aquí se enviaría la información al servidor
            console.log('Pedido procesado exitosamente');
        }, 3000);
    }

    function showFeedback(message, type = 'success') {
        // Crear elemento de feedback
        const feedback = document.createElement('div');
        feedback.className = `feedback-message ${type}`;
        feedback.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        // Estilos del feedback
        feedback.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : 'var(--primary-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            max-width: 400px;
        `;
        
        document.body.appendChild(feedback);
        
        // Remover después de 4 segundos
        setTimeout(() => {
            feedback.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 4000);
    }

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === successModal) {
            successModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Prevenir envío del formulario
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
        });
    });
});

// Agregar estilos de animación para feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .field-error {
        color: var(--error-color);
        font-size: 0.8rem;
        margin-top: 0.25rem;
    }
    
    input.error, select.error, textarea.error {
        border-color: var(--error-color) !important;
    }
`;
document.head.appendChild(style);