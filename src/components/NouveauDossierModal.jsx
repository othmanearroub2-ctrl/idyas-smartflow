import React, { useState, useEffect, useRef } from 'react';

const NouveauDossierModal = ({ isOpen, onClose, onSave, nextId, fournisseurs = [], transporteurs = [], clients = [] }) => {
  const modalRef = useRef(null);
  const [form, setForm] = useState({
    ID_Dossier: '',
    Type_Operation: '',
    Fournisseur: '',
    Client: '',
    Transporteur: '',
    Lieu_Chargement: '',
    Lieu_Dechargement: '',
    Mode_Transport: '',
    Type_Envoi: '',
    Incoterm: '',
    Marchandise: '',
    Nombre_Palettes: '',
    Poids_Brut: '',
    Volume: '',
    ETD: '',
    ETA: '',
  });

  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        ID_Dossier: nextId,
        Type_Operation: '',
        Fournisseur: '',
        Client: '',
        Transporteur: '',
        Lieu_Chargement: '',
        Lieu_Dechargement: '',
        Mode_Transport: '',
        Type_Envoi: '',
        Incoterm: '',
        Marchandise: '',
        Nombre_Palettes: '',
        Poids_Brut: '',
        Volume: '',
        ETD: '',
        ETA: '',
      });
      setErrors({});
    }
  }, [isOpen, nextId]);

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
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    const required = ['ID_Dossier', 'Fournisseur', 'Client', 'Transporteur', 'Mode_Transport', 'Type_Envoi', 'Incoterm', 'ETD'];
    required.forEach(field => {
      if (!form[field]) newErrors[field] = 'Champ requis';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newDossier = {
      ...form,
      ATD: null,
      ATA: null,
      Retard_Calcule: null,
      Fiabilite_Transporteur: 90, // default for new carrier
    };
    onSave(newDossier);
    onClose();
  };

  if (!isOpen) return null;

  const lieuxDechargement = ['Port Casablanca', 'Tanger Med', 'Aéroport Mohammed V, Casa'];

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
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-primary-500/20">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Nouveau Dossier</h2>
              <p className="text-xs text-dark-400">Créer un nouveau dossier d'exploitation</p>
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
          {/* Section: Identité */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-dark-600" />
              Identité du Dossier
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="ID Dossier" error={errors.ID_Dossier}>
                <input
                  type="text"
                  value={form.ID_Dossier}
                  onChange={(e) => handleChange('ID_Dossier', e.target.value)}
                  placeholder="IDY-2026-XXX"
                  className="form-input"
                />
              </FormField>
              <FormField label="Import / Export" error={errors.Type_Operation}>
                <select
                  value={form.Type_Operation}
                  onChange={(e) => handleChange('Type_Operation', e.target.value)}
                  className="form-input form-select"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Import">📥 Import</option>
                  <option value="Export">📤 Export</option>
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
            </div>
          </div>

          {/* Section: Logistique & Transport */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-dark-600" />
              Logistique & Transport
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <FormField label="Mode de Transport" error={errors.Mode_Transport}>
                <select
                  value={form.Mode_Transport}
                  onChange={(e) => handleChange('Mode_Transport', e.target.value)}
                  className="form-input form-select"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Maritime">🚢 Maritime</option>
                  <option value="Aérien">✈️ Aérien</option>
                  <option value="Routier">🚛 Routier</option>
                </select>
              </FormField>
              <FormField label="Type d'Envoi" error={errors.Type_Envoi}>
                <select
                  value={form.Type_Envoi}
                  onChange={(e) => handleChange('Type_Envoi', e.target.value)}
                  className="form-input form-select"
                >
                  <option value="">Sélectionner...</option>
                  <option value="FCL">FCL — Complet</option>
                  <option value="LCL">LCL — Groupage</option>
                </select>
              </FormField>
              <FormField label="Incoterm" error={errors.Incoterm}>
                <select
                  value={form.Incoterm}
                  onChange={(e) => handleChange('Incoterm', e.target.value)}
                  className="form-input form-select"
                >
                  <option value="">Sélectionner...</option>
                  <option value="EXW">EXW — Ex Works</option>
                  <option value="FCA">FCA — Free Carrier</option>
                  <option value="FAS">FAS — Free Alongside Ship</option>
                  <option value="FOB">FOB — Free On Board</option>
                  <option value="CFR">CFR — Cost and Freight</option>
                  <option value="CIF">CIF — Cost Insurance Freight</option>
                  <option value="CPT">CPT — Carriage Paid To</option>
                  <option value="CIP">CIP — Carriage Insurance Paid</option>
                  <option value="DAP">DAP — Delivered At Place</option>
                  <option value="DPU">DPU — Delivered at Place Unloaded</option>
                  <option value="DDP">DDP — Delivered Duty Paid</option>
                </select>
              </FormField>
              <FormField label="Lieu de Chargement">
                <input
                  type="text"
                  value={form.Lieu_Chargement}
                  onChange={(e) => handleChange('Lieu_Chargement', e.target.value)}
                  placeholder="Port ou usine de départ"
                  className="form-input"
                />
              </FormField>
              <FormField label="Lieu de Déchargement" fullWidth>
                <input
                  type="text"
                  value={form.Lieu_Dechargement}
                  onChange={(e) => handleChange('Lieu_Dechargement', e.target.value)}
                  placeholder="Port ou entrepôt d'arrivée"
                  className="form-input"
                />
              </FormField>
            </div>
          </div>

          {/* Section: Détails Marchandise */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-dark-600" />
              Détails Marchandise
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Marchandise" fullWidth>
                <input
                  type="text"
                  value={form.Marchandise}
                  onChange={(e) => handleChange('Marchandise', e.target.value)}
                  placeholder="Description de la marchandise"
                  className="form-input"
                />
              </FormField>
              <FormField label="Nombre de Palettes">
                <input
                  type="number"
                  min="0"
                  value={form.Nombre_Palettes}
                  onChange={(e) => handleChange('Nombre_Palettes', e.target.value)}
                  placeholder="Ex: 12"
                  className="form-input"
                />
              </FormField>
              <FormField label="Poids Brut (kg)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
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
            </div>
          </div>

          {/* Section: Dates */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-dark-600" />
              Dates Prévisionnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="ETD — Départ Prévu" error={errors.ETD}>
                <input
                  type="date"
                  value={form.ETD}
                  onChange={(e) => handleChange('ETD', e.target.value)}
                  className="form-input"
                />
              </FormField>
              <FormField label="ETA — Arrivée Prévue" error={errors.ETA}>
                <input
                  type="date"
                  value={form.ETA}
                  onChange={(e) => handleChange('ETA', e.target.value)}
                  className="form-input"
                />
              </FormField>
            </div>
            <p className="text-xs text-dark-500 mt-2 italic">
              Les dates réelles (ATD/ATA) seront renseignées automatiquement lors du suivi.
            </p>
          </div>

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
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                         bg-gradient-to-r from-emerald-500 to-emerald-600
                         hover:from-emerald-400 hover:to-emerald-500
                         shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30
                         transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Enregistrer le dossier
            </button>
          </div>
        </form>
      </div>
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
