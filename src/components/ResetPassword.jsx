import React, { useState, useEffect } from 'react';

const ResetPassword = ({ token, onReturnToLogin }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/dossiers';
      const resetUrl = baseUrl.replace('/api/dossiers', '/api/reset-password');

      const response = await fetch(resetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la réinitialisation');
      }

      setSuccess('Votre mot de passe a été modifié avec succès !');
      // Automatically redirect to login after 3 seconds
      setTimeout(() => {
        onReturnToLogin();
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/login_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-dark-900/65" />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/idyas_logo.png" 
              alt="Idyas Control Tower Logo" 
              className="h-24 w-auto object-contain drop-shadow-2xl"
            />
          </div>
          <p className="text-sm text-dark-400">Sécurisez votre espace logistique</p>
        </div>

        <div className="glass-card p-8">
          {success ? (
            <div className="text-center py-4 animate-scale-up">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/40">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-white font-medium mb-2">{success}</h4>
              <p className="text-sm text-dark-500 mb-6">Redirection vers la page de connexion...</p>
              <button 
                onClick={onReturnToLogin}
                className="text-sm text-primary-400 font-bold hover:text-primary-300 border-b border-primary-500/30 pb-0.5"
              >
                Se connecter maintenant
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-white mb-2">Nouveau mot de passe</h3>
              <p className="text-sm text-dark-400 mb-6">Définissez votre nouveau mot de passe.</p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 animate-slide-up">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-dark-300 mb-2 uppercase tracking-wider">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full bg-dark-900/80 border border-dark-600 rounded-xl px-4 py-3 text-sm text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-dark-300 mb-2 uppercase tracking-wider">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full bg-dark-900/80 border border-dark-600 rounded-xl px-4 py-3 text-sm text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/50 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 transition-all flex justify-center items-center gap-2 mt-4"
                >
                  {isLoading ? "Enregistrement..." : "Enregistrer le mot de passe"}
                </button>
                <button 
                  type="button" 
                  onClick={onReturnToLogin}
                  className="w-full text-xs text-dark-500 hover:text-dark-300 transition-colors uppercase tracking-widest font-bold mt-2"
                >
                  Annuler
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
