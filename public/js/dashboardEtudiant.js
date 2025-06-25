// Déconnexion
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "etudiantlogin.html";
});

// Vérification du token
const token = localStorage.getItem("token");
if (!token) {
  alert("Veuillez vous connecter.");
  window.location.href = "etudiantlogin.html";
}

// Récupération des infos de l'étudiant connecté
fetch('/api/etudiants/me', {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(res => res.json())
  .then(data => {
    console.log("Données récupérées :", data);
    document.getElementById("nom").textContent = data.nom;
    document.getElementById("prenom").textContent = data.prenom;
    document.getElementById("matricule").textContent = data.matricule;
    document.getElementById("promotion").textContent = data.promotions;

    // Stocker les infos utiles pour l'envoi futur
    window.userInfos = data;
  })
  .catch(err => {
    console.error("Erreur récupération infos :", err);
    alert("Session expirée.");
    localStorage.removeItem("token");
    window.location.href = "etudiantlogin.html";
  });

// Génération des bons
document.getElementById("bonsForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const bonsCoches = [...document.querySelectorAll('input[name="bon"]:checked')];
  const container = document.getElementById("listeBons");
  container.innerHTML = "";

  bonsCoches.forEach(bon => {
    const motif = bon.value;
    const montant = {
      "Frais académiques": 925,
      "Frais CISNET": 20,
      "Attestations de fréquentation": 10
    }[motif];

    const ref = genererReference();
    const banque = "Rawbank UPC";
    const numeroCompte = "00011-55101-12345678900-55";
    const agence = "55101-Kinshasa UPC";

    console.log("USERSSS :", window.userInfos);
    // Génération du bon côté visuel
    const bonHTML = document.createElement("div");
    bonHTML.className = "bon";
    bonHTML.innerHTML = `
      <p><strong>Nom:</strong> ${window.userInfos.nom}</p>
      <p><strong>Prénom:</strong> ${window.userInfos.prenom}</p>
      <p><strong>Matricule:</strong> ${window.userInfos.matricule}</p>
      <p><strong>Promotion:</strong> ${window.userInfos.promotions}</p>
      <p><strong>Motif:</strong> ${motif}</p>
      <p><strong>Montant:</strong> ${montant} $</p>
      <p><strong>Référence:</strong> ${ref}</p>
      <p><strong>Banque:</strong> ${banque}</p>
      <p><strong>N° Compte:</strong> ${numeroCompte}</p>
      <p><strong>Agence:</strong> ${agence}</p>
      <canvas class="qr-code" id="qr-${ref}"></canvas>
      <button class="export-btn" onclick="exporterPDF(this)">Exporter en PDF</button>
    `;
    container.appendChild(bonHTML);

console.log("Motif :", motif);
console.log("Montant :", montant);

    const qrText = `
Nom: ${window.userInfos.nom}
Prénom: ${window.userInfos.prenom}
Matricule: ${window.userInfos.matricule}
Motif: ${motif}
Montant: ${montant}$
Réf: ${ref}
Banque: ${banque}
Compte: ${numeroCompte}
Agence: ${agence}
    `.trim();

// Génération du QR Code
QRCode.toCanvas(
  document.getElementById(`qr-${ref}`),
  qrText,
  function (error) {
    if (error) console.error("QR Code error:", error);
  }
);
    // Appel API pour enregistrer le bon en BDD
fetch('/api/bons', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ motif, montant, reference: ref })
})
      .then(res => res.json())
      .then(rep => {
        console.log(rep);
      })
      .catch(err => console.error("Erreur création du bon :", err));
  });
});

// Génération référence unique
function genererReference() {
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

// Export PDF 
function exporterPDF(button) {
  const bon = button.parentElement.cloneNode(true);
  bon.querySelector('.export-btn').remove();

  const doc = new window.jspdf.jsPDF();
  doc.html(bon, {
    callback: function (pdf) {
      pdf.save(`bon-${Date.now()}.pdf`);
    },
    x: 10,
    y: 10
  });
}
