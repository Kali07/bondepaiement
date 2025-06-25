// Déconnexion
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "etudiantlogin.html";
});

// Token check
const token = localStorage.getItem("token");
if (!token) {
  alert("Veuillez vous connecter.");
  window.location.href = "etudiantlogin.html";
}

// Récupération des infos de l’étudiant connecté
fetch('/api/etudiants/me', {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(res => res.json())
  .then(data => {
    document.getElementById("nom").textContent = data.nom;
    document.getElementById("prenom").textContent = data.prenom;
    document.getElementById("matricule").textContent = data.matricule;
    document.getElementById("promotion").textContent = data.promotion;
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

    const bonHTML = document.createElement("div");
    bonHTML.className = "bon";
    bonHTML.innerHTML = `
      <p><strong>Nom:</strong> ${document.getElementById("nom").textContent}</p>
      <p><strong>Prénom:</strong> ${document.getElementById("prenom").textContent}</p>
      <p><strong>Matricule:</strong> ${document.getElementById("matricule").textContent}</p>
      <p><strong>Promotion:</strong> ${document.getElementById("promotion").textContent}</p>
      <p><strong>Motif:</strong> ${motif}</p>
      <p><strong>Montant:</strong> ${montant} $</p>
      <p><strong>Référence:</strong> ${ref}</p>
      <p><strong>Banque:</strong> ${banque}</p>
      <p><strong>N° Compte:</strong> ${numeroCompte}</p>
      <p><strong>Agence:</strong> ${agence}</p>
      <div class="qr-code" id="qr-${ref}"></div>
      <button class="export-btn" onclick="exporterPDF(this)">Exporter en PDF</button>
    `;

    container.appendChild(bonHTML);

    const qrText = `
Nom: ${document.getElementById("nom").textContent}
Prénom: ${document.getElementById("prenom").textContent}
Matricule: ${document.getElementById("matricule").textContent}
Motif: ${motif}
Montant: ${montant}$
Réf: ${ref}
Banque: ${banque}
Compte: ${numeroCompte}
Agence: ${agence}
    `.trim();

    QRCode.toCanvas(document.getElementById(`qr-${ref}`), qrText, function (error) {
      if (error) console.error("QR Code error:", error);
    });
  });
});

// Génère une référence de type XXD-A71-C2E-02
function genererReference() {
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

// Export en PDF (exclut le bouton)
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