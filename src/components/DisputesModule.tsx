import React, { useState } from 'react';
import {
  AlertTriangle, Search, Filter, Clock, CheckCircle, XCircle, Eye,
  MessageSquare, Info, Plus, Send, User,
  FileCheck, ArrowRightCircle, ShieldAlert, Paperclip
} from 'lucide-react';
import { mockClients, mockContracts, mockReceivables } from '../data/mockData';
import { showToast } from '../hooks/useToast';

type DisputeReason = 'wrong_value' | 'duplicate' | 'not_recognized' | 'wrong_settlement_date' | 'chargeback_disagreement' | 'other';

type EventType =
  | 'opened'
  | 'assigned'
  | 'comment'
  | 'document_requested'
  | 'document_received'
  | 'analysis_started'
  | 'status_changed'
  | 'resolved'
  | 'rejected';

interface TimelineEvent {
  id: string;
  type: EventType;
  description: string;
  author: string;
  date: Date;
  metadata?: string;
}

interface Dispute {
  id: string;
  urId: string;
  contractId: string;
  contractNumber: string;
  clientId: string;
  clientName: string;
  clientDocument: string;
  acquirer: string;
  cardBrand: string;
  originalValue: number;
  transactionDate: Date;
  settlementDate: Date;
  reason: DisputeReason;
  status: 'open' | 'in_analysis' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  createdDate: Date;
  lastUpdate: Date;
  assignedTo?: string;
  resolution?: string;
}

const REASON_LABELS: Record<DisputeReason, string> = {
  'wrong_value': 'Valor divergente',
  'duplicate': 'UR duplicada',
  'not_recognized': 'UR não reconhecida',
  'wrong_settlement_date': 'Data de liquidação incorreta',
  'chargeback_disagreement': 'Discordância de chargeback',
  'other': 'Outros'
};

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  'opened': 'Contestação aberta',
  'assigned': 'Atribuição de responsável',
  'comment': 'Comentário',
  'document_requested': 'Documentação solicitada',
  'document_received': 'Documentação recebida',
  'analysis_started': 'Análise iniciada',
  'status_changed': 'Mudança de status',
  'resolved': 'Contestação resolvida',
  'rejected': 'Contestação rejeitada'
};

const EVENT_COLORS: Record<EventType, { dot: string; bg: string; text: string }> = {
  'opened':             { dot: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-800' },
  'assigned':           { dot: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-800' },
  'comment':            { dot: 'bg-gray-400',   bg: 'bg-gray-50',   text: 'text-gray-800' },
  'document_requested': { dot: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-800' },
  'document_received':  { dot: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-800' },
  'analysis_started':   { dot: 'bg-blue-600',   bg: 'bg-blue-50',   text: 'text-blue-800' },
  'status_changed':     { dot: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-800' },
  'resolved':           { dot: 'bg-green-500',  bg: 'bg-green-50',  text: 'text-green-800' },
  'rejected':           { dot: 'bg-red-500',    bg: 'bg-red-50',    text: 'text-red-800' }
};

const EVENT_ICONS: Record<EventType, React.ReactNode> = {
  'opened':             <ShieldAlert className="w-3.5 h-3.5" />,
  'assigned':           <User className="w-3.5 h-3.5" />,
  'comment':            <MessageSquare className="w-3.5 h-3.5" />,
  'document_requested': <Paperclip className="w-3.5 h-3.5" />,
  'document_received':  <FileCheck className="w-3.5 h-3.5" />,
  'analysis_started':   <Eye className="w-3.5 h-3.5" />,
  'status_changed':     <ArrowRightCircle className="w-3.5 h-3.5" />,
  'resolved':           <CheckCircle className="w-3.5 h-3.5" />,
  'rejected':           <XCircle className="w-3.5 h-3.5" />
};

// Actions the user can add (subset of event types)
const USER_EVENT_TYPES: EventType[] = [
  'comment',
  'assigned',
  'document_requested',
  'document_received',
  'analysis_started',
  'status_changed',
  'resolved',
  'rejected'
];

// Build helper maps from mock data
const clientMap = Object.fromEntries(mockClients.map(c => [c.id, c]));
const contractMap = Object.fromEntries(mockContracts.map(c => [c.id, c]));

const buildDispute = (
  id: string,
  urId: string,
  reason: DisputeReason,
  status: Dispute['status'],
  priority: Dispute['priority'],
  description: string,
  createdDate: Date,
  lastUpdate: Date,
  assignedTo?: string,
  resolution?: string
): Dispute | null => {
  const ur = mockReceivables.find(r => r.id === urId);
  if (!ur) return null;
  const contract = contractMap[ur.contractId];
  if (!contract) return null;
  const client = clientMap[contract.clientId];
  if (!client) return null;

  return {
    id,
    urId: ur.id,
    contractId: contract.id,
    contractNumber: contract.contractNumber,
    clientId: client.id,
    clientName: client.name,
    clientDocument: client.document,
    acquirer: ur.acquirer,
    cardBrand: ur.cardBrand,
    originalValue: ur.originalValue,
    transactionDate: ur.transactionDate,
    settlementDate: ur.settlementDate,
    reason,
    status,
    priority,
    description,
    createdDate,
    lastUpdate,
    assignedTo,
    resolution
  };
};

const mockDisputes: Dispute[] = [
  buildDispute(
    'CTT-001', 'ur-004', 'chargeback_disagreement', 'open', 'critical',
    'Cliente contesta chargeback da UR ur-004. Alega que a transação foi legítima e reconhecida pelo portador.',
    new Date('2025-01-15'), new Date('2025-01-15'), 'João Silva'
  ),
  buildDispute(
    'CTT-002', 'ur-002', 'wrong_value', 'in_analysis', 'high',
    'Valor onerado da UR ur-002 diverge do valor original da transação. Cliente reporta diferença de R$ 42,50 nas taxas aplicadas.',
    new Date('2025-01-14'), new Date('2025-01-16'), 'Maria Santos'
  ),
  buildDispute(
    'CTT-003', 'ur-013', 'wrong_settlement_date', 'resolved', 'medium',
    'Data de liquidação da UR ur-013 registrada como 15/01, porém cliente alega que deveria ser 14/01 conforme agenda.',
    new Date('2025-01-13'), new Date('2025-01-17'), 'Carlos Oliveira',
    'Data corrigida no sistema. Diferença causada por feriado municipal não cadastrado no calendário de liquidação.'
  ),
  buildDispute(
    'CTT-004', 'ur-101', 'duplicate', 'rejected', 'low',
    'Cliente alega que a UR ur-101 está duplicada com outra transação no mesmo valor. Solicita cancelamento de uma das URs.',
    new Date('2025-01-12'), new Date('2025-01-18'), 'Ana Costa',
    'Após análise, as URs referem-se a transações distintas realizadas no mesmo dia. NSUs diferentes confirmam unicidade.'
  ),
  buildDispute(
    'CTT-005', 'ur-005', 'not_recognized', 'in_analysis', 'high',
    'UR ur-005 não reconhecida pelo estabelecimento. Merchant ID MERCH001 não corresponde ao cadastro do cliente.',
    new Date('2025-01-16'), new Date('2025-01-17'), 'João Silva'
  ),
  buildDispute(
    'CTT-006', 'ur-014', 'wrong_value', 'open', 'medium',
    'Valor de taxa (fee) aplicado na UR ur-014 está acima do acordado contratualmente. Taxa cobrada: 5%. Taxa contratada: 3.5%.',
    new Date('2025-01-17'), new Date('2025-01-17')
  ),
  buildDispute(
    'CTT-007', 'ur-009', 'wrong_settlement_date', 'open', 'high',
    'UR ur-009 com previsão de liquidação para 16/01 ainda não liquidada. Cliente solicita esclarecimento sobre atraso.',
    new Date('2025-01-17'), new Date('2025-01-17'), 'Maria Santos'
  ),
].filter(Boolean) as Dispute[];

// Initial timeline events per dispute
const initialEvents: Record<string, TimelineEvent[]> = {
  'CTT-001': [
    { id: 'ev-001', type: 'opened', description: 'Contestação aberta pelo cliente referente à UR ur-004. Motivo: discordância de chargeback.', author: 'Sistema', date: new Date('2025-01-15T09:00:00') },
    { id: 'ev-002', type: 'assigned', description: 'Contestação atribuída para análise.', author: 'Sistema', date: new Date('2025-01-15T09:15:00'), metadata: 'João Silva' },
    { id: 'ev-003', type: 'document_requested', description: 'Solicitado ao cliente comprovante da transação e print do extrato bancário.', author: 'João Silva', date: new Date('2025-01-15T10:30:00') },
  ],
  'CTT-002': [
    { id: 'ev-010', type: 'opened', description: 'Contestação aberta pelo cliente referente à UR ur-002. Motivo: valor divergente nas taxas.', author: 'Sistema', date: new Date('2025-01-14T11:00:00') },
    { id: 'ev-011', type: 'assigned', description: 'Contestação atribuída para análise.', author: 'Sistema', date: new Date('2025-01-14T11:05:00'), metadata: 'Maria Santos' },
    { id: 'ev-012', type: 'analysis_started', description: 'Iniciada verificação das taxas aplicadas versus contrato vigente.', author: 'Maria Santos', date: new Date('2025-01-15T08:30:00') },
    { id: 'ev-013', type: 'comment', description: 'Taxa aplicada de 5% está correta para bandeira Mastercard parcelado. Verificando se cliente tem condição especial.', author: 'Maria Santos', date: new Date('2025-01-16T14:00:00') },
  ],
  'CTT-003': [
    { id: 'ev-020', type: 'opened', description: 'Contestação aberta pelo cliente referente à UR ur-013. Motivo: data de liquidação incorreta.', author: 'Sistema', date: new Date('2025-01-13T10:00:00') },
    { id: 'ev-021', type: 'assigned', description: 'Contestação atribuída para análise.', author: 'Sistema', date: new Date('2025-01-13T10:10:00'), metadata: 'Carlos Oliveira' },
    { id: 'ev-022', type: 'analysis_started', description: 'Verificando calendário de liquidação e agenda da credenciadora.', author: 'Carlos Oliveira', date: new Date('2025-01-14T09:00:00') },
    { id: 'ev-023', type: 'comment', description: 'Identificado feriado municipal em 14/01 na cidade do estabelecimento que não constava no calendário do sistema.', author: 'Carlos Oliveira', date: new Date('2025-01-15T11:00:00') },
    { id: 'ev-024', type: 'status_changed', description: 'Status alterado de "Em Análise" para "Resolvida".', author: 'Carlos Oliveira', date: new Date('2025-01-17T09:00:00'), metadata: 'open → resolved' },
    { id: 'ev-025', type: 'resolved', description: 'Data corrigida no sistema. Diferença causada por feriado municipal não cadastrado no calendário de liquidação.', author: 'Carlos Oliveira', date: new Date('2025-01-17T09:05:00') },
  ],
  'CTT-004': [
    { id: 'ev-030', type: 'opened', description: 'Contestação aberta pelo cliente referente à UR ur-101. Motivo: UR duplicada.', author: 'Sistema', date: new Date('2025-01-12T14:00:00') },
    { id: 'ev-031', type: 'assigned', description: 'Contestação atribuída para análise.', author: 'Sistema', date: new Date('2025-01-12T14:10:00'), metadata: 'Ana Costa' },
    { id: 'ev-032', type: 'document_requested', description: 'Solicitado ao cliente relatório de transações do período para comparação.', author: 'Ana Costa', date: new Date('2025-01-13T09:00:00') },
    { id: 'ev-033', type: 'document_received', description: 'Recebido relatório de transações do cliente via e-mail.', author: 'Ana Costa', date: new Date('2025-01-15T10:00:00') },
    { id: 'ev-034', type: 'analysis_started', description: 'Comparando NSUs das URs apontadas como duplicadas.', author: 'Ana Costa', date: new Date('2025-01-16T08:00:00') },
    { id: 'ev-035', type: 'comment', description: 'NSU NSU500001 e NSU500002 são distintos. Valores similares mas transações em terminais diferentes (TERM020 vs TERM021).', author: 'Ana Costa', date: new Date('2025-01-17T15:00:00') },
    { id: 'ev-036', type: 'rejected', description: 'Após análise, as URs referem-se a transações distintas realizadas no mesmo dia. NSUs diferentes confirmam unicidade.', author: 'Ana Costa', date: new Date('2025-01-18T09:00:00') },
  ],
  'CTT-005': [
    { id: 'ev-040', type: 'opened', description: 'Contestação aberta pelo cliente referente à UR ur-005. Motivo: UR não reconhecida.', author: 'Sistema', date: new Date('2025-01-16T08:30:00') },
    { id: 'ev-041', type: 'assigned', description: 'Contestação atribuída para análise.', author: 'Sistema', date: new Date('2025-01-16T08:35:00'), metadata: 'João Silva' },
    { id: 'ev-042', type: 'analysis_started', description: 'Verificando cadastro de Merchant ID MERCH001 e vinculação com cliente.', author: 'João Silva', date: new Date('2025-01-17T09:00:00') },
  ],
  'CTT-006': [
    { id: 'ev-050', type: 'opened', description: 'Contestação aberta pelo cliente referente à UR ur-014. Motivo: taxa acima do contratado.', author: 'Sistema', date: new Date('2025-01-17T10:00:00') },
  ],
  'CTT-007': [
    { id: 'ev-060', type: 'opened', description: 'Contestação aberta pelo cliente referente à UR ur-009. Motivo: atraso na liquidação prevista para 16/01.', author: 'Sistema', date: new Date('2025-01-17T11:00:00') },
    { id: 'ev-061', type: 'assigned', description: 'Contestação atribuída para análise.', author: 'Sistema', date: new Date('2025-01-17T11:05:00'), metadata: 'Maria Santos' },
  ],
};

export const DisputesModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);
  const [allEvents, setAllEvents] = useState<Record<string, TimelineEvent[]>>(initialEvents);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    reason: ''
  });

  // New event form
  const [newEventType, setNewEventType] = useState<EventType>('comment');
  const [newEventDescription, setNewEventDescription] = useState('');

  const selectedDispute = disputes.find(d => d.id === selectedDisputeId) || null;
  const selectedEvents = selectedDisputeId ? (allEvents[selectedDisputeId] || []) : [];

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch =
      dispute.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.clientDocument.includes(searchTerm) ||
      dispute.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.urId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || dispute.status === filters.status;
    const matchesPriority = !filters.priority || dispute.priority === filters.priority;
    const matchesReason = !filters.reason || dispute.reason === filters.reason;

    return matchesSearch && matchesStatus && matchesPriority && matchesReason;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: Dispute['status']) => {
    const styles: Record<string, string> = {
      open: 'bg-yellow-100 text-yellow-800',
      in_analysis: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const labels: Record<string, string> = {
      open: 'Aberta', in_analysis: 'Em Análise', resolved: 'Resolvida', rejected: 'Rejeitada'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getPriorityBadge = (priority: Dispute['priority']) => {
    const styles: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800', medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800', critical: 'bg-red-100 text-red-800'
    };
    const labels: Record<string, string> = {
      low: 'Baixa', medium: 'Média', high: 'Alta', critical: 'Crítica'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  const handleAddEvent = () => {
    if (!selectedDisputeId || !newEventDescription.trim()) return;

    const newEvent: TimelineEvent = {
      id: `ev-${Date.now()}`,
      type: newEventType,
      description: newEventDescription.trim(),
      author: 'Usuário Atual',
      date: new Date()
    };

    setAllEvents(prev => ({
      ...prev,
      [selectedDisputeId]: [...(prev[selectedDisputeId] || []), newEvent]
    }));

    // Update dispute status if event is resolved/rejected
    if (newEventType === 'resolved' || newEventType === 'rejected') {
      setDisputes(prev => prev.map(d =>
        d.id === selectedDisputeId
          ? { ...d, status: newEventType === 'resolved' ? 'resolved' as const : 'rejected' as const, lastUpdate: new Date(), resolution: newEventDescription.trim() }
          : d
      ));
    } else if (newEventType === 'analysis_started') {
      setDisputes(prev => prev.map(d =>
        d.id === selectedDisputeId && d.status === 'open'
          ? { ...d, status: 'in_analysis' as const, lastUpdate: new Date() }
          : d
      ));
    } else {
      setDisputes(prev => prev.map(d =>
        d.id === selectedDisputeId ? { ...d, lastUpdate: new Date() } : d
      ));
    }

    setNewEventDescription('');
    setNewEventType('comment');
    showToast('success', 'Evento adicionado à linha do tempo');
  };

  const handleCloseModal = () => {
    setSelectedDisputeId(null);
    setNewEventDescription('');
    setNewEventType('comment');
  };

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-0 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente, UR, contrato ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="open">Aberta</option>
                  <option value="in_analysis">Em Análise</option>
                  <option value="resolved">Resolvida</option>
                  <option value="rejected">Rejeitada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motivo</label>
                <select
                  value={filters.reason}
                  onChange={(e) => setFilters(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {Object.entries(REASON_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-[80px] px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="w-[130px] px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UR / Contrato</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="w-[120px] px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credenciadora</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                <th className="w-[110px] px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="w-[160px] px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="w-[100px] px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDisputes.map((dispute) => (
                <tr
                  key={dispute.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedDisputeId(dispute.id)}
                >
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="text-xs font-semibold text-gray-900">{dispute.id}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="truncate text-sm font-medium text-gray-900">{dispute.urId}</div>
                    <div className="truncate text-xs text-gray-500">{dispute.contractNumber}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="truncate text-sm font-medium text-gray-900">{dispute.clientName}</div>
                    <div className="truncate text-xs text-gray-500">{dispute.clientDocument}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="truncate text-sm text-gray-900">{dispute.acquirer}</div>
                    <div className="truncate text-xs text-gray-500">{dispute.cardBrand}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs text-gray-900">{REASON_LABELS[dispute.reason]}</span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(dispute.originalValue)}</span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {getPriorityBadge(dispute.priority)}
                      {getStatusBadge(dispute.status)}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="text-xs text-gray-500">{formatDate(dispute.createdDate)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDisputes.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-2">Nenhuma contestação encontrada</div>
              <div className="text-sm text-gray-400">Tente ajustar os filtros ou termos de busca</div>
            </div>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Informações sobre Contestações</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• <strong>Contestação por UR:</strong> Cada contestação está vinculada a uma Unidade de Recebível (UR) específica dentro de um contrato.</li>
              <li>• <strong>Motivos:</strong> Valor divergente, UR duplicada, não reconhecida, data de liquidação incorreta, discordância de chargeback.</li>
              <li>• <strong>Fluxo:</strong> Aberta → Em Análise → Resolvida ou Rejeitada.</li>
              <li>• <strong>Prioridades:</strong> Contestações críticas e de alto valor são priorizadas na fila de análise.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ===== TIMELINE MODAL ===== */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 truncate">
                    {selectedDispute.id} — Linha do Tempo
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-sm text-gray-500">
                    <span>{selectedDispute.urId}</span>
                    <span className="text-gray-300">·</span>
                    <span>{selectedDispute.contractNumber}</span>
                    <span className="text-gray-300">·</span>
                    <span className="truncate max-w-[180px]">{selectedDispute.clientName}</span>
                    <span className="text-gray-300">·</span>
                    <span className="font-medium text-gray-700">{formatCurrency(selectedDispute.originalValue)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getPriorityBadge(selectedDispute.priority)}
                  {getStatusBadge(selectedDispute.status)}
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* UR summary */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 rounded-lg p-3 text-xs">
                <div>
                  <span className="text-gray-500">Credenciadora</span>
                  <p className="font-medium text-gray-900">{selectedDispute.acquirer}</p>
                </div>
                <div>
                  <span className="text-gray-500">Bandeira</span>
                  <p className="font-medium text-gray-900">{selectedDispute.cardBrand}</p>
                </div>
                <div>
                  <span className="text-gray-500">Transação</span>
                  <p className="font-medium text-gray-900">{formatDateTime(selectedDispute.transactionDate)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Motivo</span>
                  <p className="font-medium text-gray-900">{REASON_LABELS[selectedDispute.reason]}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200" />

                <div className="space-y-0">
                  {selectedEvents.map((event, index) => {
                    const colors = EVENT_COLORS[event.type];
                    const icon = EVENT_ICONS[event.type];
                    const isLast = index === selectedEvents.length - 1;

                    return (
                      <div key={event.id} className={`relative flex gap-4 ${isLast ? '' : 'pb-6'}`}>
                        {/* Dot */}
                        <div className={`relative z-10 flex-shrink-0 w-[31px] h-[31px] rounded-full ${colors.dot} flex items-center justify-center text-white`}>
                          {icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className={`rounded-lg border p-3 ${colors.bg}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-semibold ${colors.text}`}>
                                {EVENT_TYPE_LABELS[event.type]}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDateTime(event.date)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800">{event.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {event.author}
                              </span>
                              {event.metadata && (
                                <span className="text-xs text-gray-400">
                                  → {event.metadata}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedEvents.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">Nenhum evento registrado</p>
                </div>
              )}
            </div>

            {/* New event form */}
            <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <Plus className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Novo Evento</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as EventType)}
                  className="w-full sm:w-52 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm flex-shrink-0"
                >
                  {USER_EVENT_TYPES.map(type => (
                    <option key={type} value={type}>{EVENT_TYPE_LABELS[type]}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Descreva o evento..."
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && newEventDescription.trim()) handleAddEvent(); }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleAddEvent}
                  disabled={!newEventDescription.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
