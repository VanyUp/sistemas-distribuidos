// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard script cargado');

    // Elementos del DOM
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    const refreshBtn = document.getElementById('refreshDashboard');
    const logoutBtn = document.getElementById('logoutBtn');
    const addBookBtn = document.getElementById('addBookBtn');
    const addBookModal = document.getElementById('addBookModal');
    const closeModal = document.querySelector('.close-modal');
    const quickActions = document.querySelectorAll('.action-card');
    const selectAllBooks = document.getElementById('selectAllBooks');
    const bookCheckboxes = document.querySelectorAll('.book-checkbox');

    // Inicializar funcionalidades
    initializeNavigation();
    initializeDashboard();
    initializeBooksManagement();
    initializeEventListeners();

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
                
                // Actualizar título de la página
                updatePageTitle(this.textContent.trim());
            });
        });
    }

    function initializeDashboard() {
        // Actualizar dashboard
        refreshBtn.addEventListener('click', function() {
            refreshDashboard();
        });

        // Filtro de fecha
        const dateFilter = document.getElementById('dashboardRange');
        if (dateFilter) {
            dateFilter.addEventListener('change', function() {
                updateDashboardData(this.value);
            });
        }

        // Inicializar datos del dashboard
        loadDashboardData();
    }

    function initializeBooksManagement() {
        // Select all books checkbox
        if (selectAllBooks) {
            selectAllBooks.addEventListener('change', function() {
                const isChecked = this.checked;
                bookCheckboxes.forEach(checkbox => {
                    checkbox.checked = isChecked;
                });
            });
        }

        // Filtros de libros
        const bookSearch = document.getElementById('bookSearch');
        const bookCategory = document.getElementById('bookCategory');
        const bookStatus = document.getElementById('bookStatus');

        if (bookSearch) {
            let searchTimeout;
            bookSearch.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    filterBooks();
                }, 500);
            });
        }

        if (bookCategory) {
            bookCategory.addEventListener('change', filterBooks);
        }

        if (bookStatus) {
            bookStatus.addEventListener('change', filterBooks);
        }
    }

    function initializeEventListeners() {
        // Logout
        logoutBtn.addEventListener('click', function() {
            showConfirmationModal(
                'Cerrar Sesión',
                '¿Estás seguro de que quieres cerrar sesión?',
                'Cerrar Sesión',
                () => {
                    // Simular logout
                    showLoading('Cerrando sesión...');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                }
            );
        });

        // Agregar libro
        addBookBtn.addEventListener('click', function() {
            openAddBookModal();
        });

        // Cerrar modal
        closeModal.addEventListener('click', function() {
            addBookModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        // Acciones rápidas
        quickActions.forEach(action => {
            action.addEventListener('click', function() {
                const actionType = this.dataset.action;
                handleQuickAction(actionType);
            });
        });

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', function(event) {
            if (event.target === addBookModal) {
                addBookModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        // Notificaciones
        const notificationsBtn = document.getElementById('notificationsBtn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', function() {
                showNotificationsPanel();
            });
        }
    }

    function updatePageTitle(sectionName) {
        document.title = `${sectionName} - VanseBook Admin`;
    }

    function refreshDashboard() {
        showLoading('Actualizando dashboard...');
        
        // Simular actualización de datos
        setTimeout(() => {
            loadDashboardData();
            hideLoading();
            showFeedback('Dashboard actualizado correctamente', 'success');
        }, 2000);
    }

    function loadDashboardData() {
        // En una aplicación real, aquí se harían peticiones AJAX
        console.log('Cargando datos del dashboard...');
        
        // Simular actualización de estadísticas
        updateStatsCards();
        updateCharts();
        updateRecentActivity();
    }

    function updateDashboardData(range) {
        showLoading(`Cargando datos para ${range}...`);
        
        // Simular cambio de rango de fecha
        setTimeout(() => {
            // Actualizar estadísticas basadas en el rango seleccionado
            const stats = generateMockStats(range);
            updateStatsWithData(stats);
            hideLoading();
        }, 1500);
    }

    function generateMockStats(range) {
        // Generar datos mock basados en el rango
        const baseStats = {
            revenue: 2845600,
            orders: 156,
            users: 1248,
            books: 2456
        };

        const multipliers = {
            'today': { revenue: 0.15, orders: 0.1, users: 0.01, books: 0.001 },
            'week': { revenue: 1, orders: 1, users: 1, books: 1 },
            'month': { revenue: 4.5, orders: 4.2, users: 1.2, books: 0.98 },
            'quarter': { revenue: 13.5, orders: 12.6, users: 1.5, books: 0.95 },
            'year': { revenue: 54, orders: 50.4, users: 2, books: 0.9 }
        };

        const multiplier = multipliers[range] || multipliers.week;
        
        return {
            revenue: Math.round(baseStats.revenue * multiplier.revenue),
            orders: Math.round(baseStats.orders * multiplier.orders),
            users: Math.round(baseStats.users * multiplier.users),
            books: Math.round(baseStats.books * multiplier.books)
        };
    }

    function updateStatsWithData(stats) {
        // Actualizar tarjetas de estadísticas
        document.querySelector('.stat-card.revenue .stat-value').textContent = `$${stats.revenue.toLocaleString()}`;
        document.querySelector('.stat-card.orders .stat-value').textContent = stats.orders.toLocaleString();
        document.querySelector('.stat-card.users .stat-value').textContent = stats.users.toLocaleString();
        document.querySelector('.stat-card.books .stat-value').textContent = stats.books.toLocaleString();
    }

    function updateStatsCards() {
        // Simular pequeñas variaciones en las estadísticas
        const stats = generateMockStats('week');
        updateStatsWithData(stats);
    }

    function updateCharts() {
        // En una aplicación real, aquí se actualizarían los gráficos
        console.log('Actualizando gráficos...');
    }

    function updateRecentActivity() {
        // En una aplicación real, aquí se cargaría la actividad reciente
        console.log('Actualizando actividad reciente...');
    }

    function filterBooks() {
        const searchTerm = document.getElementById('bookSearch').value.toLowerCase();
        const category = document.getElementById('bookCategory').value;
        const status = document.getElementById('bookStatus').value;

        // Simular filtrado
        showLoading('Filtrando libros...');
        
        setTimeout(() => {
            // En una aplicación real, aquí se filtrarían los datos
            console.log('Filtrando libros:', { searchTerm, category, status });
            hideLoading();
        }, 1000);
    }

    function openAddBookModal() {
        addBookModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function handleQuickAction(action) {
        switch(action) {
            case 'add-book':
                openAddBookModal();
                break;
            case 'manage-orders':
                // Navegar a gestión de pedidos
                document.querySelector('[data-section="orders"]').click();
                break;
            case 'view-reports':
                // Navegar a reportes
                document.querySelector('[data-section="reports"]').click();
                break;
            case 'manage-users':
                // Navegar a gestión de usuarios
                document.querySelector('[data-section="users"]').click();
                break;
            case 'check-inventory':
                // Navegar a inventario
                document.querySelector('[data-section="inventory"]').click();
                break;
            case 'supplier-orders':
                // Navegar a proveedores
                document.querySelector('[data-section="suppliers"]').click();
                break;
        }
        
        showFeedback(`Acción: ${getActionName(action)}`, 'info');
    }

    function getActionName(action) {
        const actions = {
            'add-book': 'Agregar Libro',
            'manage-orders': 'Gestionar Pedidos',
            'view-reports': 'Ver Reportes',
            'manage-users': 'Gestionar Usuarios',
            'check-inventory': 'Revisar Inventario',
            'supplier-orders': 'Pedir a Proveedores'
        };
        return actions[action] || action;
    }

    function showNotificationsPanel() {
        // En una aplicación real, aquí se mostraría un panel de notificaciones
        showFeedback('Panel de notificaciones - En desarrollo', 'info');
    }

    function showConfirmationModal(title, message, confirmText, onConfirm) {
        // Crear modal de confirmación
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>${title}</h2>
                <p>${message}</p>
                <div class="modal-actions">
                    <button class="btn btn-secondary" id="cancelConfirm">Cancelar</button>
                    <button class="btn btn-primary" id="confirmAction">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Event listeners
        document.getElementById('cancelConfirm').addEventListener('click', function() {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        });

        document.getElementById('confirmAction').addEventListener('click', function() {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
            onConfirm();
        });

        // Cerrar al hacer clic fuera
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.body.style.overflow = 'auto';
            }
        });
    }

    function showLoading(message = 'Cargando...') {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            const loadingContent = loadingOverlay.querySelector('.loading-content');
            if (loadingContent.querySelector('h3')) {
                loadingContent.querySelector('h3').textContent = message;
            }
            loadingOverlay.style.display = 'flex';
        }
    }

    function hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
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
            top: 90px;
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

    // Exportar funcionalidades para otros módulos
    window.adminDashboard = {
        refresh: refreshDashboard,
        showFeedback: showFeedback,
        showLoading: showLoading,
        hideLoading: hideLoading
    };
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
    
    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 2px solid var(--border-color);
    }
`;
document.head.appendChild(style);