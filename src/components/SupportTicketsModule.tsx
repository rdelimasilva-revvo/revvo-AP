import React, { useState } from 'react';
import {
  Search, Filter, Plus, MessageSquare, Clock, CheckCircle,
  AlertTriangle, XCircle, User, Send, ChevronDown, ChevronRight, Info
} from 'lucide-react';
import { showToast } from '../hooks/useToast';

type TicketStatus = 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high';
type TicketCategory = 'bug' | 'question' | 'feature_request' | 'access' | 'billing' | 'other';

interface TicketMessage {
  id: string;
  author: string;
  isSupport: boolean;
  message: string;
  date: Date;
}

interface Ticket {
  id: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo: string | null;
  messages: TicketMessage[];
}

const STATUS_CONFIG: Record<TicketStatus, { label: string; style: string; icon: React.ReactNode }> = {
  open:              { label: 'Aberto',              style: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="w-3 h-3" /> },
  in_progress:       { label: 'Em andamento',        style: 'bg-blue-100 text-blue-800',     icon: <Clock className="w-3 h-3" /> },
  waiting_response:  { label: 'Aguardando resposta', style: 'bg-purple-100 text-purple-800', icon: <MessageSquare className="w-3 h-3" /> },
  resolved:          { label: 'Resolvido',           style: 'bg-green-100 text-green-800',   icon: <CheckCircle className="w-3 h-3" /> },
  closed:            { label: 'Fechado',             style: 'bg-gray-100 text-gray-600',     icon: <XCircle className="w-3 h-3" /> },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; style: string }> = {
  low:    { label: 'Baixa', style: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Média', style: 'bg-yellow-100 text-yellow-800' },
  high:   { label: 'Alta',  style: 'bg-red-100 text-red-800' },
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  bug: 'Bug / Erro',
  question: 'Dúvida',
  feature_request: 'Solicitação de funcionalidade',
  access: 'Acesso / Permissões',
  billing: 'Cobrança / Faturamento',
  other: 'Outros',
};

const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    subject: 'Erro ao gerar relatório de liquidações do mês de janeiro',
    category: 'bug',
    status: 'in_progress',
    priority: 'high',
    createdBy: 'João Silva',
    createdAt: new Date('2025-01-17T09:30:00'),
    updatedAt: new Date('2025-01-17T14:20:00'),
    assignedTo: 'Suporte Nível 2',
    messages: [
      { id: 'm1', author: 'João Silva', isSupport: false, message: 'Ao tentar gerar o relatório de liquidações de janeiro, o sistema retorna erro 500. Já tentei limpar cache e trocar de navegador.', date: new Date('2025-01-17T09:30:00') },
      { id: 'm2', author: 'Suporte Nível 1', isSupport: true, message: 'Obrigado pelo relato, João. Estamos encaminhando para a equipe técnica analisar o problema.', date: new Date('2025-01-17T10:15:00') },
      { id: 'm3', author: 'Suporte Nível 2', isSupport: true, message: 'Identificamos o problema: um timeout na query de liquidações para o período selecionado. Estamos otimizando a consulta. Previsão de correção: hoje à tarde.', date: new Date('2025-01-17T14:20:00') },
    ],
  },
  {
    id: 'TKT-002',
    subject: 'Como configurar domicílio de liquidação para novo cliente?',
    category: 'question',
    status: 'waiting_response',
    priority: 'medium',
    createdBy: 'Maria Santos',
    createdAt: new Date('2025-01-16T15:00:00'),
    updatedAt: new Date('2025-01-17T08:45:00'),
    assignedTo: 'Suporte Nível 1',
    messages: [
      { id: 'm4', author: 'Maria Santos', isSupport: false, message: 'Preciso cadastrar o domicílio de liquidação para um novo cliente. O campo de conta transitória não aparece habilitado.', date: new Date('2025-01-16T15:00:00') },
      { id: 'm5', author: 'Suporte Nível 1', isSupport: true, message: 'Maria, para cadastrar contas transitórias, primeiro é necessário que o cliente tenha opt-in ativo. Verifique na tela de Opt-in se o cliente já foi ativado.', date: new Date('2025-01-17T08:45:00') },
    ],
  },
  {
    id: 'TKT-003',
    subject: 'Solicitar acesso ao módulo de monitoramento para novos analistas',
    category: 'access',
    status: 'open',
    priority: 'medium',
    createdBy: 'Carlos Oliveira',
    createdAt: new Date('2025-01-17T11:00:00'),
    updatedAt: new Date('2025-01-17T11:00:00'),
    assignedTo: null,
    messages: [
      { id: 'm6', author: 'Carlos Oliveira', isSupport: false, message: 'Precisamos liberar acesso ao módulo de monitoramento para 3 novos analistas da equipe: Ana Costa, Pedro Lima e Fernanda Souza.', date: new Date('2025-01-17T11:00:00') },
    ],
  },
  {
    id: 'TKT-004',
    subject: 'Valor de taxa divergente no contrato CT-2025-0042',
    category: 'billing',
    status: 'in_progress',
    priority: 'high',
    createdBy: 'Ana Costa',
    createdAt: new Date('2025-01-15T10:20:00'),
    updatedAt: new Date('2025-01-16T16:30:00'),
    assignedTo: 'Suporte Nível 2',
    messages: [
      { id: 'm7', author: 'Ana Costa', isSupport: false, message: 'O contrato CT-2025-0042 está cobrando taxa de 5% mas o acordado era 3.5%. Preciso de correção urgente.', date: new Date('2025-01-15T10:20:00') },
      { id: 'm8', author: 'Suporte Nível 1', isSupport: true, message: 'Recebido, Ana. Vamos verificar os parâmetros de operação do contrato.', date: new Date('2025-01-15T11:00:00') },
      { id: 'm9', author: 'Suporte Nível 2', isSupport: true, message: 'Confirmado a divergência. A taxa foi cadastrada incorretamente durante a formalização. Estamos corrigindo e recalculando os valores.', date: new Date('2025-01-16T16:30:00') },
    ],
  },
  {
    id: 'TKT-005',
    subject: 'Sugestão: adicionar exportação de dados em CSV no monitoramento',
    category: 'feature_request',
    status: 'open',
    priority: 'low',
    createdBy: 'João Silva',
    createdAt: new Date('2025-01-14T14:30:00'),
    updatedAt: new Date('2025-01-14T14:30:00'),
    assignedTo: null,
    messages: [
      { id: 'm10', author: 'João Silva', isSupport: false, message: 'Seria muito útil ter uma opção de exportar os dados do módulo de monitoramento em formato CSV para análises externas no Excel.', date: new Date('2025-01-14T14:30:00') },
    ],
  },
  {
    id: 'TKT-006',
    subject: 'Tela de agenda não carrega para o cliente ABC Comércio',
    category: 'bug',
    status: 'resolved',
    priority: 'high',
    createdBy: 'Maria Santos',
    createdAt: new Date('2025-01-13T08:00:00'),
    updatedAt: new Date('2025-01-14T10:00:00'),
    assignedTo: 'Suporte Nível 2',
    messages: [
      { id: 'm11', author: 'Maria Santos', isSupport: false, message: 'A tela de visão de agendas fica em loading infinito quando seleciono o cliente ABC Comércio Ltda.', date: new Date('2025-01-13T08:00:00') },
      { id: 'm12', author: 'Suporte Nível 2', isSupport: true, message: 'O problema era causado por um volume muito grande de URs para esse cliente. Otimizamos a paginação e o problema foi resolvido.', date: new Date('2025-01-14T10:00:00') },
    ],
  },
];

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);

const timeAgo = (date: Date) => {
  const now = new Date('2025-01-17T18:00:00');
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 0) return `${diffDays}d atrás`;
  if (diffHours > 0) return `${diffHours}h atrás`;
  return 'Agora';
};

export const SupportTicketsModule: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'question' as TicketCategory, priority: 'medium' as TicketPriority, message: '' });

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;

  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || t.status === statusFilter;
    const matchesCategory = !categoryFilter || t.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateTicket = () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) return;
    const id = `TKT-${String(tickets.length + 1).padStart(3, '0')}`;
    const now = new Date();
    const ticket: Ticket = {
      id,
      subject: newTicket.subject.trim(),
      category: newTicket.category,
      status: 'open',
      priority: newTicket.priority,
      createdBy: 'Usuário Atual',
      createdAt: now,
      updatedAt: now,
      assignedTo: null,
      messages: [{
        id: `m-${Date.now()}`,
        author: 'Usuário Atual',
        isSupport: false,
        message: newTicket.message.trim(),
        date: now,
      }],
    };
    setTickets(prev => [ticket, ...prev]);
    setNewTicket({ subject: '', category: 'question', priority: 'medium', message: '' });
    setShowNewForm(false);
    showToast('success', 'Chamado criado com sucesso');
  };

  const handleReply = () => {
    if (!selectedTicketId || !replyText.trim()) return;
    const newMsg: TicketMessage = {
      id: `m-${Date.now()}`,
      author: 'Usuário Atual',
      isSupport: false,
      message: replyText.trim(),
      date: new Date(),
    };
    setTickets(prev => prev.map(t =>
      t.id === selectedTicketId
        ? { ...t, messages: [...t.messages, newMsg], updatedAt: new Date(), status: t.status === 'waiting_response' ? 'in_progress' as const : t.status }
        : t
    ));
    setReplyText('');
    showToast('success', 'Resposta enviada');
  };

  // Stats
  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const waitingCount = tickets.filter(t => t.status === 'waiting_response').length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{openCount}</p>
              <p className="text-xs text-gray-500">Abertos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
              <p className="text-xs text-gray-500">Em andamento</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{waitingCount}</p>
              <p className="text-xs text-gray-500">Aguardando resposta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por assunto, ID ou autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas categorias</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              Novo Chamado
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredTickets.map(ticket => {
            const statusCfg = STATUS_CONFIG[ticket.status];
            const priorityCfg = PRIORITY_CONFIG[ticket.priority];
            const lastMsg = ticket.messages[ticket.messages.length - 1];

            return (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className="px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-400">{ticket.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.style}`}>
                        {statusCfg.icon}
                        {statusCfg.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityCfg.style}`}>
                        {priorityCfg.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                        {CATEGORY_LABELS[ticket.category]}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</h4>
                    <p className="text-xs text-gray-500 mt-1 truncate">{lastMsg.message}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{timeAgo(ticket.updatedAt)}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{ticket.createdBy}</p>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <MessageSquare className="w-3 h-3 text-gray-300" />
                      <span className="text-[11px] text-gray-400">{ticket.messages.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Nenhum chamado encontrado</p>
            <p className="text-xs text-gray-400 mt-1">Ajuste os filtros ou crie um novo chamado</p>
          </div>
        )}
      </div>

      {/* Ticket detail modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-400">{selectedTicket.id}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedTicket.status].style}`}>
                      {STATUS_CONFIG[selectedTicket.status].icon}
                      {STATUS_CONFIG[selectedTicket.status].label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_CONFIG[selectedTicket.priority].style}`}>
                      {PRIORITY_CONFIG[selectedTicket.priority].label}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>Aberto por {selectedTicket.createdBy}</span>
                    <span className="text-gray-300">·</span>
                    <span>{formatDateTime(selectedTicket.createdAt)}</span>
                    {selectedTicket.assignedTo && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span>Atribuído a {selectedTicket.assignedTo}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedTicketId(null); setReplyText(''); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {selectedTicket.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isSupport ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${msg.isSupport ? 'bg-gray-100' : 'bg-blue-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className={`text-xs font-medium ${msg.isSupport ? 'text-gray-700' : 'text-blue-700'}`}>
                        {msg.author}
                      </span>
                      <span className="text-[11px] text-gray-400">{formatDateTime(msg.date)}</span>
                    </div>
                    <p className="text-sm text-gray-800">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply */}
            {selectedTicket.status !== 'closed' && (
              <div className="flex-shrink-0 border-t border-gray-200 px-6 py-3 bg-gray-50">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Escreva sua resposta..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && replyText.trim()) handleReply(); }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    Enviar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New ticket modal */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Novo Chamado</h2>
              <button
                onClick={() => setShowNewForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Descreva brevemente o problema..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value as TicketCategory }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as TicketPriority }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Descreva o problema ou solicitação em detalhes..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={!newTicket.subject.trim() || !newTicket.message.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Criar Chamado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
