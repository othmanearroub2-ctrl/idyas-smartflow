import React, { useState, useEffect, useRef } from 'react';
import { PHASES } from '../data/mockData';
import DocumentViewer from './DocumentViewer';

const NouveauDossierModal = ({ isOpen, onClose, onSave, nextId, fournisseurs = [], transporteurs = [], clients = [], editDossier = null }) => {
  const modalRef = useRef(null);

  const emptyForm = {
    ID_Dossier: '',
    Facture_No: '',
    Type_Operation: 'Import', // Default to Import as requested
    Fournisseur: '',
    Client: '',
    Agent: '',
    Armateur: '',
    Transporteur: '',
    Transitaire: '',
    Numero_TC: '',
    Numero_Remorque: '',
    Lieu_Chargement: '',
    Lieu_Dechargement: '',
    Mode_Transport: '',
    Type_Envoi: '',
    Incoterm: '',
    Marchandise: '',
    Designation: '',
    Nb_Colis: '',
    Nombre_Palettes: '',
    Poids_Brut: '',
    Volume: '',
    N_Plomb: '',
    Navire_Voyage: '',
    BL_LTA_CMR_No: '',
    Franchise: '',
    Port_Chargement: '',
    Date_Enlevement: '',
    ETD: '',
    ETA: '',
    ATD: '',
    ATA: '',
    Reception_BAD: '',
    Remis_Transit: '',
    Reception_Docs: '',
    Livre_Le: '',
    Observations: '',
    Historique: '',
    Documents: [],
    DocVerif: {
      PL_Poids: '', PL_Palettes: '', PL_Marchandise: '',
      CMR_Poids: '', CMR_Palettes: '', CMR_Marchandise: '',
      BL_Poids: '', BL_Palettes: '', BL_Marchandise: '',
    },
    Finances: {
      Achats: [],
      Ventes: []
    },
    Destinataire: '',
    Booking_No: '',
    Sequence: '',
    Regle_Le: '',
    Export_Montant: '',
    DHP: '',
    DHR: '',
    Tare: '',
    TC_Type: '',
    Phase: 'Dossier Créé',
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const fileInputRef = useRef(null);

  const isEditMode = !!editDossier;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editDossier) {
        // Edit mode: pre-fill form with existing dossier data
        setForm({
          ...emptyForm,
          ...editDossier,
          Documents: editDossier.Documents || [],
        });
      } else {
        // Create mode: empty form with next ID
        setForm({ ...emptyForm, ID_Dossier: nextId });
      }
      setErrors({});
      setNewDocName('');
      setNewDocUrl('');
    }
  }, [isOpen, nextId, editDossier]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleChange = (field, value) => {
    if (field.startsWith('PL_') || field.startsWith('CMR_') || field.startsWith('BL_')) {
      // Nested DocVerif field
      setForm(prev => ({
        ...prev,
        DocVerif: { ...prev.DocVerif, [field]: value },
      }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  // --- Document management ---
  const handleAddDocument = () => {
    const name = newDocName.trim();
    const url = newDocUrl.trim();
    if (!name && !url) return;
    setForm(prev => ({
      ...prev,
      Documents: [...prev.Documents, { name: name || 'Document', url, addedAt: new Date().toISOString() }],
    }));
    setNewDocName('');
    setNewDocUrl('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'idyas_new';

    if (!cloudName || !uploadPreset) {
      alert("⚠️ Configuration manquante : Veuillez configurer VITE_CLOUDINARY_CLOUD_NAME et VITE_CLOUDINARY_UPLOAD_PRESET dans le fichier .env (à la racine du projet frontend)");
      return;
    }

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      // Determine the correct Cloudinary resource type based on file extension
      const fileName = file.name;
      const ext = fileName.split('.').pop().toLowerCase();
      const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'tiff'];
      const resourceType = imageExts.includes(ext) ? 'image' : 'raw';

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Cloudinary error:', errorData);
        throw new Error(errorData.error?.message || 'Erreur upload Cloudinary');
      }
      
      const data = await res.json();
      const fileUrl = data.secure_url;

      setForm(prev => ({
        ...prev,
        Documents: [...prev.Documents, { name: newDocName.trim() || fileName, url: fileUrl, type: ext, addedAt: new Date().toISOString() }],
      }));
      setNewDocName('');
      setNewDocUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      alert("Échec de l'upload du fichier. Vérifiez votre connexion ou la configuration Cloudinary.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleRemoveDocument = (index) => {
    setForm(prev => ({
      ...prev,
      Documents: prev.Documents.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};
    const required = ['ID_Dossier', 'Fournisseur', 'Client', 'Transporteur'];
    required.forEach(field => {
      if (!form[field]) newErrors[field] = 'Champ requis';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditMode) {
      // Edit mode: send updated dossier
      onSave(form, true); // true = isEdit
    } else {
      // Create mode
      const newDossier = {
        ...form,
        ATD: form.ATD || null,
        ATA: form.ATA || null,
        Retard_Calcule: null,
        Fiabilite_Transporteur: 90,
      };
      onSave(newDossier, false);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-dark-600/50 animate-slide-up"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-dark-700/50 bg-dark-800/95 backdrop-blur-xl rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${isEditMode ? 'from-amber-500/20 to-orange-500/20' : 'from-emerald-500/20 to-primary-500/20'}`}>
              {isEditMode ? (
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{isEditMode ? 'Modifier le Dossier' : 'Nouveau Dossier'}</h2>
              <p className="text-xs text-dark-400">{isEditMode ? `Modification de ${form.ID_Dossier}` : "Créer un nouveau dossier d'exploitation"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section: Identité & Parties */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-dark-600" />
              Identité & Parties
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="Dossier N°" error={errors.ID_Dossier}>
                <input
                  type="text"
                  value={form.ID_Dossier}
                  onChange={(e) => handleChange('ID_Dossier', e.target.value)}
                  placeholder="IDY-2026-XXX"
                  className="form-input"
                  disabled={isEditMode}
                />
              </FormField>
              <FormField label="Facture N°">
                <input
                  type="text"
                  value={form.Facture_No}
                  onChange={(e) => handleChange('Facture_No', e.target.value)}
                  placeholder="Facture N°"
                  className="form-input"
                />
              </FormField>
              <FormField label="Type d'Opération" error={errors.Type_Operation}>
                <select
                  value={form.Type_Operation}
                  onChange={(e) => handleChange('Type_Operation', e.target.value)}
                  className="form-input form-select"
                >
                  <option value="Import">📥 Import</option>
                  <option value="Export">📤 Export</option>
                </select>
              </FormField>
              <FormField label="Phase actuelle (Manuel)">
                <select
                  value={form.Phase || 'Dossier Créé'}
                  onChange={(e) => handleChange('Phase', e.target.value)}
                  className="form-input form-select border-primary-500/30 text-primary-400 font-semibold"
                >
                  {PHASES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </FormField>
              
              <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                <FormField label="Client" error={errors.Client}>
                  <select
                    value={form.Client}
                    onChange={(e) => handleChange('Client', e.target.value)}
                    className="form-input form-select"
                  >
                    <option value="">Sélectionner...</option>
                    {clients.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Fournisseur" error={errors.Fournisseur}>
                  <select
                    value={form.Fournisseur}
                    onChange={(e) => handleChange('Fournisseur', e.target.value)}
                    className="form-input form-select"
                  >
                    <option value="">Sélectionner...</option>
                    {fournisseurs.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Agent">
                  <input
                    type="text"
                    value={form.Agent}
                    onChange={(e) => handleChange('Agent', e.target.value)}
                    placeholder="Agent"
                    className="form-input"
                  />
                </FormField>
                <FormField label="Armateur">
                  <input
                    type="text"
                    value={form.Armateur}
                    onChange={(e) => handleChange('Armateur', e.target.value)}
                    placeholder="Armateur"
                    className="form-input"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Section: Marchandise */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-dark-600" />
              Marchandise
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="Nb de Colis">
                <input
                  type="text"
                  value={form.Nb_Colis}
                  onChange={(e) => handleChange('Nb_Colis', e.target.value)}
                  placeholder="Ex: 12"
                  className="form-input"
                />
              </FormField>
              <FormField label="Poids Brut (kg)">
                <input
                  type="text"
                  value={form.Poids_Brut}
                  onChange={(e) => handleChange('Poids_Brut', e.target.value)}
                  placeholder="Ex: 2500"
                  className="form-input"
                />
              </FormField>
              <FormField label="Volume (m³)">
                <input
                  type="text"
                  value={form.Volume}
                  onChange={(e) => handleChange('Volume', e.target.value)}
                  placeholder="Ex: 15.5 m³"
                  className="form-input"
                />
              </FormField>
              <FormField label="Désignation" fullWidth>
                <input
                  type="text"
                  value={form.Designation}
                  onChange={(e) => handleChange('Designation', e.target.value)}
                  placeholder="Description de la marchandise"
                  className="form-input"
                />
              </FormField>
            </div>
          </div>

          {/* Section: Logistique & Transport */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-dark-600" />
              Logistique Principale
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="Provenance (Départ)">
                <input
                  type="text"
                  value={form.Lieu_Chargement}
                  onChange={(e) => handleChange('Lieu_Chargement', e.target.value)}
                  placeholder="Provenance"
                  className="form-input"
                />
              </FormField>
              <FormField label="Destination (Arrivée)">
                <input
                  type="text"
                  value={form.Lieu_Dechargement}
                  onChange={(e) => handleChange('Lieu_Dechargement', e.target.value)}
                  placeholder="Destination"
                  className="form-input"
                />
              </FormField>
              <FormField label="N° TC / SR">
                <input
                  type="text"
                  value={form.Numero_TC}
                  onChange={(e) => handleChange('Numero_TC', e.target.value.toUpperCase())}
                  placeholder="Ex: MSCU1234567"
                  className="form-input"
                />
              </FormField>
              <FormField label="N° de Plomb">
                <input
                  type="text"
                  value={form.N_Plomb}
                  onChange={(e) => handleChange('N_Plomb', e.target.value)}
                  placeholder="N° de Plomb"
                  className="form-input"
                />
              </FormField>

              <FormField label="Incoterm">
                <select
                  value={form.Incoterm}
                  onChange={(e) => handleChange('Incoterm', e.target.value)}
                  className="form-input form-select"
                >
                  <option value="">Sélectionner...</option>
                  <option value="EXW">EXW</option>
                  <option value="FCA">FCA</option>
                  <option value="FOB">FOB</option>
                  <option value="CFR">CFR</option>
                  <option value="CIF">CIF</option>
                  <option value="DAP">DAP</option>
                  <option value="DDP">DDP</option>
                </select>
              </FormField>
              <FormField label="Navire / Voyage">
                <input
                  type="text"
                  value={form.Navire_Voyage}
                  onChange={(e) => handleChange('Navire_Voyage', e.target.value)}
                  placeholder="Navire / Voyage"
                  className="form-input"
                />
              </FormField>
              <FormField label="BL / LTA / CMR N°">
                <input
                  type="text"
                  value={form.BL_LTA_CMR_No}
                  onChange={(e) => handleChange('BL_LTA_CMR_No', e.target.value)}
                  placeholder="N° Transport"
                  className="form-input"
                />
              </FormField>
              <FormField label="Franchise">
                <input
                  type="text"
                  value={form.Franchise}
                  onChange={(e) => handleChange('Franchise', e.target.value)}
                  placeholder="Franchise"
                  className="form-input"
                />
              </FormField>
              
              <FormField label="Port de Chargement">
                <input
                  type="text"
                  value={form.Port_Chargement}
                  onChange={(e) => handleChange('Port_Chargement', e.target.value)}
                  placeholder="Port de Chargement"
                  className="form-input"
                />
              </FormField>
              <FormField label="Date d'Enlèvement">
                <input
                  type="date"
                  value={form.Date_Enlevement}
                  onChange={(e) => handleChange('Date_Enlevement', e.target.value)}
                  className="form-input"
                />
              </FormField>
              <FormField label="Transitaire">
                <input
                  type="text"
                  value={form.Transitaire}
                  onChange={(e) => handleChange('Transitaire', e.target.value)}
                  placeholder="Transitaire"
                  className="form-input"
                />
              </FormField>
              <FormField label="Transporteur" error={errors.Transporteur}>
                <select
                  value={form.Transporteur}
                  onChange={(e) => handleChange('Transporteur', e.target.value)}
                  className="form-input form-select"
                >
                  <option value="">Sélectionner...</option>
                  {transporteurs.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </FormField>
            </div>
          </div>

          {/* Section: Spécificités EXPORT (Conditionnel) */}
          {form.Type_Operation === 'Export' && (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 animate-fade-in">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-2">
                <span className="w-5 h-px bg-amber-500/30" />
                Spécificités EXPORT
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField label="Destinataire">
                  <input type="text" value={form.Destinataire} onChange={(e) => handleChange('Destinataire', e.target.value)} placeholder="Destinataire" className="form-input border-amber-500/20 focus:border-amber-500/50" />
                </FormField>
                <FormField label="N° de Booking">
                  <input type="text" value={form.Booking_No} onChange={(e) => handleChange('Booking_No', e.target.value)} placeholder="N° Booking" className="form-input border-amber-500/20 focus:border-amber-500/50" />
                </FormField>
                <FormField label="Séquence">
                  <input type="text" value={form.Sequence} onChange={(e) => handleChange('Sequence', e.target.value)} placeholder="Séquence" className="form-input border-amber-500/20 focus:border-amber-500/50" />
                </FormField>
                <FormField label="Tare">
                  <input type="text" value={form.Tare} onChange={(e) => handleChange('Tare', e.target.value)} placeholder="Tare" className="form-input border-amber-500/20 focus:border-amber-500/50" />
                </FormField>
                
                <FormField label="Réglé le">
                  <input type="date" value={form.Regle_Le} onChange={(e) => handleChange('Regle_Le', e.target.value)} className="form-input border-amber-500/20 focus:border-amber-500/50" />
                </FormField>
                <FormField label="Montant">
                  <input type="text" value={form.Export_Montant} onChange={(e) => handleChange('Export_Montant', e.target.value)} placeholder="Montant" className="form-input border-amber-500/20 focus:border-amber-500/50" />
                </FormField>
                <FormField label="D.H.P">
                  <input type="text" value={form.DHP} onChange={(e) => handleChange('DHP', e.target.value)} placeholder="DHP" className="form-input border-amber-500/20 focus:border-amber-500/50" />
                </FormField>
                <FormField label="D.H.R">
                  <input type="text" value={form.DHR} onChange={(e) => handleChange('DHR', e.target.value)} placeholder="DHR" className="form-input border-amber-500/20 focus:border-amber-500/50" />
                </FormField>
                
                <FormField label="Type TC (Autres)">
                  <input type="text" value={form.TC_Type} onChange={(e) => handleChange('TC_Type', e.target.value)} placeholder="Type de TC" className="form-input border-amber-500/20 focus:border-amber-500/50" />
                </FormField>
              </div>
            </div>
          )}

          {/* Section: Suivi & Dates */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-dark-600" />
              Suivi & Dates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="ETD (Départ Prévu)">
                <input type="date" value={form.ETD} onChange={(e) => handleChange('ETD', e.target.value)} className="form-input" />
              </FormField>
              <FormField label="ETA (Arrivée Prévue)">
                <input type="date" value={form.ETA} onChange={(e) => handleChange('ETA', e.target.value)} className="form-input" />
              </FormField>
              <FormField label="ATD (Départ Réel)">
                <input type="date" value={form.ATD || ''} onChange={(e) => handleChange('ATD', e.target.value)} className="form-input" />
              </FormField>
              <FormField label="ATA (Arrivée Réelle)">
                <input type="date" value={form.ATA || ''} onChange={(e) => handleChange('ATA', e.target.value)} className="form-input" />
              </FormField>
              
              <FormField label="Réception du BAD le">
                <input type="date" value={form.Reception_BAD} onChange={(e) => handleChange('Reception_BAD', e.target.value)} className="form-input" />
              </FormField>
              <FormField label="Remis au Transit le">
                <input type="date" value={form.Remis_Transit} onChange={(e) => handleChange('Remis_Transit', e.target.value)} className="form-input" />
              </FormField>
              <FormField label="Réception des Docs le">
                <input type="date" value={form.Reception_Docs} onChange={(e) => handleChange('Reception_Docs', e.target.value)} className="form-input" />
              </FormField>
              <FormField label="Livré le">
                <input type="date" value={form.Livre_Le} onChange={(e) => handleChange('Livre_Le', e.target.value)} className="form-input" />
              </FormField>
            </div>
          </div>

          {/* Section: Notes & Historique */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-dark-600" />
              Notes & Historique
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <FormField label="Observations">
                <input
                  type="text"
                  value={form.Observations}
                  onChange={(e) => handleChange('Observations', e.target.value)}
                  placeholder="Observations..."
                  className="form-input"
                />
              </FormField>
              <FormField label="Historique du dossier">
                <textarea
                  value={form.Historique}
                  onChange={(e) => handleChange('Historique', e.target.value)}
                  placeholder="Historique..."
                  className="form-input resize-y min-h-[100px]"
                />
              </FormField>
            </div>
          </div>

          {/* Section: Documents */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-dark-600" />
              Documents Attachés
            </h3>
            
            {/* Document list */}
            {form.Documents && form.Documents.length > 0 && (
              <div className="space-y-2 mb-3">
                {form.Documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-dark-900/50 border border-dark-700/50">
                    <div className="flex items-center gap-2">
                      <svg className={`w-4 h-4 shrink-0 ${(doc.type || doc.url?.split('.').pop()?.toLowerCase()) === 'pdf' ? 'text-red-400' : 'text-primary-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      {doc.url ? (
                        <button
                          type="button"
                          onClick={() => setViewingDoc(doc)}
                          className="text-sm text-primary-400 hover:text-primary-300 hover:underline truncate max-w-[300px] text-left"
                          title="Cliquer pour visualiser"
                        >
                          {doc.name}
                        </button>
                      ) : (
                        <span className="text-sm text-dark-200 truncate max-w-[300px]">{doc.name}</span>
                      )}
                      <span className="text-[10px] text-dark-500 uppercase">{doc.type || ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {doc.url && (
                        <button
                          type="button"
                          onClick={() => setViewingDoc(doc)}
                          className="p-1 rounded-lg hover:bg-primary-500/10 text-dark-500 hover:text-primary-400 transition-colors shrink-0"
                          title="Visualiser"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(i)}
                        className="p-1 rounded-lg hover:bg-red-500/10 text-dark-500 hover:text-red-400 transition-colors shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new document */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="Nom du document (BL, CMR...)"
                  className="form-input flex-1"
                />
                <input
                  type="url"
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDocument(); } }}
                  placeholder="Ou Lien URL (G.Drive...)"
                  className="form-input flex-1"
                />

                {/* File Upload Button */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingDoc}
                  className="px-3 py-2.5 rounded-xl text-sm font-medium text-dark-300 bg-dark-700/50 border border-dark-600
                             hover:bg-dark-600 hover:text-white transition-all duration-200 shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                  title="Uploader un fichier local (Cloudinary)"
                >
                  {uploadingDoc ? (
                    <span className="w-4 h-4 border-2 border-dark-400 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                  )}
                  Upload
                </button>

                <button
                  type="button"
                  onClick={handleAddDocument}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-primary-400 bg-primary-500/10 border border-primary-500/30
                             hover:bg-primary-500/20 transition-all duration-200 shrink-0 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Ajouter
                </button>
              </div>
            </div>
            <p className="text-xs text-dark-500 mt-2 italic">
              Ex: BL, CMR, Facture commerciale, Certificate d'origine, Packing List, DUM...
            </p>
          </div>

          {/* Section: Vérification Documentaire (edit mode only) */}
          {isEditMode && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-2">
                <span className="w-5 h-px bg-dark-600" />
                🔍 Vérification de Conformité Documentaire
              </h3>
              <p className="text-xs text-dark-500 mb-4">
                Saisissez les valeurs de chaque document pour détecter les écarts automatiquement (tolérance ±2% pour le poids).
              </p>

              {/* Input grid: PL / CMR / BL */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-dark-700/50">
                      <th className="text-left py-2 px-2 text-dark-400 font-medium">Champ</th>
                      <th className="text-center py-2 px-2 text-dark-400 font-medium">📋 Packing List</th>
                      <th className="text-center py-2 px-2 text-dark-400 font-medium">🚛 CMR / BL Route</th>
                      <th className="text-center py-2 px-2 text-dark-400 font-medium">🚢 B/L Maritime</th>
                      <th className="text-center py-2 px-2 text-dark-400 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <VerifRow 
                      label="Poids (kg)"
                      fields={['PL_Poids', 'CMR_Poids', 'BL_Poids']}
                      form={form} handleChange={handleChange}
                      type="weight"
                    />
                    <VerifRow 
                      label="Nb Palettes"
                      fields={['PL_Palettes', 'CMR_Palettes', 'BL_Palettes']}
                      form={form} handleChange={handleChange}
                      type="exact"
                    />
                    <VerifRow 
                      label="Marchandise"
                      fields={['PL_Marchandise', 'CMR_Marchandise', 'BL_Marchandise']}
                      form={form} handleChange={handleChange}
                      type="text"
                    />
                  </tbody>
                </table>
              </div>

              {/* Global conformity badge */}
              <ConformityBadge docVerif={form.DocVerif} />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-dark-300 bg-dark-700/50 border border-dark-600
                         hover:bg-dark-600 hover:text-white transition-all duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                         bg-gradient-to-r ${isEditMode ? 'from-amber-500 to-orange-500 shadow-amber-500/20 hover:shadow-amber-500/30 hover:from-amber-400 hover:to-orange-400' : 'from-emerald-500 to-emerald-600 shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:from-emerald-400 hover:to-emerald-500'}
                         shadow-lg
                         transition-all duration-200 flex items-center gap-2`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {isEditMode ? 'Sauvegarder les modifications' : 'Enregistrer le dossier'}
            </button>
          </div>

          {/* Section: Finances (ACHAT / VENTE) */}
          <div className="mt-8 border-t border-dark-700 pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-4 flex items-center gap-2">
              <span className="w-5 h-px bg-dark-600" />
              💰 Finances & Facturation (Achat / Vente)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Colonne ACHAT */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-bold text-white uppercase tracking-widest bg-dark-700 px-3 py-1 rounded-lg">ACHAT</h4>
                  <button 
                    type="button"
                    onClick={() => {
                      const newAchats = [...(form.Finances?.Achats || []), { desc: '', amount: 0 }];
                      setForm(prev => ({ ...prev, Finances: { ...prev.Finances, Achats: newAchats } }));
                    }}
                    className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1"
                  >
                    + Ajouter un frais
                  </button>
                </div>
                <div className="space-y-2">
                  {(form.Finances?.Achats || []).map((item, idx) => (
                    <div key={idx} className="flex gap-2 animate-slide-up">
                      <input 
                        type="text" 
                        placeholder="Libellé (ex: Fret)" 
                        value={item.desc}
                        onChange={(e) => {
                          const newAchats = [...form.Finances.Achats];
                          newAchats[idx].desc = e.target.value;
                          setForm(prev => ({ ...prev, Finances: { ...prev.Finances, Achats: newAchats } }));
                        }}
                        className="form-input flex-1 text-xs"
                      />
                      <input 
                        type="number" 
                        placeholder="Montant" 
                        value={item.amount || ''}
                        onChange={(e) => {
                          const newAchats = [...form.Finances.Achats];
                          newAchats[idx].amount = parseFloat(e.target.value) || 0;
                          setForm(prev => ({ ...prev, Finances: { ...prev.Finances, Achats: newAchats } }));
                        }}
                        className="form-input w-24 text-xs"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const newAchats = form.Finances.Achats.filter((_, i) => i !== idx);
                          setForm(prev => ({ ...prev, Finances: { ...prev.Finances, Achats: newAchats } }));
                        }}
                        className="p-2 text-dark-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colonne VENTE */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-bold text-dark-900 uppercase tracking-widest bg-gray-300 px-3 py-1 rounded-lg">VENTE</h4>
                  <button 
                    type="button"
                    onClick={() => {
                      const newVentes = [...(form.Finances?.Ventes || []), { desc: '', amount: 0 }];
                      setForm(prev => ({ ...prev, Finances: { ...prev.Finances, Ventes: newVentes } }));
                    }}
                    className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1"
                  >
                    + Ajouter une vente
                  </button>
                </div>
                <div className="space-y-2">
                  {(form.Finances?.Ventes || []).map((item, idx) => (
                    <div key={idx} className="flex gap-2 animate-slide-up">
                      <input 
                        type="text" 
                        placeholder="Libellé (ex: Vente Fret)" 
                        value={item.desc}
                        onChange={(e) => {
                          const newVentes = [...form.Finances.Ventes];
                          newVentes[idx].desc = e.target.value;
                          setForm(prev => ({ ...prev, Finances: { ...prev.Finances, Ventes: newVentes } }));
                        }}
                        className="form-input flex-1 text-xs"
                      />
                      <input 
                        type="number" 
                        placeholder="Montant" 
                        value={item.amount || ''}
                        onChange={(e) => {
                          const newVentes = [...form.Finances.Ventes];
                          newVentes[idx].amount = parseFloat(e.target.value) || 0;
                          setForm(prev => ({ ...prev, Finances: { ...prev.Finances, Ventes: newVentes } }));
                        }}
                        className="form-input w-24 text-xs"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const newVentes = form.Finances.Ventes.filter((_, i) => i !== idx);
                          setForm(prev => ({ ...prev, Finances: { ...prev.Finances, Ventes: newVentes } }));
                        }}
                        className="p-2 text-dark-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Résumé Marge */}
            <div className="mt-6 p-4 rounded-2xl bg-dark-900 border border-dark-600 flex justify-between items-center">
              <div className="text-xs text-dark-400">Résumé financier estimé :</div>
              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-[10px] text-dark-500 uppercase">Total Achat</p>
                  <p className="text-sm font-bold text-white">{(form.Finances?.Achats || []).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} <span className="text-dark-500 text-[10px]">MAD</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-dark-500 uppercase">Total Vente</p>
                  <p className="text-sm font-bold text-white">{(form.Finances?.Ventes || []).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} <span className="text-dark-500 text-[10px]">MAD</span></p>
                </div>
                <div className="text-right border-l border-dark-700 pl-6">
                  <p className="text-[10px] text-dark-500 uppercase">Marge Brute</p>
                  <p className={`text-sm font-bold ${
                    ((form.Finances?.Ventes || []).reduce((acc, curr) => acc + curr.amount, 0) - (form.Finances?.Achats || []).reduce((acc, curr) => acc + curr.amount, 0)) >= 0 
                    ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {((form.Finances?.Ventes || []).reduce((acc, curr) => acc + curr.amount, 0) - (form.Finances?.Achats || []).reduce((acc, curr) => acc + curr.amount, 0)).toLocaleString()} <span className="text-emerald-500/50 text-[10px]">MAD</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <DocumentViewer doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}
    </div>
  );
};

// Reusable form field component
const FormField = ({ label, error, children, fullWidth }) => (
  <div className={fullWidth ? 'md:col-span-2' : ''}>
    <label className="block text-xs font-medium text-dark-300 mb-1.5">{label}</label>
    {children}
    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
);

export default NouveauDossierModal;

// --- Verification sub-components ---

const VerifRow = ({ label, fields, form, handleChange, type }) => {
  const vals = fields.map(f => form.DocVerif?.[f] || '');
  const filledVals = vals.filter(v => v.toString().trim() !== '');

  let status = 'empty'; // empty | ok | warning | error

  if (filledVals.length >= 2) {
    if (type === 'weight') {
      const nums = filledVals.map(v => parseFloat(v)).filter(n => !isNaN(n));
      if (nums.length >= 2) {
        const max = Math.max(...nums);
        const min = Math.min(...nums);
        const diff = max > 0 ? ((max - min) / max) * 100 : 0;
        status = diff <= 2 ? 'ok' : diff <= 5 ? 'warning' : 'error';
      }
    } else if (type === 'exact') {
      const allSame = filledVals.every(v => v === filledVals[0]);
      status = allSame ? 'ok' : 'error';
    } else {
      // text comparison (case insensitive)
      const normalized = filledVals.map(v => v.toString().toLowerCase().trim());
      const allSame = normalized.every(v => v === normalized[0]);
      status = allSame ? 'ok' : 'warning';
    }
  }

  const statusBadge = {
    empty: <span className="text-dark-500 text-xs">—</span>,
    ok: <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">✅ Conforme</span>,
    warning: <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">⚠️ Écart</span>,
    error: <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">❌ Non conforme</span>,
  };

  return (
    <tr className="border-b border-dark-700/20">
      <td className="py-2 px-2 text-dark-300 font-medium">{label}</td>
      {fields.map(f => (
        <td key={f} className="py-2 px-1">
          <input
            type={type === 'text' ? 'text' : 'text'}
            value={form.DocVerif?.[f] || ''}
            onChange={(e) => handleChange(f, e.target.value)}
            placeholder={type === 'weight' ? 'kg' : type === 'exact' ? '0' : '...'}
            className="w-full bg-dark-900/60 border border-dark-600 rounded-lg px-2 py-1.5 text-xs text-dark-200 text-center
                       placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-primary-500/40 focus:border-primary-500/50 transition-all"
          />
        </td>
      ))}
      <td className="py-2 px-2 text-center">{statusBadge[status]}</td>
    </tr>
  );
};

const ConformityBadge = ({ docVerif }) => {
  if (!docVerif) return null;

  const checks = [
    { fields: ['PL_Poids', 'CMR_Poids', 'BL_Poids'], type: 'weight' },
    { fields: ['PL_Palettes', 'CMR_Palettes', 'BL_Palettes'], type: 'exact' },
  ];

  let hasData = false;
  let hasError = false;
  let hasWarning = false;

  checks.forEach(({ fields, type }) => {
    const vals = fields.map(f => docVerif[f] || '').filter(v => v.toString().trim() !== '');
    if (vals.length >= 2) {
      hasData = true;
      if (type === 'weight') {
        const nums = vals.map(v => parseFloat(v)).filter(n => !isNaN(n));
        if (nums.length >= 2) {
          const max = Math.max(...nums);
          const min = Math.min(...nums);
          const diff = max > 0 ? ((max - min) / max) * 100 : 0;
          if (diff > 5) hasError = true;
          else if (diff > 2) hasWarning = true;
        }
      } else {
        const allSame = vals.every(v => v === vals[0]);
        if (!allSame) hasError = true;
      }
    }
  });

  if (!hasData) return null;

  if (hasError) {
    return (
      <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
        <span className="text-lg">❌</span>
        <div>
          <p className="text-sm font-semibold text-red-400">Non conforme — Écarts détectés</p>
          <p className="text-xs text-red-400/70">Des différences significatives ont été trouvées entre les documents. Vérifiez avant expédition.</p>
        </div>
      </div>
    );
  }
  if (hasWarning) {
    return (
      <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <span className="text-lg">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-amber-400">Écart mineur détecté</p>
          <p className="text-xs text-amber-400/70">Des différences mineures existent (entre 2% et 5%). À vérifier.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
      <span className="text-lg">✅</span>
      <div>
        <p className="text-sm font-semibold text-emerald-400">Conformité documentaire : OK</p>
        <p className="text-xs text-emerald-400/70">Tous les documents sont alignés. Aucun écart significatif détecté.</p>
      </div>
    </div>
  );
};
