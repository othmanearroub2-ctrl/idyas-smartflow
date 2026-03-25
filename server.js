require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*', // En production, tu pourras restreindre au domaine Vercel
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// --- MongoDB Connexion ---
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Connecté à MongoDB Atlas'))
.catch(err => console.error('❌ Erreur de connexion MongoDB :', err));

// --- Mongoose Schema & Model ---
const dossierSchema = new mongoose.Schema({
  ID_Dossier: { type: String, required: true, unique: true },
  Type_Operation: { type: String, default: '' },
  Fournisseur: { type: String, default: '' },
  Client: { type: String, default: '' },
  Transporteur: { type: String, default: '' },
  Numero_TC: { type: String, default: '' },
  Numero_Remorque: { type: String, default: '' },
  Lieu_Chargement: { type: String, default: '' },
  Lieu_Dechargement: { type: String, default: '' },
  Mode_Transport: { type: String, default: '' },
  Type_Envoi: { type: String, default: '' },
  Incoterm: { type: String, default: '' },
  Marchandise: { type: String, default: '' },
  Nombre_Palettes: { type: String, default: '' },
  Poids_Brut: { type: String, default: '' },
  Volume: { type: String, default: '' },
  ETD: { type: String, default: '' },
  ATD: { type: String, default: '' },
  ETA: { type: String, default: '' },
  ATA: { type: String, default: '' },
  Retard_Calcule: { type: Number, default: 0 },
  Fiabilite_Transporteur: { type: Number, default: 100 },
  Status: { type: String, default: 'En attente' },
  Documents: { type: [{ name: String, addedAt: String }], default: [] },
  DocVerif: {
    PL_Poids: { type: String, default: '' },
    PL_Palettes: { type: String, default: '' },
    PL_Marchandise: { type: String, default: '' },
    CMR_Poids: { type: String, default: '' },
    CMR_Palettes: { type: String, default: '' },
    CMR_Marchandise: { type: String, default: '' },
    BL_Poids: { type: String, default: '' },
    BL_Palettes: { type: String, default: '' },
    BL_Marchandise: { type: String, default: '' }
  }
}, { timestamps: true });

const Dossier = mongoose.model('Dossier', dossierSchema);

// --- Helper functions ---
const calculateDelayDays = (etaStr, ataStr) => {
  if (!etaStr || !ataStr) return 0;
  const eta = new Date(etaStr);
  const ata = new Date(ataStr);
  eta.setHours(0, 0, 0, 0);
  ata.setHours(0, 0, 0, 0);
  const diffTime = ata - eta;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const determineStatus = (etd, atd, eta, ata, delayDays) => {
  if (!atd && !ata) return 'En attente';
  if (atd && !ata) return 'En transit';
  if (ata) {
    if (delayDays <= 0) return 'À l\'heure';
    return 'En retard';
  }
  return 'En attente';
};

// --- Routes ---
app.get('/api/dossiers', async (req, res) => {
  try {
    const dossiers = await Dossier.find().sort({ createdAt: -1 });
    res.json(dossiers);
  } catch (error) {
    console.error('Erreur GET /api/dossiers:', error);
    res.status(500).json({ error: 'Échec de la récupération des dossiers' });
  }
});

app.post('/api/dossiers', async (req, res) => {
  try {
    const newDossierData = req.body;
    
    let delayDays = 0;
    if (newDossierData.ETA && newDossierData.ATA) {
      delayDays = calculateDelayDays(newDossierData.ETA, newDossierData.ATA);
    }
    
    newDossierData.Retard_Calcule = Math.max(0, delayDays);
    newDossierData.Status = determineStatus(
      newDossierData.ETD, 
      newDossierData.ATD, 
      newDossierData.ETA, 
      newDossierData.ATA, 
      delayDays
    );

    const dossier = new Dossier(newDossierData);
    await dossier.save();
    
    res.status(201).json({ 
      message: 'Dossier créé avec succès (MongoDB)', 
      dossier 
    });
  } catch (error) {
    console.error('Erreur POST /api/dossiers:', error);
    res.status(500).json({ error: 'Échec de la sauvegarde du dossier' });
  }
});

// PUT — Modifier un dossier existant
app.put('/api/dossiers/:id', async (req, res) => {
  try {
    const updateData = req.body;
    
    let delayDays = 0;
    if (updateData.ETA && updateData.ATA) {
      delayDays = calculateDelayDays(updateData.ETA, updateData.ATA);
    }
    
    updateData.Retard_Calcule = Math.max(0, delayDays);
    updateData.Status = determineStatus(
      updateData.ETD, 
      updateData.ATD, 
      updateData.ETA, 
      updateData.ATA, 
      delayDays
    );

    const dossier = await Dossier.findOneAndUpdate(
      { ID_Dossier: req.params.id },
      updateData,
      { new: true }
    );
    
    if (!dossier) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }
    
    res.json({ message: 'Dossier modifié avec succès', dossier });
  } catch (error) {
    console.error('Erreur PUT /api/dossiers:', error);
    res.status(500).json({ error: 'Échec de la modification du dossier' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
});
