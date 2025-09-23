// PsyTarot - Funcionalidades principales

document.addEventListener('DOMContentLoaded', function() {
    // Elementos de la interfaz
    const loginBtn = document.querySelector('.btn.secondary');
    const registerBtn = document.querySelector('.btn.primary');
    const exploreBtn = document.querySelector('.hero-buttons .btn.primary');
    const learnMoreBtn = document.querySelector('.hero-buttons .btn.secondary');
    const readMoreLinks = document.querySelectorAll('.read-more');
    
    // Manejo de botones de autenticación
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            // Aquí iría la lógica para mostrar el modal de inicio de sesión
            console.log('Iniciar Sesión clickeado');
            // Por ahora, solo mostraremos un mensaje
            showNotification('Funcionalidad de inicio de sesión en desarrollo');
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            // Aquí iría la lógica para mostrar el modal de registro
            console.log('Registrarse clickeado');
            showNotification('Funcionalidad de registro en desarrollo');
        });
    }
    
    // Botones de la sección hero
    if (exploreBtn) {
        exploreBtn.addEventListener('click', function() {
            // Navegar a la sección de exploración
            const newsSection = document.querySelector('.news-section');
            if (newsSection) {
                newsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            // Mostrar información adicional sobre PsyTarot
            showNotification('PsyTarot combina la sabiduría del tarot con principios de psicología moderna para ofrecerte herramientas de autoconocimiento y crecimiento personal.');
        });
    }
    
    // Enlaces "Leer más" de las noticias
    readMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const cardTitle = this.closest('.news-card').querySelector('h4').textContent;
            showNotification(`Artículo "${cardTitle}" en desarrollo. Próximamente disponible.`);
        });
    });
    
    // Efectos de hover mejorados para tarjetas de noticias
    const newsCards = document.querySelectorAll('.news-card');
    newsCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
    });
    
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
    
    const observer = new IntersectionObserver(function(entries) {
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