document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const API = "https://sistemas-distribuidos-lcpe.onrender.com";   



    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("${API}/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        console.log("Login response:", data);

        if (res.ok) {
            // Guardar token en localStorage
            localStorage.setItem("access_token", data.access_token);
            alert("✅ Inicio de sesión exitoso");
            window.location.href = "/seleccion";
        } else {
            alert("❌ " + data.detail);
        }
    } catch (err) {
        console.error("Error en login:", err);
        alert("Error de conexión");
    }
});