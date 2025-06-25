document.addEventListener("DOMContentLoaded", () => {
  chargerTypesBons();
 function afficherSection(sectionId) {
  const sections = document.querySelectorAll(".section-dashboard");
  sections.forEach(section => {
    section.style.display = "none";
  });

  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.style.display = "block";
  }
}
  // Ajouter un type de bon
  document.getElementById("add-bon-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nom = document.getElementById("nom-bon").value.trim();
    if (nom.length < 3) return alert("Le nom doit contenir au moins 3 caractères.");
    try {
      const res = await fetch("/api/bons-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom })
      });
      if (!res.ok) throw new Error("Erreur lors de l’ajout.");
      document.getElementById("nom-bon").value = "";
      chargerTypesBons();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  });
});
async function chargerTypesBons() {
  try {
    const res = await fetch("/api/bons-types");
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
      const res = await fetch(`/api/bons-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nouveauNom })
      });
      if (!res.ok) throw new Error("Erreur lors de la modification.");
      chargerTypesBons();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };
}
async function supprimerType(id) {
  if (!confirm("Voulez-vous vraiment supprimer ce type de bon ?")) return;

  try {
    const res = await fetch(`/api/bons-types/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erreur lors de la suppression.");
    chargerTypesBons();
  } catch (err) {
    alert("Erreur : " + err.message);
  }
}
// — SECTION : Liste des bons avec filtres
// Charger les types dans le filtre au chargement
async function chargerTypesPourFiltre() {
  const res = await fetch('/api/typesbons');
  const types = await res.json();
  const select = document.getElementById('filtre-type');
  types.forEach(type => {
    const opt = document.createElement('option');
    opt.value = type.id;
    opt.textContent = type.nom;
    select.appendChild(opt);
  });
}
async function chargerListeBons() {
  const type = document.getElementById('filtre-type').value;
  const statut = document.getElementById('filtre-statut').value;
  const dateDebut = document.getElementById('filtre-date-debut').value;
  const dateFin = document.getElementById('filtre-date-fin').value;
  let url = '/api/bons?';
  if (type) url += `type_id=${type}&`;
  if (statut) url += `statut=${statut}&`;
  if (dateDebut) url += `dateDebut=${dateDebut}&`;
  if (dateFin) url += `dateFin=${dateFin}`;

  const res = await fetch(url);
  const bons = await res.json();
  const tbody = document.querySelector('#table-bons tbody');
  tbody.innerHTML = '';

  bons.forEach(bon => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${bon.nom_type}</td>
      <td>${bon.montant}</td>
      <td>${bon.description}</td>
      <td>${bon.statut}</td>
      <td>${new Date(bon.date_creation).toLocaleDateString()}</td>
    `;
    tbody.appendChild(row);
  });
}
// Événement filtre
document.getElementById('btn-filtrer').addEventListener('click', chargerListeBons);
// Activer la section "Liste des bons" (ex: quand l'admin clique dans la sidebar)
document.getElementById('btn-liste-bons').addEventListener('click', () => {
  document.querySelectorAll(".section-dashboard").forEach(section => {
  section.style.display = "none";
});
  document.getElementById('liste-bons-section').style.display = 'block';
  chargerTypesPourFiltre();
  chargerListeBons();
});
