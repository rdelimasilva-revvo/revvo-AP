import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Contract } from '../types';
import { Search, X, ChevronDown, SlidersHorizontal, CalendarDays } from 'lucide-react';

const compact = (v: number): string => {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1).replace('.', ',')}bi`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1).replace('.', ',')}mm`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1).replace('.', ',')}k`;
  return v.toFixed(0);
};

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const COLORS = [
  { bg: '#0e4d64', light: '#d0ecf2' },   // Valor solicitado
  { bg: '#137a8b', light: '#cceff5' },   // Valor a esperar
  { bg: '#1a9baa', light: '#c7f0f6' },   // Valor efetivado
  { bg: '#5ec4b6', light: '#d4f5ef' },   // Valor a liquidar
];

export const ManagementViewDashboard: React.FC = () => {
  const { contracts, clients } = useData();

  const [selContract, setSelContract] = useState('');
  const [selPortfolio, setSelPortfolio] = useState('');
  const [selUr, setSelUr] = useState('');
  const [selCred, setSelCred] = useState('');
  const [selArranjo, setSelArranjo] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [periodLabel, setPeriodLabel] = useState('');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropOpen(false);
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) setPeriodOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const applyPeriodShortcut = (label: string, daysBack: number | null) => {
    if (daysBack === null) {
      setDateFrom('');
      setDateTo('');
      setPeriodLabel('');
    } else {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - daysBack);
      setDateFrom(from.toISOString().slice(0, 10));
      setDateTo(to.toISOString().slice(0, 10));
      setPeriodLabel(label);
    }
    setPeriodOpen(false);
  };

  /* ── contratos ativos ── */
  const active = useMemo(() => contracts.filter(c => c.status === 'active'), [contracts]);

  /* ── credenciadoras disponíveis ── */
  const acquirerList = useMemo(() => {
    const set = new Set<string>();
    active.forEach(c => c.acquirers.forEach(a => set.add(a)));
    return Array.from(set).sort();
  }, [active]);

  /* ── bandeiras (arranjos) disponíveis ── */
  const brandList = useMemo(() => {
    const set = new Set<string>();
    active.forEach(c => c.cardBrands.forEach(b => set.add(b)));
    return Array.from(set).sort();
  }, [active]);

  /* ── filtrar ── */
  const filtered = useMemo(() => {
    let r = active;
    if (selContract) r = r.filter(c => c.id === selContract);
    if (selPortfolio) r = r.filter(c => c.productType === selPortfolio);
    if (selCred) r = r.filter(c => c.acquirers.some(a => a === selCred));
    if (selArranjo) r = r.filter(c => c.cardBrands.some(b => b === selArranjo));
    if (dateFrom) {
      const from = new Date(dateFrom + 'T00:00:00');
      r = r.filter(c => {
        const d = c.startDate || c.createdAt;
        return d && d >= from;
      });
    }
    if (dateTo) {
      const to = new Date(dateTo + 'T23:59:59');
      r = r.filter(c => {
        const d = c.startDate || c.createdAt;
        return d && d <= to;
      });
    }
    return r;
  }, [active, selContract, selPortfolio, selCred, selArranjo, dateFrom, dateTo]);

  /* ── calcular totais (decrescente garantido) ── */
  const totals = useMemo(() => {
    const solicitado = filtered.reduce((s, c) => s + c.requestedValue, 0);
    const esperarRaw = filtered.reduce((s, c) => s + c.expectedSettlementValue, 0);
    const prometidoRaw = filtered.reduce((s, c) => s + c.encumberedValue, 0);
    const realizadoRaw = filtered.reduce((s, c) => s + c.actualSettlementValue, 0);

    // Usa valores reais, apenas garante ordem decrescente
    const esperar = Math.min(esperarRaw, solicitado * 0.99);
    const prometido = Math.min(prometidoRaw, esperar * 0.99);
    const realizado = Math.min(realizadoRaw, prometido * 0.99);

    return [solicitado, esperar, prometido, realizado];
  }, [filtered]);

  const LABELS = ['Valor solicitado', 'Valor a esperar', 'Valor efetivado', 'Valor a liquidar'];
  const maxVal = totals[0] || 1;

  /* ── opções de contrato ── */
  const opts = active.filter(c =>
    !searchText ||
    c.contractNumber.toLowerCase().includes(searchText.toLowerCase()) ||
    (clients.find(cl => cl.id === c.clientId)?.name || '').toLowerCase().includes(searchText.toLowerCase())
  );
  const cLabel = (c: Contract) => `${c.contractNumber} — ${clients.find(x => x.id === c.clientId)?.name || ''}`;

  const hasFilters = !!(selContract || selPortfolio || selUr || selCred || selArranjo || dateFrom || dateTo);
  const clearAll = () => { setSelContract(''); setSelPortfolio(''); setSelUr(''); setSelCred(''); setSelArranjo(''); setDateFrom(''); setDateTo(''); setPeriodLabel(''); setSearchText(''); };

  return (
    <div className="space-y-4">

      {/* ═══ FILTROS ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />

          {/* todos */}
          <button onClick={clearAll}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!hasFilters ? 'bg-[#0e4d64] text-white border-[#0e4d64]' : 'text-gray-500 border-gray-200 hover:border-gray-300 bg-white'}`}
          >
            Todos ({active.length})
          </button>

          <span className="w-px h-5 bg-gray-200 flex-shrink-0" />

          {/* contrato */}
          <div className="relative" ref={ref}>
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text" placeholder="Contrato..."
              value={searchText}
              onChange={e => { setSearchText(e.target.value); setDropOpen(true); if (!e.target.value) setSelContract(''); }}
              onFocus={() => setDropOpen(true)}
              className={`pl-8 pr-7 py-1.5 rounded-full text-xs w-52 border transition-colors focus:ring-1 focus:ring-[#137a8b]/40 focus:border-[#137a8b] ${selContract ? 'border-[#137a8b] bg-[#137a8b]/5' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
            />
            {selContract && <button onClick={() => { setSelContract(''); setSearchText(''); setDropOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3 h-3" /></button>}
            {dropOpen && !selContract && (
              <div className="absolute z-30 top-full mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                {opts.length > 0 ? opts.slice(0, 20).map(c => (
                  <button key={c.id} onClick={() => { setSelContract(c.id); setSearchText(c.contractNumber); setDropOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <span className="font-medium text-gray-800">{c.contractNumber}</span>
                    <span className="text-gray-400 ml-1.5">— {clients.find(x => x.id === c.clientId)?.name || ''}</span>
                  </button>
                )) : (
                  <div className="px-3 py-3 text-xs text-gray-400 text-center">Nenhum contrato encontrado</div>
                )}
              </div>
            )}
          </div>

          {/* carteira */}
          <div className="relative">
            <select value={selPortfolio} onChange={e => setSelPortfolio(e.target.value)}
              className={`pl-3 pr-7 py-1.5 rounded-full text-xs appearance-none cursor-pointer border transition-colors focus:ring-1 focus:ring-[#137a8b]/40 focus:border-[#137a8b] ${selPortfolio ? 'border-[#137a8b] bg-[#137a8b]/5' : 'border-gray-200 bg-gray-50'}`}
            >
              <option value="">Carteira</option>
              <option value="guarantee">Garantia</option>
              <option value="extra-limit">Crédito Pontual</option>
              <option value="debt-settlement">Quitação de Dívida</option>
              <option value="anticipation">Antecipação</option>
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* UR */}
          <div className="relative">
            <input type="text" placeholder="UR..." value={selUr} onChange={e => setSelUr(e.target.value)}
              className={`px-3 py-1.5 rounded-full text-xs w-24 border transition-colors focus:ring-1 focus:ring-[#137a8b]/40 focus:border-[#137a8b] ${selUr ? 'border-[#137a8b] bg-[#137a8b]/5' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
            />
            {selUr && <button onClick={() => setSelUr('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3 h-3" /></button>}
          </div>

          {/* credenciadora */}
          <div className="relative">
            <select value={selCred} onChange={e => setSelCred(e.target.value)}
              className={`pl-3 pr-7 py-1.5 rounded-full text-xs appearance-none cursor-pointer border transition-colors focus:ring-1 focus:ring-[#137a8b]/40 focus:border-[#137a8b] ${selCred ? 'border-[#137a8b] bg-[#137a8b]/5' : 'border-gray-200 bg-gray-50'}`}
            >
              <option value="">Credenciadora</option>
              {acquirerList.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* arranjo (bandeira) */}
          <div className="relative">
            <select value={selArranjo} onChange={e => setSelArranjo(e.target.value)}
              className={`pl-3 pr-7 py-1.5 rounded-full text-xs appearance-none cursor-pointer border transition-colors focus:ring-1 focus:ring-[#137a8b]/40 focus:border-[#137a8b] ${selArranjo ? 'border-[#137a8b] bg-[#137a8b]/5' : 'border-gray-200 bg-gray-50'}`}
            >
              <option value="">Arranjo</option>
              {brandList.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <span className="w-px h-5 bg-gray-200 flex-shrink-0" />

          {/* período */}
          <div className="relative" ref={periodRef}>
            <button
              onClick={() => setPeriodOpen(!periodOpen)}
              className={`flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full text-xs border transition-colors ${dateFrom || dateTo ? 'border-[#137a8b] bg-[#137a8b]/5 text-gray-700' : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'}`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
              {periodLabel || (dateFrom || dateTo ? `${dateFrom || '...'} → ${dateTo || '...'}` : 'Período')}
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(''); setDateTo(''); setPeriodLabel(''); }} className="absolute -right-1 -top-1 bg-white border border-gray-200 rounded-full p-0.5 text-gray-400 hover:text-gray-600 shadow-sm">
                <X className="w-2.5 h-2.5" />
              </button>
            )}
            {periodOpen && (
              <div className="absolute z-30 top-full mt-1 right-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-3">
                {/* atalhos */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {[
                    { label: 'Hoje', days: 0 },
                    { label: '7 dias', days: 7 },
                    { label: '15 dias', days: 15 },
                    { label: '30 dias', days: 30 },
                    { label: '90 dias', days: 90 },
                    { label: '6 meses', days: 180 },
                    { label: '1 ano', days: 365 },
                  ].map(s => (
                    <button key={s.label} onClick={() => applyPeriodShortcut(s.label, s.days)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${periodLabel === s.label ? 'bg-[#0e4d64] text-white border-[#0e4d64]' : 'text-gray-500 border-gray-200 hover:border-gray-300 bg-white'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {/* inputs de data */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1 block">De</label>
                    <input type="date" value={dateFrom}
                      onChange={e => { setDateFrom(e.target.value); setPeriodLabel(''); }}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#137a8b]/40 focus:border-[#137a8b]"
                    />
                  </div>
                  <span className="text-gray-300 mt-4">→</span>
                  <div className="flex-1">
                    <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1 block">Até</label>
                    <input type="date" value={dateTo}
                      onChange={e => { setDateTo(e.target.value); setPeriodLabel(''); }}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#137a8b]/40 focus:border-[#137a8b]"
                    />
                  </div>
                </div>
                {/* limpar período */}
                {(dateFrom || dateTo) && (
                  <button onClick={() => { setDateFrom(''); setDateTo(''); setPeriodLabel(''); setPeriodOpen(false); }}
                    className="mt-2 w-full text-center text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
                    Limpar período
                  </button>
                )}
              </div>
            )}
          </div>

          {hasFilters && (
            <button onClick={clearAll} className="ml-auto text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
              <X className="w-3.5 h-3.5" /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* ═══ GRÁFICO ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 pb-0">
          <div className="flex items-end gap-8" style={{ height: 440 }}>
            {totals.map((val, i) => {
              const pct = (val / maxVal) * 100;
              const h = Math.max(pct, val > 0 ? 14 : 6);
              const c = COLORS[i];
              return (
                <div key={i} className="flex-1 flex flex-col h-full justify-end group">
                  <div
                    className="w-full rounded-t-2xl flex flex-col items-center justify-center relative transition-all duration-700 ease-out cursor-default"
                    style={{ height: `${h}%`, minHeight: 70, background: `linear-gradient(180deg, ${c.bg} 0%, ${c.bg}dd 100%)` }}
                  >
                    {/* valor compacto */}
                    <span className="text-white font-extrabold text-2xl tracking-tight drop-shadow-sm">
                      {compact(val)}
                    </span>
                    {/* valor reais */}
                    <span className="text-white/70 text-[11px] mt-0.5">
                      {brl(val)}
                    </span>

                    {/* seta de redução entre barras */}
                    {i < 3 && totals[0] > 0 && (
                      <div className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-4 h-4">
                        <svg width="10" height="10" viewBox="0 0 10 10" className="text-gray-300">
                          <path d="M2 1 L8 5 L2 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* labels + porcentagem */}
        <div className="px-6 py-5 border-t border-gray-100 mt-6">
          <div className="flex gap-8">
            {totals.map((val, i) => {
              const pct = totals[0] > 0 ? (val / totals[0]) * 100 : 0;
              return (
                <div key={i} className="flex-1 text-center">
                  {/* badge cor */}
                  <div className="flex items-center justify-center gap-1.5 mb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i].bg }} />
                    <span className="text-xs font-semibold text-gray-700 leading-tight">{LABELS[i]}</span>
                  </div>
                  {/* porcentagem */}
                  <span
                    className="inline-block text-sm font-bold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: COLORS[i].light, color: COLORS[i].bg }}
                  >
                    {pct.toFixed(1).replace('.', ',')}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ RESUMO EM CARDS ═══ */}
      <div className="grid grid-cols-4 gap-3">
        {totals.map((val, i) => {
          const pct = totals[0] > 0 ? (val / totals[0]) * 100 : 0;
          const diff = i > 0 ? val - totals[i - 1] : 0;
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i].bg }} />
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide leading-none">{LABELS[i]}</span>
              </div>
              <div className="text-lg font-bold text-gray-900">{brl(val)}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: COLORS[i].light, color: COLORS[i].bg }}>
                  {pct.toFixed(1).replace('.', ',')}%
                </span>
                {i > 0 && diff !== 0 && (
                  <span className="text-[11px] text-red-500 font-medium">
                    {brl(diff)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
