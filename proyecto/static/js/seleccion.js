// Selección de Camino - PsyTarot

document.addEventListener('DOMContentLoaded', function() {
    const selectionCards = document.querySelectorAll('.selection-card');
    const cardButtons = document.querySelectorAll('.card-btn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Efecto de selección en tarjetas
    selectionCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('card-btn')) {
                // Remover selección anterior
                selectionCards.forEach(c => c.classList.remove('selected'));
                // Agregar selección actual
                this.classList.add('selected');
                
                const path = this.dataset.path;
                showSelectionFeedback(path);
            }
        });
    });

    // Botones de selección
    cardButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.selection-card');
            const path = card.dataset.path;
            
            selectPath(path);
        });
    });

    // Función para seleccionar camino
    function selectPath(path) {
        showNotification(`Redirigiendo a: ${getPathName(path)}`);
        
        // Simular redirección
        setTimeout(() => {
            switch(path) {
                case 'tarot':
                    window.location.href = '/chat-tar';
                    break;
                case 'psychology':
                    window.location.href = '/psychology';
                    break;
            }
        }, 1000);
    }

    // Función para mostrar feedback de selección
    function showSelectionFeedback(path) {
        const messages = {
            tarot: '✨ Has seleccionado el camino del Tarot',
            psychology: '🧠 Has seleccionado el camino de la Psicología'
        };
        
        showNotification(messages[path]);
    }

    // Función auxiliar para nombres de rutas
    function getPathName(path) {
        const names = {
            tarot: 'Tarot',
            psychology: 'Psicología'
        };
        return names[path];
    }

    // Función de notificación (reutilizable)
    function showNotification(message) {
        let notification = document.querySelector('.selection-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'selection-notification';
            notification.style.cssText = `
                position: fixed;
                top: 750px;
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

    // Efectos de hover mejorados
    selectionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });

    // Manejo de botón de logout
    logoutBtn.addEventListener('click', function() {
        showNotification('Cerrando sesión...');
        setTimeout(() => {
            window.location.href = '/login'; // Redirigir a la página de login
        }, 1000);
    });
});