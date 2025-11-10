// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Perfil.js cargado correctamente');

    // Establecer año actual en el footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Elementos del DOM
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    const forms = document.querySelectorAll('.profile-form');
    const editAvatarBtn = document.getElementById('editAvatarBtn');
    const avatarModal = document.getElementById('avatarModal');
    const closeModal = document.querySelector('.close-modal');
    const uploadArea = document.getElementById('uploadArea');
    const avatarFile = document.getElementById('avatarFile');
    const avatarPreview = document.getElementById('avatarPreview');
    const previewImage = document.getElementById('previewImage');
    const saveAvatarBtn = document.getElementById('saveAvatar');
    const cancelUploadBtn = document.getElementById('cancelUpload');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    const newPasswordInput = document.getElementById('newPassword');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');

    // Inicializar funcionalidades
    initializeNavigation();
    initializeForms();
    initializeAvatarUpload();
    initializePasswordStrength();

    function initializeNavigation() {
        // Navegación entre secciones
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetSection = this.dataset.section;
                
                // Remover active de todos los items
                navItems.forEach(nav => nav.classList.remove('active'));
                contentSections.forEach(section => section.classList.remove('active'));
                
                // Agregar active al item clickeado
                this.classList.add('active');
                
                // Mostrar sección correspondiente
                document.getElementById(targetSection).classList.add('active');
                
                // Scroll to top de la sección
                document.getElementById(targetSection).scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    function initializeForms() {
        // Manejar envío de formularios
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                handleFormSubmit(this);
            });
        });

        // Botones de cancelar
        document.querySelectorAll('[id^="cancel"]').forEach(button => {
            button.addEventListener('click', function() {
                const form = this.closest('form');
                resetForm(form);
            });
        });

        // Toggle de contraseñas
        togglePasswordButtons.forEach(button => {
            button.addEventListener('click', function() {
                const input = this.parentElement.querySelector('input');
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    function initializeAvatarUpload() {
        // Abrir modal de avatar
        editAvatarBtn.addEventListener('click', function() {
            avatarModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });

        // Cerrar modal
        closeModal.addEventListener('click', closeAvatarModal);
        cancelUploadBtn.addEventListener('click', closeAvatarModal);

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', function(event) {
            if (event.target === avatarModal) {
                closeAvatarModal();
            }
        });

        // Manejar área de upload
        uploadArea.addEventListener('click', function() {
            avatarFile.click();
        });

        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--primary-color)';
            this.style.background = 'var(--background-color)';
        });

        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--border-color)';
            this.style.background = 'transparent';
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--border-color)';
            this.style.background = 'transparent';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleImageSelection(files[0]);
            }
        });

        // Manejar selección de archivo
        avatarFile.addEventListener('change', function(e) {
            if (this.files.length > 0) {
                handleImageSelection(this.files[0]);
            }
        });

        // Guardar avatar
        saveAvatarBtn.addEventListener('click', function() {
            saveAvatar();
        });
    }

    function initializePasswordStrength() {
        if (newPasswordInput && strengthFill && strengthText) {
            newPasswordInput.addEventListener('input', function() {
                updatePasswordStrength(this.value);
            });
        }
    }

    function handleFormSubmit(form) {
        const formId = form.id;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Mostrar estado de carga
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        submitBtn.disabled = true;
        
        // Simular envío al servidor
        setTimeout(() => {
            // En una aplicación real, aquí se enviarían los datos al servidor
            console.log(`Enviando formulario: ${formId}`, getFormData(form));
            
            // Mostrar feedback de éxito
            showFeedback('Cambios guardados correctamente', 'success');
            
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Marcar formulario como no modificado
            form.classList.remove('modified');
            
        }, 2000);
    }

    function getFormData(form) {
        const formData = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData[input.name] = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) {
                    formData[input.name] = input.value;
                }
            } else {
                formData[input.id] = input.value;
            }
        });
        
        return formData;
    }

    function resetForm(form) {
        form.reset();
        form.classList.remove('modified');
        showFeedback('Cambios descartados', 'info');
    }

    function closeAvatarModal() {
        avatarModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetAvatarUpload();
    }

    function handleImageSelection(file) {
        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showFeedback('Por favor selecciona una imagen JPG, PNG o GIF', 'error');
            return;
        }

        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showFeedback('La imagen debe ser menor a 5MB', 'error');
            return;
        }

        // Mostrar vista previa
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            uploadArea.style.display = 'none';
            avatarPreview.style.display = 'block';
            saveAvatarBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    function resetAvatarUpload() {
        uploadArea.style.display = 'block';
        avatarPreview.style.display = 'none';
        avatarFile.value = '';
        saveAvatarBtn.disabled = true;
    }

    function saveAvatar() {
        // Simular upload al servidor
        saveAvatarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
        saveAvatarBtn.disabled = true;
        
        setTimeout(() => {
            // En una aplicación real, aquí se subiría la imagen al servidor
            const newAvatarUrl = previewImage.src;
            
            // Actualizar avatar en la interfaz
            document.getElementById('userAvatar').src = newAvatarUrl;
            
            // Cerrar modal y mostrar feedback
            closeAvatarModal();
            showFeedback('Foto de perfil actualizada correctamente', 'success');
            
        }, 1500);
    }

    function updatePasswordStrength(password) {
        let strength = 0;
        let feedback = '';
        
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;
        
        // Actualizar barra de fuerza
        strengthFill.setAttribute('data-strength', strength);
        
        // Actualizar texto
        switch(strength) {
            case 0:
                feedback = 'Muy débil';
                break;
            case 1:
                feedback = 'Débil';
                break;
            case 2:
                feedback = 'Regular';
                break;
            case 3:
                feedback = 'Fuerte';
                break;
            case 4:
                feedback = 'Muy fuerte';
                break;
        }
        
        strengthText.textContent = feedback;
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

    // Detectar cambios en formularios para habilitar/deshabilitar botones
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        const submitBtn = form.querySelector('button[type="submit"]');
        const cancelBtn = form.querySelector('[id^="cancel"]');
        
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                form.classList.add('modified');
            });
            
            input.addEventListener('change', function() {
                form.classList.add('modified');
            });
        });
    });

    // Menú hamburguesa para móviles
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
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
    }

    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                hamburger.click();
            }
        });
    });

    // Gestión de sesiones (ejemplo)
    document.getElementById('manageSessions')?.addEventListener('click', function() {
        showFeedback('Redirigiendo a gestión de sesiones...', 'info');
        // En una aplicación real, aquí se redirigiría a la página de sesiones
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
    
    form.modified button[type="submit"] {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);