import React from 'react';

const KPICards = ({ kpis }) => {
  const cards = [
    {
      title: "Dossiers Actifs",
      value: kpis.dossiersActifs,
      suffix: "",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.06-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      ),
      color: "from-primary-500 to-primary-700",
      iconBg: "bg-primary-500/20",
      iconColor: "text-primary-400",
    },
    {
      title: "Retards Critiques",
      value: kpis.retardsCritiques,
      suffix: "",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      color: "from-red-500 to-red-700",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
    },
    {
      title: "Fiabilité Moyenne",
      value: kpis.fiabiliteMoyenne,
      suffix: "%",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      color: "from-emerald-500 to-emerald-700",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
    },
    {
      title: "Groupage / Complet",
      value: `${kpis.groupage} / ${kpis.complet}`,
      suffix: "",
      subtitle: "LCL / FCL",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      color: "from-amber-500 to-amber-700",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="glass-card-hover p-5 animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`${card.iconBg} ${card.iconColor} p-3 rounded-xl`}>
              {card.icon}
            </div>
            <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${card.color} opacity-60`} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-dark-400">{card.title}</p>
            <p className="text-3xl font-bold text-white tracking-tight">
              {card.value}
              {card.suffix && <span className="text-lg text-dark-400 ml-0.5">{card.suffix}</span>}
            </p>
            {card.subtitle && (
              <p className="text-xs text-dark-500">{card.subtitle}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
