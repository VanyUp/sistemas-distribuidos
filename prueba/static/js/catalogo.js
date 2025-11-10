// ===============================
// Cargar y mostrar libros
// ===============================
async function cargarLibros() {
    try {
        const response = await fetch('/api/catalogo');
        const libros = await response.json();
        console.log("Libros cargados:", libros);
        mostrarLibros(libros);
    } catch (error) {
        console.error("Error cargando catálogo:", error);
    }
}

function mostrarLibros(libros) {
    const grid = document.getElementById("booksGrid");
    if (!grid) {
        console.error("No se encontró el contenedor con id 'booksGrid'");
        return;
    }

    grid.innerHTML = "";

    libros.forEach(libro => {
        const card = document.createElement("div");
        card.classList.add("book-card");

        card.innerHTML = `
            <div class="book-image">
                <img src="${libro.portada}" alt="${libro.nombre}">
            </div>
            <div class="book-info">
                <h3 class="book-title">${libro.nombre}</h3>
                <p class="book-author">${libro.autor}</p>
                <div class="book-price">
                    <span class="current-price">$${libro.precio}</span>
                </div>
                <button class="btn btn-primary btn-full add-to-cart">
                    <i class="fas fa-cart-plus"></i>
                    Añadir al Carrito
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ===============================
// Inicialización al cargar DOM
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Catálogo de libros cargado');

    // Mostrar libros
    cargarLibros();

    // Año actual en el footer
    const year = document.getElementById('currentYear');
    if (year) year.textContent = new Date().getFullYear();

    // Elementos del DOM
    const booksGrid = document.getElementById('booksGrid');
    const viewButtons = document.querySelectorAll('.view-btn');
    const sortSelect = document.getElementById('sort');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const applyPriceBtn = document.getElementById('applyPrice');
    const wishlistButtons = document.querySelectorAll('.wishlist-btn');
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');

    // Toggle vista (grid/list)
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const viewType = this.dataset.view;
            booksGrid.classList.toggle('list-view', viewType === 'list');
        });
    });

    // Ordenamiento simulado
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            console.log('Ordenando por:', this.value);
            showFeedback('Productos ordenados correctamente');
        });
    }

    // Limpiar filtros
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
            document.querySelectorAll('input[type="radio"]').forEach(r => {
                if (r.value === 'all') r.checked = true;
            });
            document.getElementById('minPrice').value = '';
            document.getElementById('maxPrice').value = '';
            showFeedback('Filtros limpiados correctamente');
        });
    }

    // Filtro de precio
    if (applyPriceBtn) {
        applyPriceBtn.addEventListener('click', function() {
            const minPrice = document.getElementById('minPrice').value;
            const maxPrice = document.getElementById('maxPrice').value;
            if (minPrice || maxPrice) {
                console.log('Filtrando por precio:', minPrice, '-', maxPrice);
                showFeedback('Filtro de precio aplicado');
            }
        });
    }

    // Wishlist toggle
    wishlistButtons.forEach(button => {
        button.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const isActive = icon.classList.contains('fas');
            if (isActive) {
                icon.classList.replace('fas', 'far');
                showFeedback('Removido de favoritos');
            } else {
                icon.classList.replace('far', 'fas');
                showFeedback('Agregado a favoritos');
            }
            updateWishlistCount(!isActive);
        });
    });

    // Modal login
    if (loginBtn && loginModal && closeModal) {
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
    }

    // Búsqueda
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.trim()) {
                    console.log('Buscando:', this.value);
                }
            }, 500);
        });
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.querySelector('.search-btn').click();
            }
        });
    }

    // Efecto header scroll
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (!header) return;
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'var(--surface-color)';
            header.style.backdropFilter = 'none';
        }
    });
});

// ===============================
// Utilidades visuales
// ===============================
function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-message';
    feedback.innerHTML = `<i class="fas fa-check-circle"></i>${message}`;
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
    setTimeout(() => {
        feedback.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => feedback.remove(), 300);
    }, 3000);
}

function updateWishlistCount(add) {
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (!wishlistBtn) return;
    const badge = wishlistBtn.querySelector('.icon-badge');
    let count = parseInt(badge.textContent) || 0;
    count = add ? count + 1 : Math.max(0, count - 1);
    badge.textContent = count;
    badge.style.display = count === 0 ? 'none' : 'flex';
}

// ===============================
// Animaciones de feedback
// ===============================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
