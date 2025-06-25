document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const mot_de_passe = document.getElementById("password").value;

    console.log("[FRONT] Tentative de connexion avec :", { email, mot_de_passe });

    try {
        const res = await fetch('http://localhost:3000/api/admin/login', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, mot_de_passe })
        });

        console.log("[FRONT] Requête envoyée, en attente de réponse...");

        const data = await res.json();

        console.log("[FRONT] Réponse reçue :", data);

        if (!res.ok) {
            alert(data.message || "Identifiants incorrects");
            return;
        }

        localStorage.setItem("adminToken", data.token);

        alert("Connexion réussie !");
        window.location.href = "dashboard_admin.html";

    } catch (err) {
        console.error("[FRONT] Erreur requête :", err);
        alert("Erreur serveur lors de la connexion");
    }
});
