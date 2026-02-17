import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Contract, Client, ContractChangeRequest, SettlementAccount } from '../types';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, FileText, Clock, RefreshCw, Search, X, Users, Check, Zap, CreditCard, CalendarRange, RotateCcw, CheckCheck, ArrowRight } from 'lucide-react';

interface ContractApprovalBoardProps {
  contracts: Contract[];
  clients: Client[];
  onApprove: (contractId: string) => void;
  onApproveBatch: (contractIds: string[]) => void;
  onReject: (contractId: string) => void;
  changeRequests?: ContractChangeRequest[];
  onApproveChangeRequest?: (requestId: string) => void;
  onRejectChangeRequest?: (requestId: string) => void;
}

const productTypeLabels: Record<Contract['productType'], string> = {
  'guarantee': 'Garantia',
  'extra-limit': 'Crédito Pontual',
  'debt-settlement': 'Quitação',
  'anticipation': 'Antecipação',
};

const productTypeColors: Record<Contract['productType'], string> = {
  'guarantee': 'bg-blue-100 text-blue-800',
  'extra-limit': 'bg-purple-100 text-purple-800',
  'debt-settlement': 'bg-orange-100 text-orange-800',
  'anticipation': 'bg-teal-100 text-teal-800',
};

const operationModeLabels: Record<Contract['operationMode'], string> = {
  'credit': 'Crédito',
  'debit': 'Débito',
  'both': 'Crédito e Débito',
};

const operationModeColors: Record<Contract['operationMode'], string> = {
  'credit': 'bg-green-100 text-green-800',
  'debit': 'bg-rose-100 text-rose-800',
  'both': 'bg-cyan-100 text-cyan-800',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR').format(date);

const formatAccountLabel = (acc: SettlementAccount | null | undefined): string => {
  if (!acc) return '(nenhuma)';
  return `${acc.bank} — Ag ${acc.agency} / CC ${acc.accountNumber}`;
};

const renderFieldValue = (field: string, value: any) => {
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((v: string) => (
          <span key={v} className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">
            {v}
          </span>
        ))}
      </div>
    );
  }
  if (field === 'operationMode') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${operationModeColors[value as Contract['operationMode']] || 'bg-gray-100 text-gray-700'}`}>
        {operationModeLabels[value as Contract['operationMode']] || value}
      </span>
    );
  }
  if (field === 'settlementAccount') {
    return <span className="text-sm text-gray-700">{formatAccountLabel(value)}</span>;
  }
  return <span className="text-sm text-gray-700">{String(value)}</span>;
};

export const ContractApprovalBoard: React.FC<ContractApprovalBoardProps> = ({
  contracts,
  clients,
  onApprove,
  onApproveBatch,
  onReject,
  changeRequests = [],
  onApproveChangeRequest,
  onRejectChangeRequest,
}) => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'changes'>('contracts');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());
  const [selectedContractIds, setSelectedContractIds] = useState<Set<string>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [expandedChangeId, setExpandedChangeId] = useState<string | null>(null);
  const [rejectingChangeId, setRejectingChangeId] = useState<string | null>(null);
  const [changeRejectReason, setChangeRejectReason] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setClientSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Cliente não encontrado';
  };

  const relevantClients = useMemo(() => {
    const clientIds = new Set(contracts.map(c => c.clientId));
    return clients.filter(c => clientIds.has(c.id));
  }, [contracts, clients]);

  const visibleDropdownClients = useMemo(() => {
    if (!clientSearch) return relevantClients;
    return relevantClients.filter(c =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase())
    );
  }, [relevantClients, clientSearch]);

  const toggleClient = (clientId: string) => {
    setSelectedClientIds(prev => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  };

  const clearClientFilter = () => {
    setSelectedClientIds(new Set());
    setClientSearch('');
  };

  const filteredContracts = useMemo(() => {
    if (selectedClientIds.size === 0) return contracts;
    return contracts.filter(c => selectedClientIds.has(c.clientId));
  }, [contracts, selectedClientIds]);

  const toggleContractSelection = (contractId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedContractIds(prev => {
      const next = new Set(prev);
      if (next.has(contractId)) {
        next.delete(contractId);
      } else {
        next.add(contractId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedContractIds.size === filteredContracts.length) {
      setSelectedContractIds(new Set());
    } else {
      setSelectedContractIds(new Set(filteredContracts.map(c => c.id)));
    }
  };

  const handleApproveBatch = () => {
    const ids = Array.from(selectedContractIds);
    onApproveBatch(ids);
    setSelectedContractIds(new Set());
    setExpandedId(null);
  };

  const allSelected = filteredContracts.length > 0 && selectedContractIds.size === filteredContracts.length;

  const toggle = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setRejectingId(null);
      setRejectReason('');
    } else {
      setExpandedId(id);
      setRejectingId(null);
      setRejectReason('');
    }
  };

  const handleApprove = (contractId: string) => {
    onApprove(contractId);
    setExpandedId(null);
  };

  const handleStartReject = (contractId: string) => {
    setRejectingId(contractId);
    setRejectReason('');
  };

  const handleConfirmReject = (contractId: string) => {
    onReject(contractId);
    setRejectingId(null);
    setRejectReason('');
    setExpandedId(null);
  };

  // --- Change request tab helpers ---
  const toggleChangeExpand = (id: string) => {
    if (expandedChangeId === id) {
      setExpandedChangeId(null);
      setRejectingChangeId(null);
      setChangeRejectReason('');
    } else {
      setExpandedChangeId(id);
      setRejectingChangeId(null);
      setChangeRejectReason('');
    }
  };

  const handleApproveChange = (requestId: string) => {
    onApproveChangeRequest?.(requestId);
    setExpandedChangeId(null);
  };

  const handleStartRejectChange = (requestId: string) => {
    setRejectingChangeId(requestId);
    setChangeRejectReason('');
  };

  const handleConfirmRejectChange = (requestId: string) => {
    onRejectChangeRequest?.(requestId);
    setRejectingChangeId(null);
    setChangeRejectReason('');
    setExpandedChangeId(null);
  };

  const renderNewContractsTab = () => {
    if (contracts.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum contrato pendente</h3>
          <p className="text-sm text-gray-500">Todos os contratos foram analisados.</p>
        </div>
      );
    }

    return (
      <>
        {/* Client filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm min-w-0 sm:min-w-[220px] justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {selectedClientIds.size === 0
                        ? 'Filtrar por cliente'
                        : `${selectedClientIds.size} cliente${selectedClientIds.size > 1 ? 's' : ''} selecionado${selectedClientIds.size > 1 ? 's' : ''}`
                      }
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full sm:w-72 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar cliente..."
                          value={clientSearch}
                          onChange={e => setClientSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                      {visibleDropdownClients.length === 0 ? (
                        <div className="px-3 py-4 text-center text-sm text-gray-500">Nenhum cliente encontrado</div>
                      ) : (
                        visibleDropdownClients.map(client => {
                          const isSelected = selectedClientIds.has(client.id);
                          return (
                            <button
                              key={client.id}
                              onClick={() => toggleClient(client.id)}
                              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm"
                            >
                              <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                                isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className="text-gray-800 truncate">{client.name}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                    {selectedClientIds.size > 0 && (
                      <div className="border-t border-gray-100 p-2">
                        <button
                          onClick={clearClientFilter}
                          className="w-full text-center text-xs text-gray-500 hover:text-gray-700 py-1 transition-colors"
                        >
                          Limpar seleção
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedClientIds.size > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(selectedClientIds).map(id => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium"
                    >
                      {getClientName(id)}
                      <button
                        onClick={() => toggleClient(id)}
                        className="hover:text-blue-900 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm text-gray-500">
                {filteredContracts.length} de {contracts.length} contratos
              </span>
            </div>
          </div>
        </div>

        {/* Batch actions bar */}
        {filteredContracts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                  allSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}>
                  {allSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                Selecionar todos
              </button>
              {selectedContractIds.size > 0 && (
                <span className="text-sm text-blue-600 font-medium">
                  {selectedContractIds.size} selecionado{selectedContractIds.size > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button
              onClick={handleApproveBatch}
              disabled={selectedContractIds.size === 0}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedContractIds.size > 0
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCheck className="w-4 h-4" />
              {selectedContractIds.size === 0
                ? 'Aprovar em lote'
                : selectedContractIds.size === filteredContracts.length
                  ? 'Aprovar todos'
                  : `Aprovar ${selectedContractIds.size} contrato${selectedContractIds.size > 1 ? 's' : ''}`
              }
            </button>
          </div>
        )}

        {/* Cards */}
        {filteredContracts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum contrato encontrado</h3>
            <p className="text-sm text-gray-500">Tente ajustar o filtro de cliente.</p>
          </div>
        ) : filteredContracts.map(contract => {
          const isExpanded = expandedId === contract.id;
          const isRejecting = rejectingId === contract.id;

          return (
            <div
              key={contract.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
            >
              <button
                onClick={() => toggle(contract.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    onClick={(e) => toggleContractSelection(contract.id, e)}
                    className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                      selectedContractIds.has(contract.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {selectedContractIds.has(contract.id) && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{contract.contractNumber}</span>
                      <span className="text-sm text-gray-500">—</span>
                      <span className="text-sm text-gray-700 truncate">{getClientName(contract.clientId)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${productTypeColors[contract.productType]}`}>
                        {productTypeLabels[contract.productType]}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(contract.requestedValue)}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(contract.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  {isExpanded
                    ? <ChevronUp className="w-5 h-5 text-gray-400" />
                    : <ChevronDown className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 px-6 py-5 bg-gray-50 space-y-5">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Condições do Contrato</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs text-gray-500">Tipo de Produto</span>
                        <div className="mt-0.5">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${productTypeColors[contract.productType]}`}>
                            {productTypeLabels[contract.productType]}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Revolvência</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <RefreshCw className={`w-3.5 h-3.5 ${contract.hasRevolvency ? 'text-green-600' : 'text-gray-400'}`} />
                          <span className="text-sm font-medium text-gray-900">{contract.hasRevolvency ? 'Sim' : 'Não'}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Valor Solicitado</span>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatCurrency(contract.requestedValue)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Data de Criação</span>
                        <p className="text-sm text-gray-900 mt-0.5">{formatDate(contract.createdAt)}</p>
                      </div>
                      {contract.expiryDate && (
                        <div>
                          <span className="text-xs text-gray-500">Data de Expiração</span>
                          <p className="text-sm text-gray-900 mt-0.5">{formatDate(contract.expiryDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Visão Avançada</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs text-gray-500">Início do Contrato</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <CalendarRange className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-900">{contract.startDate ? formatDate(contract.startDate) : '—'}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Fim do Contrato</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <CalendarRange className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-900">{contract.endDate ? formatDate(contract.endDate) : '—'}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Modalidade</span>
                        <div className="mt-0.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${operationModeColors[contract.operationMode]}`}>
                            <CreditCard className="w-3 h-3" />
                            {operationModeLabels[contract.operationMode]}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Automação de Captura</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Zap className={`w-3.5 h-3.5 ${contract.hasAutomaticCapture ? 'text-yellow-500' : 'text-gray-400'}`} />
                          <span className="text-sm font-medium text-gray-900">{contract.hasAutomaticCapture ? 'Ativa' : 'Inativa'}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Trigger de Recaptura</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <RotateCcw className={`w-3.5 h-3.5 ${contract.hasRecaptureTrigger ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className="text-sm font-medium text-gray-900">{contract.hasRecaptureTrigger ? 'Ativo' : 'Inativo'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Parâmetros de Captura</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500">Credenciadoras</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {contract.acquirers.map(acq => (
                            <span key={acq} className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {acq}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Bandeiras</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {contract.cardBrands.map(brand => (
                            <span key={brand} className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              {brand}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    {!isRejecting ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleApprove(contract.id)}
                          className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleStartReject(contract.id)}
                          className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          Reprovar
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Motivo da reprovação <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Informe o motivo da reprovação..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
                          autoFocus
                        />
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleConfirmReject(contract.id)}
                            disabled={rejectReason.trim().length === 0}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-colors text-sm font-medium ${
                              rejectReason.trim().length > 0
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <XCircle className="w-4 h-4" />
                            Confirmar Reprovação
                          </button>
                          <button
                            onClick={() => { setRejectingId(null); setRejectReason(''); }}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };

  const renderChangesTab = () => {
    if (changeRequests.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma alteração pendente</h3>
          <p className="text-sm text-gray-500">Todas as solicitações de alteração foram analisadas.</p>
        </div>
      );
    }

    return (
      <>
        {changeRequests.map(request => {
          const isExpanded = expandedChangeId === request.id;
          const isRejecting = rejectingChangeId === request.id;

          return (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
            >
              <button
                onClick={() => toggleChangeExpand(request.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{request.contractNumber}</span>
                      <span className="text-sm text-gray-500">—</span>
                      <span className="text-sm text-gray-700 truncate">{getClientName(request.clientId)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                        {request.changes.length} campo{request.changes.length > 1 ? 's' : ''} alterado{request.changes.length > 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(request.createdAt)}
                      </span>
                      <span className="text-xs text-gray-500">
                        por {request.requestedBy}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  {isExpanded
                    ? <ChevronUp className="w-5 h-5 text-gray-400" />
                    : <ChevronDown className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 px-6 py-5 bg-gray-50 space-y-5">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Comparação de Alterações</h4>
                    <div className="space-y-4">
                      {request.changes.map((change, idx) => (
                        <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
                          <p className="text-sm font-semibold text-gray-900 mb-3">{change.label}</p>
                          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-start">
                            <div>
                              <span className="text-xs font-medium text-red-600 uppercase tracking-wider mb-1.5 block">Antes</span>
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                {renderFieldValue(change.field, change.oldValue)}
                              </div>
                            </div>
                            <div className="hidden md:flex items-center justify-center pt-6">
                              <ArrowRight className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <span className="text-xs font-medium text-green-600 uppercase tracking-wider mb-1.5 block">Depois</span>
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                {renderFieldValue(change.field, change.newValue)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    {!isRejecting ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleApproveChange(request.id)}
                          className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aprovar Alteração
                        </button>
                        <button
                          onClick={() => handleStartRejectChange(request.id)}
                          className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          Reprovar
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Motivo da reprovação <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={changeRejectReason}
                          onChange={e => setChangeRejectReason(e.target.value)}
                          placeholder="Informe o motivo da reprovação..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
                          autoFocus
                        />
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleConfirmRejectChange(request.id)}
                            disabled={changeRejectReason.trim().length === 0}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-colors text-sm font-medium ${
                              changeRejectReason.trim().length > 0
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <XCircle className="w-4 h-4" />
                            Confirmar Reprovação
                          </button>
                          <button
                            onClick={() => { setRejectingChangeId(null); setChangeRejectReason(''); }}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex gap-1">
        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'contracts'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Novos Contratos
          {contracts.length > 0 && (
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full ${
              activeTab === 'contracts' ? 'bg-yellow-400 text-yellow-900' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {contracts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('changes')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'changes'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Alterações de Contratos
          {changeRequests.length > 0 && (
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full ${
              activeTab === 'changes' ? 'bg-orange-400 text-orange-900' : 'bg-orange-100 text-orange-800'
            }`}>
              {changeRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'contracts' ? renderNewContractsTab() : renderChangesTab()}
    </div>
  );
};
