import React from 'react';
import { ContractMonitoring } from '../types';
import {
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Eye
} from 'lucide-react';
import {
  ComposedChart,
  Area,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface ContractMonitoringCardProps {
  monitoring: ContractMonitoring;
  onContractClick: (contractId: string) => void;
}

export const ContractMonitoringCard: React.FC<ContractMonitoringCardProps> = ({
  monitoring,
  onContractClick
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'functional':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          badge: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          label: 'OK'
        };
      case 'insufficient':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          badge: 'bg-yellow-100 text-yellow-800',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          label: 'Com falha'
        };
      case 'no_generation':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          badge: 'bg-red-100 text-red-800',
          icon: <TrendingDown className="w-5 h-5 text-red-600" />,
          label: 'Falha crítica (>10%)'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          badge: 'bg-gray-100 text-gray-800',
          icon: <Activity className="w-5 h-5 text-gray-600" />,
          label: 'Desconhecido'
        };
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  };

  const statusConfig = getStatusConfig(monitoring.status);
  const valorFuturo = monitoring.valorFuturo ?? 0;
  const hasBurnup = monitoring.burnupData && monitoring.burnupData.length > 0;
  const chartData = hasBurnup
    ? monitoring.burnupData!.map((p) => ({
        date: formatDate(p.date),
        fullDate: p.date,
        pagoRecebido: p.pagoRecebido,
        futuro: p.futuro,
        cobertura: p.total - (p.naoRealizado ?? 0),
        queda: p.naoRealizado ?? 0,
        total: p.total,
      }))
    : monitoring.dailyTrend.map((trend) => ({
        date: formatDate(trend.date),
        capturado: trend.capturedValue,
        esperado: trend.expectedValue,
      }));

  const valorProblema = monitoring.valorProblema ?? 0;
  const liquidatedPct = monitoring.liquidatedPercentage ?? monitoring.capturedPercentage;

  const getSuggestedAction = () => {
    if (monitoring.status === 'no_generation') {
      return { text: 'Falha acima de 10% do contrato', color: 'text-red-600' };
    }
    if (monitoring.status === 'insufficient') {
      return { text: 'Verificar falhas de liquidação', color: 'text-yellow-600' };
    }
    return null;
  };

  const suggestedAction = getSuggestedAction();

  return (
    <div
      className={`${statusConfig.bg} ${statusConfig.border} border-2 rounded-lg p-4 hover:shadow-md transition-all`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          {statusConfig.icon}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              {monitoring.contractNumber}
            </h3>
            <p className="text-xs text-gray-600">{monitoring.clientName}</p>
          </div>
        </div>
        <span className={`${statusConfig.badge} px-2 py-1 rounded-full text-xs font-medium`}>
          {statusConfig.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Meta</p>
          <p className="font-semibold text-gray-900 text-sm">
            {formatCurrency(monitoring.targetValue)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Liquidado</p>
          <p className="font-semibold text-gray-900 text-sm">
            {formatCurrency(monitoring.liquidatedValue ?? monitoring.capturedValue)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Faltam (problema)</p>
          <p className={`font-semibold text-sm ${valorProblema > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(valorProblema)}
          </p>
        </div>
      </div>

      {(valorFuturo ?? 0) > 0 && (
        <div className="mb-4 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-xs text-emerald-700 mb-1">A liquidar (futuro)</p>
          <p className="text-sm font-semibold text-emerald-800">{formatCurrency(valorFuturo ?? 0)}</p>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600">Progresso (Liquidação)</span>
          <span className="text-xs font-semibold text-gray-900">
            {liquidatedPct.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              liquidatedPct >= 100
                ? 'bg-green-500'
                : liquidatedPct >= 75
                ? 'bg-blue-500'
                : liquidatedPct >= 50
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(liquidatedPct, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[10px] text-gray-500 mb-1">
          Área vermelha: queda (incl. chargeback em liquidação futura)
        </p>
        <div style={{ height: '80px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {hasBurnup ? (
            <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
              />
              <Tooltip
                contentStyle={{ fontSize: '12px' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border border-gray-200 rounded shadow text-xs min-w-[180px]">
                      <p className="font-medium mb-1">{p.fullDate ? formatDate(p.fullDate) : p.date}</p>
                      <p className="text-red-600 font-medium">Queda acumulada: {formatCurrency(p.queda ?? 0)}</p>
                      <p className="text-gray-500 mt-1 text-[10px]">
                        Inclui: não liquidadas, parciais, chargebacks e chargeback em liquidação futura
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="queda"
                fill="#ef4444"
                fillOpacity={0.6}
                stroke="#dc2626"
                strokeWidth={1.5}
              />
            </ComposedChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: '12px' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Line
                type="monotone"
                dataKey="capturado"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="esperado"
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Clock className="w-4 h-4" />
          <span className={monitoring.daysRemaining <= 3 ? 'text-red-600 font-semibold' : ''}>
            {monitoring.daysRemaining} dias restantes
          </span>
          <span className="text-gray-300">·</span>
          <span>Fim do contrato: {formatDate(monitoring.windowEndDate)}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        {suggestedAction && (
          <div className={`text-xs font-medium mb-2 ${suggestedAction.color}`}>
            {suggestedAction.text}
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContractClick(monitoring.contractId);
          }}
          className="w-full flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs font-medium"
        >
          <Eye className="w-3 h-3" />
          <span>Ver Detalhes</span>
        </button>
      </div>
    </div>
  );
};
