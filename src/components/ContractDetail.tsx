import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Contract } from '../types';
import { ContractMetricCard } from './ContractMetricCard';
import { ExecuteURsModal } from './ExecuteURsModal';
import { showToast } from '../hooks/useToast';
import { useData } from '../context/DataContext';
import { saveContestacao, getContestacaoMotivo, hasContestacao } from '../utils/contestacaoStorage';
import { UrIdLink } from './UrIdLink';
import { buildContractMonitoringFromContaCorrente } from '../data/contractMonitoringBuilder';
import type { ContaCorrenteEntry, ContaCorrenteEvento } from '../types/contaCorrente';
import {
  ArrowLeft,
  CheckCircle,
  Calendar,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronRight,
  X,
  AlertTriangle,
  TrendingDown,
} from 'lucide-react';

const CONTEST_REASON_OPTIONS = [
  { value: 'valor_a_menor', label: 'Valor a menor' },
  { value: 'maiores_informacoes', label: 'Maiores informações' },
  { value: 'outros', label: 'Outros' },
] as const;

const EVENTO_LABELS: Record<ContaCorrenteEvento, string> = {
  contrato_criado: 'Contrato criado',
  liquidacao_total: 'Liquidação total',
  liquidacao_parcial: 'Liquidação parcial',
  nao_liquidada_na_data: 'Não liquidada na data',
  chargeback: 'Chargeback',
  liquidacao_prevista: 'Liquidação prevista',
  liquidacao_prevista_com_chargeback: 'Liquidação prevista com chargeback',
};

interface ContractDetailProps {
  contract: Contract;
  onBack: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR').format(date);

const formatDateShort = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

const getEventoBadge = (evento: ContaCorrenteEvento) => {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
  const map: Record<ContaCorrenteEvento, string> = {
    contrato_criado: `${base} bg-blue-100 text-blue-800`,
    liquidacao_total: `${base} bg-emerald-100 text-emerald-800`,
    liquidacao_parcial: `${base} bg-teal-100 text-teal-800`,
    nao_liquidada_na_data: `${base} bg-orange-100 text-orange-800`,
    chargeback: `${base} bg-red-100 text-red-800`,
    liquidacao_prevista: `${base} bg-amber-100 text-amber-800`,
    liquidacao_prevista_com_chargeback: `${base} bg-amber-50 text-amber-900 border border-amber-300`,
  };
  return map[evento];
};

export const ContractDetail: React.FC<ContractDetailProps> = ({ contract, onBack }) => {
  const { contaCorrenteEntries, liquidationProblems, contracts, useCsv } = useData();
  const [showExecuteURsModal, setShowExecuteURsModal] = useState(false);
  const [localContract, setLocalContract] = useState(contract);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [eventoFilter, setEventoFilter] = useState<string>('all');
  const [contestingEntry, setContestingEntry] = useState<ContaCorrenteEntry | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [showContestacaoMotivo, setShowContestacaoMotivo] = useState<{ urId: string; motivo: string } | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const handleApproveContract = () => {
    setLocalContract({ ...localContract, status: 'active' });
    showToast('success', 'Contrato aprovado com sucesso!');
  };

  const formatCurrencyCompact = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(2).replace('.', ',')}Mi`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(2).replace('.', ',')}k`;
    return formatCurrency(value);
  };

  const contractEntries = useMemo(() => {
    return contaCorrenteEntries.filter((e) => e.contractId === localContract.id);
  }, [contaCorrenteEntries, localContract.id]);

  const urEntries = useMemo(
    () => contractEntries.filter((e) => e.urId && e.evento !== 'contrato_criado'),
    [contractEntries]
  );

  const contractMonitoring = useMemo(() => {
    if (useCsv && contaCorrenteEntries.length > 0 && contracts.length > 0) {
      const monitoring = buildContractMonitoringFromContaCorrente(contaCorrenteEntries, contracts);
      return monitoring.find((m) => m.contractId === localContract.id);
    }
    return null;
  }, [useCsv, contaCorrenteEntries, contracts, localContract.id]);

  const chartByAcquirer = useMemo(() => {
    const byAcquirer = new Map<string, { esperado: number; atual: number; chargeback: number }>();
    urEntries.forEach((e) => {
      const curr = byAcquirer.get(e.acquirer) ?? { esperado: 0, atual: 0, chargeback: 0 };
      curr.esperado += e.valorEsperado ?? 0;
      curr.atual += e.valorAtual ?? 0;
      curr.chargeback += e.chargebackValor ?? 0;
      byAcquirer.set(e.acquirer, curr);
    });
    return Array.from(byAcquirer.entries()).map(([acquirer, v]) => ({
      acquirer,
      esperado: v.esperado,
      atual: v.atual,
      chargeback: v.chargeback,
    }));
  }, [urEntries]);

  const contractLiquidationProblems = useMemo(() => {
    return liquidationProblems.filter((p) => p.contractId === localContract.contractNumber);
  }, [liquidationProblems, localContract.contractNumber]);

  const chargebackEntries = useMemo(() => {
    return urEntries.filter(
      (e) => e.evento === 'chargeback' || e.evento === 'liquidacao_prevista_com_chargeback'
    );
  }, [urEntries]);

  const filteredEntries = useMemo(() => {
    if (eventoFilter === 'all') return urEntries;
    return urEntries.filter((e) => e.evento === eventoFilter);
  }, [urEntries, eventoFilter]);

  const dailyEntries = useMemo(() => {
    const map = new Map<string, ContaCorrenteEntry[]>();
    filteredEntries.forEach((e) => {
      const d = e.dataEfetiva ?? e.dataEsperada ?? e.dataEvento;
      const key = d.toISOString().slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, entries]) => ({
        dateKey,
        date: new Date(dateKey + 'T12:00:00'),
        entries: entries.sort((a, b) => (a.dataEvento.getTime() - b.dataEvento.getTime())),
      }));
  }, [filteredEntries]);

  const toggleDateExpansion = (dateKey: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);
      return next;
    });
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const canContestar = (evento: ContaCorrenteEvento) =>
    evento === 'nao_liquidada_na_data' || evento === 'liquidacao_parcial';

  const totalValue = urEntries.reduce((s, e) => s + (e.valorEsperado ?? 0), 0);
  const totalAtual = urEntries.reduce((s, e) => s + (e.valorAtual ?? 0), 0);
  const totalChargeback = urEntries.reduce((s, e) => s + (e.chargebackValor ?? 0), 0);

  const useMassData = useCsv && contractEntries.length > 0;

  return (
    <div className="space-y-6">
      {/* Header com título */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Detalhe do Contrato</h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  {localContract.contractNumber} — Visão completa do contrato
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {localContract.status === 'pending_approval' && (
                <button
                  onClick={handleApproveContract}
                  className="flex items-center gap-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors h-8 text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Aprovar Contrato
                </button>
              )}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  localContract.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : localContract.status === 'pending_approval'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {localContract.status === 'active' ? 'Ativo' : localContract.status === 'pending_approval' ? 'Pendente' : 'Encerrado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informações do contrato */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Contrato</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Número do Contrato</p>
              <p className="font-medium text-gray-900">{localContract.contractNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Data de Criação</p>
              <p className="font-medium text-gray-900">{formatDate(localContract.createdAt)}</p>
            </div>
          </div>
          {localContract.closedAt && (
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Data de Encerramento</p>
                <p className="font-medium text-gray-900">{formatDate(localContract.closedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ContractMetricCard
          title="Valor Solicitado"
          value={formatCurrencyCompact(localContract.requestedValue)}
          tooltip={formatCurrency(localContract.requestedValue)}
          color="text-blue-600"
        />
        <ContractMetricCard
          title="Valor Alcançado"
          value={formatCurrencyCompact(localContract.encumberedValue)}
          tooltip={formatCurrency(localContract.encumberedValue)}
          color="text-green-600"
        />
        {contractMonitoring && (
          <>
            <ContractMetricCard
              title="Faltam (problema)"
              value={formatCurrencyCompact(contractMonitoring.valorProblema)}
              tooltip={formatCurrency(contractMonitoring.valorProblema)}
              color="text-red-600"
            />
            <ContractMetricCard
              title="A liquidar (futuro)"
              value={formatCurrencyCompact(contractMonitoring.valorFuturo ?? 0)}
              tooltip={formatCurrency(contractMonitoring.valorFuturo ?? 0)}
              color="text-amber-600"
            />
          </>
        )}
      </div>

      {/* Gráfico por credenciadora */}
      {useMassData && chartByAcquirer.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('chart')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Totais por Credenciadora</h3>
            </div>
            {collapsedSections.has('chart') ? (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {!collapsedSections.has('chart') && (
          <div className="px-6 pb-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartByAcquirer} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="acquirer" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="esperado" name="Esperado" fill="#94a3b8" radius={[0, 0, 0, 0]} />
                <Bar dataKey="atual" name="Atual" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="chargeback" name="Chargeback" fill="#ef4444" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          </div>
          )}
        </div>
      )}

      {/* Problemas de liquidação e chargeback */}
      {useMassData && (contractLiquidationProblems.length > 0 || chargebackEntries.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('problemas')}
            className="w-full flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-white hover:bg-amber-50/80 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">Problemas de Liquidação e Chargeback</h3>
            </div>
            {collapsedSections.has('problemas') ? (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {!collapsedSections.has('problemas') && (
          <div className="divide-y divide-gray-100">
            {contractLiquidationProblems.length > 0 && (
              <div className="p-4">
                <button
                  onClick={() => toggleSection('problemas-liquidation')}
                  className="w-full flex items-center justify-between mb-3 text-left hover:opacity-80"
                >
                  <h4 className="text-sm font-medium text-gray-700">Não liquidados / Parciais</h4>
                  {collapsedSections.has('problemas-liquidation') ? (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {!collapsedSections.has('problemas-liquidation') && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 pr-4">UR</th>
                        <th className="py-2 pr-4">Credenciadora</th>
                        <th className="py-2 pr-4">Data esperada</th>
                        <th className="py-2 pr-4">Esperado</th>
                        <th className="py-2 pr-4">Realizado</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2">Contestação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractLiquidationProblems.map((p) => (
                        <tr key={p.id} className="border-t border-gray-100">
                          <td className="py-2 pr-4">
                            <UrIdLink urId={p.id} className="text-xs" />
                          </td>
                          <td className="py-2 pr-4">{p.acquirer} / {p.brand}</td>
                          <td className="py-2 pr-4">{p.expectedDate}</td>
                          <td className="py-2 pr-4">{formatCurrency(p.expectedAmount)}</td>
                          <td className="py-2 pr-4">{formatCurrency(p.realizedAmount)}</td>
                          <td className="py-2 pr-4">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              p.status === 'not_settled' ? 'bg-red-100 text-red-800' :
                              p.status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
                            }`}>
                              {p.status === 'not_settled' ? 'Não liquidado' : p.status === 'partial' ? 'Parcial' : 'Atrasado'}
                            </span>
                          </td>
                          <td className="py-2">
                            {hasContestacao(p.id) ? (
                              <button
                                onClick={() => {
                                  const motivo = getContestacaoMotivo(p.id);
                                  if (motivo) setShowContestacaoMotivo({ urId: p.id, motivo });
                                }}
                                className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              >
                                Contestado
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const entry = urEntries.find((e) => e.urId === p.id);
                                  if (entry) {
                                    setContestingEntry(entry);
                                    setSelectedReason('');
                                  }
                                }}
                                className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                              >
                                Contestar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            )}
            {chargebackEntries.length > 0 && (
              <div className="p-4">
                <button
                  onClick={() => toggleSection('problemas-chargeback')}
                  className="w-full flex items-center justify-between mb-3 text-left hover:opacity-80"
                >
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    Chargebacks
                  </h4>
                  {collapsedSections.has('problemas-chargeback') ? (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {!collapsedSections.has('problemas-chargeback') && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 pr-4">UR</th>
                        <th className="py-2 pr-4">Credenciadora</th>
                        <th className="py-2 pr-4">Data</th>
                        <th className="py-2 pr-4">Esperado</th>
                        <th className="py-2 pr-4">Chargeback</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chargebackEntries.map((e) => (
                        <tr key={e.id} className="border-t border-gray-100">
                          <td className="py-2 pr-4">
                            <UrIdLink urId={e.urId} className="text-xs" />
                          </td>
                          <td className="py-2 pr-4">{e.acquirer} / {e.cardBrand}</td>
                          <td className="py-2 pr-4">{formatDateShort(e.dataChargeback ?? e.dataEsperada ?? e.dataEvento)}</td>
                          <td className="py-2 pr-4">{formatCurrency(e.valorEsperado ?? 0)}</td>
                          <td className="py-2 pr-4 text-red-600 font-medium">{formatCurrency(e.chargebackValor ?? 0)}</td>
                          <td className="py-2">
                            <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-800">
                              {e.evento === 'liquidacao_prevista_com_chargeback' ? 'Liquidação futura com chargeback' : 'Chargeback'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            )}
          </div>
          )}
        </div>
      )}

      {/* Analítico de URs */}
      {useMassData ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('analitico')}
            className="w-full flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Analítico de URs</h3>
            </div>
            {collapsedSections.has('analitico') ? (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {!collapsedSections.has('analitico') && (
          <>
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Total de URs</p>
                <p className="text-2xl font-bold text-gray-900">{urEntries.length}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Valor Esperado</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Valor Atual</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalAtual)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Chargeback</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalChargeback)}</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-3 border-b border-gray-200 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-600">Evento:</span>
            {['all', ...Object.keys(EVENTO_LABELS)].map((ev) => (
              <button
                key={ev}
                onClick={() => setEventoFilter(ev)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  eventoFilter === ev ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {ev === 'all' ? 'Todos' : EVENTO_LABELS[ev as ContaCorrenteEvento]}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UR</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credenciadora</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Esperado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Atual</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contestação</th>
                </tr>
              </thead>
              <tbody>
                {dailyEntries.map(({ dateKey, date, entries }) => {
                  const isExpanded = expandedDates.has(dateKey);
                  return (
                    <React.Fragment key={dateKey}>
                      <tr
                        className="hover:bg-gray-50 transition-colors border-b border-gray-200 cursor-pointer"
                        onClick={() => toggleDateExpansion(dateKey)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            {formatDateShort(date)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{entries.length} URs</td>
                        <td colSpan={4} />
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {(() => {
                            // Divergência = valor esperado diferente do valor atual (parcial, não liquidado, chargeback)
                            const comDivergencia = entries.filter(
                              (e) => Math.abs((e.valorEsperado ?? 0) - (e.valorAtual ?? 0)) > 0.01
                            );
                            const count = comDivergencia.length;
                            const contestadas = comDivergencia.filter((e) => hasContestacao(e.urId)).length;
                            return count > 0 ? (
                              <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                {count} {count === 1 ? 'divergência' : 'divergências'}
                                {contestadas > 0 && (
                                  <span className="text-amber-600 font-normal text-xs">
                                    ({contestadas} contestada{contestadas > 1 ? 's' : ''})
                                  </span>
                                )}
                              </span>
                            ) : (
                              '—'
                            );
                          })()}
                        </td>
                      </tr>
                      {isExpanded &&
                        entries.map((e) => (
                          <tr key={e.id} className="bg-gray-50 border-b border-gray-100">
                            <td className="px-4 py-2 pl-12 text-sm text-gray-500" />
                            <td className="px-4 py-2 text-sm">
                              <UrIdLink urId={e.urId} className="text-xs" />
                            </td>
                            <td className="px-4 py-2">
                              <span className={getEventoBadge(e.evento)}>{EVENTO_LABELS[e.evento]}</span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">{e.acquirer} / {e.cardBrand}</td>
                            <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(e.valorEsperado ?? 0)}</td>
                            <td className="px-4 py-2 text-sm text-right font-medium text-green-600">
                              {formatCurrency(e.valorAtual ?? 0)}
                            </td>
                            <td className="px-4 py-2">
                              {canContestar(e.evento) ? (
                                hasContestacao(e.urId) ? (
                                  <button
                                    onClick={(ev) => {
                                      ev.stopPropagation();
                                      const motivo = getContestacaoMotivo(e.urId);
                                      if (motivo) setShowContestacaoMotivo({ urId: e.urId, motivo });
                                    }}
                                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                  >
                                    Contestado
                                  </button>
                                ) : (
                                  <button
                                    onClick={(ev) => {
                                      ev.stopPropagation();
                                      setContestingEntry(e);
                                      setSelectedReason('');
                                    }}
                                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  >
                                    Contestar
                                  </button>
                                )
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Nenhum dado de massa disponível para este contrato.</p>
        </div>
      )}

      {/* Modal de Contestação */}
      {contestingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Contestar UR</h3>
              <button onClick={() => setContestingEntry(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">UR</p>
                <p className="font-medium text-gray-900">{contestingEntry.urId}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valor Esperado</p>
                  <p className="font-medium text-gray-900">{formatCurrency(contestingEntry.valorEsperado ?? 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valor Atual</p>
                  <p className="font-medium text-green-600">{formatCurrency(contestingEntry.valorAtual ?? 0)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Motivo da contestação</p>
                <div className="space-y-2">
                  {CONTEST_REASON_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                        selectedReason === opt.value ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="contestReason"
                        value={opt.value}
                        checked={selectedReason === opt.value}
                        onChange={() => setSelectedReason(opt.value)}
                        className="w-4 h-4 text-red-600"
                      />
                      <span className="ml-3 text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setContestingEntry(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (selectedReason) {
                    const motivo = CONTEST_REASON_OPTIONS.find((o) => o.value === selectedReason)?.label ?? selectedReason;
                    saveContestacao(contestingEntry.urId, motivo);
                    showToast('success', 'Contestação registrada!', `UR: ${contestingEntry.urId}`);
                    setContestingEntry(null);
                  }
                }}
                disabled={!selectedReason}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirmar Contestação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal motivo da contestação */}
      {showContestacaoMotivo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Motivo da contestação</h3>
              <button onClick={() => setShowContestacaoMotivo(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-2">UR {showContestacaoMotivo.urId}</p>
              <p className="text-gray-900">{showContestacaoMotivo.motivo}</p>
            </div>
          </div>
        </div>
      )}

      <ExecuteURsModal
        isOpen={showExecuteURsModal}
        onClose={() => setShowExecuteURsModal(false)}
        contract={localContract}
      />
    </div>
  );
};
