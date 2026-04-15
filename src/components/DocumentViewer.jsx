import React, { useRef, useState, useEffect } from 'react';

const DocumentViewer = ({ doc, onClose }) => {
  const modalRef = useRef(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!doc || !doc.url) return null;

  const ext = (doc.type || doc.url.split('.').pop().split('?')[0] || '').toLowerCase();
  const isPdf = ext === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
  const isDataUrl = doc.url.startsWith('data:');

  // For Cloudinary URLs, fetch as blob. For data URLs, use directly.
  useEffect(() => {
    if (!isPdf || !doc.url) return;

    // If it's already a data URL (base64), use it directly
    if (isDataUrl) {
      setBlobUrl(doc.url);
      setLoading(false);
      return;
    }

    // For remote URLs, try to fetch as blob
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(doc.url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('PDF fetch error:', err);
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      // Only revoke if it's an object URL (not a data URL)
      if (blobUrl && blobUrl.startsWith('blob:')) URL.revokeObjectURL(blobUrl);
    };
  }, [doc.url, isPdf]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" />

      {/* Viewer Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-5xl h-[90vh] flex flex-col rounded-2xl overflow-hidden bg-dark-800 border border-dark-600/50 shadow-2xl animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-dark-700/50 bg-dark-800/95 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-lg ${isPdf ? 'bg-red-500/10' : 'bg-primary-500/10'}`}>
              {isPdf ? (
                <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{doc.name}</h3>
              <p className="text-xs text-dark-400 uppercase">{ext} • {doc.addedAt ? new Date(doc.addedAt).toLocaleDateString('fr-FR') : ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Download - only show for non-data URLs */}
            {!isDataUrl && (
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-dark-300 bg-dark-700/50 border border-dark-600 hover:bg-dark-600 hover:text-white transition-all shadow-sm"
                title="Ouvrir dans un nouvel onglet"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Nouvel onglet
              </a>
            )}
            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-dark-900/50 relative">
          {isPdf ? (
            loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-dark-400">
                <div className="w-10 h-10 border-3 border-dark-600 border-t-primary-500 rounded-full animate-spin" />
                <p className="text-sm">Chargement du PDF...</p>
              </div>
            ) : error ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-dark-400 p-6">
                <svg className="w-16 h-16 text-red-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-center">Impossible de charger le PDF (erreur {error})</p>
                <p className="text-xs text-dark-500 text-center max-w-md">
                  Ce fichier a été uploadé avec une ancienne version. Veuillez le supprimer et le ré-uploader.
                </p>
              </div>
            ) : blobUrl ? (
              <iframe
                src={blobUrl}
                className="w-full h-full border-0 bg-white"
                title={doc.name}
              />
            ) : null
          ) : isImage ? (
            <div className="w-full h-full flex items-center justify-center p-6 overflow-auto">
              <img
                src={doc.url}
                alt={doc.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-dark-400">
              <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-sm">Aperçu non disponible pour ce type de fichier</p>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 transition-all"
              >
                Télécharger le fichier
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
