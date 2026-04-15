import React, { useState } from 'react';
import { getStatut } from '../data/mockData';

const DossierTable = ({ data, onEdit, onArchive, onViewDetail, isArchiveView, archiveCount = 0 }) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (aVal === null) return 1;
    if (bVal === null) return -1;
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }) => (
    <span className="inline-flex ml-1 opacity-40">
      {sortField === field ? (
        sortDirection === 'asc' ? '↑' : '↓'
      ) : '↕'}
    </span>
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return <span className="text-dark-500">—</span>;
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getModeBadge = (mode) => {
    switch (mode) {
      case 'Maritime':
        return <span className="badge-maritime">🚢 Maritime</span>;
      case 'Aérien':
        return <span className="badge-aerien">✈️ Aérien</span>;
      case 'Routier':
        return <span className="badge-routier">🚛 Routier</span>;
      default:
        return <span className="badge-info">{mode}</span>;
    }
  };

  const getStatutBadge = (dossier) => {
    const statut = getStatut(dossier);
    switch (statut) {
      case 'À l\'heure':
        return (
          <span className="badge-success">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            À l'heure
          </span>
        );
      case 'En retard':
        return (
          <span className="badge-danger">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            +{dossier.Retard_Calcule}j
          </span>
        );
      case 'En transit':
        return (
          <span className="badge-warning">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            En transit
          </span>
        );
      default:
        return <span className="badge-info">{statut}</span>;
    }
  };

  const getPhaseBadge = (phase) => {
    if (!phase) return <span className="text-dark-500">—</span>;
    
    // Classes par défaut
    let baseClass = "text-[10px] font-bold px-2 py-0.5 rounded-full border ";
    
    switch (phase) {
      case 'Dossier Créé':
        return <span className={baseClass + "bg-dark-700/50 text-dark-300 border-dark-600"}>{phase}</span>;
      case 'Documents Reçus':
      case 'Ouverture Dossier':
        return <span className={baseClass + "bg-blue-500/10 text-blue-400 border-blue-500/20"}>{phase}</span>;
      case 'En transit':
      case 'Arrivage Port':
        return <span className={baseClass + "bg-primary-500/10 text-primary-400 border-primary-500/20"}>{phase}</span>;
      case 'En Douane':
        return <span className={baseClass + "bg-orange-500/10 text-orange-400 border-orange-500/20"}>{phase}</span>;
      case 'Bon à Délivrer (BAD)':
        return <span className={baseClass + "bg-amber-500/10 text-amber-400 border-amber-500/20"}>{phase}</span>;
      case 'Livraison en cours':
        return <span className={baseClass + "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"}>{phase}</span>;
      case 'Dossier Livré':
        return <span className={baseClass + "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}>{phase}</span>;
      case 'Facturation':
        return <span className={baseClass + "bg-violet-500/10 text-violet-400 border-violet-500/20"}>{phase}</span>;
      case 'Clôturé':
        return <span className={baseClass + "bg-dark-600/50 text-dark-400 border-dark-500/30"}>{phase}</span>;
      default:
        return <span className={baseClass + "bg-dark-700/50 text-dark-300 border-dark-600"}>{phase}</span>;
    }
  };

  const getFiabiliteBadge = (fiab) => {
    if (fiab >= 90) return <span className="text-emerald-400 font-semibold">{fiab}%</span>;
    if (fiab >= 80) return <span className="text-amber-400 font-semibold">{fiab}%</span>;
    return <span className="text-red-400 font-semibold">{fiab}%</span>;
  };

  const columns = [
    { key: 'ID_Dossier', label: 'ID Dossier' },
    { key: 'Type_Operation', label: 'Imp/Exp' },
    { key: 'Fournisseur', label: 'Fournisseur' },
    { key: 'Client', label: 'Client' },
    { key: 'Transporteur', label: 'Transporteur' },
    { key: 'Mode_Transport', label: 'Mode' },
    { key: 'Type_Envoi', label: 'Type' },
    { key: 'Incoterm', label: 'Incoterm' },
    { key: 'Lieu_Chargement', label: 'Départ' },
    { key: 'Lieu_Dechargement', label: 'Arrivée' },
    { key: 'ETD', label: 'ETD' },
    { key: 'ATD', label: 'ATD' },
    { key: 'ETA', label: 'ETA' },
    { key: 'ATA', label: 'ATA' },
    { key: 'Phase', label: 'Phase Logistique' },
    { key: 'Retard_Calcule', label: 'Tendance' },
    { key: 'Fiabilite_Transporteur', label: 'Fiabilité' },
    { key: '_actions', label: '' },
  ];

  return (
    <div className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '300ms' }}>
      {/* Table header */}
      <div className="px-6 py-4 border-b border-dark-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isArchiveView ? 'bg-amber-500/10' : 'bg-primary-500/10'}`}>
            {isArchiveView ? (
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125m0 0h-7.5" />
              </svg>
            )}
          </div>
          <div>
            <h2 className={`text-base font-semibold ${isArchiveView ? 'text-amber-400' : 'text-white'}`}>
              {isArchiveView ? '📦 Dossiers Archivés' : 'Dossiers d\'Exploitation'}
            </h2>
            <p className="text-xs text-dark-400">
              {sortedData.length} dossier{sortedData.length > 1 ? 's' : ''} {isArchiveView ? 'archivé' : 'affiché'}{sortedData.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {isArchiveView && (
          <span className="text-xs text-amber-500/60 italic hidden sm:block">
            Les dossiers archivés ne comptent pas dans les KPIs
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px]">
          <thead>
            <tr className="border-b border-dark-700/30">
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="table-header cursor-pointer hover:text-primary-400 transition-colors select-none"
                >
                  {col.label}
                  <SortIcon field={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700/20">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-16 text-dark-400">
                  {isArchiveView ? (
                    <>
                      <svg className="w-14 h-14 mx-auto mb-4 text-amber-500/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                      <p className="text-base font-medium text-dark-300 mb-1">Aucun dossier archivé</p>
                      <p className="text-sm text-dark-500">Les dossiers que vous archiverez apparaîtront ici</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-dark-400">Aucun dossier ne correspond aux filtres sélectionnés</p>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              sortedData.map((dossier, idx) => (
                <tr
                  key={dossier.ID_Dossier}
                  onClick={() => onViewDetail && onViewDetail(dossier)}
                  className="hover:bg-dark-700/30 transition-colors duration-150 cursor-pointer"
                >
                  <td className="table-cell">
                    <span className="font-mono text-sm font-semibold text-primary-400">
                      {dossier.ID_Dossier}
                    </span>
                  </td>
                  <td className="table-cell">
                    {dossier.Type_Operation === 'Import' ? (
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/10 text-blue-400">📥 Import</span>
                    ) : dossier.Type_Operation === 'Export' ? (
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-orange-500/10 text-orange-400">📤 Export</span>
                    ) : (
                      <span className="text-dark-500">—</span>
                    )}
                  </td>
                  <td className="table-cell font-medium text-dark-200">{dossier.Fournisseur}</td>
                  <td className="table-cell text-dark-300">{dossier.Client}</td>
                  <td className="table-cell">
                    <span className="font-medium text-dark-200">{dossier.Transporteur}</span>
                  </td>
                  <td className="table-cell">{getModeBadge(dossier.Mode_Transport)}</td>
                  <td className="table-cell">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      dossier.Type_Envoi === 'FCL' 
                        ? 'bg-primary-500/10 text-primary-400' 
                        : 'bg-violet-500/10 text-violet-400'
                    }`}>
                      {dossier.Type_Envoi}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-teal-500/10 text-teal-400">
                      {dossier.Incoterm || '—'}
                    </span>
                  </td>
                  <td className="table-cell text-dark-300 text-xs">{dossier.Lieu_Chargement}</td>
                  <td className="table-cell text-dark-300 text-xs">{dossier.Lieu_Dechargement}</td>
                  <td className="table-cell text-xs">{formatDate(dossier.ETD)}</td>
                  <td className="table-cell text-xs">{formatDate(dossier.ATD)}</td>
                  <td className="table-cell text-xs">{formatDate(dossier.ETA)}</td>
                  <td className="table-cell text-xs">{formatDate(dossier.ATA)}</td>
                  <td className="table-cell">{getPhaseBadge(dossier.Phase)}</td>
                  <td className="table-cell">{getStatutBadge(dossier)}</td>
                  <td className="table-cell">{getFiabiliteBadge(dossier.Fiabilite_Transporteur)}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewDetail && onViewDetail(dossier); }}
                        className="p-1.5 rounded-lg text-dark-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200"
                        title="Voir la feuille du dossier"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      {!isArchiveView && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit && onEdit(dossier); }}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-200"
                          title="Modifier ce dossier"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onArchive && onArchive(dossier); }}
                        className={`p-1.5 rounded-lg transition-all duration-200 ${
                          isArchiveView
                            ? 'text-dark-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                            : 'text-dark-400 hover:text-amber-400 hover:bg-amber-500/10'
                        }`}
                        title={isArchiveView ? 'Restaurer ce dossier' : 'Archiver ce dossier'}
                      >
                        {isArchiveView ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DossierTable;
