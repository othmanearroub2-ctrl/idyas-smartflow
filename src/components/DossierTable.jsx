import React, { useState } from 'react';
import { getStatut } from '../data/mockData';

const DossierTable = ({ data }) => {
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
    { key: 'Retard_Calcule', label: 'Statut' },
    { key: 'Fiabilite_Transporteur', label: 'Fiabilité' },
  ];

  return (
    <div className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '300ms' }}>
      {/* Table header */}
      <div className="px-6 py-4 border-b border-dark-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-500/10">
            <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125m0 0h-7.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Dossiers d'Exploitation</h2>
            <p className="text-xs text-dark-400">{sortedData.length} dossier{sortedData.length > 1 ? 's' : ''} affiché{sortedData.length > 1 ? 's' : ''}</p>
          </div>
        </div>
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
                <td colSpan={columns.length} className="text-center py-12 text-dark-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  Aucun dossier ne correspond aux filtres sélectionnés
                </td>
              </tr>
            ) : (
              sortedData.map((dossier, idx) => (
                <tr
                  key={dossier.ID_Dossier}
                  className="hover:bg-dark-700/30 transition-colors duration-150"
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
                  <td className="table-cell">{getStatutBadge(dossier)}</td>
                  <td className="table-cell">{getFiabiliteBadge(dossier.Fiabilite_Transporteur)}</td>
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
