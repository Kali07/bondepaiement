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

// Récupération des infos étudiant
fetch('/api/etudiants/me', {
  headers: { Authorization: `Bearer ${token}` }
})
.then(res => res.json())
.then(data => {
  document.getElementById("nom").textContent = data.nom;
  document.getElementById("prenom").textContent = data.prenom;
  document.getElementById("matricule").textContent = data.matricule;
  document.getElementById("promotion").textContent = data.promotion;
  window.userInfos = data;

  // Charger dynamiquement les bons depuis la BDD après infos récupérées
  chargerBonsDisponibles();
})
.catch(() => {
  alert("Session expirée.");
  localStorage.removeItem("token");
  window.location.href = "etudiantlogin.html";
});


function chargerBonsDisponibles() {
  fetch('/api/bons-types', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(types => {
      const container = document.getElementById("bonsCheckBoxes");
      container.innerHTML = "";

      types.forEach(type => {
        const label = document.createElement("label");
        label.innerHTML = `
          <input type="checkbox" name="bon" value="${type.nom}"> ${type.nom}
        `;
        container.appendChild(label);
      });
    })
    .catch(err => {
      console.error("Erreur chargement types de bons :", err);
    });
}


// Génération des bons avec contrôle doublon
document.getElementById("bonsForm").addEventListener("submit", (e) => {
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

    // Vérification doublon avant génération
    fetch('/api/bons', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(existingBons => {
      const dejaExistant = existingBons.some(b => b.description === motif && b.statut !== 'annulé');

      if (dejaExistant) {
        alert(`Vous avez déjà un bon actif pour : ${motif}`);
        return;
      }

      // Génération visuelle
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
        <canvas id="qr-${ref}"></canvas>
        <button class="export-btn" onclick="exporterPDF(this)">Exporter en PDF</button>
      `;
      container.appendChild(bonHTML);

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

      QRCode.toCanvas(document.getElementById(`qr-${ref}`), qrText, (error) => {
        if (error) console.error("QR Code error:", error);
      });

      // Enregistrement en BDD
      fetch('/api/bons', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ motif, montant, reference: ref })
      })
      .then(res => res.json())
      .then(rep => console.log(rep))
      .catch(err => console.error("Erreur création du bon :", err));
    });
  });
});

function genererReference() {
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${segment()}-${segment()}-${segment()}`;
}

// Export PDF
function exporterPDF(button) {
  const bon = button.parentElement;
  const infos = [...bon.querySelectorAll("p")].map(p => p.textContent.split(":")[1]?.trim());
  const [nom, prenom, matricule, promotion, motif, montant, reference, banque, compte, agence] = infos;
  const qrCanvas = bon.querySelector("canvas");

  const doc = new window.jspdf.jsPDF();
  doc.setFontSize(14);
  doc.text("Université Protestante au Congo", 20, 20);
  doc.setFontSize(12);
  doc.text(`Nom: ${nom}`, 20, 35);
  doc.text(`Prénom: ${prenom}`, 20, 42);
  doc.text(`Matricule: ${matricule}`, 20, 49);
  doc.text(`Promotion: ${promotion}`, 20, 56);
  doc.text(`Motif: ${motif}`, 20, 63);
  doc.text(`Montant: ${montant}`, 20, 70);
  doc.text(`Référence: ${reference}`, 20, 77);
  doc.text(`Banque: ${banque}`, 20, 84);
  doc.text(`N° Compte: ${compte}`, 20, 91);
  doc.text(`Agence: ${agence}`, 20, 98);

  if (qrCanvas) {
    const qrDataUrl = qrCanvas.toDataURL();
    doc.addImage(qrDataUrl, 'PNG', 20, 110, 50, 50);
  }

  doc.save(`bon-${Date.now()}.pdf`);
}

// Voir anciens bons
document.getElementById('voirMesBons').addEventListener('click', () => {
  fetch('/api/bons', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(bons => {
    const container = document.getElementById('listeMesBons');
    container.innerHTML = '';

    if (bons.length === 0) {
      container.innerHTML = '<p>Aucun bon généré.</p>';
      return;
    }

    bons.forEach(bon => {
      const bloc = document.createElement("div");
      bloc.className = "bon";
      bloc.innerHTML = `
        <p><strong>Motif:</strong> ${bon.description}</p>
        <p><strong>Montant:</strong> ${bon.montant} $</p>
        <p><strong>Référence:</strong> ${bon.reference}</p>
        <p><strong>Statut:</strong> ${bon.statut}</p>
        <canvas id="qr-${bon.reference}"></canvas>
        <button class="export-btn" onclick="exporterPDF(this)">Exporter en PDF</button>
      `;
      container.appendChild(bloc);

      const qrText = `
Nom: ${window.userInfos.nom}
Prénom: ${window.userInfos.prenom}
Matricule: ${window.userInfos.matricule}
Motif: ${bon.description}
Montant: ${bon.montant}$
Réf: ${bon.reference}
Banque: Rawbank UPC
Compte: 00011-55101-12345678900-55
Agence: 55101-Kinshasa UPC
`.trim();

      QRCode.toCanvas(document.getElementById(`qr-${bon.reference}`), qrText, (error) => {
        if (error) console.error("QR Code error:", error);
      });
    });

    document.getElementById('mesBonsSection').style.display = 'block';
  })
  .catch(() => alert("Impossible de récupérer vos bons"));
});
