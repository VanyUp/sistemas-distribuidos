// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Establecer año actual en el footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Elementos del DOM
    const orderCards = document.querySelectorAll('.order-card');
    const viewDetailsButtons = document.querySelectorAll('.view-details');
    const trackOrderButtons = document.querySelectorAll('.track-order');
    const downloadInvoiceButtons = document.querySelectorAll('.download-invoice');
    const reorderButtons = document.querySelectorAll('.reorder');
    const cancelOrderButtons = document.querySelectorAll('.cancel-order');
    const completePaymentButtons = document.querySelectorAll('.complete-payment');
    const contactSupportButtons = document.querySelectorAll('.contact-support');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const orderSearch = document.getElementById('orderSearch');
    const downloadInvoiceBtn = document.getElementById('downloadInvoiceBtn');
    const emptyOrders = document.getElementById('emptyOrders');
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    const closeModal = document.querySelector('.close-modal');

    // Inicializar funcionalidades
    initializeEventListeners();
    initializeFilters();

    function initializeEventListeners() {
        // Ver detalles del pedido
        viewDetailsButtons.forEach(button => {
            button.addEventListener('click', function() {
                const orderCard = this.closest('.order-card');
                const orderNumber = orderCard.querySelector('.order-number strong').textContent;
                showOrderDetails(orderNumber, orderCard);
            });
        });

        // Seguir envío
        trackOrderButtons.forEach(button => {
            button.addEventListener('click', function() {
                const orderCard = this.closest('.order-card');
                const orderNumber = orderCard.querySelector('.order-number strong').textContent;
                trackOrder(orderNumber);
            });
        });

        // Descargar factura
        downloadInvoiceButtons.forEach(button => {
            button.addEventListener('click', function() {
                const orderCard = this.closest('.order-card');
                const orderNumber = orderCard.querySelector('.order-number strong').textContent;
                downloadInvoice(orderNumber);
            });
        });

        // Volver a comprar
        reorderButtons.forEach(button => {
            button.addEventListener('click', function() {
                const orderCard = this.closest('.order-card');
                reorderItems(orderCard);
            });
        });

        // Cancelar pedido
        cancelOrderButtons.forEach(button => {
            button.addEventListener('click', function() {
                const orderCard = this.closest('.order-card');
                const orderNumber = orderCard.querySelector('.order-number strong').textContent;
                cancelOrder(orderNumber, orderCard);
            });
        });

        // Completar pago
        completePaymentButtons.forEach(button => {
            button.addEventListener('click', function() {
                const orderCard = this.closest('.order-card');
                const orderNumber = orderCard.querySelector('.order-number strong').textContent;
                completePayment(orderNumber, orderCard);
            });
        });

        // Contactar soporte
        contactSupportButtons.forEach(button => {
            button.addEventListener('click', function() {
                const orderCard = this.closest('.order-card');
                const orderNumber = orderCard.querySelector('.order-number strong').textContent;
                contactSupport(orderNumber);
            });
        });

        // Descargar todas las facturas
        downloadInvoiceBtn.addEventListener('click', function() {
            downloadAllInvoices();
        });

        // Cerrar modal
        closeModal.addEventListener('click', function() {
            orderDetailsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', function(event) {
            if (event.target === orderDetailsModal) {
                orderDetailsModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    function initializeFilters() {
        // Filtro por estado
        statusFilter.addEventListener('change', function() {
            filterOrders();
        });

        // Filtro por fecha
        dateFilter.addEventListener('change', function() {
            filterOrders();
        });

        // Búsqueda
        let searchTimeout;
        orderSearch.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterOrders();
            }, 500);
        });
    }

    function filterOrders() {
        const status = statusFilter.value;
        const dateRange = dateFilter.value;
        const searchTerm = orderSearch.value.toLowerCase().trim();

        let visibleOrders = 0;

        orderCards.forEach(card => {
            let shouldShow = true;

            // Filtrar por estado
            if (status !== 'all') {
                const cardStatus = getOrderStatus(card);
                if (cardStatus !== status) {
                    shouldShow = false;
                }
            }

            // Filtrar por búsqueda
            if (searchTerm && shouldShow) {
                const orderNumber = card.querySelector('.order-number strong').textContent.toLowerCase();
                if (!orderNumber.includes(searchTerm)) {
                    shouldShow = false;
                }
            }

            // Aplicar visibilidad
            if (shouldShow) {
                card.style.display = 'block';
                visibleOrders++;
                
                // Animación de aparición
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                    card.style.transition = 'all 0.3s ease';
                }, 100);
            } else {
                card.style.display = 'none';
            }
        });

        // Mostrar estado vacío si no hay resultados
        if (visibleOrders === 0) {
            document.querySelector('.orders-list').style.display = 'none';
            document.querySelector('.pagination').style.display = 'none';
            emptyOrders.style.display = 'flex';
        } else {
            document.querySelector('.orders-list').style.display = 'block';
            document.querySelector('.pagination').style.display = 'flex';
            emptyOrders.style.display = 'none';
        }
    }

    function getOrderStatus(orderCard) {
        if (orderCard.classList.contains('delivered')) return 'delivered';
        if (orderCard.classList.contains('shipped')) return 'shipped';
        if (orderCard.classList.contains('processing')) return 'processing';
        if (orderCard.classList.contains('pending')) return 'pending';
        if (orderCard.classList.contains('cancelled')) return 'cancelled';
        return 'unknown';
    }

    function showOrderDetails(orderNumber, orderCard) {
        // Simular carga de detalles del pedido
        const modalBody = orderDetailsModal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="loading-spinner" style="text-align: center; padding: 2rem;">
                <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #2C5530; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                <p style="margin-top: 1rem; color: #718096;">Cargando detalles del pedido...</p>
            </div>
        `;

        orderDetailsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Simular delay de carga
        setTimeout(() => {
            const orderDetails = generateOrderDetails(orderNumber, orderCard);
            modalBody.innerHTML = orderDetails;
        }, 1000);
    }

    function generateOrderDetails(orderNumber, orderCard) {
        const status = getOrderStatus(orderCard);
        const statusText = orderCard.querySelector('.status-badge').textContent.trim();
        const orderDate = orderCard.querySelector('.order-date').textContent;
        const total = orderCard.querySelector('.order-total strong').textContent;

        return `
            <div class="order-details-content">
                <div class="details-section">
                    <h3>Información del Pedido</h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <strong>Número de Pedido:</strong>
                            <span>${orderNumber}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Fecha:</strong>
                            <span>${orderDate.replace('Realizado el ', '')}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Estado:</strong>
                            <span class="status-text ${status}">${statusText}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Total:</strong>
                            <span>${total}</span>
                        </div>
                    </div>
                </div>

                <div class="details-section">
                    <h3>Productos</h3>
                    <div class="products-list">
                        ${generateProductsHTML(orderCard)}
                    </div>
                </div>

                <div class="details-section">
                    <h3>Dirección de Envío</h3>
                    <div class="address-info">
                        <p><strong>Juan Pérez</strong></p>
                        <p>Carrera 45 #72-15, Apartamento 301</p>
                        <p>Bogotá, Bogotá D.C. 110011</p>
                        <p>Colombia</p>
                        <p>📞 +57 300 123 4567</p>
                    </div>
                </div>

                <div class="details-section">
                    <h3>Método de Pago</h3>
                    <div class="payment-info">
                        <p><strong>Tarjeta de Crédito</strong></p>
                        <p>Visa terminada en 3456</p>
                        <p>${total}</p>
                    </div>
                </div>

                <div class="details-section">
                    <h3>Historial del Pedido</h3>
                    <div class="timeline">
                        <div class="timeline-item completed">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <strong>Pedido Confirmado</strong>
                                <span>${orderDate.replace('Realizado el ', '')} - 10:30 AM</span>
                            </div>
                        </div>
                        ${status !== 'pending' ? `
                        <div class="timeline-item ${status === 'processing' || status === 'shipped' || status === 'delivered' ? 'completed' : ''}">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <strong>Procesando</strong>
                                <span>${orderDate.replace('Realizado el ', '')} - 11:45 AM</span>
                            </div>
                        </div>
                        ` : ''}
                        ${status === 'shipped' || status === 'delivered' ? `
                        <div class="timeline-item ${status === 'shipped' || status === 'delivered' ? 'completed' : ''}">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <strong>Enviado</strong>
                                <span>17 Ene, 2024 - 09:15 AM</span>
                            </div>
                        </div>
                        ` : ''}
                        ${status === 'delivered' ? `
                        <div class="timeline-item completed">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <strong>Entregado</strong>
                                <span>18 Ene, 2024 - 02:30 PM</span>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <style>
                .order-details-content {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                
                .details-section h3 {
                    margin-bottom: 1rem;
                    color: var(--text-primary);
                    border-bottom: 2px solid var(--border-color);
                    padding-bottom: 0.5rem;
                }
                
                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                
                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                
                .status-text {
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    display: inline-block;
                    width: fit-content;
                }
                
                .status-text.delivered { background: rgba(56, 161, 105, 0.1); color: var(--success-color); }
                .status-text.shipped { background: rgba(49, 130, 206, 0.1); color: var(--info-color); }
                .status-text.processing { background: rgba(214, 158, 46, 0.1); color: var(--warning-color); }
                .status-text.pending { background: rgba(214, 158, 46, 0.1); color: var(--warning-color); }
                .status-text.cancelled { background: rgba(229, 62, 62, 0.1); color: var(--error-color); }
                
                .products-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .address-info, .payment-info {
                    background: var(--background-color);
                    padding: 1rem;
                    border-radius: 8px;
                }
                
                .timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .timeline-item {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                }
                
                .timeline-marker {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: var(--border-color);
                    margin-top: 0.25rem;
                    flex-shrink: 0;
                }
                
                .timeline-item.completed .timeline-marker {
                    background: var(--success-color);
                }
                
                .timeline-content {
                    flex: 1;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }

    function generateProductsHTML(orderCard) {
        const items = orderCard.querySelectorAll('.order-item');
        let html = '';
        
        items.forEach(item => {
            const title = item.querySelector('.item-title').textContent;
            const author = item.querySelector('.item-author').textContent;
            const quantity = item.querySelector('.item-quantity').textContent;
            const price = item.querySelector('.item-price').textContent;
            
            html += `
                <div class="product-item">
                    <div class="product-info">
                        <strong>${title}</strong>
                        <span>${author}</span>
                        <span>${quantity}</span>
                    </div>
                    <div class="product-price">${price}</div>
                </div>
            `;
        });
        
        return html;
    }

    function trackOrder(orderNumber) {
        showFeedback(`Abriendo seguimiento para ${orderNumber}...`, 'info');
        // En una aplicación real, aquí se redirigiría a la página de seguimiento
        setTimeout(() => {
            window.open(`https://tracking.vansebook.com/order/${orderNumber}`, '_blank');
        }, 1000);
    }

    function downloadInvoice(orderNumber) {
        showFeedback(`Descargando factura de ${orderNumber}...`, 'info');
        // Simular descarga
        setTimeout(() => {
            showFeedback(`Factura de ${orderNumber} descargada correctamente`, 'success');
        }, 1500);
    }

    function reorderItems(orderCard) {
        const items = orderCard.querySelectorAll('.order-item');
        let itemCount = 0;
        
        items.forEach(item => {
            const title = item.querySelector('.item-title').textContent;
            itemCount++;
            // En una aplicación real, aquí se añadirían los items al carrito
            console.log(`Añadiendo al carrito: ${title}`);
        });
        
        showFeedback(`${itemCount} productos añadidos al carrito`, 'success');
        
        // Redirigir al carrito después de un delay
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 2000);
    }

    function cancelOrder(orderNumber, orderCard) {
        if (confirm(`¿Estás seguro de que quieres cancelar el pedido ${orderNumber}?`)) {
            // Simular cancelación
            orderCard.classList.add('cancelled');
            orderCard.classList.remove('pending', 'processing');
            
            const statusBadge = orderCard.querySelector('.status-badge');
            statusBadge.className = 'status-badge cancelled';
            statusBadge.innerHTML = '<i class="fas fa-times-circle"></i> Cancelado';
            
            const deliveryDate = orderCard.querySelector('.delivery-date');
            if (deliveryDate) {
                deliveryDate.textContent = `Cancelado el ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
            }
            
            showFeedback(`Pedido ${orderNumber} cancelado correctamente`, 'success');
        }
    }

    function completePayment(orderNumber, orderCard) {
        showFeedback(`Procesando pago para ${orderNumber}...`, 'info');
        
        // Simular procesamiento de pago
        setTimeout(() => {
            orderCard.classList.remove('pending');
            orderCard.classList.add('processing');
            
            const statusBadge = orderCard.querySelector('.status-badge');
            statusBadge.className = 'status-badge processing';
            statusBadge.innerHTML = '<i class="fas fa-cog"></i> Procesando';
            
            const deliveryDate = orderCard.querySelector('.delivery-date');
            if (deliveryDate) {
                deliveryDate.textContent = 'Preparando tu pedido';
            }
            
            // Remover sección de pago pendiente
            const paymentSection = orderCard.querySelector('.payment-pending');
            if (paymentSection) {
                paymentSection.remove();
            }
            
            showFeedback(`Pago para ${orderNumber} completado exitosamente`, 'success');
        }, 2000);
    }

    function contactSupport(orderNumber) {
        showFeedback(`Iniciando chat de soporte para ${orderNumber}...`, 'info');
        // En una aplicación real, aquí se abriría un chat de soporte
    }

    function downloadAllInvoices() {
        showFeedback('Preparando descarga de todas las facturas...', 'info');
        // Simular preparación de descarga
        setTimeout(() => {
            showFeedback('Todas las facturas han sido descargadas', 'success');
        }, 2000);
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
`;
document.head.appendChild(style);