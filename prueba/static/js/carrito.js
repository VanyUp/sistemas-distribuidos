document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
        alert("Debes iniciar sesión para ver tu carrito");
        window.location.href = "/";
        return;
    }

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
            div.classList.add("cart-item");
            div.innerHTML = `
                <div class="cart-item-info">
                    <img src="${libro.portada || '../static/img/default-book.jpg'}" alt="${libro.titulo}">
                    <div>
                        <h4>${libro.titulo}</h4>
                        <p>$${libro.precio.toLocaleString()}</p>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <span class="cantidad">${item.cantidad}</span>
                    <span class="subtotal">$${totalItem.toLocaleString()}</span>
                    <button class="btn-delete" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            itemsContainer.appendChild(div);
        });

        // Actualizamos resumen
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
});
