require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

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
.then(async () => {
  console.log('✅ Connecté à MongoDB Atlas');
  // Seed admin user
  const adminEmail = 'othmanearroub2@gmail.com';
  const User = mongoose.model('User');
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('IDYAS2026', salt);
    await User.create({ email: adminEmail, password: hashedPassword });
    console.log('🔑 Utilisateur admin initialisé en base de données.');
  }
})
.catch(err => console.error('❌ Erreur de connexion MongoDB :', err));

// --- Nodemailer Configuration ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Mot de passe d'application (16 caractères)
  },
});

// Test transporter (debug)
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ Erreur configuration email :', error.message);
  } else {
    console.log('📧 Serveur prêt pour l\'envoi d\'emails');
  }
});

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// --- Mongoose Schema & Model ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

const User = mongoose.model('User', userSchema);

const entitySchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true }, // 'fournisseurs', 'transporteurs', 'clients'
  items: { type: [String], default: [] }
});

const Entity = mongoose.model('Entity', entitySchema);

const dossierSchema = new mongoose.Schema({
  ID_Dossier: { type: String, required: true, unique: true },
  Facture_No: { type: String, default: '' },
  Type_Operation: { type: String, default: '' },
  Fournisseur: { type: String, default: '' },
  Client: { type: String, default: '' },
  Agent: { type: String, default: '' },
  Armateur: { type: String, default: '' },
  Transporteur: { type: String, default: '' },
  Transitaire: { type: String, default: '' },
  Numero_TC: { type: String, default: '' },
  Numero_Remorque: { type: String, default: '' },
  Lieu_Chargement: { type: String, default: '' },
  Lieu_Dechargement: { type: String, default: '' },
  Mode_Transport: { type: String, default: '' },
  Type_Envoi: { type: String, default: '' },
  Incoterm: { type: String, default: '' },
  Marchandise: { type: String, default: '' },
  Designation: { type: String, default: '' },
  Nb_Colis: { type: String, default: '' },
  Nombre_Palettes: { type: String, default: '' },
  Poids_Brut: { type: String, default: '' },
  Volume: { type: String, default: '' },
  N_Plomb: { type: String, default: '' },
  Navire_Voyage: { type: String, default: '' },
  BL_LTA_CMR_No: { type: String, default: '' },
  Franchise: { type: String, default: '' },
  Port_Chargement: { type: String, default: '' },
  Date_Enlevement: { type: String, default: '' },
  ETD: { type: String, default: '' },
  ATD: { type: String, default: '' },
  ETA: { type: String, default: '' },
  ATA: { type: String, default: '' },
  Reception_BAD: { type: String, default: '' },
  Remis_Transit: { type: String, default: '' },
  Reception_Docs: { type: String, default: '' },
  Livre_Le: { type: String, default: '' },
  Observations: { type: String, default: '' },
  Historique: { type: String, default: '' },
  Destinataire: { type: String, default: '' },
  Booking_No: { type: String, default: '' },
  Sequence: { type: String, default: '' },
  Regle_Le: { type: String, default: '' },
  Export_Montant: { type: String, default: '' },
  DHP: { type: String, default: '' },
  DHR: { type: String, default: '' },
  Tare: { type: String, default: '' },
  TC_Type: { type: String, default: '' },
  Phase: { type: String, default: 'Dossier Créé' },
  Retard_Calcule: { type: Number, default: 0 },
  Fiabilite_Transporteur: { type: Number, default: 100 },
  Status: { type: String, default: 'En attente' },
  Documents: { type: [{ name: String, url: String, addedAt: String }], default: [] },
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
  },
  isArchived: { type: Boolean, default: false },
  Finances: {
    Achats: [{ desc: String, amount: Number }],
    Ventes: [{ desc: String, amount: Number }]
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
app.get('/api/entities', async (req, res) => {
  try {
    const Entity = mongoose.model('Entity');
    const entities = await Entity.find();
    res.json(entities);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des entités' });
  }
});

app.post('/api/entities/:type', async (req, res) => {
  try {
    const Entity = mongoose.model('Entity');
    const type = req.params.type;
    const { items } = req.body;
    let entity = await Entity.findOne({ type });
    if (!entity) {
      entity = new Entity({ type, items: [] });
    }
    entity.items = items;
    await entity.save();
    res.json(entity);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde de l\'entité' });
  }
});
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

// PATCH — Toggle archive status
app.patch('/api/dossiers/:id/archive', async (req, res) => {
  try {
    const dossier = await Dossier.findOne({ ID_Dossier: req.params.id });
    if (!dossier) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }
    dossier.isArchived = !dossier.isArchived;
    await dossier.save();
    res.json({ message: `Dossier ${dossier.isArchived ? 'archivé' : 'restauré'} avec succès`, dossier });
  } catch (error) {
    res.status(500).json({ error: "Échec de l'archivage du dossier" });
  }
});

// --- Auth Routes ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

    const User = mongoose.model('User');
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Mot de passe incorrect' });
    
    res.json({ message: 'Connexion réussie', user: { email: user.email, name: 'Administrateur' } });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
});

app.post('/api/generate-reset-token', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    const User = mongoose.model('User');
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'Cet email n\'existe pas.' });

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token for saving in DB (security best practice)
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes expiration

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    // Return the raw token (to be sent in the email by Vercel)
    res.json({ token: resetToken });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la génération du token' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token et nouveau mot de passe requis' });

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const User = mongoose.model('User');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() } // Token must not be expired
    });

    if (!user) {
      return res.status(400).json({ error: 'Le lien de réinitialisation est invalide ou a expiré' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear reset tokens
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la réinitialisation' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
});
