let ws;
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Recuperar token del localStorage
const token = localStorage.getItem("access_token");

// Conectar al WebSocket
function connectWebSocket() {
    if (!token) {
        alert("⚠️ No estás autenticado. Inicia sesión primero.");
        return;
    }

    ws = new WebSocket(`ws://localhost:8000/ws/chat?token=${token}`);

    ws.onopen = () => {
        console.log("✅ Conectado al chat IA");
        appendMessage("Sistema", "Conexión establecida con Tarot AI 🌙");
    };

    ws.onmessage = (event) => {
        appendMessage("Tarot IA", event.data);
    };

    ws.onclose = () => {
        console.log("❌ Desconectado del chat");
        appendMessage("Sistema", "Chat desconectado.");
    };

    ws.onerror = (err) => {
        console.error("Error WebSocket:", err);
    };
}

// Enviar mensaje
function sendMessage() {
    const message = messageInput.value.trim();
    if (message && ws.readyState === WebSocket.OPEN) {
        appendMessage("Tú", message);
        ws.send(message);
        messageInput.value = "";
    }
}

// Mostrar mensajes en el chat
function appendMessage(sender, text) {
    const msg = document.createElement("div");
    msg.classList.add("message");

    if (sender === "Tú") {
        msg.classList.add("user-message");
    } else if (sender === "Tarot IA") {
        msg.classList.add("ai-message");
    } else {
        msg.classList.add("system-message");
    }

    // Escapar HTML y reemplazar saltos de línea
    const safeText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");

    msg.innerHTML = `<strong>${sender}:</strong><br>${safeText}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

// Conectar automáticamente
connectWebSocket();