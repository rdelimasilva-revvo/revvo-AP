import React from 'react';
import { ContractMonitoring } from '../types';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Activity,
  Minus,
  Eye,
  FileText
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

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
          label: 'Reposição Funcional'
        };
      case 'insufficient':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          badge: 'bg-yellow-100 text-yellow-800',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          label: 'Reposição Insuficiente'
        };
      case 'no_generation':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          badge: 'bg-red-100 text-red-800',
          icon: <TrendingDown className="w-5 h-5 text-red-600" />,
          label: 'Sem Geração de URs'
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  };

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const isMonthlyRevolving = monitoring.windowType === 'monthly_revolving';

  const statusConfig = getStatusConfig(monitoring.status);
  const isVelocityGood = monitoring.currentVelocity >= monitoring.requiredVelocity;

  const chartData = monitoring.dailyTrend.map(trend => ({
    date: formatDate(trend.date),
    capturado: trend.capturedValue,
    esperado: trend.expectedValue
  }));

  const remainingValue = monitoring.targetValue - monitoring.capturedValue;

  const getTrendIndicator = () => {
    const recentTrend = monitoring.dailyTrend.slice(-3);
    if (recentTrend.length < 2) return 'stable';

    const firstValue = recentTrend[0].capturedValue;
    const lastValue = recentTrend[recentTrend.length - 1].capturedValue;
    const growth = lastValue - firstValue;

    if (growth > monitoring.requiredVelocity * 1.2) return 'improving';
    if (growth < monitoring.requiredVelocity * 0.8) return 'worsening';
    return 'stable';
  };

  const trendIndicator = getTrendIndicator();

  const getSuggestedAction = () => {
    if (monitoring.status === 'no_generation') {
      return { text: 'Contatar cliente urgente', color: 'text-red-600', action: 'contact' };
    }
    if (monitoring.status === 'insufficient') {
      if (!isVelocityGood) {
        return { text: 'Verificar com cliente', color: 'text-yellow-600', action: 'contact' };
      }
      return { text: 'Monitorar próximas 24h', color: 'text-yellow-600', action: 'monitor' };
    }
    if (trendIndicator === 'worsening') {
      return { text: 'Verificar causa da queda', color: 'text-orange-600', action: 'review' };
    }
    return { text: 'Manter acompanhamento', color: 'text-green-600', action: null };
  };

  const suggestedAction = getSuggestedAction();

  const handleActionClick = (e: React.MouseEvent, _action: string) => {
    e.stopPropagation();
    // Action handling for contract monitoring
  };

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

      {isMonthlyRevolving && (
        <div className="flex items-center justify-between mb-3 px-2 py-1.5 bg-blue-50 rounded-lg">
          <span className="text-xs font-medium text-blue-700">
            Janela: {formatMonthYear(monitoring.windowStartDate)}
          </span>
          {monitoring.windowMonth && (
            <span className="text-xs text-blue-600">Mês {monitoring.windowMonth}</span>
          )}
          {monitoring.renewalDate && (
            <span className="text-xs text-blue-600">Renova: {formatDate(monitoring.renewalDate)}</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">{isMonthlyRevolving ? 'Meta Mensal' : 'Meta'}</p>
          <p className="font-semibold text-gray-900 text-sm">
            {formatCurrency(monitoring.targetValue)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Capturado</p>
          <p className="font-semibold text-gray-900 text-sm">
            {formatCurrency(monitoring.capturedValue)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Falta</p>
          <p className="font-semibold text-red-600 text-sm">
            {formatCurrency(remainingValue)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600">Progresso</span>
          <span className="text-xs font-semibold text-gray-900">
            {monitoring.capturedPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              monitoring.capturedPercentage >= 100
                ? 'bg-green-500'
                : monitoring.capturedPercentage >= 75
                ? 'bg-blue-500'
                : monitoring.capturedPercentage >= 50
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(monitoring.capturedPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-4" style={{ height: '80px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
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
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className={isVelocityGood ? 'text-green-600' : 'text-red-600'}>
            {isVelocityGood ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
          <div>
            <p className="text-xs text-gray-600">Velocidade Atual</p>
            <p className="text-xs font-semibold text-gray-900">
              {formatCurrency(monitoring.currentVelocity)}/dia
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-gray-600" />
          <div>
            <p className="text-xs text-gray-600">Necessária</p>
            <p className="text-xs font-semibold text-gray-900">
              {formatCurrency(monitoring.requiredVelocity)}/dia
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1 text-gray-600">
            <Clock className="w-3 h-3" />
            <span className={monitoring.daysRemaining <= 3 ? 'text-red-600 font-semibold' : ''}>
              {monitoring.daysRemaining} dias restantes
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {trendIndicator === 'improving' && <TrendingUp className="w-3 h-3 text-green-600" />}
            {trendIndicator === 'worsening' && <TrendingDown className="w-3 h-3 text-red-600" />}
            {trendIndicator === 'stable' && <Minus className="w-3 h-3 text-gray-600" />}
            <span className={
              trendIndicator === 'improving' ? 'text-green-600' :
              trendIndicator === 'worsening' ? 'text-red-600' : 'text-gray-600'
            }>
              {trendIndicator === 'improving' ? 'Melhorando' :
               trendIndicator === 'worsening' ? 'Piorando' : 'Estável'}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-600">
          <span>Projeção: {formatDate(monitoring.projectedCompletionDate)}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className={`flex items-center justify-between text-xs font-medium mb-2 ${suggestedAction.color}`}>
          <span>Ação sugerida: {suggestedAction.text}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContractClick(monitoring.contractId);
            }}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs font-medium"
          >
            <Eye className="w-3 h-3" />
            <span>Ver Detalhes</span>
          </button>
          <button
            onClick={(e) => handleActionClick(e, 'note')}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-xs font-medium"
          >
            <FileText className="w-3 h-3" />
            <span>Adicionar Nota</span>
          </button>
        </div>
      </div>
    </div>
  );
};
