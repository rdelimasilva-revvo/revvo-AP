import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  AlertTriangle,
  Wallet,
  ArrowRight,
  FileText,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Receivable } from '../types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

interface MonitoringVolumeDashboardProps {
  onNavigate: (section: string) => void;
}

export const MonitoringVolumeDashboard: React.FC<MonitoringVolumeDashboardProps> = ({ onNavigate }) => {
  const { receivables, liquidationProblems } = useData();

  const [activePeriod, setActivePeriod] = useState<string>('hoje');

  const periodOptions = [
    { id: 'hoje', label: 'Hoje' },
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mês' },
    { id: 'trimestre', label: 'Trimestre' },
    { id: 'semestre', label: 'Semestre' },
    { id: 'ano', label: 'Ano' },
  ];

  const getStartDate = (period: string): Date | null => {
    if (period === 'hoje') return null; // sem filtro — visão consolidada do dia
    const s = new Date();
    switch (period) {
      case 'semana':
        s.setDate(s.getDate() - 7);
        break;
      case 'mes':
        s.setMonth(s.getMonth() - 1);
        break;
      case 'trimestre':
        s.setMonth(s.getMonth() - 3);
        break;
      case 'semestre':
        s.setMonth(s.getMonth() - 6);
        break;
      case 'ano':
        s.setFullYear(s.getFullYear() - 1);
        break;
    }
    s.setHours(0, 0, 0, 0);
    return s;
  };

  const filteredReceivables = useMemo(() => {
    const start = getStartDate(activePeriod);
    if (!start) return receivables;
    return receivables.filter((r) => r.settlementDate >= start);
  }, [receivables, activePeriod]);

  const filteredLiquidationProblems = useMemo(() => {
    const start = getStartDate(activePeriod);
    if (!start) return liquidationProblems;
    return liquidationProblems.filter((p) => new Date(p.expectedDate) >= start);
  }, [liquidationProblems, activePeriod]);

  const notSettled = filteredLiquidationProblems.filter((p) => p.status === 'not_settled');
  const partial = filteredLiquidationProblems.filter((p) => p.status === 'partial');
  const notSettledCount = notSettled.length;
  const partialCount = partial.length;
  const notSettledValue = notSettled.reduce((sum, p) => sum + p.expectedAmount, 0);
  const partialExpected = partial.reduce((sum, p) => sum + p.expectedAmount, 0);
  const partialRealized = partial.reduce((sum, p) => sum + p.realizedAmount, 0);

  const chargebackReceivables = filteredReceivables.filter(
    (r): r is Receivable & { chargebackDate: Date } =>
      r.status === 'chargeback' && r.chargebackDate != null
  );
  const chargebackCount = chargebackReceivables.length;
  const chargebackTotalValue = chargebackReceivables.reduce(
    (sum, r) => sum + (r.originalValue - r.encumberedValue),
    0
  );

  const settledReceivables = filteredReceivables.filter((r) => r.status === 'settled');
  const settledCount = settledReceivables.length;
  const settledValue = settledReceivables.reduce((sum, r) => sum + r.encumberedValue, 0);

  const totalUrCount = filteredReceivables.length;
  const totalUrValue = filteredReceivables.reduce((sum, r) => sum + r.originalValue, 0);

  type VolumeCard = {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    count: number;
    value?: number | null;
    partialExpected?: number;
    partialRealized?: number;
    description: string;
    color: string;
  };

  const cards: VolumeCard[] = [
    {
      id: 'settled-success',
      icon: CheckCircle2,
      label: 'Liquidados com sucesso',
      count: settledCount,
      value: settledValue,
      description: 'URs liquidadas integralmente na data prevista',
      color: 'emerald',
    },
    {
      id: 'chargeback-monitoring',
      icon: TrendingDown,
      label: 'Chargeback',
      count: chargebackCount,
      value: chargebackTotalValue,
      description: 'URs com valor reduzido por estorno',
      color: 'red',
    },
    {
      id: 'liquidation-problems',
      icon: AlertTriangle,
      label: 'Não liquidado na data',
      count: notSettledCount,
      value: notSettledValue,
      description: 'URs que não liquidaram na data prevista',
      color: 'amber',
    },
    {
      id: 'liquidation-problems',
      icon: Wallet,
      label: 'Liquidação parcial',
      count: partialCount,
      partialExpected,
      partialRealized,
      description: 'URs com valor liquidado menor que o previsto',
      color: 'yellow',
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 border-emerald-200 hover:border-emerald-300';
      case 'red':
        return 'bg-red-50 border-red-200 hover:border-red-300';
      case 'amber':
        return 'bg-amber-50 border-amber-200 hover:border-amber-300';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 hover:border-yellow-300';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'text-emerald-600 bg-emerald-100';
      case 'red':
        return 'text-red-600 bg-red-100';
      case 'amber':
        return 'text-amber-600 bg-amber-100';
      case 'yellow':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const hasFilters = activePeriod !== 'hoje';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-5">
          {/* Period filter */}
          <div className="mb-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtrar por período</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {periodOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setActivePeriod(opt.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePeriod === opt.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 p-4 rounded-lg border border-green-200 bg-green-50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Volume total de URs</h3>
                <p className="text-xs text-green-700">Total de unidades de recebível{hasFilters ? ' no período selecionado' : ' no sistema'}</p>
              </div>
            </div>
            <div className="text-right flex items-baseline gap-3">
              <span className="text-2xl font-bold text-green-900">{totalUrCount}</span>
              <span className="text-sm text-green-700">URs</span>
              <span className="text-base font-semibold text-green-800">{formatCurrency(totalUrValue)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {cards.map((card) => {
              const Icon = card.icon;
              const hasPartialValues = card.partialExpected !== undefined && card.partialRealized !== undefined;
              const hasSimpleValue = card.value != null && card.value > 0 && !hasPartialValues;
              const hasOnlyCount = !hasSimpleValue && !hasPartialValues;
              return (
                <button
                  key={card.id + card.label}
                  onClick={() => onNavigate(card.id)}
                  className={`flex flex-col p-3 rounded-lg border transition-all text-left ${getColorClasses(card.color)} hover:shadow-md`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`p-1.5 rounded-md flex-shrink-0 ${getIconColor(card.color)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{card.label}</h3>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{card.description}</p>
                  <div className={`flex items-baseline justify-between gap-2 ${hasOnlyCount ? 'py-1' : ''}`}>
                    <span className={`font-bold text-gray-900 ${hasOnlyCount ? 'text-2xl' : 'text-xl'}`}>
                      {card.count} <span className="text-sm font-normal text-gray-500">URs</span>
                    </span>
                    {hasSimpleValue && (
                      <span className="text-sm font-semibold text-gray-800">
                        {formatCurrency(card.value!)}
                      </span>
                    )}
                  </div>
                  {hasPartialValues && (
                    <div className="mt-2 pt-2 border-t border-gray-200/80 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500 block">Esperado</span>
                        <span className="font-semibold text-gray-800">{formatCurrency(card.partialExpected!)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Liquidado</span>
                        <span className="font-medium text-gray-700">{formatCurrency(card.partialRealized!)}</span>
                      </div>
                      {card.partialExpected! > card.partialRealized! && (
                        <div>
                          <span className="text-amber-600 font-medium block">Faltam</span>
                          <span className="font-semibold text-amber-600">
                            {formatCurrency(card.partialExpected! - card.partialRealized!)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Clique em um card para acessar o detalhamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
