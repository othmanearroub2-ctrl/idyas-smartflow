import React, { useState, useEffect } from 'react';

const INCOTERMS = [
  { code: 'EXW', label: 'Ex Works', desc: 'Le vendeur met la marchandise à disposition dans ses locaux. L\'acheteur assume tous les frais.' },
  { code: 'FOB', label: 'Free On Board', desc: 'Le vendeur livre la marchandise sur le navire. Les frais maritimes sont à l\'acheteur.' },
  { code: 'CIF', label: 'Cost, Insurance & Freight', desc: 'Le vendeur paie le fret et l\'assurance jusqu\'au port de destination.' },
  { code: 'DAP', label: 'Delivered At Place', desc: 'Le vendeur livre la marchandise à destination, non dédouanée.' },
  { code: 'DDP', label: 'Delivered Duty Paid', desc: 'Le vendeur assume tous les frais, y compris le dédouanement et les taxes.' },
];

const FreightCalculator = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('Maritime');
  const [dimensions, setDimensions] = useState({ l: '', w: '', h: '', count: 1 });
  const [weight, setWeight] = useState('');
  const [rate, setRate] = useState('');
  const [exchangeRate, setExchangeRate] = useState('10.15');
  const [incoterm, setIncoterm] = useState('EXW');
  const [merchandiseValue, setMerchandiseValue] = useState('');
  const [surcharges, setSurcharges] = useState({ baf: false, ssc: false, port: false });
  
  const [results, setResults] = useState(null);

  const calculate = () => {
    const L = parseFloat(dimensions.l) || 0;
    const W = parseFloat(dimensions.w) || 0;
    const H = parseFloat(dimensions.h) || 0;
    const N = parseFloat(dimensions.count) || 1;
    const realWeight = parseFloat(weight) || 0;
    const freightRate = parseFloat(rate) || 0;
    const currRate = parseFloat(exchangeRate) || 10.15;
    const val = parseFloat(merchandiseValue) || 0;

    let volumetricWeight = 0;
    let taxableWeight = 0;
    let baseFreight = 0;
    let detailLines = [];

    // 1. CALCUL VOLUMÉTRIQUE
    const volumeCBM = (L * W * H * N) / 1000000;
    
    if (mode === 'Maritime') {
      volumetricWeight = volumeCBM; // 1 tonne = 1 cbm
      taxableWeight = Math.max(realWeight / 1000, volumeCBM); // Poids en Tonnes vs CBM
      detailLines.push(`Volume total : ${volumeCBM.toFixed(3)} CBM`);
      detailLines.push(`Poids réel : ${(realWeight / 1000).toFixed(3)} Tonnes`);
      detailLines.push(`Poids taxable retenu : ${taxableWeight.toFixed(3)} (Règle : Max Tonnes/CBM)`);
    } else if (mode === 'Aérien') {
      volumetricWeight = (L * W * H * N) / 6000;
      taxableWeight = Math.max(realWeight, volumetricWeight);
      detailLines.push(`Poids volumétrique (1:6000) : ${volumetricWeight.toFixed(2)} kg`);
      detailLines.push(`Poids réel : ${realWeight} kg`);
      detailLines.push(`Poids taxable retenu : ${taxableWeight.toFixed(2)} kg`);
    } else { // Routier
      volumetricWeight = (L * W * H * N) / 4000;
      taxableWeight = Math.max(realWeight, volumetricWeight);
      detailLines.push(`Poids volumétrique (1:4000) : ${volumetricWeight.toFixed(2)} kg`);
      detailLines.push(`Poids réel : ${realWeight} kg`);
      detailLines.push(`Poids taxable retenu : ${taxableWeight.toFixed(2)} kg`);
    }

    // ALERTE SI VOLUMÉTRIQUE REPRÉSENTE PLUS QUE LE RÉEL
    const volWarning = volumetricWeight > (mode === 'Maritime' ? realWeight/1000 : realWeight);

    // 2. FRET DE BASE
    baseFreight = taxableWeight * freightRate;

    // 3. SURCHARGES & ACCESSOIRES (Simulés selon pourcentages métier standards)
    const bafCost = surcharges.baf ? baseFreight * 0.15 : 0; // 15% BAF/FAF
    const sscCost = surcharges.ssc ? (mode === 'Aérien' ? taxableWeight * 0.12 : 50) : 0; 
    const portFees = surcharges.port ? (mode === 'Maritime' ? 150 : 80) : 0;
    const insurance = val > 0 ? val * 0.005 : 0; // 0.5% Valeur
    
    const totalUSD = baseFreight + bafCost + sscCost + portFees + insurance;
    const totalMAD = totalUSD * currRate;

    setResults({
      taxableWeight,
      baseFreight,
      bafCost,
      sscCost,
      portFees,
      insurance,
      totalUSD,
      totalMAD,
      detailLines,
      volWarning,
      incotermInfo: INCOTERMS.find(i => i.code === incoterm)
    });
  };

  useEffect(() => {
    if (dimensions.l && dimensions.w && dimensions.h && weight && rate) {
      calculate();
    }
  }, [mode, dimensions, weight, rate, exchangeRate, incoterm, surcharges, merchandiseValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-primary-500/20">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-700/50 flex items-center justify-between bg-dark-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3l-3 3h3m-9 0h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Calculateur de Fret Expert</h2>
              <p className="text-xs text-dark-400">Application des ratios Idyas Shipping 2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-xl transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-dark-900/30">
          
          {/* Left Side: Inputs */}
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-xs font-bold text-primary-400 uppercase tracking-widest">Mode de Transport</label>
              <div className="grid grid-cols-3 gap-2">
                {['Maritime', 'Aérien', 'Routier'].map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`py-2 text-sm rounded-xl border transition-all ${
                      mode === m ? 'bg-primary-500/20 border-primary-500 text-primary-400 font-bold' : 'bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-600'
                    }`}
                  >
                    {m === 'Maritime' ? '🚢' : m === 'Aérien' ? '✈️' : '🚛'} {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-dark-300">Dimensions (L × l × H cm)</label>
                <div className="flex gap-1">
                  <input type="number" placeholder="L" value={dimensions.l} onChange={e => setDimensions({...dimensions, l: e.target.value})} className="form-input w-full px-2 text-center" />
                  <input type="number" placeholder="l" value={dimensions.w} onChange={e => setDimensions({...dimensions, w: e.target.value})} className="form-input w-full px-2 text-center" />
                  <input type="number" placeholder="H" value={dimensions.h} onChange={e => setDimensions({...dimensions, h: e.target.value})} className="form-input w-full px-2 text-center" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-dark-300">Nombre de Colis</label>
                <input type="number" value={dimensions.count} onChange={e => setDimensions({...dimensions, count: e.target.value})} className="form-input" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-dark-300">Poids Réel (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="form-input" placeholder="ex: 500" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-dark-300">Taux de fret ($/Unité)</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="form-input" placeholder="ex: 45" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-dark-300">Taux Change (1$ = X MAD)</label>
                <input type="number" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} className="form-input" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-dark-300">Incoterm</label>
                <select value={incoterm} onChange={e => setIncoterm(e.target.value)} className="form-input">
                  {INCOTERMS.map(i => <option key={i.code} value={i.code}>{i.code} - {i.label}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-dark-800/50 border border-dark-700/50">
              <label className="block text-xs font-bold text-dark-400 capitalize">Extra & Surcharges</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={surcharges.baf} onChange={e => setSurcharges({...surcharges, baf: e.target.checked})} className="rounded bg-dark-700 border-dark-600 text-primary-500" />
                  <span className="text-xs text-dark-300">BAF / FAF</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={surcharges.ssc} onChange={e => setSurcharges({...surcharges, ssc: e.target.checked})} className="rounded bg-dark-700 border-dark-600 text-primary-500" />
                  <span className="text-xs text-dark-300">Sécurité (SSC)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={surcharges.port} onChange={e => setSurcharges({...surcharges, port: e.target.checked})} className="rounded bg-dark-700 border-dark-600 text-primary-500" />
                  <span className="text-xs text-dark-300">Frais Port/Aéroport</span>
                </label>
              </div>
              <div className="pt-2 border-t border-dark-700/30">
                <label className="block text-xs font-medium text-dark-400 mb-1">Valeur Marchandise (Assurance 0.5%)</label>
                <input type="number" value={merchandiseValue} onChange={e => setMerchandiseValue(e.target.value)} className="form-input text-xs" placeholder="Valeur en $" />
              </div>
            </div>
          </div>

          {/* Right Side: Results */}
          <div className="bg-dark-950/40 rounded-3xl p-6 border border-dark-700/50 flex flex-col h-full">
            {results ? (
              <div className="space-y-6 flex flex-col h-full">
                {/* Result Header */}
                <div className="text-center pb-6 border-b border-dark-700/50">
                  <span className="text-[10px] text-dark-500 uppercase tracking-widest font-bold">Coût Total Estimé</span>
                  <div className="text-4xl font-black text-primary-400 mt-1">{results.totalMAD.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-lg">MAD</span></div>
                  <div className="text-lg text-dark-400 font-medium">{results.totalUSD.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}</div>
                </div>

                {/* Detail List */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-dark-500 uppercase">Détails du Calcul :</h4>
                    {results.detailLines.map((line, i) => (
                      <div key={i} className="text-xs text-dark-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mt-1 shrink-0" />
                        {line}
                      </div>
                    ))}
                    {results.volWarning && (
                      <div className="mt-2 text-[10px] bg-amber-500/10 text-amber-500 p-2 rounded-lg border border-amber-500/20 font-medium">
                        ⚠️ Alerte : Le volume dépasse le poids réel. Le fret sera calculé sur la base volumétrique.
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-dark-700/30 space-y-2">
                   <h4 className="text-[10px] font-bold text-dark-500 uppercase">Répartition des frais ($) :</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                      <span className="text-dark-400">Fret de base :</span>
                      <span className="text-right text-white font-mono">${results.baseFreight.toFixed(2)}</span>
                      <span className="text-dark-400">Surcharge BAF/FAF :</span>
                      <span className="text-right text-white font-mono">${results.bafCost.toFixed(2)}</span>
                      <span className="text-dark-400">SSC :</span>
                      <span className="text-right text-white font-mono">${results.sscCost.toFixed(2)}</span>
                      <span className="text-dark-400">Frais Port/Aéro :</span>
                      <span className="text-right text-white font-mono">${results.portFees.toFixed(2)}</span>
                      <span className="text-dark-400">Assurance :</span>
                      <span className="text-right text-white font-mono">${results.insurance.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-primary-500/5 border border-primary-500/20 rounded-xl">
                    <h4 className="text-[10px] font-bold text-primary-400 uppercase mb-1">Incoterm {results.incotermInfo.code} :</h4>
                    <p className="text-[11px] text-primary-300 leading-tight italic">{results.incotermInfo.desc}</p>
                  </div>
                </div>

                <div className="mt-auto pt-6 text-center italic text-[10px] text-dark-500">
                  * Ces calculs sont donnés à titre indicatif selon les standards Idyas Shipping.
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center border border-dark-700">
                  <svg className="w-8 h-8 text-dark-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-dark-400">Prêt au calcul</h4>
                  <p className="text-xs text-dark-500 px-4">Saisissez les dimensions et le poids pour voir le coût détaillé du fret.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreightCalculator;
