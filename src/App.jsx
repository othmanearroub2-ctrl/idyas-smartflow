import React, { useState, useMemo, useCallback, useEffect } from 'react';
import KPICards from './components/KPICards';
import Filters from './components/Filters';
import DossierTable from './components/DossierTable';
import FocusMaroc from './components/FocusMaroc';
import NouveauDossierModal from './components/NouveauDossierModal';
import GestionEntites from './components/GestionEntites';
import LoginPage from './components/LoginPage';
import DossierDetailView from './components/DossierDetailView';
import FreightCalculator from './components/FreightCalculator';
import {
  dossiers as initialDossiers,
  calculateKPIs,
  getFocusMarocStats,
} from './data/mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/dossiers';

function App() {
  const [user, setUser] = useState(null);
  const [allDossiers, setAllDossiers] = useState(initialDossiers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDossier, setEditDossier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showArchives, setShowArchives] = useState(false); // Archive toggle state
  const [selectedDossier, setSelectedDossier] = useState(null); // Detail view state
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false); // Freight calculator state
  const [entityModal, setEntityModal] = useState(null); // 'fournisseurs' | 'transporteurs' | 'clients' | null

  // Dynamic entity lists (empty — user adds their own)
  const [fournisseursList, setFournisseursList] = useState([]);
  const [transporteursList, setTransporteursList] = useState([]);
  const [clientsList, setClientsList] = useState([]);

  // Generic add/delete handlers
  const entityHandlers = useMemo(() => ({
    fournisseurs: {
      items: fournisseursList,
      onAdd: (name) => setFournisseursList(prev => [...prev, name].sort()),
      onDelete: (name) => setFournisseursList(prev => prev.filter(f => f !== name)),
    },
    transporteurs: {
      items: transporteursList,
      onAdd: (name) => setTransporteursList(prev => [...prev, name].sort()),
      onDelete: (name) => setTransporteursList(prev => prev.filter(f => f !== name)),
    },
    clients: {
      items: clientsList,
      onAdd: (name) => setClientsList(prev => [...prev, name].sort()),
      onDelete: (name) => setClientsList(prev => prev.filter(f => f !== name)),
    },
  }), [fournisseursList, transporteursList, clientsList]);
  const [filters, setFilters] = useState({
    search: '',
    fournisseur: '',
    transporteur: '',
    type_operation: '',
    depart: '',
    arrivee: '',
    mode: '',
    client: '',
  });

  // Generate next ID
  const nextId = useMemo(() => {
    const nums = allDossiers.map(d => {
      const parts = d.ID_Dossier.split('-');
      return parseInt(parts[parts.length - 1], 10) || 0;
    });
    const next = Math.max(...nums) + 1;
    return `IDY-2026-${String(next).padStart(3, '0')}`;
  }, [allDossiers]);

  // Unique values for filters (from managed lists)
  const fournisseurs = fournisseursList;
  const transporteurs = transporteursList;
  const clients = clientsList;
  const modes = useMemo(() => [...new Set(allDossiers.map(d => d.Mode_Transport))].sort(), [allDossiers]);

  // Fetch dossiers from API on mount
  const fetchDossiers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      if (data.length > 0) {
        setAllDossiers(data);
      }
    } catch (error) {
      console.warn('⚠️ API inaccessible, utilisation des données locales:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDossiers();
  }, [fetchDossiers]);

  // Save dossier — POST (create) or PUT (edit)
  const handleSaveDossier = useCallback(async (dossierData, isEdit = false) => {
    try {
      if (isEdit) {
        // PUT — update existing
        const url = API_URL.replace('/api/dossiers', '') + '/api/dossiers/' + dossierData.ID_Dossier;
        const response = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dossierData),
        });
        if (!response.ok) throw new Error('PUT failed');
      } else {
        // POST — create new
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dossierData),
        });
        if (!response.ok) throw new Error('POST failed');
      }
      await fetchDossiers();
    } catch (error) {
      console.warn('⚠️ Sauvegarde échouée:', error.message);
      alert(`⚠️ Erreur de connexion avec le serveur (Render) :\n${error.message}\n\nLe dossier a été sauvegardé en "mode hors-ligne" et disparaîtra au rafraîchissement. Vérifiez que votre backend sur Render est bien allumé et que ${API_URL} est la bonne adresse.`);
      if (!isEdit) {
        setAllDossiers(prev => [dossierData, ...prev]);
      }
    }
  }, [fetchDossiers]);

  // Open edit modal
  const handleEditDossier = useCallback((dossier) => {
    setEditDossier(dossier);
    setIsModalOpen(true);
  }, []);

  // Archive / Unarchive dossier
  const handleArchiveDossier = useCallback(async (dossier) => {
    const action = dossier.isArchived ? 'restaurer' : 'archiver';
    const confirmed = window.confirm(
      `Voulez-vous ${action} le dossier ${dossier.ID_Dossier} ?`
    );
    if (!confirmed) return;

    try {
      const baseUrl = API_URL.replace('/api/dossiers', '');
      const url = `${baseUrl}/api/dossiers/${dossier.ID_Dossier}/archive`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Action failed');
      await fetchDossiers();
    } catch (error) {
      console.warn('⚠️ Erreur archivage:', error.message);
      // Fallback: use PUT if PATCH not supported (older backend)
      try {
        const updatedDossier = { ...dossier, isArchived: !dossier.isArchived };
        const baseUrl = API_URL.replace('/api/dossiers', '');
        const url = `${baseUrl}/api/dossiers/${dossier.ID_Dossier}`;
        const response = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDossier),
        });
        if (!response.ok) throw new Error('PUT fallback failed');
        await fetchDossiers();
      } catch (fallbackError) {
        alert("Erreur lors de l'archivage du dossier : " + fallbackError.message);
      }
    }
  }, [fetchDossiers]);

  // Count archived dossiers
  const archiveCount = useMemo(() => allDossiers.filter(d => d.isArchived).length, [allDossiers]);

  // Filtered data
  const filteredData = useMemo(() => {
    return allDossiers.filter(d => {
      // 1. Filter by archive status
      if (showArchives ? !d.isArchived : d.isArchived) return false;

      // 2. Other filters
      const matchSearch = !filters.search ||  
        (d.ID_Dossier || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (d.Fournisseur || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (d.Client || '').toLowerCase().includes(filters.search.toLowerCase());
      const matchFournisseur = !filters.fournisseur || d.Fournisseur === filters.fournisseur;
      const matchTransporteur = !filters.transporteur || d.Transporteur === filters.transporteur;
      const matchTypeOp = !filters.type_operation || d.Type_Operation === filters.type_operation;
      const matchDepart = !filters.depart || (d.Lieu_Chargement && d.Lieu_Chargement.toLowerCase().includes(filters.depart.toLowerCase()));
      const matchArrivee = !filters.arrivee || (d.Lieu_Dechargement && d.Lieu_Dechargement.toLowerCase().includes(filters.arrivee.toLowerCase()));
      const matchMode = !filters.mode || d.Mode_Transport === filters.mode;
      const matchClient = !filters.client || d.Client === filters.client;
      return matchSearch && matchFournisseur && matchTransporteur && matchTypeOp && matchDepart && matchArrivee && matchMode && matchClient;
    });
  }, [filters, allDossiers, showArchives]);

  // KPIs always from ACTIVE dossiers (never archived)
  const activeDossiers = useMemo(() => allDossiers.filter(d => !d.isArchived), [allDossiers]);
  const kpis = useMemo(() => calculateKPIs(activeDossiers), [activeDossiers]);

  // Focus Maroc stats from active dossiers
  const focusMarocStats = useMemo(() => getFocusMarocStats(activeDossiers), [activeDossiers]);

  // Current date
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // If not authenticated, show login
  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {selectedDossier ? (
        <DossierDetailView 
          dossier={selectedDossier} 
          onClose={() => setSelectedDossier(null)}
          onEdit={(d) => {
            setSelectedDossier(null);
            handleEditDossier(d);
          }}
        />
      ) : (
        <>
          {/* Background pattern */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-primary-700/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-primary-600/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-dark-700/50 bg-dark-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 md:py-4">
          {/* Row 1: Logo + Nouveau Dossier + User */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Logo */}
              <div className="relative shrink-0">
                <img 
                  src="/idyas_logo.png" 
                  alt="Idyas Control Tower Logo" 
                  className="h-10 md:h-12 w-auto object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold tracking-tight truncate">
                  <span className="text-white">Idyas</span>{' '}
                  <span className="gradient-text">Control Tower</span>
                </h1>
                <p className="text-xs text-dark-400 mt-0.5 hidden sm:block">
                  Plateforme de suivi logistique — Commissionnaire de transport
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              {/* Nouveau Dossier - always visible */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold text-white
                           bg-gradient-to-r from-emerald-500 to-emerald-600
                           hover:from-emerald-400 hover:to-emerald-500
                           shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30
                           transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="hidden sm:inline">Nouveau</span> Dossier
              </button>

              {/* Date - hidden on mobile */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="w-px h-10 bg-dark-700" />
                <div className="text-right">
                  <p className="text-xs text-dark-400 capitalize">{today}</p>
                  <p className="text-xs text-dark-500">v1.0 · ESCA Supply Chain</p>
                </div>
              </div>

              <div className="w-px h-8 bg-dark-700" />

              {/* User avatar + logout */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm text-dark-300 font-medium hidden md:inline">{user.name || 'Utilisateur'}</span>
                <button
                  onClick={() => setUser(null)}
                  className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                  title="Se déconnecter"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Entity buttons - scrollable on mobile */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setEntityModal('fournisseurs')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0
                         text-dark-300 bg-dark-700/50 border border-dark-600
                         hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-400
                         transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
              Fournisseurs
            </button>
            <button
              onClick={() => setEntityModal('transporteurs')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0
                         text-dark-300 bg-dark-700/50 border border-dark-600
                         hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400
                         transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
              Transporteurs
            </button>
            <button
              onClick={() => setEntityModal('clients')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0
                         text-dark-300 bg-dark-700/50 border border-dark-600
                         hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400
                         transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Clients
            </button>
            <div className="w-px h-6 bg-dark-700 mx-1 hidden sm:block" />
            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0
                         text-primary-400 bg-primary-500/10 border border-primary-500/30
                         hover:bg-primary-500/20 hover:border-primary-500/50
                         transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3l-3 3h3m-9 0h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculateur Fret
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <section>
          <KPICards kpis={kpis} />
        </section>

        {/* Search & Filters */}
        <section className="relative z-40">
          <Filters 
            filters={filters} 
            setFilters={setFilters}
            fournisseurs={fournisseurs}
            transporteurs={transporteurs}
            clients={clients}
            modes={modes}
            showArchives={showArchives}
            setShowArchives={setShowArchives}
            archiveCount={archiveCount}
          />
        </section>

        {/* Main Table */}
        <section>
          <DossierTable 
            data={filteredData} 
            onEdit={handleEditDossier} 
            onArchive={handleArchiveDossier}
            onViewDetail={setSelectedDossier}
            isArchiveView={showArchives}
            archiveCount={archiveCount}
          />
        </section>

        {/* Focus Maroc */}
        <section>
          <FocusMaroc stats={focusMarocStats} />
        </section>

        </main>

        <FreightCalculator 
          isOpen={isCalculatorOpen} 
          onClose={() => setIsCalculatorOpen(false)} 
        />
        </>
      )}

      {/* Modal Nouveau Dossier / Modifier Dossier */}
      <NouveauDossierModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditDossier(null); }}
        onSave={handleSaveDossier}
        nextId={nextId}
        fournisseurs={fournisseursList}
        transporteurs={transporteursList}
        clients={clientsList}
        editDossier={editDossier}
      />

      {/* Gestion des entités */}
      {entityModal && (
        <GestionEntites
          isOpen={true}
          onClose={() => setEntityModal(null)}
          items={entityHandlers[entityModal].items}
          onAdd={entityHandlers[entityModal].onAdd}
          onDelete={entityHandlers[entityModal].onDelete}
          entityType={entityModal}
        />
      )}
    </div>
  );
}

export default App;
