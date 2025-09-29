// PsyTarot - Funcionalidades principales


    const API = "https://sistemas-distribuidos-lcpe.onrender.com";

document.addEventListener('DOMContentLoaded', function () {
    // Elementos de la interfaz
    const loginBtn = document.querySelector('.btn.secondary');
    const registerBtn = document.querySelector('.btn.primary');
    const exploreBtn = document.querySelector('.hero-buttons .btn.primary');
    const learnMoreBtn = document.querySelector('.hero-buttons .btn.secondary');
    const readMoreLinks = document.querySelectorAll('.read-more');
    

    // Manejo de botones de autenticación
    if (loginBtn) {
        loginBtn.addEventListener('click', function () {
            window.location.href = '/login'; // Redirigir a la página de login
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', function () {
            window.location.href = '/register'; // Redirigir a la página de registro
        });
    }

    // Botones de la sección hero
    if (exploreBtn) {
        exploreBtn.addEventListener('click', function () {
            // Navegar a la sección de exploración
            const newsSection = document.querySelector('.news-section');
            if (newsSection) {
                newsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function () {
            // Mostrar información adicional sobre PsyTarot
            showNotification('PsyTarot combina la sabiduría del tarot con principios de psicología moderna para ofrecerte herramientas de autoconocimiento y crecimiento personal.');
        });
    }

    // Enlaces "Leer más" de las noticias
    readMoreLinks.forEach(link => {
        link.addEventListener('click', async function (e) {
            window.location.href = '/login'; // Redirigir a la página de login
        });
    });

    // Efectos de hover mejorados para tarjetas de noticias
    const newsCards = document.querySelectorAll('.news-card');
    newsCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
    });

    // Función para mostrar notificaciones
    function showNotification(message) {
        // Crear elemento de notificación si no existe
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
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(109, 40, 217, 0.4);
                z-index: 1000;
                transform: translateX(150%);
                transition: transform 0.3s ease;
                max-width: 300px;
                font-family: 'Poppins', sans-serif;
                font-weight: 500;
            `;
            document.body.appendChild(notification);
        }

        // Establecer mensaje y mostrar notificación
        notification.textContent = message;
        notification.style.transform = 'translateX(0)';

        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(150%)';
        }, 3000);
    }

    // Efecto de scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animación de aparición gradual para elementos al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Aplicar animación a elementos que deben aparecer al hacer scroll
    const animatedElements = document.querySelectorAll('.news-card, .section-header');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
});