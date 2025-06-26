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
}

// Ajout type de bon
async function ajouterTypeBon(e) {
  e.preventDefault();
  const nom = document.getElementById("nom-bon").value.trim();
  if (nom.length < 3) return alert("Le nom doit contenir au moins 3 caractères.");

  try {
    const token = localStorage.getItem("adminToken");
    const res = await fetch("/api/bons-types", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nom })
    });
    if (!res.ok) throw new Error("Erreur lors de l’ajout.");
    document.getElementById("nom-bon").value = "";
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

// Éditer type de bon
function editerType(id, bouton) {
  const ligne = bouton.closest("tr");
  const nomCell = ligne.querySelector(".type-nom");
  const ancienNom = nomCell.textContent;

  const input = document.createElement("input");
  input.type = "text";
  input.value = ancienNom;
  input.className = "form-control form-control-sm";
  nomCell.replaceWith(input);

  bouton.innerHTML = '<i class="bi bi-check-lg"></i>';

  bouton.onclick = async () => {
    const nouveauNom = input.value.trim();
    if (nouveauNom.length < 3) return alert("Nom trop court.");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/bons-types/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nom: nouveauNom })
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
  
console.log(params.toString());
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
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Erreur chargement bons :", err);
  }
}
