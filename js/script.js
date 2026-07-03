// =============================
// 1) LISTE DES SOUS-CATÉGORIES
// =============================
const sousCategoriesParCategorie = {
  depistage: [
    { value: 'population_generale', label: 'Population générale' }
  ],
  diagnostic_precoce: [
    { value: 'plainte_cognitive', label: 'Plainte cognitive' },
    { value: 'alerte_entourage', label: 'Alerte de l’entourage' },
    { value: 'situations_cliniques', label: 'Situations cliniques à risque' },
    { value: 'benefices', label: 'Bénéfices' }
  ],
  evaluation_initiale: [
    { value: 'entretien', label: 'Entretien' },
    { value: 'antecedents', label: 'Antécédents' },
    { value: 'retentissement', label: 'Retentissement' },
    { value: 'mmse', label: 'MMSE' }
  ],
  diagnostic: [
    { value: 'causes_alternatives', label: 'Causes alternatives' }
  ],
  examens: [
    { value: 'biologie', label: 'Biologie' },
    { value: 'imagerie', label: 'Imagerie' }
  ],
  orientation: [
    { value: 'avis_specialise', label: 'Avis spécialisé' }
  ],
  annonce: [
    { value: 'consultation_dediee', label: 'Consultation dédiée' }
  ],
  prise_en_charge: [
    { value: 'plan_soins', label: 'Plan de soins' }
  ],
  interventions_non_medicamenteuses: [
    { value: 'approche_globale', label: 'Approche globale' }
  ],
  aidants: [
    { value: 'soutien', label: 'Soutien' }
  ],
  suivi: [
    { value: 'medecin_traitant', label: 'Médecin traitant' },
    { value: 'contenu_consultation', label: 'Contenu de consultation' }
  ],
  securite: [
    { value: 'environnement_juridique', label: 'Environnement et juridique' }
  ]
};

// =========================================
// 2) RÉCUPÉRATION DES ÉLÉMENTS DE LA PAGE 
// =========================================
const form = document.getElementById('form-api');
const apiUrlInput = document.getElementById('apiUrl');
const categorieInput = document.getElementById('categorie');
const sousCategorieInput = document.getElementById('sousCategorie');
const publicInput = document.getElementById('public');
const message = document.getElementById('message');
const resume = document.getElementById('resume');
const resultats = document.getElementById('resultats');
const btnReset = document.getElementById('btnReset');
const blocResultats = document.getElementById('bloc-resultats');


// ====================================
// 3) FONCTION POUR AFFICHER UN MESSAGE
// ====================================
function afficherMessage(texte, type = '') {
  if (!message) return;
  message.textContent = texte;
  message.className = `message ${type}`.trim();
}

// =======================================
// 4) REMPLIR LA LISTE DES SOUS-CATÉGORIES 
// =======================================
function remplirSousCategories(categorie) {
  if (!sousCategorieInput) return;

  sousCategorieInput.innerHTML = '<option value="">Toutes</option>';

  if (!categorie || !sousCategoriesParCategorie[categorie]) {
    sousCategorieInput.disabled = true;
    return;
  }

  sousCategoriesParCategorie[categorie].forEach((item) => {
    const option = document.createElement('option');
    option.value = item.value;
    option.textContent = item.label;
    sousCategorieInput.appendChild(option);
  });

  sousCategorieInput.disabled = false;
}

// ========================================
// 5) CRÉER UNE CARTE DE RÉSULTAT À L'ÉCRAN
// ========================================
function creerCarte(item) {
  const carte = document.createElement('article');
  carte.className = 'carte-resultat';

  carte.innerHTML = `
    <div class="meta">
      <span class="badge">${item.categorie || 'Non précisée'}</span>
      <span class="badge badge-secondaire">${item.public || 'Tous'}</span>
    </div>
    <h3>${item.titre || 'Sans titre'}</h3>
    <p><strong>Sous-catégorie :</strong> ${item.sous_categorie || 'Non précisée'}</p>
    <p>${item.contenu || 'Aucun contenu disponible.'}</p>
    <p class="source"><strong>Source :</strong> ${item.source || 'Non précisée'}</p>
  `;

  return carte;
}

// =========================================
// 6) FONCTION PRINCIPALE : INTERROGER L'API
// =========================================
async function testerApi(e) {
  e.preventDefault();

  if (!apiUrlInput || !resume || !resultats) return;

  afficherMessage('Chargement des recommandations...', 'info');
  resume.textContent = '';
  resultats.innerHTML = '';

  const valeurUrl = apiUrlInput.value.trim();

  if (!valeurUrl) {
    afficherMessage("Veuillez saisir l’URL de l’API.", 'warning');
    return;
  }

  try {
    const url = new URL(valeurUrl);

    if (categorieInput && categorieInput.value) {
      url.searchParams.set('categorie', categorieInput.value);
    }

    if (sousCategorieInput && sousCategorieInput.value) {
      url.searchParams.set('sous_categorie', sousCategorieInput.value);
    }

    if (publicInput && publicInput.value) {
      url.searchParams.set('public', publicInput.value);
    }

    const reponse = await fetch(url.toString());

    if (!reponse.ok) {
      throw new Error(`Erreur HTTP ${reponse.status}`);
    }

    const donnees = await reponse.json();

    if (!Array.isArray(donnees) || donnees.length === 0) {
      afficherMessage('Aucune recommandation trouvée pour ces filtres.', 'warning');
      resume.textContent = '0 résultat';
      if (blocResultats) {
        blocResultats.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
      return;
    }

    afficherMessage('Requête réussie.', 'success');
    resume.textContent = `${donnees.length} résultat(s) trouvé(s)`;

    donnees.forEach((item) => {
      resultats.appendChild(creerCarte(item));
    });

    if (blocResultats) {
      blocResultats.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  } catch (erreur) {
    afficherMessage("Erreur : impossible de contacter l'API.", 'error');
    resume.textContent = '';
    resultats.innerHTML = '';
    console.error(erreur);
  }
}

// =========================================
// 7) RÉINITIALISER LA PAGE ET LE FORMULAIRE
// =========================================
function reinitialiserPage() {
  if (form) {
    form.reset();
  }

  afficherMessage('');

  if (resume) {
    resume.textContent = '';
  }

  if (resultats) {
    resultats.innerHTML = '';
  }

  remplirSousCategories('');
}

// =======================================
// 8) GESTION DES ACTIONS DE L'UTILISATEUR
// =======================================
if (categorieInput) {
  categorieInput.addEventListener('change', (e) => {
    remplirSousCategories(e.target.value);
  });
}

if (form) {
  form.addEventListener('submit', testerApi);
}

if (btnReset) {
  btnReset.addEventListener('click', () => {
    setTimeout(reinitialiserPage, 0);
  });
}

// ================================
// 9) ÉTAT AU CHARGEMENT DE LA PAGE
// ================================
remplirSousCategories('');
