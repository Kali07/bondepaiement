document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    alert("Accès interdit. Veuillez vous connecter.");
    window.location.href = "admin-login.html";
    return;
  }
  console.log("[ADMIN] Token détecté :", token);

  afficherSection("types-bons");

  chargerTypesBons();
  chargerTypesPourFiltre();
  chargerListeBons();

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("adminToken");
    window.location.href = "admin-login.html";
  });

  document.getElementById("add-bon-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nom = document.getElementById("nom-bon").value.trim();
    if (nom.length < 3) return alert("Le nom doit contenir au moins 3 caractères.");
    try {
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
  });

  document.getElementById("applyFilters").addEventListener("click", chargerListeBons);

});

// Changement de section
function afficherSection(sectionId) {
  document.querySelectorAll("section").forEach(section => {
    section.style.display = "none";
  });
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.style.display = "block";
  }
}

// Charger types de bons tableau
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
    console.error("Erreur de chargement :", err);
  }
}

// Charger types de bons dans le filtre
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
    console.error("Erreur chargement filtres :", err);
  }
}

// Modifier un type de bon
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
      if (!res.ok) throw new Error("Erreur lors de la modification.");
      chargerTypesBons();
      chargerTypesPourFiltre();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };
}

// Supprimer un type de bon
async function supprimerType(id) {
  if (!confirm("Voulez-vous vraiment supprimer ce type de bon ?")) return;
  try {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`/api/bons-types/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Erreur lors de la suppression.");
    chargerTypesBons();
    chargerTypesPourFiltre();
  } catch (err) {
    alert("Erreur : " + err.message);
  }
}

// Charger liste des bons avec filtres
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
    const res = await fetch(`/api/bons?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const bons = await res.json();
    const tbody = document.querySelector('#bonsTable tbody');
    tbody.innerHTML = '';

    bons.forEach(bon => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${bon.type_bon}</td>
        <td>${bon.description}</td>
        <td>${bon.montant} $</td>
        <td>${bon.statut}</td>
        <td>${bon.date_creation}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Erreur chargement liste bons :", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    alert("Accès interdit. Veuillez vous connecter.");
    window.location.href = "admin-login.html";
    return;
  }

  const payload = JSON.parse(atob(token.split('.')[1])); 
  console.log("[ADMIN] Payload décodé :", payload);

  if (payload.nom) {
    document.getElementById("nom-admin").textContent = payload.nom;
  }

  afficherSection("types-bons");
  chargerTypesBons();
  chargerTypesPourFiltre();
  chargerListeBons();
});
