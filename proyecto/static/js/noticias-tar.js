// Noticias de Tarot - Funcionalidades

// Función para mostrar notificaciones
function showNotification(message) {
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: linear-gradient(135deg, #883aed, #9a06d4);
            color: white;
            border-radius: 14px;
            box-shadow: 0 4px 15px rgba(136, 58, 237, 0.4);
            z-index: 1000;
            transform: translateX(150%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            font-size: 14px;
        `;
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.transform = 'translateX(0)';

    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function () {
    // Elementos de la interfaz
    const chatBtn = document.getElementById('chatBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const readMoreBtns = document.querySelectorAll('.read-more');
    const loadMoreBtn = document.querySelector('.load-more .btn');
    const searchBtn = document.querySelector('.search-btn');
    const newsletterBtn = document.querySelector('.newsletter-form .btn');
    const featuredReadBtn = document.querySelector('.featured-content .btn');

    // Filtrado de noticias
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remover clase active de todos los botones
            filterBtns.forEach(b => b.classList.remove('active'));
            // Agregar clase active al botón clickeado
            this.classList.add('active');

            const category = this.textContent;
            showNotification(`Filtrando por: ${category}`);

            // Aquí iría la lógica real de filtrado
            simulateFiltering(category);
        });
    });

    // Botones "Leer más"
    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const card = this.closest('.news-card');
            const title = card.querySelector('h5').textContent;
            showNotification(`Abriendo artículo: "${title}"`);
        });
    });

    // Botón "Cargar más"
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function () {
            showNotification('Cargando más noticias...');
            simulateLoadMore();
        });
    }

    // Búsqueda
    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            const searchInput = document.querySelector('.search-bar input');
            if (searchInput.value.trim()) {
                showNotification(`Buscando: "${searchInput.value}"`);
            } else {
                showNotification('Por favor, ingresa un término de búsqueda');
            }
        });
    }

    // Newsletter
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', function () {
            const emailInput = document.querySelector('.newsletter-form input');
            if (emailInput.value.trim() && isValidEmail(emailInput.value)) {
                showNotification('¡Gracias por suscribirte a nuestro newsletter!');
                emailInput.value = '';
            } else {
                showNotification('Por favor, ingresa un email válido');
            }
        });
    }

    // Artículo destacado
    if (featuredReadBtn) {
        featuredReadBtn.addEventListener('click', function () {
            const title = document.querySelector('.featured-content h4').textContent;
            showNotification(`Leyendo artículo destacado: "${title}"`);
        });
    }

    // Botón chat
    chatBtn.addEventListener('click', function () {
        window.location.href = "/chat-tar";
    });

    // Navegación
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
});