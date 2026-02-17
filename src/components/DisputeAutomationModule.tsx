import React, { useState } from 'react';
import {
  Zap, ShieldAlert, TrendingDown, ChevronDown, ChevronRight,
  Info, Save, ToggleLeft, ToggleRight, Clock, AlertTriangle,
  Search, Filter, ExternalLink, CheckCircle, XCircle
} from 'lucide-react';
import { showToast } from '../hooks/useToast';

type RulePriority = 'low' | 'medium' | 'high' | 'critical';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: RulePriority;
  autoAssignTo: string;
  thresholdPercent: number;
  createdAt: Date;
  lastTriggered: Date | null;
  triggerCount: number;
}

interface TriggerLog {
  id: string;
  ruleId: string;
  ruleName: string;
  disputeId: string;
  urId: string;
  clientName: string;
  originalValue: number;
  detectedValue: number;
  difference: number;
  differencePercent: number;
  priority: RulePriority;
  assignedTo: string;
  triggeredAt: Date;
  status: 'opened' | 'auto_resolved' | 'failed';
}

const PRIORITY_LABELS: Record<RulePriority, string> = {
  low: 'Baixa', medium: 'Média', high: 'Alta', critical: 'Crítica',
};

const PRIORITY_STYLES: Record<RulePriority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const initialRules: AutomationRule[] = [
  {
    id: 'rule-blocked-reduction',
    name: 'URs bloqueadas com redução de valor',
    description: 'Abre contestação quando uma UR é bloqueada e seu valor onerado sofre redução em relação ao valor original.',
    enabled: true,
    priority: 'high',
    autoAssignTo: '',
    thresholdPercent: 0,
    createdAt: new Date('2025-01-10'),
    lastTriggered: new Date('2025-01-17T14:32:00'),
    triggerCount: 12,
  },
  {
    id: 'rule-settled-less',
    name: 'URs liquidadas a menor',
    description: 'Abre contestação quando uma UR é liquidada por valor inferior ao valor onerado previsto na agenda.',
    enabled: false,
    priority: 'critical',
    autoAssignTo: '',
    thresholdPercent: 5,
    createdAt: new Date('2025-01-12'),
    lastTriggered: new Date('2025-01-16T09:15:00'),
    triggerCount: 4,
  },
];

const mockTriggerLogs: TriggerLog[] = [
  {
    id: 'log-001', ruleId: 'rule-blocked-reduction', ruleName: 'URs bloqueadas com redução de valor',
    disputeId: 'CTT-008', urId: 'ur-022', clientName: 'ABC Comércio Ltda',
    originalValue: 15200.00, detectedValue: 12800.00, difference: 2400.00, differencePercent: 15.79,
    priority: 'high', assignedTo: 'Fila geral', triggeredAt: new Date('2025-01-17T14:32:00'), status: 'opened',
  },
  {
    id: 'log-002', ruleId: 'rule-blocked-reduction', ruleName: 'URs bloqueadas com redução de valor',
    disputeId: 'CTT-009', urId: 'ur-045', clientName: 'XYZ Indústria S.A.',
    originalValue: 8750.00, detectedValue: 7100.00, difference: 1650.00, differencePercent: 18.86,
    priority: 'high', assignedTo: 'Fila geral', triggeredAt: new Date('2025-01-17T11:20:00'), status: 'opened',
  },
  {
    id: 'log-003', ruleId: 'rule-settled-less', ruleName: 'URs liquidadas a menor',
    disputeId: 'CTT-010', urId: 'ur-031', clientName: 'Varejo Prime Eireli',
    originalValue: 22400.00, detectedValue: 19800.00, difference: 2600.00, differencePercent: 11.61,
    priority: 'critical', assignedTo: 'Fila geral', triggeredAt: new Date('2025-01-16T09:15:00'), status: 'opened',
  },
  {
    id: 'log-004', ruleId: 'rule-blocked-reduction', ruleName: 'URs bloqueadas com redução de valor',
    disputeId: 'CTT-011', urId: 'ur-018', clientName: 'Tech Solutions ME',
    originalValue: 5600.00, detectedValue: 5600.00, difference: 0, differencePercent: 0,
    priority: 'high', assignedTo: 'Fila geral', triggeredAt: new Date('2025-01-16T08:45:00'), status: 'auto_resolved',
  },
  {
    id: 'log-005', ruleId: 'rule-blocked-reduction', ruleName: 'URs bloqueadas com redução de valor',
    disputeId: 'CTT-012', urId: 'ur-067', clientName: 'Distribuidora Nacional Ltda',
    originalValue: 31000.00, detectedValue: 27500.00, difference: 3500.00, differencePercent: 11.29,
    priority: 'high', assignedTo: 'Fila geral', triggeredAt: new Date('2025-01-15T16:50:00'), status: 'opened',
  },
  {
    id: 'log-006', ruleId: 'rule-settled-less', ruleName: 'URs liquidadas a menor',
    disputeId: 'CTT-013', urId: 'ur-089', clientName: 'Supermercado Bom Preço',
    originalValue: 42000.00, detectedValue: 38200.00, difference: 3800.00, differencePercent: 9.05,
    priority: 'critical', assignedTo: 'Fila geral', triggeredAt: new Date('2025-01-15T14:10:00'), status: 'opened',
  },
  {
    id: 'log-007', ruleId: 'rule-blocked-reduction', ruleName: 'URs bloqueadas com redução de valor',
    disputeId: 'CTT-014', urId: 'ur-012', clientName: 'ABC Comércio Ltda',
    originalValue: 9300.00, detectedValue: 8100.00, difference: 1200.00, differencePercent: 12.90,
    priority: 'high', assignedTo: 'Fila geral', triggeredAt: new Date('2025-01-15T10:05:00'), status: 'opened',
  },
  {
    id: 'log-008', ruleId: 'rule-blocked-reduction', ruleName: 'URs bloqueadas com redução de valor',
    disputeId: 'CTT-015', urId: 'ur-055', clientName: 'Farmácia Popular S.A.',
    originalValue: 6800.00, detectedValue: 6800.00, difference: 0, differencePercent: 0,
    priority: 'high', assignedTo: 'Fila geral', triggeredAt: new Date('2025-01-14T17:30:00'), status: 'failed',
  },
  {
    id: 'log-009', ruleId: 'rule-settled-less', ruleName: 'URs liquidadas a menor',
    disputeId: 'CTT-016', urId: 'ur-041', clientName: 'Loja do Centro ME',
    originalValue: 18500.00, detectedValue: 16200.00, difference: 2300.00, differencePercent: 12.43,
    priority: 'critical', assignedTo: 'Fila geral', triggeredAt: new Date('2025-01-14T11:22:00'), status: 'opened',
  },
  {
    id: 'log-010', ruleId: 'rule-blocked-reduction', ruleName: 'URs bloqueadas com redução de valor',
    disputeId: 'CTT-017', urId: 'ur-078', clientName: 'Materiais Express Ltda',
    originalValue: 12100.00, detectedValue: 10400.00, difference: 1700.00, differencePercent: 14.05,
    priority: 'high', assignedTo: 'Fila geral', triggeredAt: new Date('2025-01-13T15:40:00'), status: 'opened',
  },
];

const ASSIGNEE_OPTIONS = [
  { value: '', label: 'Não atribuir (fila geral)' },
  { value: 'João Silva', label: 'João Silva' },
  { value: 'Maria Santos', label: 'Maria Santos' },
  { value: 'Carlos Oliveira', label: 'Carlos Oliveira' },
  { value: 'Ana Costa', label: 'Ana Costa' },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);

export const DisputeAutomationModule: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>(initialRules);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [logRuleFilter, setLogRuleFilter] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState('');

  const toggleRule = (ruleId: string) => {
    setRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
    setHasChanges(true);
  };

  const updateRule = (ruleId: string, updates: Partial<AutomationRule>) => {
    setRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, ...updates } : r))
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    showToast('success', 'Regras de automação salvas com sucesso');
  };

  const toggleExpand = (ruleId: string) => {
    setExpandedRule(prev => (prev === ruleId ? null : ruleId));
  };

  const filteredLogs = mockTriggerLogs.filter(log => {
    const matchesSearch =
      log.clientName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.urId.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.disputeId.toLowerCase().includes(logSearch.toLowerCase());
    const matchesRule = !logRuleFilter || log.ruleId === logRuleFilter;
    const matchesStatus = !logStatusFilter || log.status === logStatusFilter;
    return matchesSearch && matchesRule && matchesStatus;
  });

  // Summary stats
  const totalTriggers = rules.reduce((sum, r) => sum + r.triggerCount, 0);
  const activeRules = rules.filter(r => r.enabled).length;
  const totalDifference = mockTriggerLogs
    .filter(l => l.status === 'opened')
    .reduce((sum, l) => sum + l.difference, 0);

  return (
    <div className="space-y-6">
      {/* Unsaved changes banner */}
      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4" />
            <span>Você tem alterações não salvas</span>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Salvar
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalTriggers}</p>
              <p className="text-xs text-gray-500">Contestações abertas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <ShieldAlert className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeRules} <span className="text-sm font-normal text-gray-400">/ {rules.length}</span></p>
              <p className="text-xs text-gray-500">Regras ativas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-4.5 h-4.5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDifference)}</p>
              <p className="text-xs text-gray-500">Total contestado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rules - side by side */}
      <div className="grid grid-cols-2 gap-4">
        {rules.map(rule => {
          const isExpanded = expandedRule === rule.id;
          const iconBg = rule.id === 'rule-blocked-reduction' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600';
          const icon = rule.id === 'rule-blocked-reduction'
            ? <ShieldAlert className="w-5 h-5" />
            : <TrendingDown className="w-5 h-5" />;

          return (
            <div
              key={rule.id}
              className={`bg-white rounded-xl shadow-sm border transition-colors ${
                rule.enabled ? 'border-emerald-200' : 'border-gray-200'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 leading-tight">{rule.name}</h3>
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className="flex-shrink-0"
                        title={rule.enabled ? 'Desativar regra' : 'Ativar regra'}
                      >
                        {rule.enabled ? (
                          <ToggleRight className="w-7 h-7 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-gray-300" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{rule.description}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rule.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {rule.enabled ? 'Ativa' : 'Inativa'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLES[rule.priority]}`}>
                    {PRIORITY_LABELS[rule.priority]}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {rule.triggerCount} disparos
                  </span>
                </div>

                {rule.lastTriggered && (
                  <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Último: {formatDateTime(rule.lastTriggered)}
                  </p>
                )}

                <button
                  onClick={() => toggleExpand(rule.id)}
                  className="flex items-center gap-1 mt-3 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  Configurações
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-4 bg-gray-50/50">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Prioridade</label>
                      <select
                        value={rule.priority}
                        onChange={(e) => updateRule(rule.id, { priority: e.target.value as RulePriority })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Atribuir a</label>
                      <select
                        value={rule.autoAssignTo}
                        onChange={(e) => updateRule(rule.id, { autoAssignTo: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {ASSIGNEE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tolerância mínima</label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={rule.thresholdPercent}
                          onChange={(e) => updateRule(rule.id, { thresholdPercent: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">0% = qualquer diferença dispara.</p>
                    </div>
                  </div>

                  <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                    <div className="flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-blue-700 leading-relaxed">
                        {rule.id === 'rule-blocked-reduction'
                          ? 'Monitora URs bloqueadas e compara valor onerado com o original. Contestação aberta com motivo "Valor divergente".'
                          : 'Monitora liquidações e compara valor liquidado com o onerado previsto. Contestação aberta com motivo "Valor divergente".'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trigger history */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900">Histórico de Disparos</h3>
              <span className="text-xs text-gray-400">({filteredLogs.length})</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por cliente, UR ou contestação..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={logRuleFilter}
              onChange={(e) => setLogRuleFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as regras</option>
              {rules.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <select
              value={logStatusFilter}
              onChange={(e) => setLogStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="opened">Aberta</option>
              <option value="auto_resolved">Auto-resolvida</option>
              <option value="failed">Falha</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-[100px] px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regra</th>
                <th className="w-[90px] px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contestação</th>
                <th className="w-[80px] px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UR</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="w-[110px] px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor orig.</th>
                <th className="w-[110px] px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Diferença</th>
                <th className="w-[90px] px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="text-xs text-gray-500">{formatDate(log.triggeredAt)}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {log.ruleId === 'rule-blocked-reduction' ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-xs text-gray-700 truncate">{log.ruleName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="text-xs font-semibold text-blue-600">{log.disputeId}</span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="text-xs text-gray-700">{log.urId}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs text-gray-900 truncate block">{log.clientName}</span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-right">
                    <span className="text-xs text-gray-700">{formatCurrency(log.originalValue)}</span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-right">
                    {log.difference > 0 ? (
                      <div>
                        <span className="text-xs font-medium text-red-600">-{formatCurrency(log.difference)}</span>
                        <span className="text-[10px] text-gray-400 ml-1">({log.differencePercent.toFixed(1)}%)</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {log.status === 'opened' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" />
                        Aberta
                      </span>
                    )}
                    {log.status === 'auto_resolved' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        <Zap className="w-3 h-3" />
                        Resolvida
                      </span>
                    )}
                    {log.status === 'failed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <XCircle className="w-3 h-3" />
                        Falha
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-10">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nenhum disparo encontrado</p>
              <p className="text-xs text-gray-400 mt-1">Ajuste os filtros ou aguarde novos disparos</p>
            </div>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800">Como funcionam as automações</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• <strong>URs bloqueadas com redução:</strong> Quando uma UR é bloqueada e seu valor onerado é inferior ao original, o sistema abre contestação automaticamente.</li>
              <li>• <strong>URs liquidadas a menor:</strong> Quando o valor liquidado é inferior ao previsto, o sistema abre contestação automaticamente.</li>
              <li>• <strong>Tolerância:</strong> Diferença percentual mínima para disparo. 0% = qualquer diferença gera contestação.</li>
              <li>• <strong>Histórico:</strong> Todos os disparos ficam registrados com rastreabilidade completa (UR, contestação gerada, valores).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
