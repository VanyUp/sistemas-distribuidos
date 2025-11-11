// ===============================
// Cargar y mostrar libros
// ===============================
async function cargarLibros() {
    try {
        const response = await fetch('/api/catalogo');
        const libros = await response.json();
        mostrarLibros(libros);
    } catch (error) {
        console.error("Error cargando catálogo:", error);
        showFeedback("Error al cargar los libros", "error");
    }
}

function mostrarLibros(libros) {
    const grid = document.getElementById("booksGrid");
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
                    <span class="current-price">$${libro.precio.toLocaleString()}</span>
                </div>
                <button class="btn btn-primary btn-full add-to-cart" data-id="${libro.id}">
                    <i class="fas fa-cart-plus"></i> Añadir al Carrito
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', async e => {
            const userId = localStorage.getItem("user_id");
            if (!userId) {
                showFeedback("Debes iniciar sesión para agregar productos al carrito", "error");
                return;
            }

            const libroId = e.currentTarget.dataset.id;
            try {
                const response = await fetch('/carrito/agregar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: parseInt(userId),
                        libro_id: parseInt(libroId),
                        cantidad: 1
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    showFeedback("Libro agregado al carrito", "success");
                    await actualizarContadorCarrito();
                    await mostrarMiniCarrito();
                } else {
                    showFeedback(data.detail || "Error al agregar al carrito", "error");
                }
            } catch (err) {
                console.error("Error al agregar al carrito:", err);
                showFeedback("No se pudo agregar el libro al carrito", "error");
            }
        });
    });
}

// ===============================
// Contador y mini carrito
// ===============================
async function actualizarContadorCarrito() {
    const userId = localStorage.getItem("user_id");
    const badge = document.querySelector('#cartBtn .icon-badge');
    if (!badge || !userId) return;

    try {
        const res = await fetch(`/carrito/${userId}`);
        const items = await res.json();
        const total = items.reduce((sum, i) => sum + i.cantidad, 0);
        badge.textContent = total;
        badge.style.display = total > 0 ? 'flex' : 'none';
    } catch (err) {
        console.warn("No se pudo actualizar el contador del carrito");
    }
}

async function mostrarMiniCarrito() {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    const modal = document.getElementById("miniCartModal");
    const content = document.getElementById("miniCartContent");

    try {
        const res = await fetch(`/carrito/${userId}`);
        const items = await res.json();

        if (!items.length) {
            content.innerHTML = "<p>Tu carrito está vacío.</p>";
        } else {
            content.innerHTML = items.map(i => `
                <div class="mini-cart-item">
                    <span>${i.libros?.titulo || "Libro"}</span>
                    <span>x${i.cantidad}</span>
                    <span>$${i.libros?.precio?.toLocaleString() || "0"}</span>
                </div>
            `).join("");
        }

        modal.style.display = "flex";
        setTimeout(() => modal.classList.add("visible"), 50);
    } catch (error) {
        console.error("Error al cargar mini carrito:", error);
    }
}

// ===============================
// Eventos globales
// ===============================
document.addEventListener('DOMContentLoaded', async function() {
    cargarLibros();
    await actualizarContadorCarrito();

    // Cerrar el mini carrito
    document.addEventListener("click", e => {
        const modal = document.getElementById("miniCartModal");
        if (e.target.id === "closeMiniCart" || e.target.id === "miniCartModal") {
            modal.classList.remove("visible");
            setTimeout(() => modal.style.display = "none", 300);
        }
    });

    // Abrir al hacer click en el icono del carrito
    const cartBtn = document.getElementById("cartBtn");
    if (cartBtn) {
        cartBtn.addEventListener("click", async () => {
            await mostrarMiniCarrito();
        });
    }
});

// ===============================
// Feedback visual
// ===============================
function showFeedback(message, type = "success") {
    const feedback = document.createElement('div');
    feedback.className = `feedback-message ${type}`;
    feedback.innerHTML = `<i class="fas fa-${type === "success" ? "check" : "exclamation"}-circle"></i> ${message}`;
    feedback.style.cssText = `
        position: fixed; top: 100px; right: 20px;
        background: ${type === "success" ? "#28a745" : "#dc3545"};
        color: white; padding: 1rem 1.5rem; border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        z-index: 9999; animation: fadeIn 0.3s ease;
    `;
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2500);
}
