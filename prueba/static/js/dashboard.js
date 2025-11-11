document.getElementById("addBookForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = {
        nombre: document.getElementById("nombre").value,
        autor: document.getElementById("autor").value,
        portada: document.getElementById("portada").value,
        cantidad_hojas: parseInt(document.getElementById("cantidad_hojas").value),
        stock: parseInt(document.getElementById("stock").value),
        precio: parseFloat(document.getElementById("precio").value),
    };

    const message = document.getElementById("formMessage");

    try {
        const response = await fetch("/agregarLibro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            message.textContent = "✅ Libro agregado correctamente.";
            message.style.color = "green";
            document.getElementById("addBookForm").reset();
        } else {
            message.textContent = `❌ Error: ${result.detail || "No se pudo guardar el libro."}`;
            message.style.color = "red";
        }
    } catch (error) {
        message.textContent = "❌ Error de conexión con el servidor.";
        message.style.color = "red";
    }
});

// Cargar libros desde FastAPI y mostrarlos en la tabla
async function cargarLibros() {
    try {
        const response = await fetch('/libros'); // Endpoint correcto
        if (!response.ok) throw new Error("Error al cargar libros");

        const libros = await response.json();
        mostrarLibros(libros);
    } catch (error) {
        console.error("Error cargando catálogo:", error);
    }
}


// ✅ Función que muestra los libros en la tabla
function mostrarLibros(libros) {
  const tbody = document.querySelector('.data-table tbody');
  if (!tbody) return console.error("No se encontró el <tbody> de la tabla");

  tbody.innerHTML = ""; // Limpiar tabla

  libros.forEach(libro => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <label class="checkbox-label">
          <input type="checkbox" class="book-checkbox" />
          <span class="checkmark"></span>
        </label>
      </td>
      <td>
        <div class="book-info">
          <img src="${libro.portada}" alt="${libro.nombre}" style="width:50px;height:auto; margin-right:10px;" />
          <div>
            <strong>${libro.nombre}</strong><br>
            <span>ISBN: ${libro.id}</span>
          </div>
        </div>
      </td>
      <td>${libro.autor}</td>
      <td>Desconocida</td>
      <td>$${libro.precio}</td>
      <td>${libro.stock}</td>
      <td>${libro.stock > 0 ? 'En Stock' : 'Agotado'}</td>
      <td>0</td>
      <td>
        <button class="btn-icon small edit-btn" data-id="${libro.id}">Editar</button>
        <button class="btn-icon small delete-btn" data-id="${libro.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ✅ Escuchar clics en los botones Editar y Eliminar
document.addEventListener("click", async (e) => {
  // 🗑️ ELIMINAR LIBRO
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;

    if (confirm("¿Seguro que quieres eliminar este libro?")) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/libros/${id}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (data.deleted > 0) {
          alert("Libro eliminado correctamente");
          obtenerLibros(); // Recarga la lista
        } else {
          alert("Error al eliminar el libro");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error al conectar con el servidor");
      }
    }
  }

  // ✏️ EDITAR LIBRO
  if (e.target.classList.contains("edit-btn")) {
    const id = e.target.dataset.id;

    try {
      // Obtener datos actuales del libro
      const res = await fetch(`http://127.0.0.1:8000/libros/${id}`);
      const libro = await res.json();

      // Pedir nuevos valores (usa prompt para simplicidad)
      const nuevoNombre = prompt("Nuevo nombre:", libro.nombre);
      const nuevoAutor = prompt("Nuevo autor:", libro.autor);
      const nuevaPortada = prompt("Nueva portada (URL):", libro.portada);
      const nuevaCantidadHojas = prompt("Nueva cantidad de hojas:", libro.cantidad_hojas);
      const nuevoPrecio = prompt("Nuevo precio:", libro.precio);
      const nuevoStock = prompt("Nuevo stock:", libro.stock);

      if (nuevoNombre && nuevoAutor && nuevaPortada && nuevaCantidadHojas && nuevoPrecio && nuevoStock) {
        const response = await fetch(`http://127.0.0.1:8000/libros/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: nuevoNombre,
            autor: nuevoAutor,
            portada: nuevaPortada,
            cantidad_hojas: parseInt(nuevaCantidadHojas),
            precio: parseFloat(nuevoPrecio),
            stock: parseInt(nuevoStock),
        
          }),
        });

        if (response.ok) {
          alert("Libro actualizado correctamente");
          obtenerLibros(); // Recarga la lista
        } else {
          alert("Error al actualizar el libro");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con el servidor");
    }
  }
});

// ✅ Función para obtener y mostrar los libros
async function obtenerLibros() {
  try {
    const res = await fetch("http://127.0.0.1:8000/libros");
    const data = await res.json();
    mostrarLibros(data);
  } catch (error) {
    console.error("Error al obtener libros:", error);
  }
}

// Cargar libros al iniciar
obtenerLibros();




// Llamar cuando la página carga
document.addEventListener('DOMContentLoaded', () => {
    cargarLibros();
});








// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function () {
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
            item.addEventListener('click', function (e) {
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
        refreshBtn.addEventListener('click', function () {
            refreshDashboard();
        });

        // Filtro de fecha
        const dateFilter = document.getElementById('dashboardRange');
        if (dateFilter) {
            dateFilter.addEventListener('change', function () {
                updateDashboardData(this.value);
            });
        }

        // Inicializar datos del dashboard
        loadDashboardData();
    }

    function initializeBooksManagement() {
        // Select all books checkbox
        if (selectAllBooks) {
            selectAllBooks.addEventListener('change', function () {
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
            bookSearch.addEventListener('input', function () {
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
        logoutBtn.addEventListener('click', function () {
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
        addBookBtn.addEventListener('click', function () {
            openAddBookModal();
        });

        // Cerrar modal
        closeModal.addEventListener('click', function () {
            addBookModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        // Acciones rápidas
        quickActions.forEach(action => {
            action.addEventListener('click', function () {
                const actionType = this.dataset.action;
                handleQuickAction(actionType);
            });
        });

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', function (event) {
            if (event.target === addBookModal) {
                addBookModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        // Notificaciones
        const notificationsBtn = document.getElementById('notificationsBtn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', function () {
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
        switch (action) {
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
        document.getElementById('cancelConfirm').addEventListener('click', function () {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        });

        document.getElementById('confirmAction').addEventListener('click', function () {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
            onConfirm();
        });

        // Cerrar al hacer clic fuera
        modal.addEventListener('click', function (e) {
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

    // Cargar usuarios
    async function loadUsers() {
        const res = await fetch("/admin/usuarios");
        const users = await res.json();

        const tbody = document.getElementById("usersTableBody");
        tbody.innerHTML = "";

        users.forEach(user => {
            const row = document.createElement("tr");

            row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.rol}</td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn-icon small danger" data-delete="${user.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

            tbody.appendChild(row);
        });
    }

    // Crear usuario
    document.getElementById("createUserForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const response = await fetch("/admin/usuarios/create", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        const msg = document.getElementById("formMessage");

        if (response.ok) {
            msg.style.color = "green";
            msg.textContent = "✅ Usuario creado con éxito";
            e.target.reset();
            setTimeout(closeAddUserModal, 1200);
            // Si tienes tabla de usuarios → aquí recargas
            // loadUsers();
        } else {
            msg.style.color = "red";
            msg.textContent = "❌ " + result.detail;
        }
    });

    // Cambiar rol
    document.addEventListener("change", async (e) => {
        if (e.target.classList.contains("role-select")) {
            await fetch(`/admin/usuarios/${e.target.dataset.id}/rol`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rol: e.target.value })
            });
        }
    });

    // Eliminar usuario
    document.addEventListener("click", async (e) => {
        if (e.target.closest("[data-delete]")) {
            const id = e.target.closest("[data-delete]").dataset.delete;
            await fetch(`/admin/usuarios/${id}`, { method: "DELETE" });
            loadUsers();
        }
    });

    // Inicializar
    loadUsers();

    window.openAddUserModal = function () {
        document.getElementById("addUserModal").style.display = "flex";
    }

    window.closeAddUserModal = function () {
        document.getElementById("addUserModal").style.display = "none";
    }

    window.addEventListener("click", (e) => {
        const modal = document.getElementById("addUserModal");
        if (e.target === modal) closeAddUserModal();
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