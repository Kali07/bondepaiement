document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    alert("Accès interdit. Veuillez vous connecter.");
    window.location.href = "admin-login.html";
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.nom) {
      document.getElementById("nom-admin").textContent = payload.nom;
    }
  } catch (err) {
    console.error("Erreur décodage token :", err);
    localStorage.removeItem("adminToken");
    window.location.href = "admin-login.html";
  }

  afficherSection("types-bons");
  chargerTypesBons();
  chargerTypesPourFiltre();
  chargerListeBons();

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("adminToken");
    window.location.href = "admin-login.html";
  });

  document.getElementById("add-bon-form").addEventListener("submit", ajouterTypeBon);
  document.getElementById("applyFilters").addEventListener("click", chargerListeBons);
});

// Gestion des sections
function afficherSection(sectionId) {
  document.querySelectorAll("section").forEach(section => {
    section.style.display = "none";
  });
  const activeSection = document.getElementById(sectionId);
  if (activeSection) activeSection.style.display = "block";

  if (sectionId === "stats-bons") {
    chargerStats();
  }
}

// Ajout type de bon
async function ajouterTypeBon(e) {
  e.preventDefault();
  const nom = document.getElementById("nom-bon").value.trim();
  const montant = parseInt(document.getElementById("montant-bon").value.trim(), 10);

  if (nom.length < 3 || isNaN(montant) || montant <= 0) {
    return alert("Nom et montant requis et valides.");
  }

  try {
    const token = localStorage.getItem("adminToken");
    const res = await fetch("/api/bons-types", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nom, montant })
    });
    if (!res.ok) throw new Error("Erreur lors de l’ajout.");
    document.getElementById("nom-bon").value = "";
    document.getElementById("montant-bon").value = "";
    chargerTypesBons();
    chargerTypesPourFiltre();
  } catch (err) {
    alert("Erreur : " + err.message);
  }
}

// Charger liste des types de bons
async function chargerTypesBons() {
  const token = localStorage.getItem("adminToken");
  try {
    const res = await fetch("/api/bons-types", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const tbody = document.getElementById("bonsTypesBody");
    tbody.innerHTML = "";

    data.forEach((type, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td><span class="type-nom">${type.nom}</span></td>
        <td><span class="type-montant">${type.montant}</span> $</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editerType(${type.id}, this)"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-danger" onclick="supprimerType(${type.id})"><i class="bi bi-trash"></i></button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Erreur chargement types :", err);
  }
}

// Charger types dans le filtre
async function chargerTypesPourFiltre() {
  const token = localStorage.getItem("adminToken");
  try {
    const res = await fetch("/api/bons-types", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const types = await res.json();
    const select = document.getElementById("filterType");
    select.innerHTML = '<option value="">Tous</option>';

    types.forEach(type => {
      const opt = document.createElement("option");
      opt.value = type.id;
      opt.textContent = type.nom;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Erreur filtres :", err);
  }
}

// Éditer type de bon (nom et montant)
function editerType(id, bouton) {
  const ligne = bouton.closest("tr");
  const nomCell = ligne.querySelector(".type-nom");
  const montantCell = ligne.querySelector(".type-montant");

  const ancienNom = nomCell.textContent;
  const ancienMontant = montantCell.textContent;

  const inputNom = document.createElement("input");
  inputNom.type = "text";
  inputNom.value = ancienNom;
  inputNom.className = "form-control form-control-sm mb-1";

  const inputMontant = document.createElement("input");
  inputMontant.type = "number";
  inputMontant.value = parseFloat(ancienMontant);
  inputMontant.className = "form-control form-control-sm";

  nomCell.replaceWith(inputNom);
  montantCell.replaceWith(inputMontant);

  bouton.innerHTML = '<i class="bi bi-check-lg"></i>';

  bouton.onclick = async () => {
    const nouveauNom = inputNom.value.trim();
    const nouveauMontant = parseInt(inputMontant.value.trim(), 10);

    if (nouveauNom.length < 3 || isNaN(nouveauMontant) || nouveauMontant <= 0) {
      return alert("Nom et montant requis.");
    }

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/bons-types/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nom: nouveauNom, montant: nouveauMontant })
      });
      if (!res.ok) throw new Error("Erreur modification.");
      chargerTypesBons();
      chargerTypesPourFiltre();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };
}

// Supprimer type de bon
async function supprimerType(id) {
  if (!confirm("Confirmer suppression ?")) return;
  try {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`/api/bons-types/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Erreur suppression.");
    chargerTypesBons();
    chargerTypesPourFiltre();
  } catch (err) {
    alert("Erreur : " + err.message);
  }
}

// Liste des bons avec filtres
async function chargerListeBons() {
  const token = localStorage.getItem("adminToken");
  const type = document.getElementById('filterType').value;
  const statut = document.getElementById('filterStatut').value;
  const dateDebut = document.getElementById('filterDate').value;

  const params = new URLSearchParams();
  if (type) params.append("type_id", type);
  if (statut) params.append("statut", statut);
  if (dateDebut) params.append("dateDebut", dateDebut);

  try {
    const res = await fetch(`/api/bons/admin?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const bons = await res.json();
    const tbody = document.querySelector('#bonsTable tbody');
    tbody.innerHTML = '';

    bons.forEach(bon => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${bon.reference}</td>
        <td>${bon.type_bon}</td>
        <td>${bon.description}</td>
        <td>${bon.montant} $</td>
        <td>${bon.statut}</td>
        <td>${bon.date_creation}</td>
        <td>${bon.nom_etudiant} ${bon.prenom_etudiant} (${bon.matricule_etudiant})</td>
        <td>
          <button class="btn btn-sm btn-success" onclick="changerStatut('${bon.id}', '${bon.statut}')">Modifier Statut</button>
          <button class="btn btn-sm btn-danger" onclick="supprimerBon('${bon.id}')">Supprimer</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Erreur chargement bons :", err);
  }
}

// Bouton Modifier Statut
async function changerStatut(id, actuel) {
  const nouveau = prompt("Nouveau statut (en attente / validé / annulé) :", actuel);
  if (!nouveau || !["en attente", "validé", "annulé"].includes(nouveau)) return alert("Statut invalide");

  const token = localStorage.getItem("adminToken");
  await fetch(`/api/bons/admin/${id}/statut`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ statut: nouveau })
  });
  chargerListeBons();
}

// Bouton Supprimer Bon
async function supprimerBon(id) {
  if (!confirm("Voulez-vous vraiment supprimer ce bon ?")) return;

  const token = localStorage.getItem("adminToken");
  await fetch(`/api/bons/admin/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  chargerListeBons();
}

// Chargement des statistiques
function chargerStats() {
  const token = localStorage.getItem("adminToken");

  fetch('/api/bons/admin-stats', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(stats => {
    document.getElementById("statTotal").textContent = stats.total;
    document.getElementById("statValides").textContent = stats.valides;
    document.getElementById("statAttente").textContent = stats.en_attente;
    document.getElementById("statAnnules").textContent = stats.annules;
    document.getElementById("statMontant").textContent = stats.montant_total + " $";
  })
  .catch(err => console.error("Erreur chargement stats :", err));
}
