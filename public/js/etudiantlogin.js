document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const matricule = document.getElementById('matricule').value.trim();
  const motDePasse = document.getElementById('motDePasse').value.trim();
  const messageDiv = document.getElementById('message');
  try {
    const response = await fetch('http://localhost:3000/api/etudiants/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ matricule, motDePasse })
    });
    const data = await response.json();
    if (response.ok) {
      // Stocker le token si tu utilises un token
      localStorage.setItem('token', data.token); 
      console.log("Reponse API:",data);
      localStorage.setItem('etudiantNom', data.nom); // si tu veux afficher son nom plus tard
      // Rediriger vers l’interface de l’étudiant
      window.location.href = 'etudiantDashboard.html';
    } else {
      messageDiv.textContent = data.message || 'Identifiants incorrects';
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
    messageDiv.textContent = 'Erreur serveur. Veuillez réessayer.';
  }
});