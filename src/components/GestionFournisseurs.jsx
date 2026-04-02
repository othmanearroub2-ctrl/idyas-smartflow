import React, { useState, useRef, useEffect } from 'react';

const GestionFournisseurs = ({ isOpen, onClose, fournisseurs, onAdd, onDelete }) => {
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setNewName('');
      setError('');
      setConfirmDelete(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) { setError('Nom requis'); return; }
    if (fournisseurs.some(f => f.toLowerCase() === trimmed.toLowerCase())) {
      setError('Ce fournisseur existe déjà');
      return;
    }
    onAdd(trimmed);
    setNewName('');
    setError('');
    inputRef.current?.focus();
  };

  const handleDelete = (name) => {
    if (confirmDelete === name) {
      onDelete(name);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(name);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      <div ref={modalRef} className="relative w-full max-w-lg max-h-[85vh] flex flex-col glass-card border-dark-600/50 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/15">
              <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Gestion des Fournisseurs</h2>
              <p className="text-xs text-dark-400">{fournisseurs.length} fournisseur{fournisseurs.length > 1 ? 's' : ''} enregistré{fournisseurs.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add form */}
        <form onSubmit={handleAdd} className="px-6 py-4 border-b border-dark-700/30">
          <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">
            Ajouter un fournisseur
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setError(''); }}
                placeholder="Nom du fournisseur..."
                className="form-input"
              />
              {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                         bg-gradient-to-r from-violet-500 to-violet-600
                         hover:from-violet-400 hover:to-violet-500
                         shadow-lg shadow-violet-500/20
                         transition-all duration-200 flex items-center gap-1.5 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Ajouter
            </button>
          </div>
        </form>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {fournisseurs.length === 0 ? (
            <div className="text-center py-8 text-dark-500">
              <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
              <p className="text-sm">Aucun fournisseur</p>
              <p className="text-xs mt-1">Ajoutez votre premier fournisseur ci-dessus</p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {fournisseurs.map((f) => (
                <li
                  key={f}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-dark-800/50
                             border border-dark-700/30 hover:border-dark-600/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 text-xs font-bold">
                      {f.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-dark-200">{f}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(f)}
                    className={`p-1.5 rounded-lg transition-all duration-200 text-xs font-medium flex items-center gap-1
                      ${confirmDelete === f
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 px-3'
                        : 'text-dark-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100'
                      }`}
                    title="Supprimer"
                  >
                    {confirmDelete === f ? (
                      <>Confirmer ?</>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-dark-700/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-dark-300
                       bg-dark-700/50 border border-dark-600
                       hover:bg-dark-600 hover:text-white transition-all duration-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default GestionFournisseurs;
