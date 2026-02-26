import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ContractMonitoringCard } from './ContractMonitoringCard';
import { mockContractMonitoring } from '../data/mockData';
import { buildContractMonitoringFromContaCorrente } from '../data/contractMonitoringBuilder';
import { useData } from '../context/DataContext';
import { Contract, ContractMonitoring } from '../types';
import {
  Target,
  Filter,
  Eye,
  Search,
  X,
  ArrowUpDown
} from 'lucide-react';

type SortOption = 'faltam' | 'criticality' | 'progress' | 'daysLeft' | 'value' | 'trend';

interface DailyMonitoringDashboardProps {
  onContractClick: (contract: Contract) => void;
}

export const DailyMonitoringDashboard: React.FC<DailyMonitoringDashboardProps> = ({ onContractClick }) => {
  const { contracts, contaCorrenteEntries, useCsv } = useData();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const contractMonitoring = useMemo(() => {
    if (useCsv && contaCorrenteEntries.length > 0 && contracts.length > 0) {
      return buildContractMonitoringFromContaCorrente(contaCorrenteEntries, contracts);
    }
    return mockContractMonitoring;
  }, [useCsv, contaCorrenteEntries, contracts]);
  const [clientSearchTerm, setClientSearchTerm] = useState<string>('');
  const [showClientDropdown, setShowClientDropdown] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('faltam');
  const clientInputRef = useRef<HTMLInputElement>(null);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  const handleContractClick = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      onContractClick(contract);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        clientDropdownRef.current &&
        !clientDropdownRef.current.contains(event.target as Node) &&
        clientInputRef.current &&
        !clientInputRef.current.contains(event.target as Node)
      ) {
        setShowClientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const uniqueClients = Array.from(new Set(contractMonitoring.map(c => c.clientName))).sort();

  const filteredClientOptions = uniqueClients.filter(client =>
    client.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const calculateCriticality = (contract: ContractMonitoring) => {
    const statusWeight = {
      'no_generation': 3,
      'insufficient': 2,
      'functional': 1
    };
    const pct = contract.liquidatedPercentage ?? contract.capturedPercentage;
    const progressPenalty = pct < 50 ? 2 : pct < 80 ? 1 : 0;
    return (statusWeight[contract.status as keyof typeof statusWeight] || 0) * 10 + progressPenalty;
  };

  const filteredContracts = contractMonitoring.filter(contract => {
    const statusMatch = selectedStatusFilter === 'all' || contract.status === selectedStatusFilter;
    const clientMatch = !clientSearchTerm || contract.clientName.toLowerCase().includes(clientSearchTerm.toLowerCase());
    return statusMatch && clientMatch;
  });

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    switch (sortBy) {
      case 'faltam':
        return (b.valorProblema ?? 0) - (a.valorProblema ?? 0);
      case 'criticality':
        return calculateCriticality(b) - calculateCriticality(a);
      case 'progress':
        return (a.liquidatedPercentage ?? a.capturedPercentage) - (b.liquidatedPercentage ?? b.capturedPercentage);
      case 'daysLeft':
        return a.daysRemaining - b.daysRemaining;
      case 'value':
        return b.targetValue - a.targetValue;
      case 'trend':
        return (a.dailyTrend[a.dailyTrend.length - 1]?.capturedValue || 0) - (b.dailyTrend[b.dailyTrend.length - 1]?.capturedValue || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Eye className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Contratos em Monitoramento</h2>
                <p className="text-sm text-gray-600">Acompanhe o progresso de captura de cada contrato</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="faltam">O que falta (maior → menor)</option>
                <option value="criticality">Mais Críticos</option>
                <option value="progress">Menor Progresso</option>
                <option value="daysLeft">Prazo Mais Curto</option>
                <option value="value">Maior Valor</option>
                <option value="trend">Pior Tendência</option>
              </select>
              <Filter className="w-4 h-4 text-gray-600" />
              <div className="relative w-full sm:w-auto">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    ref={clientInputRef}
                    type="text"
                    placeholder="Buscar cliente..."
                    value={clientSearchTerm}
                    onChange={(e) => {
                      setClientSearchTerm(e.target.value);
                      setShowClientDropdown(true);
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    className="pl-9 pr-8 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-64"
                  />
                  {clientSearchTerm && (
                    <button
                      onClick={() => {
                        setClientSearchTerm('');
                        setShowClientDropdown(false);
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {showClientDropdown && filteredClientOptions.length > 0 && (
                  <div
                    ref={clientDropdownRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {filteredClientOptions.map((client) => (
                      <button
                        key={client}
                        onClick={() => {
                          setClientSearchTerm(client);
                          setShowClientDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm transition-colors"
                      >
                        {client}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="functional">OK</option>
                <option value="insufficient">Com falha</option>
                <option value="no_generation">Falha crítica (&gt;10%)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {sortedContracts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedContracts.map((contract) => (
                <ContractMonitoringCard
                  key={contract.id}
                  monitoring={contract}
                  onContractClick={handleContractClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum contrato encontrado neste filtro</p>
              <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
