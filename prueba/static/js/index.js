// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function () {
    console.log('index.js cargado correctamente');

    // Establecer año actual en el footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Elementos del DOM
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Abrir modal de login
    loginBtn.addEventListener('click', function () {
        loginModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    // Abrir modal de registro
    registerBtn.addEventListener('click', function () {
        registerModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    // Cerrar modales
    closeButtons.forEach(button => {
        button.addEventListener('click', function () {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function (event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (event.target === registerModal) {
            registerModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Menú hamburguesa para móviles
    hamburger.addEventListener('click', function () {
        navMenu.classList.toggle('active');

        // Animación simple del ícono hamburguesa
        const icon = hamburger.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
            navMenu.style.display = 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '100%';
            navMenu.style.left = '0';
            navMenu.style.right = '0';
            navMenu.style.background = 'var(--surface-color)';
            navMenu.style.padding = '2rem';
            navMenu.style.boxShadow = 'var(--shadow)';
            document.body.style.overflow = 'hidden'; // Prevenir scroll
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            navMenu.style.display = 'none';
            document.body.style.overflow = 'auto'; // Permitir scroll
        }
    });

    // Event listeners para botones móviles
    document.getElementById('loginBtnMobile')?.addEventListener('click', function () {
        loginModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        hamburger.click(); // Cerrar menú
    });

    document.getElementById('registerBtnMobile')?.addEventListener('click', function () {
        registerModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        hamburger.click(); // Cerrar menú
    });

    // Smooth scroll para enlaces de navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Cerrar menú móvil si está abierto
                if (navMenu.classList.contains('active')) {
                    hamburger.click();
                }
            }
        });
    });

    // Efecto de scroll en el header
    window.addEventListener('scroll', function () {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'var(--surface-color)';
            header.style.backdropFilter = 'none';
        }
    });

    // Animación de aparición para elementos al hacer scroll
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

    // Observar elementos para animación
    document.querySelectorAll('.feature-card, .category-card, .book-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Validación básica de formularios
    document.querySelectorAll('.auth-form').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const inputs = this.querySelectorAll('input[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#e53e3e';
                } else {
                    input.style.borderColor = 'var(--border-color)';
                }
            });

            // Validar contraseñas en registro
            const passwordInputs = this.querySelectorAll('input[type="password"]');
            if (passwordInputs.length > 1) {
                const password = passwordInputs[0].value;
                const confirmPassword = passwordInputs[1].value;

                if (password !== confirmPassword) {
                    isValid = false;
                    passwordInputs[1].style.borderColor = '#e53e3e';
                    alert('Las contraseñas no coinciden');
                }
            }

            if (isValid) {
                // Simular envío exitoso
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;

                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
                submitBtn.disabled = true;

                setTimeout(() => {
                    alert('¡Formulario enviado con éxito!');
                    this.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;

                    // Cerrar modal
                    const modal = this.closest('.modal');
                    if (modal) {
                        modal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }
                }, 1500);
            }
        });
    });

    // Efecto hover mejorado para botones de añadir al carrito
    document.querySelectorAll('.btn-small').forEach(button => {
        button.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.05)';
        });

        button.addEventListener('mouseleave', function () {
            this.style.transform = 'scale(1)';
        });
    });

    // Búsqueda en tiempo real (simulada)
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            // Aquí iría la lógica de búsqueda en tiempo real
            console.log('Buscando:', this.value);
        });

        // Buscar al presionar Enter
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                document.querySelector('.search-btn').click();
            }
        });
    }

    // Simular funcionalidad de búsqueda
    document.querySelector('.search-btn').addEventListener('click', function () {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            alert(`Buscando: "${searchTerm}"\n\nEsta funcionalidad estaría conectada a una base de datos real en producción.`);
        } else {
            searchInput.focus();
        }
    });

    // --- LOGIN USUARIO ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value;

            try {
                const res = await fetch("/usuarios/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                if (!res.ok) {
                    const error = await res.json();
                    alert(error.detail || "Error al iniciar sesión");
                    return;
                }

                window.location.href = "/catalogo";

            } catch (err) {
                console.error(err);
                alert("Error en el servidor");
            }
        });
    }


    // --- REGISTRO USUARIO ---
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("registerUsername").value.trim();
            const email = document.getElementById("registerEmail").value.trim();
            const password = document.getElementById("registerPassword").value;
            const confirm = document.getElementById("registerPasswordConfirm").value;

            if (password !== confirm) {
                alert("Las contraseñas no coinciden ❌");
                return;
            }

            try {
                const res = await fetch("/usuarios/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password })
                });

                if (!res.ok) {
                    const error = await res.json();
                    alert(error.detail || "Error al registrar usuario");
                    return;
                }

                alert("Cuenta creada con éxito 🎉");
                registerModal.style.display = "none";
                document.body.style.overflow = "auto";

            } catch (err) {
                console.error(err);
                alert("Error en el servidor");
            }
        });
    }
});