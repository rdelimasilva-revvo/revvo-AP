import React, { useState, useMemo } from 'react';
import { TrendingUp, Lock, CheckCircle, Calendar, ArrowLeft, Eye, FileText, Plus, Filter, Users, Search, Activity, ChevronDown, ChevronRight } from 'lucide-react';
import { Client } from '../types';
import { NewOptInModal } from './NewOptInModal';
import { OptInDetailsModal } from './OptInDetailsModal';
import { NewContractModal } from './NewContractModal';
import { Tooltip } from './Tooltip';
import { showToast } from '../hooks/useToast';

interface ScheduleViewProps {
  clients: Client[];
}

interface RadarData {
  date: string;
  blocked: number;
  available: number;
  isPast: boolean;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ clients }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [_selectedPeriod, _setSelectedPeriod] = useState<'7days' | '30days' | '90days' | '180days'>('30days');
  const [bloqueadoExpanded, setBloqueadoExpanded] = useState(false);
  const [liquidadoHojeExpanded, setLiquidadoHojeExpanded] = useState(false);
  const [showNewOptInModal, setShowNewOptInModal] = useState(false);
  const [showOptInDetailsModal, setShowOptInDetailsModal] = useState(false);
  const [selectedOptInClient, setSelectedOptInClient] = useState<any>(null);
  const [pastPeriodFilter, setPastPeriodFilter] = useState<'week' | 'month' | 'quarter' | 'semester' | 'year' | 'custom'>('month');
  const [customPastStartDate, setCustomPastStartDate] = useState('');
  const [customPastEndDate, setCustomPastEndDate] = useState('');
  const [futurePeriodFilter, setFuturePeriodFilter] = useState<'week' | 'month' | 'quarter' | 'semester' | 'year' | 'custom'>('month');
  const [customFutureStartDate, setCustomFutureStartDate] = useState('');
  const [customFutureEndDate, setCustomFutureEndDate] = useState('');
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [filterLimit, setFilterLimit] = useState<'all' | 'above500k' | 'above1m' | 'above5m'>('all');
  const [filterOptIn, setFilterOptIn] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');

  const handleSendToRegistry = (client: any) => {
    showToast('success', 'Opt-in encaminhado!', `Cliente: ${client.client_name}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesName = client.name.toLowerCase().includes(searchName.toLowerCase());

      let matchesLimit = true;
      if (filterLimit === 'above500k') {
        matchesLimit = client.totalLimit >= 500000;
      } else if (filterLimit === 'above1m') {
        matchesLimit = client.totalLimit >= 1000000;
      } else if (filterLimit === 'above5m') {
        matchesLimit = client.totalLimit >= 5000000;
      }

      let matchesOptIn = true;
      if (filterOptIn === 'active') {
        matchesOptIn = client.status === 'active';
      } else if (filterOptIn === 'pending') {
        matchesOptIn = client.status === 'pending';
      } else if (filterOptIn === 'inactive') {
        matchesOptIn = client.status === 'inactive';
      }

      return matchesName && matchesLimit && matchesOptIn;
    });
  }, [clients, searchName, filterLimit, filterOptIn]);

  const _formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
  };

  const generateDailyData = () => {
    const data: RadarData[] = [];
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2026-12-31');
    const today = new Date('2025-11-05');

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const isPast = d < today;
      const randomFactor = 0.8 + Math.random() * 0.4;

      data.push({
        date: dateStr,
        blocked: Math.floor((20000 + Math.random() * 15000) * randomFactor),
        available: Math.floor((25000 + Math.random() * 20000) * randomFactor),
        isPast
      });
    }
    return data;
  };

  const radarData: RadarData[] = useMemo(() => generateDailyData(), []);

  const getFilteredPastData = () => {
    const today = new Date('2025-11-05');
    const pastData = radarData.filter(d => d.isPast);

    if (pastPeriodFilter === 'custom' && customPastStartDate && customPastEndDate) {
      return pastData.filter(d => {
        const date = new Date(d.date);
        return date >= new Date(customPastStartDate) && date <= new Date(customPastEndDate);
      });
    }

    const filterDate = new Date(today);
    switch (pastPeriodFilter) {
      case 'week':
        filterDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(today.getMonth() - 3);
        break;
      case 'semester':
        filterDate.setMonth(today.getMonth() - 6);
        break;
      case 'year':
        filterDate.setFullYear(today.getFullYear() - 1);
        break;
    }

    return pastData.filter(d => new Date(d.date) >= filterDate);
  };

  const getFilteredFutureData = () => {
    const today = new Date('2025-11-05');
    const futureData = radarData.filter(d => !d.isPast);

    if (futurePeriodFilter === 'custom' && customFutureStartDate && customFutureEndDate) {
      return futureData.filter(d => {
        const date = new Date(d.date);
        return date >= new Date(customFutureStartDate) && date <= new Date(customFutureEndDate);
      });
    }

    const filterDate = new Date(today);
    switch (futurePeriodFilter) {
      case 'week':
        filterDate.setDate(today.getDate() + 7);
        break;
      case 'month':
        filterDate.setMonth(today.getMonth() + 1);
        break;
      case 'quarter':
        filterDate.setMonth(today.getMonth() + 3);
        break;
      case 'semester':
        filterDate.setMonth(today.getMonth() + 6);
        break;
      case 'year':
        filterDate.setFullYear(today.getFullYear() + 1);
        break;
    }

    return futureData.filter(d => new Date(d.date) <= filterDate);
  };

  const filteredPastData = getFilteredPastData();
  const filteredFutureData = getFilteredFutureData();

  const totalPastBlocked = filteredPastData.reduce((sum, d) => sum + d.blocked, 0);
  const totalPastAvailable = filteredPastData.reduce((sum, d) => sum + d.available, 0);
  const totalPastLiquidated = totalPastBlocked + totalPastAvailable;

  const totalFutureBlocked = filteredFutureData.reduce((sum, d) => sum + d.blocked, 0);
  const totalFutureAvailable = filteredFutureData.reduce((sum, d) => sum + d.available, 0);
  const totalFutureLiquidate = totalFutureBlocked + totalFutureAvailable;

  const maxValue = Math.max(...radarData.map(d => d.blocked + d.available));

  const totalReceivables = totalPastLiquidated + totalFutureLiquidate;
  const _averageTicket = totalReceivables / radarData.length;
  const oldestTotal = radarData[0]?.blocked + radarData[0]?.available || 0;
  const newestTotal = radarData[radarData.length - 1]?.blocked + radarData[radarData.length - 1]?.available || 0;
  const _growthRate = oldestTotal > 0 ? ((newestTotal - oldestTotal) / oldestTotal) * 100 : 0;
  const _utilizationRate = totalReceivables > 0 ? ((totalPastBlocked + totalFutureBlocked) / totalReceivables) * 100 : 0;
  const maxDayTotal = Math.max(...radarData.map(d => d.blocked + d.available));
  const _concentration = totalReceivables > 0 ? (maxDayTotal / totalReceivables) * 100 : 0;

  if (selectedClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedClient(null)}
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
          </div>
        <button
          onClick={() => setShowNewContractModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Trava</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Período Futuro</h3>
                <p className="text-sm text-gray-600">Projeções e previsões</p>
              </div>
            </div>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Filtro de Período</label>
              <select
                value={futurePeriodFilter}
                onChange={(e) => setFuturePeriodFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Próxima Semana</option>
                <option value="month">Próximo Mês</option>
                <option value="quarter">Próximo Trimestre</option>
                <option value="semester">Próximo Semestre</option>
                <option value="year">Próximo Ano</option>
                <option value="custom">Período Personalizado</option>
              </select>
            </div>
            {futurePeriodFilter === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Data Inicial</label>
                  <input
                    type="date"
                    value={customFutureStartDate}
                    onChange={(e) => setCustomFutureStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Data Final</label>
                  <input
                    type="date"
                    value={customFutureEndDate}
                    onChange={(e) => setCustomFutureEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg">
              <button
                onClick={() => setBloqueadoExpanded(!bloqueadoExpanded)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-900">Bloqueado</span>
                  <Tooltip content="Valores comprometidos com operações existentes (promessa de cessão ou outros gravames)" />
                  {bloqueadoExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <span className="text-lg font-bold text-red-600">{formatCurrency(totalFutureBlocked)}</span>
              </button>
              {bloqueadoExpanded && (
                <div className="px-4 pb-4 pt-0 space-y-2">
                  <div className="flex items-center justify-between p-3 bg-red-100/50 rounded-lg">
                    <span className="text-sm text-gray-700">Promessa de Cessão</span>
                    <span className="text-sm font-semibold text-red-700">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-100/50 rounded-lg">
                    <span className="text-sm text-gray-700">Outros</span>
                    <span className="text-sm font-semibold text-red-700">{formatCurrency(0)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Disponível</span>
                <Tooltip content="Valores livres para novas operações de crédito" />
              </div>
              <span className="text-lg font-bold text-blue-600">{formatCurrency(totalFutureAvailable)}</span>
            </div>
            <div className="bg-purple-50 rounded-lg">
              <button
                onClick={() => setLiquidadoHojeExpanded(!liquidadoHojeExpanded)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Liquidado Hoje</span>
                  {liquidadoHojeExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <span className="text-lg font-bold text-purple-600">{formatCurrency(0)}</span>
              </button>
              {liquidadoHojeExpanded && (
                <div className="px-4 pb-4 pt-0">
                  <div className="flex items-center justify-between p-3 bg-purple-100/50 rounded-lg">
                    <span className="text-sm text-gray-700">Valor Pré-Contratado</span>
                    <span className="text-sm font-semibold text-purple-700">{formatCurrency(0)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Total a Liquidar</span>
              </div>
              <span className="text-lg font-bold text-green-600">{formatCurrency(totalFutureLiquidate)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">Total de Recebíveis Livres Projetados</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalFutureAvailable)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">% Médio de Recebíveis Livres Projetados</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalFutureLiquidate > 0 ? ((totalFutureAvailable / totalFutureLiquidate) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Evolução Temporal de Recebíveis</h3>
          <p className="text-sm text-gray-600">Movimento diário com scroll lateral</p>
        </div>

        <div className="relative">
          <div
            className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#9ca3af #e5e7eb'
            }}
          >
            <div className="relative" style={{ width: `${radarData.length * 24}px`, minWidth: '100%' }}>
              <div className="relative h-96 border-b-2 border-gray-300">
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                  <defs>
                    <linearGradient id="averageGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  <polyline
                    points={radarData.map((data, index) => {
                      const total = data.blocked + data.available;
                      const availablePercent = (data.available / total) * 100;
                      const barWidth = 24;
                      const x = index * barWidth + barWidth / 2;
                      const _totalWidth = radarData.length * barWidth;
                      const y = (100 - availablePercent) * 3.84;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="url(#averageGradient)"
                    stroke="#10b981"
                    strokeWidth="3"
                  />
                  {radarData.map((data, index) => {
                    const total = data.blocked + data.available;
                    const availablePercent = (data.available / total) * 100;
                    const barWidth = 24;
                    const x = index * barWidth + barWidth / 2;
                    const y = (100 - availablePercent) * 3.84;
                    return (
                      <g key={index}>
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#10b981"
                          className="transition-all"
                        />
                      </g>
                    );
                  })}
                </svg>

                <div className="flex items-end gap-1 h-full">
                  {radarData.map((data, index) => {
                    const total = data.blocked + data.available;
                    const totalHeight = (total / maxValue) * 100;
                    const availablePercent = ((data.available / total) * 100).toFixed(1);

                    return (
                      <div key={index} className="flex flex-col justify-end items-center group relative h-full" style={{ width: '20px', minWidth: '20px' }}>
                        <div className={`w-full flex flex-col-reverse justify-start relative ${data.isPast ? 'opacity-50' : 'opacity-100'}`} style={{ height: `${totalHeight}%`, minHeight: '4px' }}>
                          <div
                            className="w-full rounded-t transition-all duration-200 bg-blue-600 group-hover:brightness-110 cursor-pointer relative"
                            style={{ flexGrow: data.available }}
                          >
                          </div>
                          <div
                            className="w-full transition-all duration-200 bg-red-600 group-hover:brightness-110 cursor-pointer relative"
                            style={{ flexGrow: data.blocked }}
                          >
                          </div>
                        </div>
                        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap pointer-events-none z-20">
                          <div className="font-semibold mb-1">{new Date(data.date).toLocaleDateString('pt-BR')}</div>
                          <div className="text-green-400">Disponível: {availablePercent}%</div>
                          <div>Total: {formatCurrency(total)}</div>
                        </div>
                        {!data.isPast && index > 0 && radarData[index - 1].isPast && (
                          <div className="absolute bottom-0 left-0 w-0.5 h-full bg-gray-900 opacity-40 pointer-events-none" style={{ height: '384px' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-1 pt-3 pb-4">
                {radarData.map((data, index) => {
                  const date = new Date(data.date);
                  const showLabel = index % 7 === 0;
                  return (
                    <div key={index} className="flex justify-center items-start" style={{ width: '20px', minWidth: '20px' }}>
                      {showLabel && (
                        <div className="text-xs text-gray-700 font-medium whitespace-nowrap">
                          {date.getDate()}/{date.getMonth() + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-700">Bloqueado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-700">Disponível</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-700">% Disponível (Média)</span>
            </div>
          </div>
        </div>
      </div>

      <NewContractModal
        isOpen={showNewContractModal}
        onClose={() => setShowNewContractModal(false)}
        clientName={selectedClient?.name || ''}
      />
    </div>
    );
  }

  return (
    <div className="space-y-6">
      <NewOptInModal
        isOpen={showNewOptInModal}
        onClose={() => setShowNewOptInModal(false)}
        onSuccess={() => {
          console.log('Opt-in criado com sucesso');
        }}
      />

      <OptInDetailsModal
        isOpen={showOptInDetailsModal}
        onClose={() => {
          setShowOptInDetailsModal(false);
          setSelectedOptInClient(null);
        }}
        client={selectedOptInClient}
        onSendToRegistry={handleSendToRegistry}
      />

      <NewContractModal
        isOpen={showNewContractModal}
        onClose={() => setShowNewContractModal(false)}
        clientName={selectedClient?.name || ''}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar por Nome</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Digite o nome do cliente..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Limite</label>
            <select
              value={filterLimit}
              onChange={(e) => setFilterLimit(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Limites</option>
              <option value="above500k">Acima de R$ 500 mil</option>
              <option value="above1m">Acima de R$ 1 milhão</option>
              <option value="above5m">Acima de R$ 5 milhões</option>
            </select>
          </div>

          <div className="md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Opt-in</label>
            <select
              value={filterOptIn}
              onChange={(e) => setFilterOptIn(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="active">Ativo</option>
              <option value="pending">Aguardando Assinatura</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNewContractModal(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nova Trava
            </button>
            <button
              onClick={() => setShowNewOptInModal(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Optin
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Limite Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {client.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.segment}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.cnpj}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      client.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : client.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {client.status === 'active' ? 'Ativo' : client.status === 'pending' ? 'Pendente' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(client.totalLimit)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Radar
                      </button>
                      <button
                        onClick={() => {
                          const statusMap: Record<string, any> = {
                            'active': 'signed',
                            'pending': 'pending_registry',
                            'inactive': 'expired'
                          };
                          const optInStatus = statusMap[client.status] || 'expired';
                          setSelectedOptInClient({
                            id: client.id,
                            client_name: client.name,
                            client_document: client.cnpj,
                            client_email: 'contato@empresa.com.br',
                            client_phone: '(11) 99999-9999',
                            client_address: 'Av. Paulista, 1000 - São Paulo, SP',
                            status: optInStatus,
                            created_at: '2024-01-15T10:00:00Z',
                            expiry_date: '2025-01-15T10:00:00Z',
                            signature_token: 'abc123token',
                            signed_at: optInStatus === 'signed' || optInStatus === 'pending_registry' ? '2024-01-16T14:30:00Z' : undefined
                          });
                          setShowOptInDetailsModal(true);
                        }}
                        className={`inline-flex items-center px-3 py-1.5 border-0 text-xs font-medium rounded-lg text-white transition-colors ${
                          client.status === 'active'
                            ? 'bg-green-600 hover:bg-green-700'
                            : client.status === 'pending'
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        OPT-IN
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
