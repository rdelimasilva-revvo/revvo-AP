import React, { useState, useMemo } from 'react';
import { X, TrendingUp, CheckCircle, ChevronDown, ChevronUp, Search, Upload, ArrowRight, Users } from 'lucide-react';
import { ImportClientsModal } from './ImportClientsModal';
import { NewClientModal } from './NewClientModal';
import { Client } from '../types';

interface AntecipationJourneyProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'client-selection' | 'selection' | 'simulation' | 'confirmation';

interface AntecipationClient {
  id: string;
  name: string;
  document: string;
  totalReceivables: number;
  availableAmount: number;
}

interface ReceivableItem {
  id: string;
  clientId: string;
  client: string;
  document: string;
  amount: number;
  dueDate: string;
  acquirer: string;
  selected: boolean;
}

interface BatchGroup {
  dueDate: string;
  daysUntilDue: number;
  receivables: ReceivableItem[];
  totalAmount: number;
  discountRate: number;
  discountAmount: number;
  netAmount: number;
}

interface DiscountRate {
  id?: string;
  daysFrom: number;
  daysTo: number;
  rate: number;
}


const mockReceivables: ReceivableItem[] = [
  { id: '1', clientId: 'c1', client: 'ABC Comércio Ltda', document: '12.345.678/0001-90', amount: 50000, dueDate: '2026-03-05', acquirer: 'Cielo', selected: false },
  { id: '2', clientId: 'c1', client: 'ABC Comércio Ltda', document: '12.345.678/0001-90', amount: 30000, dueDate: '2026-03-05', acquirer: 'Rede', selected: false },
  { id: '3', clientId: 'c3', client: 'Tech Solutions Brasil', document: '98.765.432/0001-10', amount: 75000, dueDate: '2026-04-04', acquirer: 'Stone', selected: false },
  { id: '4', clientId: 'c4', client: 'Varejo Prime Ltda', document: '22.333.444/0001-55', amount: 45000, dueDate: '2026-04-04', acquirer: 'GetNet', selected: false },
  { id: '5', clientId: 'c5', client: 'Mega Store S.A.', document: '33.444.555/0001-66', amount: 120000, dueDate: '2026-05-04', acquirer: 'Cielo', selected: false },
  { id: '6', clientId: 'c6', client: 'Distribuidora Central', document: '44.555.666/0001-77', amount: 60000, dueDate: '2026-05-04', acquirer: 'Rede', selected: false },
  { id: '7', clientId: 'c1', client: 'ABC Comércio Ltda', document: '12.345.678/0001-90', amount: 85000, dueDate: '2026-06-03', acquirer: 'Stone', selected: false },
  { id: '8', clientId: 'c3', client: 'Tech Solutions Brasil', document: '98.765.432/0001-10', amount: 95000, dueDate: '2026-06-03', acquirer: 'GetNet', selected: false },
  { id: '9', clientId: 'c5', client: 'Mega Store S.A.', document: '33.444.555/0001-66', amount: 150000, dueDate: '2026-08-02', acquirer: 'Cielo', selected: false },
  { id: '10', clientId: 'c2', client: 'XYZ Varejo', document: '11.222.333/0001-44', amount: 110000, dueDate: '2026-08-02', acquirer: 'Rede', selected: false },
  { id: '11', clientId: 'c5', client: 'Mega Store S.A.', document: '33.444.555/0001-66', amount: 200000, dueDate: '2026-10-31', acquirer: 'Stone', selected: false },
  { id: '12', clientId: 'c6', client: 'Distribuidora Central', document: '44.555.666/0001-77', amount: 130000, dueDate: '2026-10-31', acquirer: 'GetNet', selected: false },
  { id: '13', clientId: 'c1', client: 'ABC Comércio Ltda', document: '12.345.678/0001-90', amount: 250000, dueDate: '2027-01-29', acquirer: 'Cielo', selected: false },
  { id: '14', clientId: 'c2', client: 'XYZ Varejo', document: '11.222.333/0001-44', amount: 180000, dueDate: '2027-01-29', acquirer: 'Rede', selected: false },
];

const calculateDaysUntilDue = (dueDate: string, today: Date): number => {
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const loadDiscountRatesFromStorage = (): DiscountRate[] => {
  const saved = localStorage.getItem('discountRates');
  if (saved) {
    return JSON.parse(saved);
  }
  return [
    { id: '1', daysFrom: 1, daysTo: 30, rate: 1.5 },
    { id: '2', daysFrom: 31, daysTo: 60, rate: 2.0 },
    { id: '3', daysFrom: 61, daysTo: 90, rate: 2.5 },
    { id: '4', daysFrom: 91, daysTo: 120, rate: 3.0 },
    { id: '5', daysFrom: 121, daysTo: 180, rate: 3.5 },
    { id: '6', daysFrom: 181, daysTo: 270, rate: 4.0 },
    { id: '7', daysFrom: 271, daysTo: 365, rate: 4.5 },
  ];
};

const loadClientDiscountRates = (clientId: string) => {
  const saved = localStorage.getItem(`clientDiscountRates_${clientId}`);
  if (saved) {
    const rates = JSON.parse(saved);
    if (rates && rates.length > 0) {
      return rates;
    }
  }
  return null;
};

const calculateDiscountRate = (days: number, clientId?: string): number => {
  let rates;

  if (clientId) {
    const clientRates = loadClientDiscountRates(clientId);
    if (clientRates) {
      rates = clientRates;
    } else {
      rates = loadDiscountRatesFromStorage();
    }
  } else {
    rates = loadDiscountRatesFromStorage();
  }

  const matchingRate = (rates as DiscountRate[]).find((r) => days >= r.daysFrom && days <= r.daysTo);
  if (matchingRate) {
    return matchingRate.rate;
  }
  const lastRate = rates[rates.length - 1];
  return lastRate?.rate || 4.5;
};

export const AntecipationJourney: React.FC<AntecipationJourneyProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<Step>('client-selection');
  const [selectedClient, setSelectedClient] = useState<AntecipationClient | null>(null);
  const [selectedReceivables, setSelectedReceivables] = useState<Set<string>>(new Set());
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Client management state (same pattern as other journeys)
  const [importedClients, setImportedClients] = useState<AntecipationClient[]>([]);
  const [optInAuthorizations, setOptInAuthorizations] = useState<Set<string>>(new Set());
  const [contractualConsents, setContractualConsents] = useState<Set<string>>(new Set());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isSearchClientModalOpen, setIsSearchClientModalOpen] = useState(false);

  const today = useMemo(() => new Date(), []);

  const clientReceivables = useMemo(() => {
    if (!selectedClient) return [];
    return mockReceivables.filter(r => r.clientId === selectedClient.id);
  }, [selectedClient]);

  const batchGroups = useMemo((): BatchGroup[] => {
    const grouped = new Map<string, ReceivableItem[]>();

    clientReceivables.forEach(receivable => {
      if (!grouped.has(receivable.dueDate)) {
        grouped.set(receivable.dueDate, []);
      }
      grouped.get(receivable.dueDate)!.push(receivable);
    });

    return Array.from(grouped.entries())
      .map(([dueDate, receivables]) => {
        const daysUntilDue = calculateDaysUntilDue(dueDate, today);
        const totalAmount = receivables.reduce((sum, r) => sum + r.amount, 0);
        const discountRate = calculateDiscountRate(daysUntilDue, selectedClient?.id);
        const discountAmount = (totalAmount * discountRate * daysUntilDue) / (30 * 100);
        const netAmount = totalAmount - discountAmount;

        return {
          dueDate,
          daysUntilDue,
          receivables,
          totalAmount,
          discountRate,
          discountAmount,
          netAmount
        };
      })
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }, [clientReceivables, today, selectedClient]);

  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const toggleReceivableSelection = (id: string) => {
    const newSelection = new Set(selectedReceivables);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedReceivables(newSelection);
  };

  const toggleBatchSelection = (batch: BatchGroup) => {
    const newSelection = new Set(selectedReceivables);
    const allSelected = batch.receivables.every(r => newSelection.has(r.id));

    if (allSelected) {
      batch.receivables.forEach(r => newSelection.delete(r.id));
    } else {
      batch.receivables.forEach(r => newSelection.add(r.id));
    }

    setSelectedReceivables(newSelection);
  };

  const toggleBatchExpanded = (dueDate: string) => {
    const newExpanded = new Set(expandedBatches);
    if (newExpanded.has(dueDate)) {
      newExpanded.delete(dueDate);
    } else {
      newExpanded.add(dueDate);
    }
    setExpandedBatches(newExpanded);
  };

  const calculateTotalAmount = () => {
    return clientReceivables
      .filter(r => selectedReceivables.has(r.id))
      .reduce((sum, r) => sum + r.amount, 0);
  };

  const calculateTotalDiscount = () => {
    return batchGroups.reduce((total, batch) => {
      const selectedInBatch = batch.receivables.filter(r => selectedReceivables.has(r.id));
      if (selectedInBatch.length === 0) return total;

      const batchSelectedAmount = selectedInBatch.reduce((sum, r) => sum + r.amount, 0);
      const batchDiscount = (batchSelectedAmount * batch.discountRate * batch.daysUntilDue) / (30 * 100);
      return total + batchDiscount;
    }, 0);
  };

  const calculateNetAmount = () => {
    return calculateTotalAmount() - calculateTotalDiscount();
  };

  const handleCloseJourney = () => {
    setCurrentStep('client-selection');
    setSelectedClient(null);
    setSelectedReceivables(new Set());
    setImportedClients([]);
    setOptInAuthorizations(new Set());
    setContractualConsents(new Set());
    onClose();
  };

  const handleClientSelection = (client: AntecipationClient) => {
    if (!optInAuthorizations.has(client.id) || !contractualConsents.has(client.id)) {
      return;
    }
    setSelectedClient(client);
    setCurrentStep('selection');
  };

  const handleImportClients = (clients: Client[]) => {
    const mapped: AntecipationClient[] = clients.map(c => ({
      id: c.id,
      name: c.name,
      document: c.document,
      totalReceivables: Math.floor(Math.random() * 20) + 5,
      availableAmount: Math.random() * 1500000 + 200000,
    }));
    setImportedClients(prev => [...prev, ...mapped]);
    setIsImportModalOpen(false);
  };

  const handleManualClientAdd = (client: Client | Client[]) => {
    const clientsToAdd = Array.isArray(client) ? client : [client];
    const mapped: AntecipationClient[] = clientsToAdd.map(c => ({
      id: c.id,
      name: c.name,
      document: c.document,
      totalReceivables: Math.floor(Math.random() * 20) + 5,
      availableAmount: Math.random() * 1500000 + 200000,
    }));
    setImportedClients(prev => [...prev, ...mapped]);
  };

  const toggleOptInAuthorization = (clientId: string, event: React.SyntheticEvent) => {
    event.stopPropagation();
    setOptInAuthorizations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const toggleContractualConsent = (clientId: string, event: React.SyntheticEvent) => {
    event.stopPropagation();
    setContractualConsents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const toggleAllOptIns = () => {
    if (importedClients.every(c => optInAuthorizations.has(c.id))) {
      setOptInAuthorizations(new Set());
    } else {
      setOptInAuthorizations(new Set(importedClients.map(c => c.id)));
    }
  };

  const toggleAllContractualConsents = () => {
    if (importedClients.every(c => contractualConsents.has(c.id))) {
      setContractualConsents(new Set());
    } else {
      setContractualConsents(new Set(importedClients.map(c => c.id)));
    }
  };

  const renderClientSelectionStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Passo 1: Adicionar Clientes</h3>
        <p className="text-gray-600">Escolha como adicionar os clientes para antecipação de recebíveis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setIsSearchClientModalOpen(true)}
          className="bg-white border-2 border-gray-300 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Buscar Clientes</h4>
          <p className="text-sm text-gray-600">Pesquisar clientes já cadastrados</p>
        </button>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="bg-white border-2 border-gray-300 rounded-xl p-6 hover:border-teal-500 hover:bg-teal-50 transition-all group text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
              <Upload className="w-8 h-8 text-teal-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Importar Planilha</h4>
          <p className="text-sm text-gray-600">Upload de arquivo XLSX com múltiplos CNPJs</p>
        </button>
        <button
          onClick={() => setIsNewClientModalOpen(true)}
          className="bg-white border-2 border-gray-300 rounded-xl p-6 hover:border-green-500 hover:bg-green-50 transition-all group text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Adicionar Manualmente</h4>
          <p className="text-sm text-gray-600">Cadastro individual de cliente</p>
        </button>
      </div>

      {importedClients.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Clientes Adicionados ({importedClients.length})
            </h4>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAllOptIns}
                className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Marcar opt-in para todos</span>
              </button>
              <button
                onClick={toggleAllContractualConsents}
                className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Marcar todas anuências</span>
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {importedClients.map((client) => {
              const hasOptInAuth = optInAuthorizations.has(client.id);
              const hasContConsent = contractualConsents.has(client.id);
              const hasAllAuthorizations = hasOptInAuth && hasContConsent;
              return (
                <div key={client.id} className="space-y-2">
                  <button
                    onClick={() => handleClientSelection(client)}
                    disabled={!hasAllAuthorizations}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                      hasAllAuthorizations
                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                        : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-600">{client.document}</p>
                      {hasAllAuthorizations && (
                        <p className="text-xs text-blue-600 font-medium mt-1">Autorizações confirmadas - Clique para selecionar</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">URs Disponíveis</p>
                        <p className="text-sm font-bold text-blue-600">{client.totalReceivables}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Valor Total</p>
                        <p className="text-sm font-bold text-green-600">{formatCurrency(client.availableAmount)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className={`w-5 h-5 ${hasAllAuthorizations ? 'text-blue-600' : 'text-gray-400'}`} />
                        <ArrowRight className={`w-5 h-5 ${hasAllAuthorizations ? 'text-gray-600' : 'text-gray-300'}`} />
                      </div>
                    </div>
                  </button>
                  <div className="ml-4 pl-4 border-l-2 border-blue-200 space-y-2">
                    <label
                      className="flex items-start space-x-3 cursor-pointer py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={hasOptInAuth}
                        onChange={(e) => toggleOptInAuthorization(client.id, e)}
                        className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">
                        Declaro que possuo autorização para consulta dos dados "Opt-in" deste cliente
                      </span>
                    </label>
                    <label
                      className="flex items-start space-x-3 cursor-pointer py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={hasContConsent}
                        onChange={(e) => toggleContractualConsent(client.id, e)}
                        className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">
                        Tenho anuência contratual para onerar as agendas deste estabelecimento comercial
                      </span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderSelectionStep = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900">Passo 2: Selecionar Recebíveis por Lote</h3>
          <button
            onClick={() => {
              setCurrentStep('client-selection');
              setSelectedClient(null);
              setSelectedReceivables(new Set());
              setExpandedBatches(new Set());
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Trocar Cliente
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 mb-2">
          <p className="text-sm text-gray-600">Cliente Selecionado:</p>
          <p className="font-semibold text-gray-900">{selectedClient?.name} - {selectedClient?.document}</p>
        </div>
        <p className="text-gray-600">Escolha os lotes de recebíveis que deseja antecipar. Cada lote tem uma taxa de desconto específica baseada no prazo.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 font-medium">Recebíveis Selecionados</p>
          <p className="text-2xl font-bold text-blue-600">{selectedReceivables.size}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 font-medium">Valor Bruto</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(calculateTotalAmount())}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-900 font-medium">Valor Líquido</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(calculateNetAmount())}</p>
        </div>
      </div>

      {batchGroups.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nenhum recebível disponível para este cliente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {batchGroups.map((batch) => {
            const allSelected = batch.receivables.every(r => selectedReceivables.has(r.id));
            const someSelected = batch.receivables.some(r => selectedReceivables.has(r.id));
            const isExpanded = expandedBatches.has(batch.dueDate);

            return (
              <div key={batch.dueDate} className={`rounded-lg border-2 transition-all ${
                allSelected
                  ? 'border-blue-500 bg-blue-50'
                  : someSelected
                  ? 'border-blue-300 bg-blue-25'
                  : 'border-gray-200'
              }`}>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <button
                        onClick={() => toggleBatchSelection(batch)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          allSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                        }`}
                      >
                        {allSelected && <CheckCircle className="w-4 h-4 text-white" />}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <p className="font-semibold text-gray-900">Lote - Vencimento: {formatDate(batch.dueDate)}</p>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {batch.daysUntilDue} dias
                          </span>
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                            Taxa: {batch.discountRate}% a.m.
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="text-gray-600">{batch.receivables.length} URs</span>
                          <span className="text-gray-600">Valor Bruto: <strong>{formatCurrency(batch.totalAmount)}</strong></span>
                          <span className="text-red-600">Desconto: <strong>{formatCurrency(batch.discountAmount)}</strong></span>
                          <span className="text-green-600">Líquido: <strong>{formatCurrency(batch.netAmount)}</strong></span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleBatchExpanded(batch.dueDate)}
                      className="ml-4 text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 space-y-2 pl-9">
                      {batch.receivables.map(receivable => {
                        const isSelected = selectedReceivables.has(receivable.id);
                        return (
                          <button
                            key={receivable.id}
                            onClick={() => toggleReceivableSelection(receivable.id)}
                            className={`w-full p-3 rounded-lg border transition-all text-left ${
                              isSelected ? 'border-blue-400 bg-blue-100' : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">UR #{receivable.id}</p>
                                <p className="text-xs text-gray-600">{receivable.acquirer}</p>
                              </div>
                              <p className="text-sm font-bold text-gray-900">{formatCurrency(receivable.amount)}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => {
            setCurrentStep('client-selection');
            setSelectedReceivables(new Set());
          }}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={() => setCurrentStep('simulation')}
          disabled={selectedReceivables.size === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Continuar para Simulação
        </button>
      </div>
    </div>
  );

  const renderSimulationStep = () => {
    const selectedBatches = batchGroups.filter(batch =>
      batch.receivables.some(r => selectedReceivables.has(r.id))
    );

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Passo 3: Revisão e Confirmação</h3>
          <p className="text-gray-600">Revise os detalhes da antecipação por lote</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Cliente:</p>
          <p className="font-semibold text-gray-900">{selectedClient?.name} - {selectedClient?.document}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-900 mb-4">Resumo Geral da Antecipação</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <span className="text-sm text-gray-600">Valor Bruto Total</span>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(calculateTotalAmount())}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <span className="text-sm text-gray-600">Desconto Total</span>
              <p className="text-2xl font-bold text-red-600">-{formatCurrency(calculateTotalDiscount())}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <span className="text-sm text-gray-600">Valor Líquido Total</span>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(calculateNetAmount())}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-900">Detalhamento por Lote</h4>
          {selectedBatches.map((batch) => {
            const selectedInBatch = batch.receivables.filter(r => selectedReceivables.has(r.id));
            const batchSelectedAmount = selectedInBatch.reduce((sum, r) => sum + r.amount, 0);
            const batchDiscount = (batchSelectedAmount * batch.discountRate * batch.daysUntilDue) / (30 * 100);
            const batchNet = batchSelectedAmount - batchDiscount;

            return (
              <div key={batch.dueDate} className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h5 className="font-semibold text-gray-900">Lote - Vencimento: {formatDate(batch.dueDate)}</h5>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {batch.daysUntilDue} dias
                      </span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                        Taxa: {batch.discountRate}% a.m.
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{selectedInBatch.length} URs selecionadas neste lote</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-900 mb-1">Valor Bruto</p>
                    <p className="text-lg font-bold text-blue-900">{formatCurrency(batchSelectedAmount)}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-red-900 mb-1">Desconto ({batch.discountRate}% × {batch.daysUntilDue}d)</p>
                    <p className="text-lg font-bold text-red-600">-{formatCurrency(batchDiscount)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-900 mb-1">Valor Líquido</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(batchNet)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedInBatch.map((receivable) => (
                    <div key={receivable.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div>
                        <span className="font-medium text-gray-900">UR #{receivable.id}</span>
                        <span className="text-gray-500 ml-2">• {receivable.acquirer}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{formatCurrency(receivable.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep('selection')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={() => setShowApprovalModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enviar para Aprovação
          </button>
        </div>
      </div>
    );
  };

  const renderConfirmationStep = () => {
    const selectedBatches = batchGroups.filter(batch =>
      batch.receivables.some(r => selectedReceivables.has(r.id))
    );

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Passo 4: Enviado para Aprovação</h3>
          <p className="text-gray-600">Contrato enviado com sucesso</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-600 p-3 rounded-full">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-900">Contrato Enviado para Aprovação</h4>
              <p className="text-sm text-blue-700">Aguardando análise e aprovação da operação</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-600">Cliente:</p>
            <p className="font-semibold text-gray-900">{selectedClient?.name} - {selectedClient?.document}</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">URs</p>
              <p className="text-2xl font-bold text-gray-900">{selectedReceivables.size}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Lotes</p>
              <p className="text-2xl font-bold text-gray-900">{selectedBatches.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Valor Bruto</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(calculateTotalAmount())}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Valor Líquido</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(calculateNetAmount())}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-gray-900">Detalhes por Lote:</h5>
            {selectedBatches.map((batch) => {
              const selectedInBatch = batch.receivables.filter(r => selectedReceivables.has(r.id));
              const batchSelectedAmount = selectedInBatch.reduce((sum, r) => sum + r.amount, 0);
              const batchDiscount = (batchSelectedAmount * batch.discountRate * batch.daysUntilDue) / (30 * 100);
              const batchNet = batchSelectedAmount - batchDiscount;

              return (
                <div key={batch.dueDate} className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">Venc: {formatDate(batch.dueDate)}</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {batch.daysUntilDue}d
                      </span>
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                        {batch.discountRate}% a.m.
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">{selectedInBatch.length} URs</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Bruto: </span>
                      <span className="font-semibold text-blue-900">{formatCurrency(batchSelectedAmount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Desconto: </span>
                      <span className="font-semibold text-red-600">-{formatCurrency(batchDiscount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Líquido: </span>
                      <span className="font-semibold text-green-600">{formatCurrency(batchNet)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900 mb-1">Próximos Passos</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• A operação foi enviada para aprovação e pode ser acompanhada no <strong>menu de Operações</strong></li>
                <li>• Você receberá uma notificação por e-mail sobre o status da aprovação</li>
                <li>• Após aprovado, o valor líquido total de {formatCurrency(calculateNetAmount())} será creditado em sua conta</li>
                <li>• O processo de aprovação pode levar até 24 horas úteis</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleCloseJourney}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>Finalizar</span>
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const getStepNumber = (step: Step): number => {
    const steps: Step[] = ['client-selection', 'selection', 'simulation', 'confirmation'];
    return steps.indexOf(step) + 1;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Antecipação de Recebíveis</h2>
              <div className="flex items-center space-x-2 mt-2">
                <div className={`flex items-center space-x-2 ${currentStep === 'client-selection' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getStepNumber(currentStep) >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    1
                  </div>
                  <span className="text-sm font-medium">Clientes</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center space-x-2 ${currentStep === 'selection' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getStepNumber(currentStep) >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    2
                  </div>
                  <span className="text-sm font-medium">Seleção</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center space-x-2 ${currentStep === 'simulation' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getStepNumber(currentStep) >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    3
                  </div>
                  <span className="text-sm font-medium">Simulação</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center space-x-2 ${currentStep === 'confirmation' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getStepNumber(currentStep) >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    4
                  </div>
                  <span className="text-sm font-medium">Aprovação</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCloseJourney}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {currentStep === 'client-selection' && renderClientSelectionStep()}
            {currentStep === 'selection' && renderSelectionStep()}
            {currentStep === 'simulation' && renderSimulationStep()}
            {currentStep === 'confirmation' && renderConfirmationStep()}
          </div>
        </div>

        {showApprovalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Confirmar Envio para Aprovação
              </h3>

              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 mb-2">
                    <span className="font-semibold">Cliente:</span> {selectedClient?.name}
                  </p>
                  <p className="text-sm text-blue-900 mb-2">
                    <span className="font-semibold">URs selecionadas:</span> {selectedReceivables.size}
                  </p>
                  <p className="text-sm text-blue-900 mb-2">
                    <span className="font-semibold">Valor bruto:</span> {formatCurrency(calculateTotalAmount())}
                  </p>
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Valor líquido:</span> {formatCurrency(calculateNetAmount())}
                  </p>
                </div>

                <p className="text-sm text-gray-600">
                  Ao confirmar, o contrato de antecipação será enviado para análise e aprovação.
                  Você receberá uma notificação quando o processo for concluído.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setCurrentStep('confirmation');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Confirmar Envio
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ImportClientsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportClients}
      />

      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSave={handleManualClientAdd}
      />

      {isSearchClientModalOpen && (
        <AntecipationSearchClientModal
          isOpen={isSearchClientModalOpen}
          onClose={() => setIsSearchClientModalOpen(false)}
          onSelectClients={(clients) => {
            const mapped: AntecipationClient[] = clients.map(c => ({
              id: c.id,
              name: c.name,
              document: c.document,
              totalReceivables: Math.floor(Math.random() * 20) + 5,
              availableAmount: Math.random() * 1500000 + 200000,
            }));
            setImportedClients(prev => [...prev, ...mapped]);
            setIsSearchClientModalOpen(false);
          }}
        />
      )}
    </>
  );
};

// Search Client Modal for Antecipation Journey
interface AntecipationSearchClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClients: (clients: Client[]) => void;
}

const AntecipationSearchClientModal: React.FC<AntecipationSearchClientModalProps> = ({ isOpen, onClose, onSelectClients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const mockSearchClients: Client[] = [
    {
      id: 'c1',
      name: 'ABC Comércio Ltda',
      document: '12.345.678/0001-90',
      email: 'contato@abc.com.br',
      phone: '(11) 98765-4321',
      address: 'Rua A, 123, São Paulo - SP',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      totalLimit: 500000,
      usedLimit: 200000,
      availableLimit: 300000,
      collateralValue: 150000,
      status: 'active',
    },
    {
      id: 'c2',
      name: 'XYZ Varejo',
      document: '11.222.333/0001-44',
      email: 'financeiro@xyz.com.br',
      phone: '(11) 91234-5678',
      address: 'Av. B, 456, São Paulo - SP',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '02345-678',
      totalLimit: 1000000,
      usedLimit: 400000,
      availableLimit: 600000,
      collateralValue: 300000,
      status: 'active',
    },
    {
      id: 'c3',
      name: 'Tech Solutions Brasil',
      document: '98.765.432/0001-10',
      email: 'admin@techsolutions.com.br',
      phone: '(11) 99876-5432',
      address: 'Rua C, 789, São Paulo - SP',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '03456-789',
      totalLimit: 750000,
      usedLimit: 250000,
      availableLimit: 500000,
      collateralValue: 200000,
      status: 'active',
    },
    {
      id: 'c4',
      name: 'Varejo Prime Ltda',
      document: '22.333.444/0001-55',
      email: 'contato@varejoprime.com.br',
      phone: '(11) 98888-7777',
      address: 'Av. D, 321, São Paulo - SP',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04567-890',
      totalLimit: 600000,
      usedLimit: 150000,
      availableLimit: 450000,
      collateralValue: 180000,
      status: 'active',
    },
    {
      id: 'c5',
      name: 'Mega Store S.A.',
      document: '33.444.555/0001-66',
      email: 'vendas@megastore.com.br',
      phone: '(11) 97777-6666',
      address: 'Rua E, 654, São Paulo - SP',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05678-901',
      totalLimit: 900000,
      usedLimit: 350000,
      availableLimit: 550000,
      collateralValue: 280000,
      status: 'active',
    },
    {
      id: 'c6',
      name: 'Distribuidora Central',
      document: '44.555.666/0001-77',
      email: 'contato@distcentral.com.br',
      phone: '(11) 96666-5555',
      address: 'Rua F, 987, São Paulo - SP',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '06789-012',
      totalLimit: 800000,
      usedLimit: 300000,
      availableLimit: 500000,
      collateralValue: 250000,
      status: 'active',
    },
  ];

  const filteredClients = mockSearchClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.document.includes(searchTerm)
  );

  const toggleClientSelection = (clientId: string) => {
    const newSelection = new Set(selectedClients);
    if (newSelection.has(clientId)) {
      newSelection.delete(clientId);
    } else {
      newSelection.add(clientId);
    }
    setSelectedClients(newSelection);
  };

  const handleConfirm = () => {
    const selected = mockSearchClients.filter(client => selectedClients.has(client.id));
    if (selected.length > 0) {
      onSelectClients(selected);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Buscar Clientes</h2>
              <p className="text-sm text-gray-600">
                {selectedClients.size} cliente{selectedClients.size !== 1 ? 's' : ''} selecionado{selectedClients.size !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="overflow-y-auto max-h-96 space-y-2">
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum cliente encontrado</p>
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedClients.has(client.id);
                return (
                  <button
                    key={client.id}
                    onClick={() => toggleClientSelection(client.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{client.name}</div>
                            <div className="text-sm text-gray-600">{client.document}</div>
                            <div className="text-xs text-gray-500">{client.email}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          R$ {(client.availableLimit / 1000).toFixed(0)}k
                        </div>
                        <div className="text-xs text-gray-500">Disponível</div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedClients.size === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>Adicionar {selectedClients.size > 0 ? `${selectedClients.size} Cliente${selectedClients.size > 1 ? 's' : ''}` : 'Clientes'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
