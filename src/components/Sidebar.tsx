import React, { useState } from 'react';
import {
  Users,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Sliders,
  CheckSquare,
  Building2,
  BarChart3,
  FileCheck,
  Wallet,
  Calendar,
  LayoutDashboard,
  HelpCircle,
  PanelLeftClose,
  ClipboardCheck,
  List,
  ShieldAlert,
  Bot
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onHelpClick?: () => void;
  pendingApprovalCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, collapsed, onToggleCollapse, onHelpClick, pendingApprovalCount = 0 }) => {
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [operationsExpanded, setOperationsExpanded] = useState(false);
  const [disputesExpanded, setDisputesExpanded] = useState(false);
  const [helpExpanded, setHelpExpanded] = useState(false);
  const [cnabExpanded, setCnabExpanded] = useState(false);
  const [aiToolsExpanded, setAiToolsExpanded] = useState(false);
  const [menuVisibility, setMenuVisibility] = useState(() => {
    const saved = localStorage.getItem('menuVisibilitySettings');
    return saved ? JSON.parse(saved) : {
      overview: true,
      scheduleView: true,
      formalization: true,
      contractsMenu: true,
      monitoring: true,
      settlementControl: true,
      disputes: true,
      optIn: true,
      settlementDomicile: true,
      partnerRegistration: true,
      aiTools: true,
      menuSetup: true,
      operationParameters: true,
      cnabGroup: true,
    };
  });

  const allMenuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Captura de Recebíveis', visibilityKey: 'overview' },
    { id: 'schedule-view', icon: Calendar, label: 'Visão de agendas', visibilityKey: 'scheduleView' },
    { id: 'contracts-menu', icon: FileText, label: 'Operações', visibilityKey: 'contractsMenu' },
    { id: 'monitoring', icon: BarChart3, label: 'Monitoramento', visibilityKey: 'monitoring' },
    { id: 'settlement-control', icon: Wallet, label: 'Liquidações', visibilityKey: 'settlementControl' },
    { id: 'disputes', icon: ShieldAlert, label: 'Contestação', visibilityKey: 'disputes' },
  ];

  const allSettingsSubItems = [
    { id: 'formalization', icon: FileCheck, label: 'Formalização', visibilityKey: 'formalization' },
    { id: 'menu-setup', icon: Sliders, label: 'Configuração de Menus', visibilityKey: 'menuSetup' },
    { id: 'operation-parameters', icon: Settings, label: 'Parâmetros de Operação', visibilityKey: 'operationParameters' },
    { id: 'opt-in', icon: CheckSquare, label: 'Opt-in', visibilityKey: 'optIn' },
    { id: 'settlement-domicile', icon: Building2, label: 'Domicílio de Liquidação', visibilityKey: 'settlementDomicile' },
    { id: 'partner-registration', icon: Users, label: 'Cadastro de Clientes', visibilityKey: 'partnerRegistration' },
    { id: 'cnab-group', icon: FileText, label: 'Gerador de CNAB', visibilityKey: 'cnabGroup' },
  ];

  const menuItems = allMenuItems.filter(item => menuVisibility[item.visibilityKey] !== false);
  const settingsSubItems = allSettingsSubItems.filter(item =>
    item.visibilityKey === null || menuVisibility[item.visibilityKey] !== false
  );

  React.useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('menuVisibilitySettings');
      if (saved) {
        setMenuVisibility(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('menuVisibilityChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('menuVisibilityChanged', handleStorageChange);
    };
  }, []);

  if (collapsed) return null;

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
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 pt-6">
          {/* MENU section label */}
          <p className="px-3 mb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Menu</p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              if (item.id === 'contracts-menu') {
                const operationsSubItems = [
                  { id: 'contracts-menu', icon: List, label: 'Ativas' },
                  { id: 'contract-approval', icon: ClipboardCheck, label: 'Aguardando aprovação', badge: pendingApprovalCount },
                ];
                const isAnySubActive = operationsSubItems.some(sub => activeSection === sub.id);

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => setOperationsExpanded(!operationsExpanded)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${
                        isAnySubActive
                          ? 'bg-emerald-50 text-emerald-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className={`w-[18px] h-[18px] mr-3 flex-shrink-0 ${isAnySubActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {operationsExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {operationsExpanded && (
                      <div className="mt-1 ml-5 pl-4 border-l border-gray-200 space-y-1">
                        {operationsSubItems.map((subItem) => {
                          const isSubActive = activeSection === subItem.id;
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => setActiveSection(subItem.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm flex items-center justify-between ${
                                isSubActive
                                  ? 'text-emerald-700 font-medium bg-emerald-50'
                                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <span>{subItem.label}</span>
                              {'badge' in subItem && typeof subItem.badge === 'number' && subItem.badge > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-red-500 rounded-full">
                                  {subItem.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              if (item.id === 'disputes') {
                const disputesSubItems = [
                  { id: 'disputes', label: 'Em andamento' },
                  { id: 'disputes-automation', label: 'Automações' },
                ];
                const isAnySubActive = disputesSubItems.some(sub => activeSection === sub.id);

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => setDisputesExpanded(!disputesExpanded)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${
                        isAnySubActive
                          ? 'bg-emerald-50 text-emerald-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className={`w-[18px] h-[18px] mr-3 flex-shrink-0 ${isAnySubActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {disputesExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {disputesExpanded && (
                      <div className="mt-1 ml-5 pl-4 border-l border-gray-200 space-y-1">
                        {disputesSubItems.map((subItem) => {
                          const isSubActive = activeSection === subItem.id;
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => setActiveSection(subItem.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                                isSubActive
                                  ? 'text-emerald-700 font-medium bg-emerald-50'
                                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              {subItem.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] mr-3 flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* AI-TOOLS section */}
          {menuVisibility.aiTools !== false && (
            <>
              <p className="px-3 mt-8 mb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">AI-tools</p>

              <div className="space-y-1">
                {(() => {
                  const aiSubItems = [
                    { id: 'ai-agents-overview', label: 'Visão dos agentes' },
                    { id: 'ai-agents-active', label: 'Agentes ativos' },
                    { id: 'ai-agents-creator', label: 'Criador de agentes' },
                  ];
                  const isAnyAiActive = aiSubItems.some(sub => activeSection === sub.id);

                  return (
                    <div>
                      <button
                        onClick={() => setAiToolsExpanded(!aiToolsExpanded)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${
                          isAnyAiActive
                            ? 'bg-emerald-50 text-emerald-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center">
                          <Bot className={`w-[18px] h-[18px] mr-3 flex-shrink-0 ${isAnyAiActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                          <span>Agentes</span>
                        </div>
                        {aiToolsExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      {aiToolsExpanded && (
                        <div className="mt-1 ml-5 pl-4 border-l border-gray-200 space-y-1">
                          {aiSubItems.map(subItem => {
                            const isSubActive = activeSection === subItem.id;
                            return (
                              <button
                                key={subItem.id}
                                onClick={() => setActiveSection(subItem.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                                  isSubActive
                                    ? 'text-emerald-700 font-medium bg-emerald-50'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                {subItem.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          {/* OUTROS section */}
          <p className="px-3 mt-8 mb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Outros</p>

          <div className="space-y-1">
            {/* Configurações (expandable) */}
            <div>
              <button
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${
                  settingsExpanded
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <Settings className={`w-[18px] h-[18px] mr-3 flex-shrink-0 ${settingsExpanded ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span>Configurações</span>
                </div>
                {settingsExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {settingsExpanded && (
                <div className="mt-1 ml-5 pl-4 border-l border-gray-200 space-y-1">
                  {settingsSubItems.map((subItem) => {
                    if (subItem.id === 'cnab-group') {
                      const cnabSubItems = [
                        { id: 'cnab-generator', label: 'Mapeamento' },
                        { id: 'cnab-connections', label: 'Conexão Leitores' },
                      ];
                      const isAnyCnabActive = cnabSubItems.some(c => activeSection === c.id);

                      return (
                        <div key={subItem.id}>
                          <button
                            onClick={() => setCnabExpanded(!cnabExpanded)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                              isAnyCnabActive
                                ? 'text-emerald-700 font-medium bg-emerald-50'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <span>{subItem.label}</span>
                            {cnabExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </button>
                          {cnabExpanded && (
                            <div className="mt-1 ml-4 pl-3 border-l border-gray-200 space-y-1">
                              {cnabSubItems.map(cnabItem => {
                                const isCnabActive = activeSection === cnabItem.id;
                                return (
                                  <button
                                    key={cnabItem.id}
                                    onClick={() => setActiveSection(cnabItem.id)}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors text-sm ${
                                      isCnabActive
                                        ? 'text-emerald-700 font-medium bg-emerald-50'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                  >
                                    {cnabItem.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    const isSubActive = activeSection === subItem.id;
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => setActiveSection(subItem.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          isSubActive
                            ? 'text-emerald-700 font-medium bg-emerald-50'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {subItem.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ajuda e Suporte (expandable) */}
            <div>
              <button
                onClick={() => setHelpExpanded(!helpExpanded)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${
                  helpExpanded || activeSection === 'support-tickets' || activeSection === 'support-faq'
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <HelpCircle className={`w-[18px] h-[18px] mr-3 flex-shrink-0 ${
                    helpExpanded || activeSection === 'support-tickets' || activeSection === 'support-faq' ? 'text-emerald-600' : 'text-gray-400'
                  }`} />
                  <span>Ajuda e Suporte</span>
                </div>
                {helpExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {helpExpanded && (
                <div className="mt-1 ml-5 pl-4 border-l border-gray-200 space-y-1">
                  {[
                    { id: 'support-tickets', label: 'Chamados em aberto' },
                    { id: 'support-faq', label: 'FAQ' },
                  ].map(subItem => {
                    const isSubActive = activeSection === subItem.id;
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => setActiveSection(subItem.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          isSubActive
                            ? 'text-emerald-700 font-medium bg-emerald-50'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {subItem.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Footer — powered by */}
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
