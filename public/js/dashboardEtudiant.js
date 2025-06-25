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
    document.getElementById("promotion").textContent = data.promotion;

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

  
    // Génération du bon côté visuel
    const bonHTML = document.createElement("div");
    bonHTML.className = "bon";
    bonHTML.innerHTML = `
      <p><strong>Nom:</strong> ${window.userInfos.nom}</p>
      <p><strong>Prénom:</strong> ${window.userInfos.prenom}</p>
      <p><strong>Matricule:</strong> ${window.userInfos.matricule}</p>
      <p><strong>Promotion:</strong> ${window.userInfos.promotion}</p>
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
  const bon = button.parentElement;

  const nom = bon.querySelector('p:nth-child(1)').textContent;
  const prenom = bon.querySelector('p:nth-child(2)').textContent;
  const matricule = bon.querySelector('p:nth-child(3)').textContent;
  const promotion = bon.querySelector('p:nth-child(4)').textContent;
  const motif = bon.querySelector('p:nth-child(5)').textContent;
  const montant = bon.querySelector('p:nth-child(6)').textContent;
  const reference = bon.querySelector('p:nth-child(7)').textContent;
  const banque = bon.querySelector('p:nth-child(8)').textContent;
  const compte = bon.querySelector('p:nth-child(9)').textContent;
  const agence = bon.querySelector('p:nth-child(10)').textContent;
  const qrCanvas = bon.querySelector('.qr-code canvas');

  const doc = new window.jspdf.jsPDF();

  doc.setFontSize(14);
  doc.text("Université Protestante au Congo", 20, 20);
  doc.setFontSize(12);
  doc.text(nom, 20, 35);
  doc.text(prenom, 20, 42);
  doc.text(matricule, 20, 49);
  doc.text(promotion, 20, 56);
  doc.text(motif, 20, 63);
  doc.text(montant, 20, 70);
  doc.text(reference, 20, 77);
  doc.text(banque, 20, 84);
  doc.text(compte, 20, 91);
  doc.text(agence, 20, 98);

  // Ajout du QR Code s'il existe
  if (qrCanvas) {
    const qrDataUrl = qrCanvas.toDataURL();
    doc.addImage(qrDataUrl, 'PNG', 20, 110, 50, 50);
  }

  doc.save(`bon-${Date.now()}.pdf`);
}

document.getElementById('voirMesBons').addEventListener('click', () => {
  const token = localStorage.getItem('token');

  fetch('/api/bons', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(bons => {
    const container = document.getElementById('listeMesBons');
    container.innerHTML = '';

    if (bons.length === 0) {
      container.innerHTML = '<p>Aucun bon généré pour l\'instant.</p>';
    } else {
      bons.forEach(bon => {
        container.innerHTML += `
          <div class="bon">
            <p><strong>Motif:</strong> ${bon.description}</p>
            <p><strong>Montant:</strong> ${bon.montant} $</p>
            <p><strong>Référence:</strong> ${bon.reference}</p>
            <p><strong>Statut:</strong> ${bon.statut}</p>
            <hr/>
          </div>
        `;
      });
    }
    
    document.getElementById('mesBonsSection').style.display = 'block';
  })
  .catch(err => {
    console.error('Erreur récupération bons:', err);
    alert('Impossible de récupérer vos bons');
  });
});


