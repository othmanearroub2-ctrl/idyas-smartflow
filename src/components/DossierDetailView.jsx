import React, { useState } from 'react';
import DocumentViewer from './DocumentViewer';

const DossierDetailView = ({ dossier, onClose, onEdit }) => {
  const [viewingDoc, setViewingDoc] = useState(null);
  if (!dossier) return null;

  const isExport = dossier.Type_Operation === 'Export';

  // Print function
  const handlePrint = () => {
    window.print();
  };

  const Field = ({ label, value, width = "180px" }) => (
    <div className="flex text-[13px] leading-relaxed mb-4">
      <span className="font-bold shrink-0 uppercase" style={{ width }}>{label} :</span>
      <span className="flex-1 border-b border-dotted border-gray-400 font-mono text-gray-800 tracking-wide pb-0.5 min-h-[1.5rem]">
        {value || ''}
      </span>
    </div>
  );

  // --- SUB-COMPONENT: FINANCE TABLE (Common to both) ---
  const FinanceTable = () => (
    <div className="mt-6 border-[2px] border-black flex flex-col">
      <div className="flex border-b-[2px] border-black">
        <div className="w-1/2 border-r-[2px] border-black py-1.5 text-center font-bold text-[13px] tracking-[0.2em] uppercase">ACHAT</div>
        <div className="w-1/2 py-1.5 text-center font-bold text-[13px] tracking-[0.2em] uppercase bg-gray-200">VENTE</div>
      </div>
      
      <div className="flex flex-1 min-h-[140px]">
        {/* Côté ACHAT */}
        <div className="w-1/2 border-r-[2px] border-black p-2 flex flex-col gap-1">
          {(dossier.Finances?.Achats || []).map((item, i) => (
            <div key={i} className="flex justify-between text-[11px] font-mono border-b border-dotted border-gray-300 pb-0.5">
              <span className="truncate pr-2">{item.desc}</span>
              <span className="font-bold shrink-0">{item.amount?.toLocaleString()}</span>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 6 - (dossier.Finances?.Achats?.length || 0)) }).map((_, i) => (
            <div key={`empty-a-${i}`} className="border-b border-dotted border-gray-300 h-5"></div>
          ))}
        </div>

        {/* Côté VENTE */}
        <div className="w-1/2 p-2 flex flex-col gap-1">
          {(dossier.Finances?.Ventes || []).map((item, i) => (
            <div key={i} className="flex justify-between text-[11px] font-mono border-b border-dotted border-gray-300 pb-0.5">
              <span className="truncate pr-2">{item.desc}</span>
              <span className="font-bold shrink-0">{item.amount?.toLocaleString()}</span>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 6 - (dossier.Finances?.Ventes?.length || 0)) }).map((_, i) => (
            <div key={`empty-v-${i}`} className="border-b border-dotted border-gray-300 h-5"></div>
          ))}
        </div>
      </div>

      <div className="border-t-[2px] border-black flex bg-gray-50">
        <div className="w-1/2 border-r-[2px] border-black p-2 flex justify-between items-center bg-gray-50">
          <span className="font-bold text-[11px]">TOTAL ACHAT :</span>
          <span className="font-bold text-[13px] font-mono">
            {(dossier.Finances?.Achats || []).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
          </span>
        </div>
        <div className="w-1/2 flex flex-col">
          <div className="p-2 flex justify-between items-center border-b border-black">
            <span className="font-bold text-[11px]">TOTAL VENTE :</span>
            <span className="font-bold text-[13px] font-mono">
              {(dossier.Finances?.Ventes || []).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </span>
          </div>
          <div className="p-2 flex justify-between items-center bg-black text-white">
            <span className="font-bold text-[11px] tracking-wider">MARGE :</span>
            <span className="font-bold text-[14px]">
              {((dossier.Finances?.Ventes || []).reduce((acc, curr) => acc + curr.amount, 0) - (dossier.Finances?.Achats || []).reduce((acc, curr) => acc + curr.amount, 0)).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 pb-12">
      {/* Header Toolbar (non-printable) */}
      <div className="print:hidden sticky top-0 z-50 bg-dark-800/90 backdrop-blur-xl border-b border-dark-700/50 p-4 mb-8">
        <div className="max-w-[850px] mx-auto flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-dark-300 bg-dark-700/50 hover:bg-dark-600 hover:text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Retour au tableau
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(dossier)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 transition-all border border-amber-500/30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Modifier
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.728 9.752a2.25 2.25 0 013.182 0l2.5 2.5a2.25 2.25 0 010 3.182" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13.5v5.25a2.25 2.25 0 01-2.25 2.25H11.25a2.25 2.25 0 01-2.25-2.25V13.5m-1.5-6v-3a2.25 2.25 0 012.25-2.25h3.75a2.25 2.25 0 012.25 2.25v3M15 13.5V8.25m-6 5.25v-5.25m6 5.25H9m6 0a2.25 2.25 0 012.25 2.25v3a2.25 2.25 0 01-2.25 2.25H15M9 13.5a2.25 2.25 0 00-2.25 2.25v3a2.25 2.25 0 002.25 2.25H9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18h12M6 6h12M6 10h12" />
              </svg>
              Imprimer
            </button>
          </div>
        </div>
      </div>

      {/* A4 Printable Area */}
      <div className="printable-a4 max-w-[850px] mx-auto bg-white text-black min-h-[1100px] shadow-2xl p-6">
        <div className="border-[3px] border-black p-8 min-h-full flex flex-col">
          
          {/* Logo & Header (Common) */}
          <div className="text-center mb-6 flex flex-col items-center">
            <img src="/idyas_logo.png" alt="IDYAS SHIPPING" className="h-16 mb-2 grayscale" />
            <div className="text-[10px] tracking-wider text-gray-600 mb-6 border-b border-gray-300 pb-2 w-full max-w-[300px]">
              TRANSPORT INTERNATIONAL & TRANSIT
            </div>
          </div>

          {!isExport ? (
            /* --- IMPORT VIEW (ORIGINAL) --- */
            <>
              <div className="grid grid-cols-2 gap-x-12 mb-4">
                <Field label="FACTURE N°" value={dossier.Facture_No} />
                <Field label="DOSSIER N°" value={dossier.ID_Dossier} />
                <Field label="CLIENT" value={dossier.Client} />
                <Field label="FOURNISSEUR" value={dossier.Fournisseur} />
                <Field label="AGENT" value={dossier.Agent} />
                <Field label="ARMATEUR" value={dossier.Armateur} />
              </div>

              <div className="flex justify-center mb-6">
                <div className="border-[2px] border-black px-12 py-1.5 text-2xl font-bold tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                  IMPORT
                </div>
              </div>

              <table className="w-full border-collapse border-[2px] border-black text-center mb-6">
                <thead>
                  <tr>
                    <th className="border-[2px] border-black py-2 w-[15%] text-[13px] font-bold">NB DE <br/>COLIS</th>
                    <th className="border-[2px] border-black py-2 w-[25%] text-[13px] font-bold">POIDS BRUT</th>
                    <th className="border-[2px] border-black py-2 w-[20%] text-[13px] font-bold">VOLUME</th>
                    <th className="border-[2px] border-black py-2 w-[40%] text-[13px] font-bold">DESIGNATION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-[2px] border-black py-3 font-mono text-sm">{dossier.Nb_Colis || dossier.Nombre_Palettes || ''}</td>
                    <td className="border-[2px] border-black py-3 font-mono text-sm">{dossier.Poids_Brut ? `${dossier.Poids_Brut} kg` : ''}</td>
                    <td className="border-[2px] border-black py-3 font-mono text-sm">{dossier.Volume || ''}</td>
                    <td className="border-[2px] border-black py-3 font-mono text-sm font-semibold">{dossier.Designation || dossier.Marchandise || ''}</td>
                  </tr>
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-x-12 mt-2">
                <Field label="PROVENANCE" value={dossier.Lieu_Chargement} />
                <Field label="DESTINATION" value={dossier.Lieu_Dechargement} />
                <Field label="N° DE TC/SR" value={dossier.Numero_TC} />
                <Field label="N° DE PLOMB" value={dossier.N_Plomb} />
                <Field label="INCOTERM" value={dossier.Incoterm} />
                <Field label="NAVIRE / VOYAGE" value={dossier.Navire_Voyage} />
                <Field label="BL/LTA/CMR N°" value={dossier.BL_LTA_CMR_No} />
                <Field label="FRANCHISE" value={dossier.Franchise} />
                <Field label="PORT DE CHARGEMENT" value={dossier.Lieu_Chargement || dossier.Port_Chargement} />
                <Field label="DATE D'ENLEVEMENT" value={dossier.Date_Enlevement} />
                <Field label="ETD" value={dossier.ETD} />
                <Field label="ETA" value={dossier.ETA} />
                <Field label="TRANSITAIRE" value={dossier.Transitaire} />
                <Field label="TRANSPORTEUR" value={dossier.Transporteur} />
                <Field label="RECEPTION DU BAD LE" value={dossier.Reception_BAD} />
                <Field label="REMIS AU TRANSIT LE" value={dossier.Remis_Transit} />
                <Field label="RECEPTION DES DOCS LE" value={dossier.Reception_Docs} />
                <Field label="LIVRE LE" value={dossier.Livre_Le} />
              </div>
            </>
          ) : (
            /* --- EXPORT VIEW (NEW MAQUETTE) --- */
            <>
              <div className="grid grid-cols-2 gap-x-12 mb-4">
                <Field label="FACTURE N°" value={dossier.Facture_No} width="120px" />
                <Field label="DOSSIER N°" value={dossier.ID_Dossier} width="120px" />
                <Field label="CLIENT" value={dossier.Client} width="120px" />
                <Field label="AGENT" value={dossier.Agent} width="120px" />
                <div className="col-span-2">
                  <Field label="DESTINATAIRE" value={dossier.Destinataire} width="120px" />
                </div>
              </div>

              <div className="flex flex-col items-center mb-6">
                <div className="text-2xl font-bold tracking-[0.3em] border-b-2 border-black px-8">EXPORT</div>
              </div>

              <div className="grid grid-cols-2 gap-x-12">
                <Field label="ARMATEUR" value={dossier.Armateur} width="140px" />
                <Field label="NAVIRE" value={dossier.Navire_Voyage} width="140px" />
                <Field label="N° DE BOOKING" value={dossier.Booking_No} width="140px" />
                <Field label="Destination" value={dossier.Lieu_Dechargement} width="140px" />
                <Field label="N° BL" value={dossier.BL_LTA_CMR_No} width="140px" />
                <Field label="DEPART LE" value={dossier.ATD || dossier.ETD} width="140px" />
                <Field label="N°TC" value={dossier.Numero_TC} width="140px" />
                <Field label="ARRIVEE LE" value={dossier.ATA || dossier.ETA} width="140px" />
                <Field label="N° DE PLOMB" value={dossier.N_Plomb} width="140px" />
                <Field label="SEQUENCE" value={dossier.Sequence} width="140px" />
                <Field label="Transporteur" value={dossier.Transporteur} width="140px" />
                <Field label="Réglé le" value={dossier.Regle_Le} width="140px" />
                <div className="col-span-2 grid grid-cols-3 gap-4">
                    <Field label="Montant" value={dossier.Export_Montant} width="80px" />
                    <Field label="D.H.P" value={dossier.DHP} width="60px" />
                    <Field label="D.H.R" value={dossier.DHR} width="60px" />
                </div>
              </div>

              <div className="flex flex-col items-center mt-4 mb-4">
                <div className="text-xl font-bold tracking-[0.2em] border-b-2 border-black px-6 italic">AUTRES</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="TC" value={dossier.TC_Type} width="60px" />
                <Field label="NBRE COLIS" value={dossier.Nb_Colis} width="100px" />
                <Field label="Volume" value={dossier.Volume} width="70px" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="POIDS" value={dossier.Poids_Brut ? `${dossier.Poids_Brut} kg` : ''} width="100px" />
                <Field label="TARE" value={dossier.Tare} width="100px" />
              </div>
              <div className="col-span-2">
                <Field label="MARCHANDISES" value={dossier.Designation} width="140px" />
              </div>
            </>
          )}

          {/* SHARED: FINANCE TABLE (Requested) */}
          <FinanceTable />

          {/* Shared: Observations Box */}
          <div className="mt-6 border-[2px] border-black p-3 relative min-h-[70px]">
            <span className="font-bold text-[13px] absolute -top-3 left-3 bg-white px-1 uppercase leading-none">OBSERVATIONS :</span>
            <div className="font-mono text-sm text-gray-800 pt-2 px-2">
              {dossier.Observations}
            </div>
          </div>

          {/* Shared: Historique Box */}
          {!isExport && (
            <div className="mt-6 border-[2px] border-black p-3 relative min-h-[150px] flex flex-1">
              <span className="font-bold text-[13px] absolute -top-3 left-3 bg-white px-1">Historique du dossier :</span>
              <div className="w-1/2 border-r border-dotted border-gray-400 mt-4 pr-4">
                <div className="font-mono text-[12px] whitespace-pre-wrap text-gray-800 leading-loose">
                  {dossier.Historique || ''}
                </div>
              </div>
              <div className="w-1/2 mt-4 pl-4 flex flex-col justify-between py-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="border-b border-dotted border-gray-400 w-full h-[1.5rem]"></div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Documents Section (Screen only, not printed) */}
      {dossier.Documents && dossier.Documents.length > 0 && (
        <div className="print:hidden max-w-[850px] mx-auto mt-6 glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
            Documents Attachés ({dossier.Documents.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dossier.Documents.map((doc, i) => {
              const ext = (doc.type || doc.url?.split('.').pop()?.split('?')[0] || '').toLowerCase();
              const isPdf = ext === 'pdf';
              return (
                <button
                  key={i}
                  onClick={() => setViewingDoc(doc)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-900/50 border border-dark-700/50 hover:border-primary-500/30 hover:bg-dark-700/30 transition-all duration-200 text-left group"
                >
                  <div className={`p-2 rounded-lg shrink-0 ${isPdf ? 'bg-red-500/10' : 'bg-primary-500/10'}`}>
                    {isPdf ? (
                      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-dark-200 group-hover:text-primary-400 truncate transition-colors">{doc.name}</p>
                    <p className="text-[10px] text-dark-500 uppercase">{ext}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
          .printable-a4 { box-shadow: none !important; margin: 0; width: 100%; height: 100%; border: none; }
        }
      `}} />

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <DocumentViewer doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}
    </div>
  );
};

export default DossierDetailView;
