import React, { useState, useMemo, useCallback, useEffect } from 'react';
import KPICards from './components/KPICards';
import Filters from './components/Filters';
import DossierTable from './components/DossierTable';
import FocusMaroc from './components/FocusMaroc';
import NouveauDossierModal from './components/NouveauDossierModal';
import GestionEntites from './components/GestionEntites';
import LoginPage from './components/LoginPage';
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
  const [loading, setLoading] = useState(false);
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

  // Add new dossier — POST to API then refresh
  const handleSaveDossier = useCallback(async (newDossier) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDossier),
      });
      if (!response.ok) throw new Error('POST failed');
      // Refresh list from API after saving
      await fetchDossiers();
    } catch (error) {
      console.warn('⚠️ POST échoué, ajout local uniquement:', error.message);
      setAllDossiers(prev => [newDossier, ...prev]);
    }
  }, [fetchDossiers]);

  // Filtered data
  const filteredData = useMemo(() => {
    return allDossiers.filter(d => {
      const matchSearch = !filters.search || 
        d.ID_Dossier.toLowerCase().includes(filters.search.toLowerCase()) ||
        d.Fournisseur.toLowerCase().includes(filters.search.toLowerCase()) ||
        d.Client.toLowerCase().includes(filters.search.toLowerCase());
      const matchFournisseur = !filters.fournisseur || d.Fournisseur === filters.fournisseur;
      const matchTransporteur = !filters.transporteur || d.Transporteur === filters.transporteur;
      const matchTypeOp = !filters.type_operation || d.Type_Operation === filters.type_operation;
      const matchDepart = !filters.depart || (d.Lieu_Chargement && d.Lieu_Chargement.toLowerCase().includes(filters.depart.toLowerCase()));
      const matchArrivee = !filters.arrivee || (d.Lieu_Dechargement && d.Lieu_Dechargement.toLowerCase().includes(filters.arrivee.toLowerCase()));
      const matchMode = !filters.mode || d.Mode_Transport === filters.mode;
      const matchClient = !filters.client || d.Client === filters.client;
      return matchSearch && matchFournisseur && matchTransporteur && matchTypeOp && matchDepart && matchArrivee && matchMode && matchClient;
    });
  }, [filters, allDossiers]);

  // KPIs calculated from filtered data
  const kpis = useMemo(() => calculateKPIs(filteredData), [filteredData]);

  // Focus Maroc stats from filtered data
  const focusMarocStats = useMemo(() => getFocusMarocStats(filteredData), [filteredData]);

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
      {/* Background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-primary-700/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-primary-600/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-dark-700/50 bg-dark-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="relative">
                <img 
                  src="/idyas_logo.png" 
                  alt="Idyas Control Tower Logo" 
                  className="h-12 w-auto object-contain"
                />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  <span className="text-white">Idyas</span>{' '}
                  <span className="gradient-text">Control Tower</span>
                </h1>
                <p className="text-xs text-dark-400 mt-0.5">
                  Plateforme de suivi logistique — Commissionnaire de transport
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {/* Entity management buttons */}
              <button
                onClick={() => setEntityModal('fournisseurs')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                           text-dark-300 bg-dark-700/50 border border-dark-600
                           hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400
                           transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                Clients
              </button>

              <div className="w-px h-8 bg-dark-700" />

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                           bg-gradient-to-r from-emerald-500 to-emerald-600
                           hover:from-emerald-400 hover:to-emerald-500
                           shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30
                           transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Nouveau Dossier
              </button>
              <div className="w-px h-10 bg-dark-700" />
              <div className="text-right">
                <p className="text-xs text-dark-400 capitalize">{today}</p>
                <p className="text-xs text-dark-500">v1.0 · ESCA Supply Chain</p>
              </div>
              <div className="w-px h-10 bg-dark-700" />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm text-dark-300 font-medium">{user.name || 'Utilisateur'}</span>
                </div>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <section>
          <KPICards kpis={kpis} />
        </section>

        {/* Filters */}
        <section>
          <Filters
            filters={filters}
            setFilters={setFilters}
            fournisseurs={fournisseurs}
            transporteurs={transporteurs}
            clients={clients}
            modes={modes}
          />
        </section>

        {/* Main Table */}
        <section>
          <DossierTable data={filteredData} />
        </section>

        {/* Focus Maroc */}
        <section>
          <FocusMaroc stats={focusMarocStats} />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-dark-700/30">
          <p className="text-xs text-dark-500">
            © 2026 <span className="text-dark-400 font-medium">Idyas Shipping</span> · Control Tower v1.0
          </p>
          <p className="text-xs text-dark-600 mt-1">
            Stage Master Achat & SCM — ESCA École de Management
          </p>
        </footer>
      </main>

      {/* Modal Nouveau Dossier */}
      <NouveauDossierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDossier}
        nextId={nextId}
        fournisseurs={fournisseursList}
        transporteurs={transporteursList}
        clients={clientsList}
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
