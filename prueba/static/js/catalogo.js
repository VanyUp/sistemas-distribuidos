// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Catálogo de libros cargado');

    // Establecer año actual en el footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Elementos del DOM
    const booksGrid = document.getElementById('booksGrid');
    const viewButtons = document.querySelectorAll('.view-btn');
    const sortSelect = document.getElementById('sort');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const applyPriceBtn = document.getElementById('applyPrice');
    const wishlistButtons = document.querySelectorAll('.wishlist-btn');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');

    // Toggle de vista (Grid/List)
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover clase active de todos los botones
            viewButtons.forEach(btn => btn.classList.remove('active'));
            // Agregar clase active al botón clickeado
            this.classList.add('active');
            // Cambiar vista
            const viewType = this.dataset.view;
            booksGrid.classList.toggle('list-view', viewType === 'list');
        });
    });

    // Ordenamiento
    sortSelect.addEventListener('change', function() {
        // Simular ordenamiento (en una app real aquí iría una petición al servidor)
        console.log('Ordenando por:', this.value);
        showSortingFeedback();
    });

    // Limpiar filtros
    clearFiltersBtn.addEventListener('click', function() {
        // Limpiar checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Limpiar radios
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            if (radio.value === 'all') radio.checked = true;
        });
        
        // Limpiar inputs de precio
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        
        showFeedback('Filtros limpiados correctamente');
    });

    // Aplicar filtro de precio
    applyPriceBtn.addEventListener('click', function() {
        const minPrice = document.getElementById('minPrice').value;
        const maxPrice = document.getElementById('maxPrice').value;
        
        if (minPrice || maxPrice) {
            console.log('Filtrando por precio:', minPrice, '-', maxPrice);
            showFeedback('Filtro de precio aplicado');
        }
    });

    // Wishlist toggle
    wishlistButtons.forEach(button => {
        button.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const isActive = icon.classList.contains('fas');
            
            if (isActive) {
                icon.classList.replace('fas', 'far');
                icon.classList.replace('fa-heart', 'fa-heart');
                showFeedback('Removido de favoritos');
            } else {
                icon.classList.replace('far', 'fas');
                icon.classList.replace('fa-heart', 'fa-heart');
                showFeedback('Agregado a favoritos');
            }
            
            // Actualizar contador (simulado)
            updateWishlistCount(!isActive);
        });
    });

    // Añadir al carrito
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookCard = this.closest('.book-card');
            const bookTitle = bookCard.querySelector('.book-title').textContent;
            const bookPrice = bookCard.querySelector('.current-price').textContent;
            
            // Animación de añadir al carrito
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Añadiendo...';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Añadido';
                this.style.background = '#38A169';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-cart-plus"></i> Añadir al Carrito';
                    this.style.background = '';
                    this.disabled = false;
                }, 1500);
                
                showFeedback(`"${bookTitle}" añadido al carrito`);
                updateCartCount();
            }, 1000);
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

    // Funciones de utilidad
    function showSortingFeedback() {
        showFeedback('Productos ordenados correctamente');
    }

    function showFeedback(message) {
        // Crear elemento de feedback
        const feedback = document.createElement('div');
        feedback.className = 'feedback-message';
        feedback.innerHTML = `
            <i class="fas fa-check-circle"></i>
            ${message}
        `;
        
        // Estilos del feedback
        feedback.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
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

    function updateWishlistCount(add) {
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

    function updateCartCount() {
        const cartBtn = document.getElementById('cartBtn');
        const badge = cartBtn.querySelector('.icon-badge');
        let count = parseInt(badge.textContent) || 0;
        
        count += 1;
        badge.textContent = count;
        badge.style.display = 'flex';
        
        // Animación del badge
        badge.style.transform = 'scale(1.2)';
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, 300);
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
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.querySelector('.search-btn').click();
            }
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

    // Animación de aparición para libros
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar libros para animación
    document.querySelectorAll('.book-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.6s ease, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
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
`;
document.head.appendChild(style);