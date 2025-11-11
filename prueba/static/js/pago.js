// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', async function () {
    console.log('pago.js cargado correctamente');

    const userId = localStorage.getItem("user_id");

    if (!userId) {
        alert("Debes iniciar sesión para ver tu carrito");
        window.location.href = "/";
        return;
    }

    // Establecer año actual en el footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Elementos del DOM
    const completeOrderBtn = document.getElementById('completeOrderBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const successModal = document.getElementById('successModal');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    const trackOrderBtn = document.getElementById('trackOrderBtn');
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
            cardNumberInput.addEventListener('input', function (e) {
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
            expiryDateInput.addEventListener('input', function (e) {
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
            cvvInput.addEventListener('input', function (e) {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
            });
        }
    }

    function initializeEventListeners() {
        // Tabs de pago
        tabHeaders.forEach(header => {
            header.addEventListener('click', function () {
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
        acceptTerms.addEventListener('change', function () {
            completeOrderBtn.disabled = !this.checked;
        });

        // Completar pedido
        completeOrderBtn.addEventListener('click', function (e) {
            e.preventDefault();

            if (!validateForms()) {
                showFeedback('Por favor completa todos los campos requeridos correctamente', 'error');
                return;
            }

            processOrder();
        });

        // Continuar comprando
        continueShoppingBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = '/catalogo';
        });

        // Soporte
        supportBtn.addEventListener('click', function () {
            showFeedback('¿Necesitas ayuda? Contáctanos en soporte@vansebook.com', 'info');
        });

        // Validación en tiempo real de formularios
        setupRealTimeValidation();
    }

    function setupRealTimeValidation() {
        // Validación de email
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', function () {
                validateEmail(this);
            });
        }

        // Validación de teléfono
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('blur', function () {
                validatePhone(this);
            });
        }

        // Validación de campos requeridos
        const requiredInputs = document.querySelectorAll('input[required], select[required]');
        requiredInputs.forEach(input => {
            input.addEventListener('blur', function () {
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

    function getCardType(number) {
        const re = {
            visa: /^4/,
            mastercard: /^5[1-5]/,
            amex: /^3[47]/
        };
        if (re.visa.test(number)) return 'Visa';
        if (re.mastercard.test(number)) return 'MasterCard';
        if (re.amex.test(number)) return 'Amex';
        return 'Tarjeta';
    }

    function getEstimatedDelivery(method) {
        const today = new Date();
        let deliveryDate = new Date();
        switch (method) {
            case 'standard':
                deliveryDate.setDate(today.getDate() + 7);
                break;
            case 'express':
                deliveryDate.setDate(today.getDate() + 3);
                break;
            case 'next-day':
                deliveryDate.setDate(today.getDate() + 1);
                break;
            default:
                deliveryDate.setDate(today.getDate() + 5);
        }

        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return deliveryDate.toLocaleDateString('es-CO', options);
    }

    async function processOrder() {
        // Mostrar overlay de carga
        loadingOverlay.style.display = 'flex';

        // Recolectar info de envío
        const shippingData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),
            city: document.getElementById('city').value.trim(),
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value.trim(),
            country: document.getElementById('country').value,
            notes: document.getElementById('orderNotes').value.trim(),
            shipping_method: document.querySelector('input[name="shipping"]:checked').value,
            payment_method: document.querySelector('.tab-content.active').id.replace('-tab', ''), // card, paypal, pse
            user_id: parseInt(localStorage.getItem("user_id")),
            total: parseInt(document.querySelector(".summary-row.total span:last-child").textContent.replace(/\D/g, ""))
        };

        // Opcional: obtener últimos 4 dígitos de la tarjeta si el método es 'card'
        const cardNumber = document.getElementById('cardNumber')?.value.replace(/\s/g, '');
        if (shippingData.payment_method === 'card' && cardNumber) {
            shippingData.card_last4 = cardNumber.slice(-4);
            shippingData.card_type = getCardType(cardNumber);
        }

        try {
            const res = await fetch('/pedidos/crear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shippingData)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || 'Error al crear el pedido');

            // Vaciar carrito
            await fetch(`/carrito/${shippingData.user_id}/vaciar`, { method: 'POST' });

            // Mostrar modal de éxito con info dinámica
            loadingOverlay.style.display = 'none';
            successModal.style.display = 'block';
            document.body.style.overflow = 'hidden';

            // Actualizar steps
            document.querySelectorAll('.step')[2].classList.add('active');

            // Llenar modal con la información real
            successModal.querySelector(".order-number strong").textContent = data.codigo_pedido;
            successModal.querySelector('.success-message strong').textContent = shippingData.email;
            successModal.querySelector('.order-details .detail-item:nth-child(1) span').textContent =
                getEstimatedDelivery(shippingData.shipping_method);
            successModal.querySelector('.order-details .detail-item:nth-child(2) span').textContent =
                `${shippingData.address}, ${shippingData.city}`;
            successModal.querySelector('.order-details .detail-item:nth-child(3) span').textContent =
                shippingData.payment_method === 'card'
                    ? `${shippingData.card_type} terminada en ${shippingData.card_last4}`
                    : shippingData.payment_method.toUpperCase();

            showFeedback('✅ Pedido creado exitosamente');

        } catch (err) {
            loadingOverlay.style.display = 'none';
            console.error('Error procesando el pedido:', err);
            showFeedback(err.message || 'Ocurrió un error', 'error');
        }
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
    window.addEventListener('click', function (event) {
        if (event.target === successModal) {
            successModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Prevenir envío del formulario
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
        });
    });

    const itemsContainer = document.querySelector(".order-items");
    const summaryContainer = document.querySelector(".summary-details");
    const emptyCart = document.getElementById("emptyCart");

    try {
        const res = await fetch(`/carrito/${userId}`);
        const items = await res.json();

        // Si no hay productos
        if (!items || items.length === 0) {
            emptyCart.style.display = "flex";
            document.querySelector(".order-summary").style.display = "none";
            return;
        }

        // Limpiamos
        itemsContainer.innerHTML = "";
        let subtotal = 0;

        items.forEach((item) => {
            const libro = item.libros;
            const totalItem = item.cantidad * item.precio_unitario;
            subtotal += totalItem;

            const div = document.createElement("div");
            div.classList.add("order-items");
            div.innerHTML = `
                        <div class="order-item">
                            <div class="item-image">
                                <img src="${libro.portada || '../static/img/default-book.jpg'}" alt="${libro.titulo}">
                            </div>
                            <div class="item-details">
                                <span class="item-title">${libro.titulo}</span>
                                <span class="item-author">${libro.autor}</span>
                                <span class="item-quantity">Cantidad: ${item.cantidad}</span>
                            </div>
                            <span class="item-price">$${libro.precio.toLocaleString()}</span>
                        </div>
                            `;
            itemsContainer.appendChild(div);
        });

        // Actualizamos resumen
        const descuentoGuardado = parseInt(localStorage.getItem("descuento")) || 0;
        const total = subtotal - descuentoGuardado; // puedes sumar envío o descuento si aplica
        summaryContainer.innerHTML = `
            <div class="summary-row">
                <span>Subtotal (${items.length} productos)</span>
                <span>$${subtotal.toLocaleString()}</span>
            </div>
            <div class="summary-row">
                <span>Envío</span>
                <span class="free-shipping">Gratis</span>
            </div>
            <div class="summary-row">
                <span>Descuento</span>
                <span class="discount">-$${descuentoGuardado.toLocaleString()}</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>$${total.toLocaleString()}</span>
            </div>
        `;

        const shippingRadios = document.querySelectorAll('input[name="shipping"]');

        shippingRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                let shippingCost = 0;

                if (radio.value === "express") {
                    shippingCost = 12900;
                } else if (radio.value === "next-day") {
                    shippingCost = 24900;
                } else {
                    shippingCost = 0; // Envío estándar gratis
                }

                // Guardamos en localStorage para usarlo en la página de pago
                localStorage.setItem("shipping_cost", shippingCost);

                // Actualizamos el resumen
                const subtotal = parseInt(
                    document.querySelector(".summary-row:first-child span:last-child")
                        .textContent.replace(/\D/g, "")
                );

                const descuento = parseInt(localStorage.getItem("descuento")) || 0;
                const total = subtotal - descuento + shippingCost;

                document.querySelector(".summary-row:nth-child(2) span:last-child").textContent =
                    shippingCost > 0 ? `$${shippingCost.toLocaleString()}` : "Gratis";

                document.querySelector(".summary-row.total span:last-child").textContent =
                    `$${total.toLocaleString()}`;
            });
        });

    } catch (err) {
        console.error("Error cargando carrito:", err);
    }
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