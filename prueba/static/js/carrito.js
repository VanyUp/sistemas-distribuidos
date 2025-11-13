document.addEventListener("DOMContentLoaded", async () => {
    localStorage.removeItem("descuento");
    const userId = localStorage.getItem("user_id");

    if (!userId) {
        alert("Debes iniciar sesión para ver tu carrito");
        window.location.href = "/";
        return;
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

    // Aplicar código promocional
    const applyPromoBtn = document.getElementById('applyPromo');
    applyPromoBtn.addEventListener('click', function () {
        const promoCode = document.getElementById('promoCode').value.trim();

        if (!promoCode) {
            showFeedback('Por favor ingresa un código de descuento', 'error');
            return;
        }

        // Simular validación de código
        const validCodes = {
            'VANSE10': 0.1,
            'LIBRO15': 0.15,
            'BIENVENIDO20': 0.2
        };

        if (validCodes[promoCode.toUpperCase()]) {
            const discount = validCodes[promoCode.toUpperCase()];
            applyDiscount(discount, promoCode.toUpperCase());
            showFeedback(`¡Código ${promoCode.toUpperCase()} aplicado! ${discount * 100}% de descuento`);
        } else {
            showFeedback('Código de descuento inválido', 'error');
        }
    });

    function applyDiscount(discountPercentage, promoCode) {
        const subtotalElement = document.querySelector('.summary-row:first-child span:last-child');
        const subtotalText = subtotalElement.textContent;
        const subtotal = parseFloat(subtotalText.replace('$', '').replace('.', '').replace(',', '.'));

        const discount = subtotal * discountPercentage;
        const total = subtotal - discount;

        // Actualizar o crear fila de descuento
        let discountRow = document.querySelector('.summary-row .discount');
        if (!discountRow) {
            const subtotalRow = document.querySelector('.summary-row:first-child');
            discountRow = document.createElement('div');
            discountRow.className = 'summary-row';
            discountRow.innerHTML = `
                <span>Descuento (${promoCode})</span>
                <span class="discount">-$${Math.round(discount).toLocaleString()}</span>
            `;
            subtotalRow.parentNode.insertBefore(discountRow, subtotalRow.nextSibling);
        } else {
            discountRow.textContent = `-$${Math.round(discount).toLocaleString()}`;
        }

        document.querySelector('.summary-row.total span:last-child').textContent = `$${Math.round(total).toLocaleString()}`;

        // Deshabilitar input de promo
        document.getElementById('promoCode').disabled = true;
        document.getElementById('applyPromo').disabled = true;

        localStorage.setItem("descuento", Math.round(discount).toString());
    }

    const catalogoBtn = document.querySelector(".catalogo-href");
    catalogoBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/catalogo";
    });

    const profileBtn = document.querySelector(".profile-settings");
    profileBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/perfil";
    });

    const logoutBtn = document.querySelector(".logout");
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/";
        localStorage.removeItem("user_id");
    });

    const itemsContainer = document.querySelector(".cart-items");
    const summaryContainer = document.querySelector(".summary-details");
    const emptyCart = document.getElementById("emptyCart");

    try {
        const res = await fetch(`/carrito/${userId}`);
        const items = await res.json();

        // Si no hay productos
        if (!items || items.length === 0) {
            emptyCart.style.display = "flex";
            document.querySelector(".cart-layout").style.display = "none";
            return;
        }

        // Limpiamos
        itemsContainer.innerHTML = "";
        let subtotal = 0;

        items.forEach((item) => {
            const libro = item.libros;
            const totalItem = item.cantidad * item.precio_unitario;
            subtotal += totalItem;

            const div = document.createElement("div");
            div.classList.add("cart-items");
            div.innerHTML = `
                <div class="cart-item">
                    <div class="item-image">
                        <img src="${libro.portada || '../static/img/default-book.jpg'}" alt="${libro.titulo}">
                    </div>
                    <div class="item-details">
                        <h3 class="item-title">${libro.titulo}</h3>
                        <p class="item-author">${libro.autor}</p>
                        <div class="item-meta">
                            <span class="item-stock in-stock">
                                <i class="fas fa-check-circle"></i>
                                En stock
                            </span>
                        </div>
                        <div class="item-actions">
                            <button class="btn-text remove-item" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                                Eliminar
                            </button>
                        </div>
                    </div>
                    <div class="item-controls">
                        <div class="quantity-selector">
                            <input type="number" class="quantity-input" value="${item.cantidad}" min="1" max="10">
                        </div>
                        <div class="item-price">
                            <span class="current-price">$${totalItem.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `;
            itemsContainer.appendChild(div);
        });

        // Actualizamos resumen
        const descuentoGuardado = parseInt(localStorage.getItem("descuento")) || 0;
        const total = subtotal; // puedes sumar envío o descuento si aplica
        summaryContainer.innerHTML = `
            <div class="summary-row">
                <span>Subtotal (${items.length} productos)</span>
                <span>$${subtotal.toLocaleString()}</span>
            </div>
            <div class="summary-row">
                <span>Envío</span>
                <span class="free-shipping">Gratis</span>
            </div>
            <div class="summary-row">
                <span>Descuento</span>
                <span class="discount">-$${descuentoGuardado.toLocaleString()}</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>$${total.toLocaleString()}</span>
            </div>
        `;

        // Mostrar número de productos en el ícono del carrito
        const badge = document.querySelector("#cartBtn .icon-badge");
        if (badge) badge.textContent = items.length;

        // Mostrar el total de productos en el carrito
        const itemsCount = document.querySelector("h2");
        if (itemsCount) itemsCount.textContent = `Tus Productos (${items.length})`;

        // Evento para eliminar producto
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                await fetch(`/carrito/${id}`, { method: "DELETE" });
                location.reload();
            });
        });

    } catch (err) {
        console.error("Error cargando carrito:", err);
    }

    const checkoutBtn = document.getElementById("checkoutBtn");
    checkoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/pago";
    });
});
