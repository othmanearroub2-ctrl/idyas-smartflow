require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['https://idyas-smartflow.vercel.app', 'http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(express.json());

// --- PostgreSQL Connexion ---
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// --- Models Definition ---

// User Model
const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, defaultValue: 'Utilisateur' },
  resetPasswordToken: { type: DataTypes.STRING },
  resetPasswordExpire: { type: DataTypes.DATE },
}, { timestamps: true });

// Entity Model (JSONB for items flexibility)
const Entity = sequelize.define('Entity', {
  type: { type: DataTypes.STRING, allowNull: false, unique: true },
  items: { type: DataTypes.JSONB, defaultValue: [] }
}, { timestamps: true });

// Dossier Model
const Dossier = sequelize.define('Dossier', {
  ID_Dossier: { type: DataTypes.STRING, primaryKey: true, unique: true },
  Facture_No: { type: DataTypes.STRING, defaultValue: '' },
  Type_Operation: { type: DataTypes.STRING, defaultValue: '' },
  Fournisseur: { type: DataTypes.STRING, defaultValue: '' },
  Client: { type: DataTypes.STRING, defaultValue: '' },
  Agent: { type: DataTypes.STRING, defaultValue: '' },
  Armateur: { type: DataTypes.STRING, defaultValue: '' },
  Transporteur: { type: DataTypes.STRING, defaultValue: '' },
  Transitaire: { type: DataTypes.STRING, defaultValue: '' },
  Numero_TC: { type: DataTypes.STRING, defaultValue: '' },
  Numero_Remorque: { type: DataTypes.STRING, defaultValue: '' },
  Lieu_Chargement: { type: DataTypes.STRING, defaultValue: '' },
  Lieu_Dechargement: { type: DataTypes.STRING, defaultValue: '' },
  Mode_Transport: { type: DataTypes.STRING, defaultValue: '' },
  Type_Envoi: { type: DataTypes.STRING, defaultValue: '' },
  Incoterm: { type: DataTypes.STRING, defaultValue: '' },
  Marchandise: { type: DataTypes.STRING, defaultValue: '' },
  Designation: { type: DataTypes.STRING, defaultValue: '' },
  Nb_Colis: { type: DataTypes.STRING, defaultValue: '' },
  Nombre_Palettes: { type: DataTypes.STRING, defaultValue: '' },
  Poids_Brut: { type: DataTypes.STRING, defaultValue: '' },
  Volume: { type: DataTypes.STRING, defaultValue: '' },
  N_Plomb: { type: DataTypes.STRING, defaultValue: '' },
  Navire_Voyage: { type: DataTypes.STRING, defaultValue: '' },
  BL_LTA_CMR_No: { type: DataTypes.STRING, defaultValue: '' },
  Franchise: { type: DataTypes.STRING, defaultValue: '' },
  Port_Chargement: { type: DataTypes.STRING, defaultValue: '' },
  Date_Enlevement: { type: DataTypes.STRING, defaultValue: '' },
  ETD: { type: DataTypes.STRING, defaultValue: '' },
  ATD: { type: DataTypes.STRING, defaultValue: '' },
  ETA: { type: DataTypes.STRING, defaultValue: '' },
  ATA: { type: DataTypes.STRING, defaultValue: '' },
  Reception_BAD: { type: DataTypes.STRING, defaultValue: '' },
  Remis_Transit: { type: DataTypes.STRING, defaultValue: '' },
  Reception_Docs: { type: DataTypes.STRING, defaultValue: '' },
  Livre_Le: { type: DataTypes.STRING, defaultValue: '' },
  Observations: { type: DataTypes.TEXT, defaultValue: '' },
  Historique: { type: DataTypes.TEXT, defaultValue: '' },
  Destinataire: { type: DataTypes.STRING, defaultValue: '' },
  Booking_No: { type: DataTypes.STRING, defaultValue: '' },
  Sequence: { type: DataTypes.STRING, defaultValue: '' },
  Regle_Le: { type: DataTypes.STRING, defaultValue: '' },
  Export_Montant: { type: DataTypes.STRING, defaultValue: '' },
  DHP: { type: DataTypes.STRING, defaultValue: '' },
  DHR: { type: DataTypes.STRING, defaultValue: '' },
  Tare: { type: DataTypes.STRING, defaultValue: '' },
  TC_Type: { type: DataTypes.STRING, defaultValue: '' },
  Phase: { type: DataTypes.STRING, defaultValue: 'Dossier Créé' },
  Retard_Calcule: { type: DataTypes.INTEGER, defaultValue: 0 },
  Fiabilite_Transporteur: { type: DataTypes.INTEGER, defaultValue: 100 },
  Status: { type: DataTypes.STRING, defaultValue: 'En attente' },
  isArchived: { type: DataTypes.BOOLEAN, defaultValue: false },
  // JSONB Fields (Replacing MongoDB nested objects/arrays)
  Documents: { type: DataTypes.JSONB, defaultValue: [] },
  DocVerif: { type: DataTypes.JSONB, defaultValue: {} },
  Finances: { type: DataTypes.JSONB, defaultValue: {} }
}, { timestamps: true });

// --- DB Init & Server Start ---
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connecté à PostgreSQL via Supabase');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synchronisées');
    
    // Seed users
    const usersToSeed = [
      { email: 'othmanearroub2@gmail.com', name: 'Administrateur' },
      { email: 'Exploitation@idyasshipping.ma', name: 'Exploitation' },
      { email: 'Tbouchra@idyasshipping.ma', name: 'Bouchra' },
      { email: 'Idrisstachfine@idyasshipping.ma', name: 'Idriss Tachfine' }
    ];

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.SEED_DEFAULT_PASSWORD || 'IDYAS2026', salt);

    for (const u of usersToSeed) {
      const existingUser = await User.findOne({ where: { email: u.email.toLowerCase() } });
      if (!existingUser) {
        await User.create({ 
          email: u.email.toLowerCase(), 
          password: hashedPassword,
          name: u.name 
        });
        console.log(`🔑 Utilisateur ${u.name} initialisé.`);
      } else if (existingUser.name === 'Utilisateur') {
        existingUser.name = u.name;
        await existingUser.save();
        console.log(`🔑 Nom mis à jour pour ${u.email}`);
      }
    }
    
    // Start Express ONLY after DB is ready
    app.listen(PORT, () => {
      console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Erreur de connexion PostgreSQL :', err);
    process.exit(1);
  }
};

startServer();

// --- Nodemailer Configuration ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.warn('⚠️ Erreur configuration email :', error.message);
  } else {
    console.log('📧 Serveur prêt pour l\'envoi d\'emails');
  }
});

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
    const entities = await Entity.findAll();
    res.json(entities);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des entités' });
  }
});

app.post('/api/entities/:type', async (req, res) => {
  try {
    const type = req.params.type;
    const { items } = req.body;
    let [entity] = await Entity.findOrCreate({ 
      where: { type },
      defaults: { items: [] }
    });
    entity.items = items;
    await entity.save();
    res.json(entity);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde de l\'entité' });
  }
});

app.get('/api/dossiers', async (req, res) => {
  try {
    const dossiers = await Dossier.findAll({ order: [['createdAt', 'DESC']] });
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

    const dossier = await Dossier.create(newDossierData);
    res.status(201).json({ message: 'Dossier créé avec succès (Postgres)', dossier });
  } catch (error) {
    console.error('Erreur POST /api/dossiers:', error);
    res.status(500).json({ error: 'Échec de la sauvegarde du dossier' });
  }
});

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

    const [updatedRowsCount, updatedRows] = await Dossier.update(updateData, {
      where: { ID_Dossier: req.params.id },
      returning: true // specific to Postgres
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }
    
    res.json({ message: 'Dossier modifié avec succès', dossier: updatedRows[0] });
  } catch (error) {
    console.error('Erreur PUT /api/dossiers:', error);
    res.status(500).json({ error: 'Échec de la modification du dossier' });
  }
});

app.patch('/api/dossiers/:id/archive', async (req, res) => {
  try {
    const dossier = await Dossier.findByPk(req.params.id);
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

app.delete('/api/dossiers/:id', async (req, res) => {
  try {
    const dossier = await Dossier.findByPk(req.params.id);
    if (!dossier) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }
    await dossier.destroy();
    res.json({ message: 'Dossier supprimé définitivement avec succès' });
  } catch (error) {
    console.error('Erreur DELETE /api/dossiers:', error);
    res.status(500).json({ error: 'Échec de la suppression du dossier' });
  }
});

// --- Auth Routes ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Mot de passe incorrect' });
    
    res.json({ message: 'Connexion réussie', user: { email: user.email, name: user.name } });
  } catch (error) {
    console.error('❌ Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
});

app.post('/api/generate-reset-token', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ error: 'Cet email n\'existe pas.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

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

    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Sequelize.Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Le lien de réinitialisation est invalide ou a expiré' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur reset-password:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la réinitialisation' });
  }
});
