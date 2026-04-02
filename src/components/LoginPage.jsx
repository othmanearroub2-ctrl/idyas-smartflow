import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));

    if (email === 'othmanearroub2@gmail.com' && password === 'IDYAS2026') {
      onLogin({ email, name: 'Othmane Arroub' });
    } else {
      setError('Email ou mot de passe incorrect.');
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Veuillez saisir votre adresse email.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // Utilisation directe de la fonction Serverless Vercel (contourne le blocage Render)
      const forgotUrl = '/api/forgot-password';

      const response = await fetch(forgotUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      setIsSent(true);
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
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-dark-900/65" />
      
      {/* Teal glow accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/idyas_logo.png" 
              alt="Idyas Control Tower Logo" 
              className="h-24 w-auto object-contain drop-shadow-2xl"
            />
          </div>
          <p className="text-sm text-dark-400">Connectez-vous à votre espace de suivi logistique</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          {!isForgot ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 animate-slide-up">
                  <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-dark-300 mb-2 uppercase tracking-wider">
                  Adresse email
                </label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="othmanearroub2@gmail.com"
                    autoComplete="email"
                    className="w-full bg-dark-900/80 border border-dark-600 rounded-xl px-4 py-3 pl-11 text-sm text-dark-200
                               placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 
                               focus:border-primary-500/50 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-dark-300 mb-2 uppercase tracking-wider">
                  Mot de passe
                </label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full bg-dark-900/80 border border-dark-600 rounded-xl px-4 py-3 pl-11 pr-11 text-sm text-dark-200
                               placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 
                               focus:border-primary-500/50 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-dark-500 hover:text-dark-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 
                         focus:ring-primary-500/40 focus:ring-offset-0 cursor-pointer" />
                  <span className="text-xs text-dark-400 group-hover:text-dark-300 transition-colors">Se souvenir de moi</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => { setIsForgot(true); setError(''); }}
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white
                           bg-gradient-to-r from-primary-500 to-primary-600
                           hover:from-primary-400 hover:to-primary-500
                           shadow-lg shadow-primary-500/25 hover:shadow-primary-500/35
                           transition-all duration-300 hover:-translate-y-0.5
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                           flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Se connecter
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="animate-fade-in">
              <h3 className="text-lg font-semibold text-white mb-2">Réinitialisation</h3>
              <p className="text-sm text-dark-400 mb-6">Saisissez votre email pour recevoir un lien de récupération.</p>
              
              {!isSent ? (
                <form onSubmit={handleForgotSubmit} className="space-y-5">
                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 animate-slide-up">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-dark-300 mb-2 uppercase tracking-wider">Adresse email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="othmanearroub2@gmail.com"
                      className="w-full bg-dark-900/80 border border-dark-600 rounded-xl px-4 py-3 text-sm text-dark-200 focus:ring-primary-500/40 focus:border-primary-500/50 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 transition-all flex justify-center items-center gap-2"
                  >
                    {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsForgot(false); setError(''); }}
                    className="w-full text-xs text-dark-500 hover:text-dark-300 transition-colors uppercase tracking-widest font-bold"
                  >
                    Retour à la connexion
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 animate-scale-up">
                  <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-500/40">
                    <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-medium mb-2">Email envoyé !</h4>
                  <p className="text-sm text-dark-500 mb-6 px-4">
                    Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. 
                    Pensez à regarder vos courriers indésirables (Spam).
                  </p>
                  <button 
                    type="button" 
                    onClick={() => { setIsForgot(false); setIsSent(false); }}
                    className="text-sm text-primary-400 font-bold hover:text-primary-300 border-b border-primary-500/30 pb-0.5"
                  >
                    Revenir à la connexion
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
