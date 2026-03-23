import React from 'react';

const FocusMaroc = ({ stats }) => {
  const PortCard = ({ name, flag, data, gradient, portIcon }) => (
    <div className="morocco-card group">
      {/* Gradient background glow */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full ${gradient} opacity-5 
                        group-hover:opacity-10 transition-opacity duration-500`} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{portIcon}</span>
            <div>
              <h3 className="text-lg font-bold text-white">{name}</h3>
              <p className="text-xs text-dark-400">{flag}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{data.total}</p>
            <p className="text-xs text-dark-400">dossiers</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-dark-900/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-dark-400">Fiabilité</span>
            </div>
            <p className={`text-xl font-bold ${
              data.fiabilite >= 90 ? 'text-emerald-400' : 
              data.fiabilite >= 80 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {data.fiabilite}%
            </p>
          </div>

          <div className="bg-dark-900/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs text-dark-400">Retards</span>
            </div>
            <p className={`text-xl font-bold ${data.retards > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {data.retards}
            </p>
          </div>

          <div className="bg-dark-900/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-xs text-dark-400">En transit</span>
            </div>
            <p className="text-xl font-bold text-yellow-400">{data.enTransit}</p>
          </div>

          <div className="bg-dark-900/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-primary-400" />
              <span className="text-xs text-dark-400">FCL / LCL</span>
            </div>
            <p className="text-xl font-bold text-primary-400">{data.fcl} / {data.lcl}</p>
          </div>
        </div>

        {/* Volume bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-dark-400">Répartition</span>
            <span className="text-dark-400">{data.fcl + data.lcl} envois</span>
          </div>
          <div className="h-2 bg-dark-900 rounded-full overflow-hidden flex">
            {data.fcl > 0 && (
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-l-full transition-all duration-500"
                style={{ width: `${(data.fcl / (data.fcl + data.lcl || 1)) * 100}%` }}
                title={`FCL: ${data.fcl}`}
              />
            )}
            {data.lcl > 0 && (
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-r-full transition-all duration-500"
                style={{ width: `${(data.lcl / (data.fcl + data.lcl || 1)) * 100}%` }}
                title={`LCL: ${data.lcl}`}
              />
            )}
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-500" /> FCL Complet
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-500" /> LCL Groupage
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-emerald-500/10">
          <span className="text-xl">🇲🇦</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Focus Maroc</h2>
          <p className="text-xs text-dark-400">Flux logistiques vers les ports marocains</p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-dark-700 to-transparent ml-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <PortCard
          name="Port de Casablanca"
          flag="🏭 Hub industriel & commercial"
          data={stats.casablanca}
          gradient="bg-primary-500"
          portIcon="⚓"
        />
        <PortCard
          name="Tanger Med"
          flag="🌍 Gateway vers l'Europe"
          data={stats.tangerMed}
          gradient="bg-emerald-500"
          portIcon="🚢"
        />
      </div>
    </div>
  );
};

export default FocusMaroc;
