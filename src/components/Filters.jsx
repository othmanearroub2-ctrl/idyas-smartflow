import React, { useState, useRef, useEffect } from 'react';

const Filters = ({ filters, setFilters, fournisseurs, transporteurs, clients, modes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Count active filters (excluding search)
  const activeCount = [
    filters.fournisseur,
    filters.transporteur,
    filters.type_operation,
    filters.depart,
    filters.arrivee,
    filters.mode,
    filters.client,
  ].filter(Boolean).length;

  const defaultFilters = {
    search: '', fournisseur: '', transporteur: '', type_operation: '',
    depart: '', arrivee: '', mode: '', client: '',
  };

  return (
    <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un dossier..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="search-input"
          />
        </div>

        {/* Filter icon button */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                       border transition-all duration-200 ${
                         isOpen || activeCount > 0
                           ? 'text-primary-400 bg-primary-500/10 border-primary-500/30'
                           : 'text-dark-300 bg-dark-700/50 border-dark-600 hover:bg-dark-700 hover:text-dark-200'
                       }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            Filtres
            {activeCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-500 text-white text-xs font-bold">
                {activeCount}
              </span>
            )}
          </button>

          {/* Filter dropdown panel */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 z-[200] bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl shadow-black/40 animate-slide-up overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-dark-700/50">
                <h4 className="text-sm font-semibold text-white">Filtres avancés</h4>
                {activeCount > 0 && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, ...defaultFilters, search: prev.search }))}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Tout effacer
                  </button>
                )}
              </div>

              {/* Filter fields */}
              <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                {/* Import / Export */}
                <FilterField label="Import / Export">
                  <select
                    value={filters.type_operation}
                    onChange={(e) => setFilters(prev => ({ ...prev, type_operation: e.target.value }))}
                    className="filter-select w-full"
                  >
                    <option value="">Tous</option>
                    <option value="Import">📥 Import</option>
                    <option value="Export">📤 Export</option>
                  </select>
                </FilterField>

                {/* Transporteur */}
                <FilterField label="Transporteur">
                  <select
                    value={filters.transporteur}
                    onChange={(e) => setFilters(prev => ({ ...prev, transporteur: e.target.value }))}
                    className="filter-select w-full"
                  >
                    <option value="">Tous</option>
                    {transporteurs.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </FilterField>

                {/* Départ */}
                <FilterField label="Lieu de Départ">
                  <input
                    type="text"
                    value={filters.depart}
                    onChange={(e) => setFilters(prev => ({ ...prev, depart: e.target.value }))}
                    placeholder="Rechercher un lieu..."
                    className="filter-select w-full"
                  />
                </FilterField>

                {/* Arrivée */}
                <FilterField label="Lieu d'Arrivée">
                  <input
                    type="text"
                    value={filters.arrivee}
                    onChange={(e) => setFilters(prev => ({ ...prev, arrivee: e.target.value }))}
                    placeholder="Rechercher un lieu..."
                    className="filter-select w-full"
                  />
                </FilterField>

                {/* Mode */}
                <FilterField label="Mode de Transport">
                  <select
                    value={filters.mode}
                    onChange={(e) => setFilters(prev => ({ ...prev, mode: e.target.value }))}
                    className="filter-select w-full"
                  >
                    <option value="">Tous</option>
                    {modes.map(m => (
                      <option key={m} value={m}>
                        {m === 'Maritime' ? '🚢 Maritime' : m === 'Aérien' ? '✈️ Aérien' : '🚛 Routier'}
                      </option>
                    ))}
                  </select>
                </FilterField>

                {/* Client */}
                <FilterField label="Client">
                  <select
                    value={filters.client}
                    onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
                    className="filter-select w-full"
                  >
                    <option value="">Tous</option>
                    {clients.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </FilterField>

                {/* Fournisseur */}
                <FilterField label="Fournisseur">
                  <select
                    value={filters.fournisseur}
                    onChange={(e) => setFilters(prev => ({ ...prev, fournisseur: e.target.value }))}
                    className="filter-select w-full"
                  >
                    <option value="">Tous</option>
                    {fournisseurs.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </FilterField>
              </div>

              {/* Apply button */}
              <div className="px-4 py-3 border-t border-dark-700/50">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 rounded-xl text-sm font-medium text-white
                             bg-gradient-to-r from-primary-500 to-primary-600
                             hover:from-primary-400 hover:to-primary-500
                             transition-all duration-200"
                >
                  Appliquer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reset all */}
        {(filters.search || activeCount > 0) && (
          <button
            onClick={() => setFilters(defaultFilters)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                       text-dark-300 bg-dark-700/50 border border-dark-600 
                       hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400
                       transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
};

// Sub-component for filter fields
const FilterField = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

export default Filters;
