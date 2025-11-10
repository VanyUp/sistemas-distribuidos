// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
console.log('Carrito.js cargado correctamente');

    // Establecer año actual en el footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Elementos del DOM
    const cartItems = document.querySelectorAll('.cart-item');
    const clearCartBtn = document.getElementById('clearCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const applyPromoBtn = document.getElementById('applyPromo');
    const emptyCartState = document.getElementById('emptyCart');
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Inicializar carrito
    initializeCart();

    // Controladores de cantidad
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.dataset.action;
            const input = this.parentElement.querySelector('.quantity-input');
            let value = parseInt(input.value);
            
            if (action === 'increase') {
                value = Math.min(value + 1, parseInt(input.max) || 10);
            } else if (action === 'decrease') {
                value = Math.max(value - 1, parseInt(input.min) || 1);
            }
            
            input.value = value;
            updateItemTotal(this.closest('.cart-item'));
            updateCartSummary();
        });
    });

    // Input de cantidad manual
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            let value = parseInt(this.value);
            const min = parseInt(this.min) || 1;
            const max = parseInt(this.max) || 10;
            
            if (isNaN(value) || value < min) value = min;
            if (value > max) value = max;
            
            this.value = value;
            updateItemTotal(this.closest('.cart-item'));
            updateCartSummary();
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.value = this.min || 1;
                updateItemTotal(this.closest('.cart-item'));
                updateCartSummary();
            }
        });
    });

    // Eliminar item individual
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            removeCartItem(cartItem);
        });
    });

    // Mover a favoritos
    document.querySelectorAll('.move-to-wishlist').forEach(button => {
        button.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const itemTitle = cartItem.querySelector('.item-title').textContent;
            
            showFeedback(`"${itemTitle}" movido a favoritos`);
            removeCartItem(cartItem);
            updateWishlistCount(true);
        });
    });

    // Vaciar carrito
    clearCartBtn.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres vaciar tu carrito?')) {
            document.querySelectorAll('.cart-item').forEach(item => {
                removeCartItem(item, false);
            });
            
            setTimeout(() => {
                showEmptyCartState();
            }, 300);
            
            showFeedback('Carrito vaciado correctamente');
        }
    });

    // Aplicar código promocional
    applyPromoBtn.addEventListener('click', function() {
        const promoCode = document.getElementById('promoCode').value.trim();
        
        if (!promoCode) {
            showFeedback('Por favor ingresa un código de descuento', 'error');
            return;
        }
        
        // Simular validación de código
        const validCodes = {
            'VANSE10': 0.1,
            'LIBRO15': 0.15,
            'BIENVENIDO20': 0.2
        };
        
        if (validCodes[promoCode.toUpperCase()]) {
            const discount = validCodes[promoCode.toUpperCase()];
            applyDiscount(discount, promoCode.toUpperCase());
            showFeedback(`¡Código ${promoCode.toUpperCase()} aplicado! ${discount * 100}% de descuento`);
        } else {
            showFeedback('Código de descuento inválido', 'error');
        }
    });

    // Proceder al pago
    checkoutBtn.addEventListener('click', function() {
        if (document.querySelectorAll('.cart-item').length === 0) {
            showFeedback('Tu carrito está vacío', 'error');
            return;
        }
        
        // Simular proceso de checkout
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        this.disabled = true;
        
        setTimeout(() => {
            showFeedback('¡Compra realizada con éxito! Redirigiendo...');
            setTimeout(() => {
                // En una aplicación real, aquí redirigiríamos a la página de confirmación
                console.log('Redirigiendo a página de confirmación...');
                this.innerHTML = '<i class="fas fa-lock"></i> Proceder al Pago';
                this.disabled = false;
            }, 2000);
        }, 2000);
    });

    // Añadir libro recomendado
    document.querySelectorAll('.add-recommended').forEach(button => {
        button.addEventListener('click', function() {
            const recommendedBook = this.closest('.recommended-book');
            const bookTitle = recommendedBook.querySelector('.book-title').textContent;
            const bookPrice = recommendedBook.querySelector('.book-price').textContent;
            
            // Simular añadir al carrito
            showFeedback(`"${bookTitle}" añadido al carrito`);
            updateCartCount();
            
            // Animación del botón
            this.innerHTML = '<i class="fas fa-check"></i>';
            this.style.background = 'var(--success-color)';
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-plus"></i>';
                this.style.background = '';
            }, 1500);
        });
    });

    // Modal de login
    loginBtn.addEventListener('click', function() {
        loginModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    closeModal.addEventListener('click', function() {
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Menú hamburguesa
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        const icon = this.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
            document.body.style.overflow = 'hidden';
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            document.body.style.overflow = 'auto';
        }
    });

    // Funciones de utilidad
    function initializeCart() {
        updateCartSummary();
        updateProgressBar();
    }

    function updateItemTotal(cartItem) {
        const quantity = parseInt(cartItem.querySelector('.quantity-input').value);
        const priceText = cartItem.querySelector('.current-price').textContent;
        const price = parseFloat(priceText.replace('$', '').replace('.', '').replace(',', '.'));
        
        // En una aplicación real, aquí actualizaríamos el total del item
        console.log(`Actualizando item: ${quantity} x $${price}`);
    }

    function updateCartSummary() {
        let subtotal = 0;
        let totalItems = 0;
        
        document.querySelectorAll('.cart-item').forEach(item => {
            const quantity = parseInt(item.querySelector('.quantity-input').value);
            const priceText = item.querySelector('.current-price').textContent;
            const price = parseFloat(priceText.replace('$', '').replace('.', '').replace(',', '.'));
            
            subtotal += price * quantity;
            totalItems += quantity;
        });
        
        // Actualizar contadores
        document.querySelector('.section-header h2').textContent = `Tus Productos (${totalItems})`;
        document.querySelector('.summary-row:first-child span:last-child').textContent = `$${subtotal.toLocaleString()}`;
        
        // Calcular total (con descuento si existe)
        const discountElement = document.querySelector('.discount');
        let discount = 0;
        
        if (discountElement) {
            const discountText = discountElement.textContent;
            discount = parseFloat(discountText.replace('-$', '').replace('.', '').replace(',', '.'));
        }
        
        const total = subtotal - discount;
        document.querySelector('.summary-row.total span:last-child').textContent = `$${total.toLocaleString()}`;
        
        updateProgressBar(subtotal);
        updateCartCount(totalItems);
    }

    function updateProgressBar(subtotal = null) {
        if (subtotal === null) {
            // Calcular subtotal si no se proporciona
            subtotal = 0;
            document.querySelectorAll('.cart-item').forEach(item => {
                const quantity = parseInt(item.querySelector('.quantity-input').value);
                const priceText = item.querySelector('.current-price').textContent;
                const price = parseFloat(priceText.replace('$', '').replace('.', '').replace(',', '.'));
                subtotal += price * quantity;
            });
        }
        
        const freeShippingThreshold = 50000; // $50.000
        const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
        const remaining = freeShippingThreshold - subtotal;
        
        document.querySelector('.progress-fill').style.width = `${progress}%`;
        
        if (remaining > 0) {
            document.querySelector('.progress-text span').textContent = 
                `¡Faltan $${remaining.toLocaleString()} para envío gratis!`;
        } else {
            document.querySelector('.progress-text span').textContent = 
                '¡Felicidades! Tienes envío gratis';
        }
    }

    function removeCartItem(cartItem, animate = true) {
        if (animate) {
            cartItem.classList.add('removing');
            
            setTimeout(() => {
                cartItem.remove();
                updateCartSummary();
                
                if (document.querySelectorAll('.cart-item').length === 0) {
                    showEmptyCartState();
                }
            }, 300);
        } else {
            cartItem.remove();
        }
    }

    function showEmptyCartState() {
        document.querySelector('.cart-layout').style.display = 'none';
        document.querySelector('.page-header').style.display = 'none';
        document.querySelector('.breadcrumb').style.display = 'none';
        emptyCartState.style.display = 'flex';
    }

    function applyDiscount(discountPercentage, promoCode) {
        const subtotalElement = document.querySelector('.summary-row:first-child span:last-child');
        const subtotalText = subtotalElement.textContent;
        const subtotal = parseFloat(subtotalText.replace('$', '').replace('.', '').replace(',', '.'));
        
        const discount = subtotal * discountPercentage;
        const total = subtotal - discount;
        
        // Actualizar o crear fila de descuento
        let discountRow = document.querySelector('.summary-row .discount');
        if (!discountRow) {
            const subtotalRow = document.querySelector('.summary-row:first-child');
            discountRow = document.createElement('div');
            discountRow.className = 'summary-row';
            discountRow.innerHTML = `
                <span>Descuento (${promoCode})</span>
                <span class="discount">-$${Math.round(discount).toLocaleString()}</span>
            `;
            subtotalRow.parentNode.insertBefore(discountRow, subtotalRow.nextSibling);
        } else {
            discountRow.textContent = `-$${Math.round(discount).toLocaleString()}`;
        }
        
        document.querySelector('.summary-row.total span:last-child').textContent = `$${Math.round(total).toLocaleString()}`;
        
        // Deshabilitar input de promo
        document.getElementById('promoCode').disabled = true;
        document.getElementById('applyPromo').disabled = true;
    }

    function updateCartCount(count = null) {
        const cartBtn = document.getElementById('cartBtn');
        const badge = cartBtn.querySelector('.icon-badge');
        
        if (count === null) {
            // Calcular count si no se proporciona
            count = 0;
            document.querySelectorAll('.cart-item').forEach(item => {
                count += parseInt(item.querySelector('.quantity-input').value);
            });
        }
        
        badge.textContent = count;
        
        if (count === 0) {
            badge.style.display = 'none';
            cartBtn.classList.remove('active');
        } else {
            badge.style.display = 'flex';
            cartBtn.classList.add('active');
        }
    }

    function updateWishlistCount(add = true) {
        const wishlistBtn = document.getElementById('wishlistBtn');
        const badge = wishlistBtn.querySelector('.icon-badge');
        let count = parseInt(badge.textContent) || 0;
        
        count = add ? count + 1 : Math.max(0, count - 1);
        badge.textContent = count;
        
        if (count === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'flex';
        }
    }

    function showFeedback(message, type = 'success') {
        // Crear elemento de feedback
        const feedback = document.createElement('div');
        feedback.className = `feedback-message ${type}`;
        feedback.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        
        // Estilos del feedback
        feedback.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--error-color)'};
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
        
        // Remover después de 3 segundos
        setTimeout(() => {
            feedback.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 3000);
    }

    // Búsqueda en tiempo real
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.trim()) {
                    console.log('Buscando:', this.value);
                    // Aquí iría la lógica de búsqueda real
                }
            }, 500);
        });
    }

    // Efecto de scroll en el header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'var(--surface-color)';
            header.style.backdropFilter = 'none';
        }
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
    
    .cart-item.removing {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);