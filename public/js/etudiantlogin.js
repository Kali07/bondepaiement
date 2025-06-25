document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const matricule = document.getElementById("matricule").value;
  const motDePasse = document.getElementById("motDePasse").value;

  try {
    const res = await fetch('/api/etudiants/login', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricule, motDePasse })
    });

    const data = await res.json();

    if (!res.ok) {
      document.getElementById("message").textContent = data.message || "Erreur inconnue";
      return;
    }

    // Stocker le token dans le localStorage
    localStorage.setItem("token", data.token);

    // Redirection vers le dashboard
    window.location.href = "etudiantDashboard.html";

  } catch (err) {
    console.error(err);
    document.getElementById("message").textContent = "Erreur serveur";
  }
});
