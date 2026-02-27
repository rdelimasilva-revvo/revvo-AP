import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  BarChart3,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldAlert,
  FileText,
  LayoutDashboard,
  CalendarDays,
  FileCheck,
  FolderOpen,
  ClipboardCheck,
  Users,
  Settings,
  FileCode,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onHelpClick?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  subItems?: { id: string; label: string }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, collapsed, onToggleCollapse, onHelpClick: _onHelpClick }) => {
  const [monitoringExpanded, setMonitoringExpanded] = useState(true);
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [operationsExpanded, setOperationsExpanded] = useState(false);
  const [configExpanded, setConfigExpanded] = useState(false);
  const [monitoriaExpanded, setMonitoriaExpanded] = useState(false);
  const [helpExpanded, setHelpExpanded] = useState(false);
  const [cnabExpanded, setCnabExpanded] = useState(false);
  const [disputesExpanded, setDisputesExpanded] = useState(false);
  const [accessManagementExpanded, setAccessManagementExpanded] = useState(false);

  const btnClass = (active: boolean) =>
    `w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${
      active
        ? 'bg-emerald-50 text-emerald-700 font-medium'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  const iconClass = (active: boolean) =>
    `w-[18px] h-[18px] mr-3 flex-shrink-0 ${active ? 'text-emerald-600' : 'text-gray-400'}`;

  const subBtnClass = (active: boolean) =>
    `w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
      active
        ? 'text-emerald-700 font-medium bg-emerald-50'
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`;

  const expandBtnClass = (active: boolean) =>
    `w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${
      active
        ? 'bg-emerald-50 text-emerald-700 font-medium'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  const monitoringSubItems = [
    { id: 'management-view', label: 'Visão gerencial' },
    { id: 'monitoring', label: 'Visão de volume' },
    { id: 'contracts-monitoring', label: 'Contratos' },
    { id: 'liquidation-problems', label: 'Problemas de liquidação' },
    { id: 'chargeback-monitoring', label: 'Chargeback' },
  ];

  const reportsSubItems = [
    { id: 'settlement-control', label: 'Liquidações' },
    { id: 'receivables-ledger', label: 'Conta corrente das URs' },
  ];

  const operationsSubItems = [
    { id: 'contracts', label: 'Ativas' },
    { id: 'contract-approval', label: 'Pendentes de aprovação' },
  ];

  const configSubItems = [
    { id: 'financial', label: 'Financeiro' },
    { id: 'opt-in', label: 'Opt-in' },
    { id: 'settlement-domicile', label: 'Domicílio de Liquidação' },
    { id: 'partner-registration', label: 'Cadastro de Clientes' },
    { id: 'notifications', label: 'Notificações' },
    { id: 'menu-setup', label: 'Configuração de Menus' },
    { id: 'control-panel', label: 'Painel de Controle' },
  ];

  const cnabSubItems = [
    { id: 'cnab-generator', label: 'Gerador de CNAB' },
    { id: 'cnab-connections', label: 'Conexão Leitores' },
  ];

  const disputesSubItems = [
    { id: 'disputes', label: 'Contestações abertas' },
    { id: 'disputes-automation', label: 'Automações' },
  ];

  const accessManagementSubItems = [
    { id: 'user-management', label: 'Gerenciamento de Usuários' },
    { id: 'role-permissions', label: 'Perfis e Permissões' },
    { id: 'access-logs', label: 'Logs de Acesso' },
  ];

  const monitoriaSubItems = [
    { id: 'file-processing', label: 'Processamento dos arquivos' },
    { id: 'report-processing', label: 'Processamento dos relatórios' },
    { id: 'cnab-generator', label: 'Gerador de CNAB' },
    { id: 'cnab-connections', label: 'Conexão Leitores' },
  ];

  // Mini-icon items for collapsed sidebar — PRINCIPAL
  const collapsedPrincipalItems: NavItem[] = [
    { id: 'overview', label: 'Captura de recebíveis', icon: LayoutDashboard },
    { id: 'schedule-view', label: 'Visão de Agendas', icon: CalendarDays },
    { id: 'contracts', label: 'Operações', icon: FolderOpen, subItems: operationsSubItems },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'formalization', label: 'Formalização', icon: FileCheck },
  ];

  // Mini-icon items — ACOMPANHAMENTO
  const collapsedAcompanhamentoItems: NavItem[] = [
    { id: 'monitoring', label: 'Monitoramento', icon: BarChart3, subItems: monitoringSubItems },
    { id: 'settlement-control', label: 'Relatórios', icon: FileText, subItems: reportsSubItems },
    { id: 'disputes', label: 'Contestação', icon: ShieldAlert, subItems: disputesSubItems },
  ];

  // Mini-icon items — CONFIGURAÇÕES
  const collapsedConfigItems: NavItem[] = [
    { id: 'financial', label: 'Geral', icon: Settings, subItems: configSubItems },
    { id: 'user-management', label: 'Gestão de acessos', icon: Shield, subItems: accessManagementSubItems },
  ];

  // Mini-icon items — SUPORTE
  const collapsedSuporteItems: NavItem[] = [
    { id: 'file-processing', label: 'Gestão de Arquivos', icon: BarChart3, subItems: monitoriaSubItems },
    { id: 'support-tickets', label: 'Ajuda e Suporte', icon: HelpCircle },
  ];

  // Collapsed sidebar view (mini-icons only)
  if (collapsed) {
    const isActive = (item: NavItem) => {
      if (activeSection === item.id) return true;
      if (item.subItems) return item.subItems.some(sub => activeSection === sub.id);
      return false;
    };

    const renderCollapsedItem = (item: NavItem) => {
      const Icon = item.icon;
      const active = isActive(item);
      return (
        <div key={item.id} className="relative group">
          <button
            onClick={() => {
              if (item.subItems) {
                setActiveSection(item.subItems[0].id);
              } else {
                setActiveSection(item.id);
              }
              onToggleCollapse();
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              active
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
            aria-label={item.label}
          >
            <Icon className="w-[18px] h-[18px]" />
          </button>
          {/* Tooltip on hover */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
            {item.label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
          </div>
        </div>
      );
    };

    return (
      <div className="bg-white border-r border-gray-100 h-screen w-16 fixed left-0 top-0 z-30 flex-col hidden lg:flex">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 flex-shrink-0 border-b border-gray-100">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            title="Expandir menu"
            aria-label="Expandir menu"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation icons */}
        <nav className="flex-1 overflow-y-auto py-4 flex flex-col items-center space-y-1">
          {collapsedPrincipalItems.map(renderCollapsedItem)}

          <div className="w-6 border-t border-gray-200 my-2" />

          {collapsedAcompanhamentoItems.map(renderCollapsedItem)}

          <div className="w-6 border-t border-gray-200 my-2" />

          {collapsedConfigItems.map(renderCollapsedItem)}

          <div className="w-6 border-t border-gray-200 my-2" />

          {collapsedSuporteItems.map(renderCollapsedItem)}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 py-3 flex-shrink-0 flex justify-center">
          <img
            src="https://07iiwshc01.ufs.sh/f/0LiFpsMBmMUkWAQg1k3HwAgE6s7fmeklnvRFyTb5SxjoULtX"
            alt="CERC"
            className="h-3 w-auto opacity-50"
          />
        </div>
      </div>
    );
  }

  const renderExpandable = (
    key: string,
    icon: React.ElementType,
    label: string,
    expanded: boolean,
    setExpanded: (v: boolean) => void,
    subItems: { id: string; label: string }[],
  ) => {
    const Icon = icon;
    const isAnyActive = subItems.some(sub => activeSection === sub.id);
    return (
      <div key={key}>
        <button
          onClick={() => setExpanded(!expanded)}
          className={expandBtnClass(isAnyActive)}
          aria-expanded={expanded}
        >
          <div className="flex items-center">
            <Icon className={iconClass(isAnyActive)} />
            <span>{label}</span>
          </div>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {expanded && (
          <div className="mt-1 ml-5 pl-4 border-l border-gray-200 space-y-1">
            {subItems.map((subItem) => (
              <button
                key={subItem.id}
                onClick={() => setActiveSection(subItem.id)}
                className={subBtnClass(activeSection === subItem.id)}
              >
                {subItem.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSimple = (id: string, icon: React.ElementType, label: string) => {
    const Icon = icon;
    const active = activeSection === id;
    return (
      <button
        key={id}
        onClick={() => setActiveSection(id)}
        className={btnClass(active)}
      >
        <Icon className={iconClass(active)} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 z-30 bg-black/20 lg:hidden"
        onClick={onToggleCollapse}
      />

      <div className="bg-white border-r border-gray-100 h-screen w-[280px] sm:w-64 fixed left-0 top-0 z-30 flex flex-col">
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 flex-shrink-0 border-b border-gray-100">
          <div className="flex items-center space-x-2.5">
            <img
              src="https://07iiwshc01.ufs.sh/f/0LiFpsMBmMUk1KdzLnbanW4CiUlp7AaDvuoZtTx8NYPy2jes"
              alt="Logo"
              className="h-7 w-auto"
            />
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            title="Recolher menu"
            aria-label="Recolher menu"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 pt-6">
          {/* PRINCIPAL section */}
          <p className="px-3 mb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Principal</p>

          <div className="space-y-1">
            {renderSimple('overview', LayoutDashboard, 'Captura de recebíveis')}
            {renderSimple('schedule-view', CalendarDays, 'Visão de Agendas')}
            {renderExpandable('operations-group', FolderOpen, 'Operações', operationsExpanded, setOperationsExpanded, operationsSubItems)}
            {renderSimple('clients', Users, 'Clientes')}
            {renderSimple('formalization', FileCheck, 'Formalização')}
          </div>

          {/* ACOMPANHAMENTO section */}
          <p className="px-3 mt-8 mb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Acompanhamento</p>

          <div className="space-y-1">
            {renderExpandable('monitoring-group', BarChart3, 'Monitoramento', monitoringExpanded, setMonitoringExpanded, monitoringSubItems)}
            {renderExpandable('reports-group', FileText, 'Relatórios', reportsExpanded, setReportsExpanded, reportsSubItems)}
            {renderExpandable('disputes-group', ShieldAlert, 'Contestação', disputesExpanded, setDisputesExpanded, disputesSubItems)}
          </div>

          {/* CONFIGURACOES section */}
          <p className="px-3 mt-8 mb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Configurações</p>

          <div className="space-y-1">
            {renderExpandable('config-group', Settings, 'Geral', configExpanded, setConfigExpanded, configSubItems)}
            {renderExpandable('access-management-group', Shield, 'Gestão de acessos', accessManagementExpanded, setAccessManagementExpanded, accessManagementSubItems)}
          </div>

          {/* SUPORTE section */}
          <p className="px-3 mt-8 mb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Suporte</p>

          <div className="space-y-1">
            {renderExpandable('monitoria-group', BarChart3, 'Gestão de Arquivos', monitoriaExpanded, setMonitoriaExpanded, monitoriaSubItems)}
            {renderExpandable('help-group', HelpCircle, 'Ajuda e Suporte', helpExpanded, setHelpExpanded, [
              { id: 'support-tickets', label: 'Chamados em aberto' },
              { id: 'support-faq', label: 'FAQ' },
            ])}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-center gap-2">
            <img
              src="https://07iiwshc01.ufs.sh/f/0LiFpsMBmMUkWAQg1k3HwAgE6s7fmeklnvRFyTb5SxjoULtX"
              alt="CERC"
              className="h-4 w-auto"
            />
            <span className="text-[10px] text-gray-400">partner</span>
          </div>
        </div>
      </div>
    </>
  );
};
