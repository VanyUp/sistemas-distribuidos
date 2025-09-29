document.addEventListener("DOMContentLoaded", function () {
    // =====================
    // Referencias al DOM
    // =====================
    const inputEl = document.getElementById("input");
    const sendBtn = document.getElementById("send");
    const messagesEl = document.getElementById("messages");
    const convsEl = document.getElementById("convs");
    const newConvBtn = document.getElementById("newConv");
    const clearBtn = document.getElementById("clearBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const backBtn = document.getElementById("backBtn");
    const newsBtn = document.getElementById("newsBtn");
    const statusEl = document.getElementById("status");
    const API = "https://sistemas-distribuidos-lcpe.onrender.com";

    // =====================
    // Estado
    // =====================
    let convos = JSON.parse(localStorage.getItem("convos")) || {};
    let currentConvId = null;

    // =====================
    // Utilidades
    // =====================
    function nowTime() {
        return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    }

    function saveState() {
        localStorage.setItem("convos", JSON.stringify(convos));
    }

    function renderMessage(msg) {
        const row = document.createElement("div");
        row.className = `msg-row ${msg.role}`;
        row.innerHTML = `
            <div class="bubble ${msg.role} content">${msg.text}</div>
            <div class="meta"><span class="time">${msg.ts}</span></div>
            </div>
        `;
        messagesEl.appendChild(row);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function renderConversation(convId) {
        messagesEl.innerHTML = "";
        convos[convId].messages.forEach(renderMessage);
    }

    function updateConvList() {
        convsEl.innerHTML = "";
        Object.entries(convos).forEach(([id, conv]) => {
            const item = document.createElement("div");
            item.className = "conv-item";
            item.dataset.id = id;
            item.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                    <div style="font-weight:600">${conv.title}</div>
                    <div class="small">${conv.messages.length} mensajes</div>
                </div>
                <button class="delete-btn" title="Eliminar">❌</button>
            </div>
        `;

            // Clic en el bloque → abrir conversación
            item.querySelector("div").addEventListener("click", (e) => {
                if (e.target.closest(".delete-btn")) return; // no abrir si clic en ❌
                currentConvId = id;
                renderConversation(id);
            });

            // Clic en ❌ → eliminar
            item.querySelector(".delete-btn").addEventListener("click", () => {
                deleteConversation(id);
            });

            convsEl.prepend(item);
        });
    }

    async function sendToBot(text) {
        try {
            isTyping = true;
            statusEl.textContent = "Escribiendo...";

            // Crear el nodo de "escribiendo..."
            const typingNode = document.createElement('div');
            typingNode.className = 'msg-row assistant';
            typingNode.id = 'typing';
            typingNode.innerHTML = `
            <div class="avatar-small">AI</div>
            <div>
                <div class="bubble assistant typing">
                    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
            </div>`;
            messagesEl.appendChild(typingNode);

            // Hacer la petición al backend
            const res = await fetch("${API}/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    token: localStorage.getItem("access_token")
                }),
            });

            if (!res.ok) {
                throw new Error(`❌ Error en backend: ${res.status}`);
            }

            const data = await res.json();

            // ✅ Eliminar el nodo "escribiendo..." cuando ya hay respuesta
            const typing = document.getElementById("typing");
            if (typing) typing.remove();

            statusEl.textContent = "Listo";
            isTyping = false;

            return data.reply || "⚠️ Error en la respuesta";
        } catch (err) {
            // También quitamos el typing en caso de error
            const typing = document.getElementById("typing");
            if (typing) typing.remove();

            statusEl.textContent = "Error";
            isTyping = false;
            return "⚠️ No se pudo conectar con el servidor";
        }
    }

    // =====================
    // Acciones
    // =====================
    async function handleSend() {
        const text = inputEl.value.trim();
        if (!text) return;

        // Si no hay conversación activa, crea una nueva
        if (!currentConvId) {
            newConversation();
        }

        const userMsg = { role: "user", text, ts: nowTime() };
        convos[currentConvId].messages.push(userMsg);
        renderMessage(userMsg);
        inputEl.value = "";

        saveState();
        updateConvList();

        const reply = await sendToBot(text);
        const botMsg = { role: "assistant", text: reply, ts: nowTime() };
        convos[currentConvId].messages.push(botMsg);
        renderMessage(botMsg);

        saveState();
        updateConvList();
    }

    function newConversation() {
        const title = prompt("Nombre de la conversación:") || "Chat sin título";
        const id = Date.now().toString();
        convos[id] = { title, messages: [] };
        currentConvId = id;
        saveState();
        updateConvList();
        renderConversation(id);
    }

    function deleteConversation(id) {
        if (!convos[id]) return;
        const confirmDelete = confirm("¿Eliminar esta conversación definitivamente?");
        if (!confirmDelete) return;

        // Borrar del objeto
        delete convos[id];
        saveState();

        // Si justo eliminaste la que estaba abierta
        if (currentConvId === id) {
            currentConvId = null;
            messagesEl.innerHTML = "";
        }

        updateConvList();
    }

    function clearConversation() {
        if (!currentConvId) return;
        convos[currentConvId].messages = [];
        saveState();
        renderConversation(currentConvId);
        updateConvList();
    }

    function downloadConversation() {
        if (!currentConvId) return;
        const conv = convos[currentConvId];
        const content = conv.messages.map(m => `[${m.ts}] ${m.role}: ${m.text}`).join("\n");
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${conv.title}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function goBack() {
        window.location.href = "/seleccion";
    }

    function goNews() {
        window.location.href = "/noticias-tar";
    }

    // Manejo del sidebar en móviles
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (sidebarToggle && sidebar && sidebarOverlay) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.add('sidebar-open');
            sidebarOverlay.classList.add('overlay-open');
        });

        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('sidebar-open');
            sidebarOverlay.classList.remove('overlay-open');
        });

        // Cerrar sidebar al oprimir ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('sidebar-open')) {
                sidebar.classList.remove('sidebar-open');
                sidebarOverlay.classList.remove('overlay-open');
            }
        });
    }

    // =====================
    // Eventos
    // =====================
    sendBtn.addEventListener("click", handleSend);
    inputEl.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
    newConvBtn.addEventListener("click", newConversation);
    clearBtn.addEventListener("click", clearConversation);
    downloadBtn.addEventListener("click", downloadConversation);
    backBtn.addEventListener("click", goBack);
    newsBtn.addEventListener("click", goNews);

    // =====================
    // Init
    // =====================
    updateConvList();
    if (!currentConvId && Object.keys(convos).length > 0) {
        currentConvId = Object.keys(convos)[0];
        renderConversation(currentConvId);
    }
});