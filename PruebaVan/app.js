// Ajusta si tu backend corre en otro host/puerto.
const API_BASE = "http://127.0.0.1:8000";

const elChat = document.getElementById("chat");
const elForm = document.getElementById("form");
const elMsg  = document.getElementById("msg");
const elSend = document.getElementById("send");
const elStatus = document.getElementById("status");

function addBubble(text, who){
  const div = document.createElement("div");
  div.className = `bubble ${who}`;
  div.textContent = text;
  elChat.appendChild(div);
  elChat.scrollTop = elChat.scrollHeight;
}

function setStatus(t){ elStatus.textContent = t || ""; }

async function callAPI(text){
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensaje: text })
  });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}

elForm.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const text = elMsg.value.trim();
  if(!text) return;

  addBubble(text, "user");
  elMsg.value = "";
  elSend.disabled = true; setStatus("Pensando…");

  try{
    const data = await callAPI(text);
    // backend devuelve { reply: "...", crisis: bool }
    if (data && typeof data.reply === "string") {
      addBubble(data.reply, "ai");
      setStatus(data.crisis ? "Mensaje de seguridad mostrado." : "");
    } else {
      addBubble("Respuesta vacía del servidor.", "ai");
      setStatus("Sin contenido.");
    }
  } catch(err){
    addBubble("Error de red o servidor.", "ai");
    setStatus(err.message || String(err));
    console.error(err);
  } finally{
    elSend.disabled = false;
    elMsg.focus();
  }
});
