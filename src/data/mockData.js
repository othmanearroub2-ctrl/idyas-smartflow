// Données mock réalistes pour les dossiers d'exploitation Idyas Shipping

export const dossiers = [];

export const PHASES = [
  "Dossier Créé",
  "Documents Reçus",
  "Ouverture Dossier",
  "En transit",
  "Arrivage Port",
  "En Douane",
  "Bon à Délivrer (BAD)",
  "Livraison en cours",
  "Dossier Livré",
  "Facturation",
  "Clôturé"
];

// Helper pour déterminer le statut d'un dossier
export function getStatut(dossier) {
  if (dossier.ATA === null) return "En transit";
  if (dossier.Retard_Calcule > 0) return "En retard";
  return "À l'heure";
}

// Helper pour obtenir les transporteurs uniques
export function getTransporteurs() {
  return [...new Set(dossiers.map(d => d.Transporteur))].sort();
}

// Helper pour obtenir les clients uniques
export function getClients() {
  return [...new Set(dossiers.map(d => d.Client))].sort();
}

// Helper pour obtenir les modes uniques
export function getModes() {
  return [...new Set(dossiers.map(d => d.Mode_Transport))].sort();
}

// Calcul des KPIs
export function calculateKPIs(data) {
  const dossiersActifs = data.length;
  const retardsCritiques = data.filter(d => d.Retard_Calcule !== null && d.Retard_Calcule > 2).length;
  
  const fiabilites = data.map(d => d.Fiabilite_Transporteur);
  const fiabiliteMoyenne = fiabilites.length > 0 
    ? Math.round(fiabilites.reduce((a, b) => a + b, 0) / fiabilites.length) 
    : 0;

  const groupage = data.filter(d => d.Type_Envoi === "LCL").length;
  const complet = data.filter(d => d.Type_Envoi === "FCL").length;

  return { dossiersActifs, retardsCritiques, fiabiliteMoyenne, groupage, complet };
}

// Stats Focus Maroc
export function getFocusMarocStats(data) {
  const casablanca = data.filter(d => {
    const lieu = (d.Lieu_Dechargement || '').toLowerCase();
    return lieu.includes("casablanca") || lieu.includes("casa") || lieu.includes("mohammed v");
  });
  const tangerMed = data.filter(d => {
    const lieu = (d.Lieu_Dechargement || '').toLowerCase();
    return lieu.includes("tanger");
  });

  const calcFiab = (arr) => {
    if (arr.length === 0) return 0;
    return Math.round(arr.reduce((a, b) => a + b.Fiabilite_Transporteur, 0) / arr.length);
  };

  const calcRetard = (arr) => {
    const retards = arr.filter(d => d.Retard_Calcule !== null && d.Retard_Calcule > 0);
    return retards.length;
  };

  const calcEnTransit = (arr) => arr.filter(d => d.ATA === null).length;

  return {
    casablanca: {
      total: casablanca.length,
      fiabilite: calcFiab(casablanca),
      retards: calcRetard(casablanca),
      enTransit: calcEnTransit(casablanca),
      fcl: casablanca.filter(d => d.Type_Envoi === "FCL").length,
      lcl: casablanca.filter(d => d.Type_Envoi === "LCL").length,
    },
    tangerMed: {
      total: tangerMed.length,
      fiabilite: calcFiab(tangerMed),
      retards: calcRetard(tangerMed),
      enTransit: calcEnTransit(tangerMed),
      fcl: tangerMed.filter(d => d.Type_Envoi === "FCL").length,
      lcl: tangerMed.filter(d => d.Type_Envoi === "LCL").length,
    },
  };
}
