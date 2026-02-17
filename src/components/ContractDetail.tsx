import React, { useState, useMemo } from 'react';
import { Contract, Receivable, ContractChangeRequest } from '../types';
import { ContractMetricCard } from './ContractMetricCard';
import { ExecuteURsModal } from './ExecuteURsModal';
import { showToast } from '../hooks/useToast';
import { ReceivablesFlowChart } from './ReceivablesFlowChart';
import { mockReceivables } from '../data/mockData';
import { ContractEditModal } from './ContractEditModal';
import {
  ArrowLeft,
  CheckCircle,
  Calendar,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronRight,
  X,
  Edit3
} from 'lucide-react';

interface ContractDetailProps {
  contract: Contract;
  onBack: () => void;
  onUpdateContract?: (updatedContract: Contract) => void;
  onCreateChangeRequest?: (contractId: string, changes: ContractChangeRequest['changes']) => void;
}

interface DailyReceivables {
  date: Date;
  receivables: Receivable[];
  totalValue: number;
  totalEncumbered: number;
  count: number;
}

export const ContractDetail: React.FC<ContractDetailProps> = ({ contract, onBack, onUpdateContract, onCreateChangeRequest }) => {
  const [showExecuteURsModal, setShowExecuteURsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [localContract, setLocalContract] = useState(contract);

  // Analítico de URs state (inline)
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [operationTypeFilter, setOperationTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [contestedIds, setContestedIds] = useState<Set<string>>(new Set());
  const [contestingReceivable, setContestingReceivable] = useState<Receivable | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [valueMismatchFilter, setValueMismatchFilter] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);

  const handleApproveContract = () => {
    setLocalContract({ ...localContract, status: 'active' });
    showToast('success', 'Contrato aprovado com sucesso!');
  };

  const handleSaveContract = (updatedContract: Contract) => {
    if (onCreateChangeRequest) {
      const changes: ContractChangeRequest['changes'] = [];

      const arraysEqual = (a: string[], b: string[]) =>
        a.length === b.length && [...a].sort().every((v, i) => v === [...b].sort()[i]);

      if (!arraysEqual(localContract.acquirers, updatedContract.acquirers)) {
        changes.push({ field: 'acquirers', label: 'Credenciadoras', oldValue: localContract.acquirers, newValue: updatedContract.acquirers });
      }
      if (!arraysEqual(localContract.cardBrands, updatedContract.cardBrands)) {
        changes.push({ field: 'cardBrands', label: 'Bandeiras de Cartão', oldValue: localContract.cardBrands, newValue: updatedContract.cardBrands });
      }
      if (localContract.operationMode !== updatedContract.operationMode) {
        changes.push({ field: 'operationMode', label: 'Função', oldValue: localContract.operationMode, newValue: updatedContract.operationMode });
      }
      const oldAcc = JSON.stringify(localContract.settlementAccount || null);
      const newAcc = JSON.stringify(updatedContract.settlementAccount || null);
      if (oldAcc !== newAcc) {
        changes.push({ field: 'settlementAccount', label: 'Conta de Liquidação', oldValue: localContract.settlementAccount, newValue: updatedContract.settlementAccount });
      }

      if (changes.length > 0) {
        onCreateChangeRequest(localContract.id, changes);
      }
      setShowEditModal(false);
      return;
    }

    // fallback: direct update (legacy)
    setLocalContract(updatedContract);
    if (onUpdateContract) {
      onUpdateContract(updatedContract);
    }
    setShowEditModal(false);
    showToast('success', 'Contrato atualizado com sucesso!');
  };

  const formatCurrencyCompact = (value: number) => {
    if (value >= 1000000000) {
      return `R$ ${(value / 1000000000).toFixed(2).replace('.', ',')}Bi`;
    } else if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(2).replace('.', ',')}Mi`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(2).replace('.', ',')}k`;
    } else {
      return formatCurrency(value);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getFullCurrencyValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const contractReceivables = useMemo(() => {
    return mockReceivables.filter(r => r.contractId === localContract.id);
  }, [localContract.id]);

  const generateFlowData = () => {
    const days = 365;
    const startDate = new Date(localContract.createdAt);
    const data = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const progress = (i + 1) / days;
      const requestedValue = localContract.requestedValue * progress;
      const achievedValue = localContract.encumberedValue * progress;

      data.push({
        date,
        requestedValue,
        achievedValue,
      });
    }

    return data;
  };

  const flowData = generateFlowData();

  // Analítico de URs logic
  const filteredReceivables = useMemo(() => {
    return contractReceivables.filter(r => {
      if (operationTypeFilter !== 'all' && r.operationType !== operationTypeFilter) return false;
      if (valueMismatchFilter && r.encumberedValue >= r.originalValue) return false;
      return true;
    });
  }, [contractReceivables, operationTypeFilter, valueMismatchFilter]);

  const totalValue = filteredReceivables.reduce((sum, r) => sum + r.originalValue, 0);
  const totalEncumberedValue = filteredReceivables.reduce((sum, r) => sum + r.encumberedValue, 0);

  const dailyReceivables = useMemo((): DailyReceivables[] => {
    const groupedMap = new Map<string, DailyReceivables>();

    filteredReceivables.forEach(receivable => {
      const dateKey = receivable.settlementDate.toISOString().split('T')[0];

      if (!groupedMap.has(dateKey)) {
        groupedMap.set(dateKey, {
          date: receivable.settlementDate,
          receivables: [],
          totalValue: 0,
          totalEncumbered: 0,
          count: 0
        });
      }

      const group = groupedMap.get(dateKey)!;
      group.receivables.push(receivable);
      group.totalValue += receivable.originalValue;
      group.totalEncumbered += receivable.encumberedValue;
      group.count += 1;
    });

    return Array.from(groupedMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredReceivables]);

  const toggleDateExpansion = (dateKey: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey);
    } else {
      newExpanded.add(dateKey);
    }
    setExpandedDates(newExpanded);
  };

  const getSettlementAccount = (receivableId: string) => {
    const accounts = [
      { bank: 'Banco do Brasil', code: '001', agency: '1234-5', account: '12345678-9', holder: 'ABC Comércio S.A.' },
      { bank: 'Itaú Unibanco', code: '341', agency: '5678-0', account: '98765432-1', holder: 'XYZ Ltda.' },
      { bank: 'Bradesco', code: '237', agency: '3456-7', account: '45678901-2', holder: 'Loja Exemplo ME' },
      { bank: 'Santander', code: '033', agency: '7890-1', account: '23456789-0', holder: 'Comercial Silva S.A.' },
      { bank: 'Caixa Econômica Federal', code: '104', agency: '2345-6', account: '56789012-3', holder: 'Empresa ABC Ltda.' },
    ];
    const hash = receivableId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return accounts[hash % accounts.length];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center space-x-3">
          {localContract.status === 'active' && (
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center justify-center space-x-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-8 text-sm font-medium"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Editar</span>
            </button>
          )}
          {localContract.status === 'pending_approval' && (
            <button
              onClick={handleApproveContract}
              className="flex items-center justify-center space-x-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors h-8 text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Aprovar Contrato</span>
            </button>
          )}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            localContract.status === 'active'
              ? 'bg-green-100 text-green-800'
              : localContract.status === 'pending_approval'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {localContract.status === 'active' ? 'Ativo' : localContract.status === 'pending_approval' ? 'Pendente de Aprovação' : 'Encerrado'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ContractMetricCard
          title="Valor Solicitado"
          value={formatCurrencyCompact(localContract.requestedValue)}
          tooltip={getFullCurrencyValue(localContract.requestedValue)}
          color="text-blue-600"
        />
        <ContractMetricCard
          title="Valor Alcançado"
          value={formatCurrencyCompact(localContract.encumberedValue)}
          tooltip={getFullCurrencyValue(localContract.encumberedValue)}
          customSubtitle={
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    ((localContract.encumberedValue / localContract.requestedValue) * 100) === 100 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${((localContract.encumberedValue / localContract.requestedValue) * 100)}%` }}
                ></div>
              </div>
              <div className="mt-2">{((localContract.encumberedValue / localContract.requestedValue) * 100).toFixed(1)}% do solicitado</div>
            </div>
          }
          color="text-green-600"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Informações do Contrato</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Número do Contrato</p>
              <p className="font-medium text-gray-900">{localContract.contractNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Data de Criação</p>
              <p className="font-medium text-gray-900">{formatDate(localContract.createdAt)}</p>
            </div>
          </div>
          {localContract.closedAt && (
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Data de Encerramento</p>
                <p className="font-medium text-gray-900">{formatDate(localContract.closedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ReceivablesFlowChart data={flowData} />

      {/* Analítico de URs - Inline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Analítico de URs</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600">Total de URs</p>
              <p className="text-2xl font-bold text-gray-900">{filteredReceivables.length}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600">Valor Esperado</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600">Valor Bloqueado</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalEncumberedValue)}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-gray-200 bg-white flex items-center space-x-5">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-600">Tipo:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setOperationTypeFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  operationTypeFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setOperationTypeFilter('credit')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  operationTypeFilter === 'credit'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Crédito
              </button>
              <button
                onClick={() => setOperationTypeFilter('debit')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  operationTypeFilter === 'debit'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Débito
              </button>
            </div>
          </div>
          <div className="h-5 w-px bg-gray-300"></div>
          <button
            onClick={() => setValueMismatchFilter(!valueMismatchFilter)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              valueMismatchFilter
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Valor a liquidar menor que esperado
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Liquidação
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade URs
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Esperado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor a Liquidar
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contestação
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {dailyReceivables.map((daily) => {
                const dateKey = daily.date.toISOString().split('T')[0];
                const isExpanded = expandedDates.has(dateKey);

                return (
                  <React.Fragment key={dateKey}>
                    <tr
                      className="hover:bg-gray-50 transition-colors border-b border-gray-200 cursor-pointer"
                      onClick={() => toggleDateExpansion(dateKey)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                          <span>{formatDateShort(daily.date)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {daily.count} URs
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(daily.totalValue)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(daily.totalEncumbered)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                          const creditCount = daily.receivables.filter(r => r.operationType === 'credit').length;
                          const debitCount = daily.receivables.filter(r => r.operationType === 'debit').length;
                          return (
                            <div className="flex items-center space-x-2">
                              {creditCount > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  {creditCount} Crédito
                                </span>
                              )}
                              {debitCount > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                  {debitCount} Débito
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                          const contestedCount = daily.receivables.filter(r => contestedIds.has(r.id)).length;
                          return (
                            <span className="text-xs text-gray-400">
                              {contestedCount}/{daily.receivables.length} contestadas
                            </span>
                          );
                        })()}
                      </td>
                    </tr>

                    {isExpanded && daily.receivables.map((receivable) => (
                      <tr key={receivable.id} className="bg-gray-50 border-b border-gray-100">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 pl-12">
                          <div className="text-xs text-gray-500">{receivable.acquirer} - {receivable.cardBrand}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {receivable.settledAt ? (
                            <span className="text-green-600 font-medium text-xs">
                              Liquidado em {formatDateShort(receivable.settledAt)}
                            </span>
                          ) : (
                            <span className="text-yellow-600 font-medium text-xs">Pendente</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {formatCurrency(receivable.originalValue)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(receivable.encumberedValue)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {receivable.operationType === 'credit' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              Crédito
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              Débito
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {contestedIds.has(receivable.id) ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Contestado
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setContestingReceivable(receivable);
                                setSelectedReason('');
                              }}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            >
                              Contestar
                            </button>
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
      </div>

      {/* Modal de Contestação */}
      {contestingReceivable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Contestar UR</h3>
              <button
                onClick={() => setContestingReceivable(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">UR (NSU)</p>
                <p className="font-medium text-gray-900">{contestingReceivable.nsu}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valor Esperado</p>
                  <p className="font-medium text-gray-900">{formatCurrency(contestingReceivable.originalValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valor a Liquidar</p>
                  <p className="font-medium text-green-600">{formatCurrency(contestingReceivable.encumberedValue)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Motivo da contestação</p>
                <div className="space-y-2">
                  {[
                    { value: 'valor_a_menor', label: 'Valor a menor' },
                    { value: 'maiores_informacoes', label: 'Maiores informações' },
                    { value: 'outros', label: 'Outros' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedReason === option.value
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="contestReason"
                        value={option.value}
                        checked={selectedReason === option.value}
                        onChange={() => setSelectedReason(option.value)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setContestingReceivable(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (selectedReason) {
                    setContestedIds(prev => new Set(prev).add(contestingReceivable.id));
                    setContestingReceivable(null);
                  }
                }}
                disabled={!selectedReason}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Confirmar Contestação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Conta de Liquidação */}
      {selectedReceivable && (() => {
        const account = getSettlementAccount(selectedReceivable.id);
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Conta de Liquidação</h3>
                <button
                  onClick={() => setSelectedReceivable(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">UR (NSU)</p>
                  <p className="font-medium text-gray-900">{selectedReceivable.nsu}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Banco</p>
                  <p className="font-medium text-gray-900">{account.bank}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Código do Banco</p>
                  <p className="font-medium text-gray-900 font-mono">{account.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Agência</p>
                  <p className="font-medium text-gray-900 font-mono">{account.agency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Conta Corrente</p>
                  <p className="font-medium text-gray-900 font-mono">{account.account}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tipo de Conta</p>
                  <p className="font-medium text-gray-900">Conta Corrente</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Titular da Conta</p>
                  <p className="font-medium text-gray-900">{account.holder}</p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700">Conta Verificada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <ExecuteURsModal
        isOpen={showExecuteURsModal}
        onClose={() => setShowExecuteURsModal(false)}
        contract={localContract}
      />

      <ContractEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        contract={localContract}
        onSave={handleSaveContract}
      />
    </div>
  );
};
