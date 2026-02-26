import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProductModule } from './components/ProductModule';
import { ClientDetail } from './components/ClientDetail';
import { ClientDetailTest } from './components/ClientDetailTest';
import { ClientRadar } from './components/ClientRadar';
import { ScheduleView } from './components/ScheduleView';
import { ReportsModule } from './components/ReportsModule';
import { ClientTable } from './components/ClientTable';
import { ContractTable } from './components/ContractTable';
import { ContractApprovalBoard } from './components/ContractApprovalBoard';
import { FormalizationModule } from './components/FormalizationModule';
import { OperationParametersModule } from './components/OperationParametersModule';
import { OptInModule } from './components/OptInModule';
import { NotificationsModule } from './components/NotificationsModule';
import { SettlementDomicileModule } from './components/SettlementDomicileModule';
import { SettlementAccountsModule } from './components/SettlementAccountsModule';
import { SettlementControlModule } from './components/SettlementControlModule';
import { ControlPanelModule } from './components/ControlPanelModule';
import { DisputesModule } from './components/DisputesModule';
import { CnabGeneratorModule } from './components/CnabGeneratorModule';
import { CnabConnectionModule } from './components/CnabConnectionModule';
import { SupportTicketsModule } from './components/SupportTicketsModule';
import { PartnerRegistrationModule } from './components/PartnerRegistrationModule';
import { DailyMonitoringDashboard } from './components/DailyMonitoringDashboard';
import { MonitoringVolumeDashboard } from './components/MonitoringVolumeDashboard';
import { MenuSetupModule } from './components/MenuSetupModule';
import { FinancialModule } from './components/FinancialModule';
import { MonitoriaModule } from './components/MonitoriaModule';
import { ChargebackMonitoringModule } from './components/ChargebackMonitoringModule';
import { LiquidationProblemModule } from './components/LiquidationProblemModule';
import { ReceivablesLedgerModule } from './components/ReceivablesLedgerModule';
import { OverviewModule } from './components/OverviewModule';
import { NewClientModal } from './components/NewClientModal';
import { ImportClientsModal } from './components/ImportClientsModal';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { OptInSignature } from './components/OptInSignature';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { GlobalSearch } from './components/GlobalSearch';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import {
  mockProducts,
  mockReceivableReports,
} from './data/mockData';
import { Client, Contract } from './types';
import { useData } from './context/DataContext';
import { LoadingSpinner } from './components/LoadingSpinner';
import { FaqModule } from './components/FaqModule';

const LazyContractDetail = React.lazy(() =>
  import('./components/ContractDetail').then(module => ({ default: module.ContractDetail }))
);

function App() {
  const { clients: appClients, contracts: appContractsData, isLoading: _dataLoading } = useData();
  const isSignaturePage = window.location.pathname.startsWith('/optin-signature/');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [showRegister, setShowRegister] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedClientTest, setSelectedClientTest] = useState<Client | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [previousSection, setPreviousSection] = useState<string>('contracts');
  const [selectedClientForRadar, setSelectedClientForRadar] = useState<Client | null>(null);
  const [controlPanelOpenSection, setControlPanelOpenSection] = useState<string | null>(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showImportClientsModal, setShowImportClientsModal] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 1024);
  const [appContracts, setAppContracts] = useState(appContractsData);

  useEffect(() => {
    setAppContracts(appContractsData);
  }, [appContractsData]);

  const { toasts, removeToast, addToast } = useToast();

  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      callback: () => {
        if (activeSection === 'clients' || activeSection === 'clients-test') {
          setShowNewClientModal(true);
        }
      },
      description: 'Abrir modal de novo cliente',
    },
    {
      key: 'k',
      ctrl: true,
      callback: () => {
        setShowGlobalSearch(true);
      },
      description: 'Busca global',
    },
    {
      key: '?',
      callback: () => {
        setShowShortcutsModal(true);
      },
      description: 'Mostrar atalhos de teclado',
    },
  ]);

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setActiveSection('client-detail');
  };

  const handleBackToClients = () => {
    setSelectedClient(null);
    setActiveSection('clients');
  };

  const handleClientTestClick = (client: Client) => {
    setSelectedClientTest(client);
    setActiveSection('client-detail-test');
  };

  const handleBackToClientsTest = () => {
    setSelectedClientTest(null);
    setActiveSection('clients-test');
  };

  const handleProblemCardClick = (problemType: string) => {
    setControlPanelOpenSection(problemType);
    setActiveSection('control-panel');
  };

  const handleContractClick = (contract: Contract, fromSection?: string) => {
    setSelectedContract(contract);
    if (fromSection) {
      setPreviousSection(fromSection);
    }
    setActiveSection('contract-detail');
  };

  const handleBackToContracts = () => {
    setSelectedContract(null);
    setActiveSection(previousSection);
    setPreviousSection('contracts');
  };

  const handleRadarClick = (client: Client) => {
    setSelectedClientForRadar(client);
    setActiveSection('client-radar');
  };

  const handleBackFromRadar = () => {
    setSelectedClientForRadar(null);
    setActiveSection('clients');
  };

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
  }, [isAuthenticated]);

  const handleLogin = (_email: string, _password: string) => {
    setIsAuthenticated(true);
  };

  const handleRegister = (_name: string, _email: string, _password: string) => {
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowRegister(false);
    localStorage.removeItem('isAuthenticated');
  };

  if (isSignaturePage) {
    return <OptInSignature />;
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register
          onRegister={handleRegister}
          onBackToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  const handleApproveContracts = (contractIds: string[]) => {
    setAppContracts(prev =>
      prev.map(c => contractIds.includes(c.id) ? { ...c, status: 'active' as const } : c)
    );
    addToast('success', `${contractIds.length} contrato${contractIds.length > 1 ? 's aprovados' : ' aprovado'} com sucesso!`);
  };

  const handleApproveSingleContract = (contractId: string) => {
    setAppContracts(prev =>
      prev.map(c => c.id === contractId ? { ...c, status: 'active' as const } : c)
    );
    addToast('success', 'Contrato aprovado com sucesso!');
  };

  const handleRejectContract = (contractId: string) => {
    setAppContracts(prev =>
      prev.map(c => c.id === contractId ? { ...c, status: 'closed' as const } : c)
    );
    addToast('error', 'Contrato reprovado', 'O contrato foi reprovado e encerrado.');
  };

  const pendingApprovalContracts = appContracts.filter(c => c.status === 'pending_approval');

  const pageTitleMap: Record<string, string> = {
    'overview': 'Captura de Recebíveis',
    'guarantee': 'Garantia',
    'extra-limit': 'Crédito Pontual',
    'debt-settlement': 'Quitação',
    'anticipation': 'Antecipação',
    'clients': 'Clientes',
    'clients-test': 'Clientes',
    'client-detail': selectedClient?.name || 'Detalhe do Cliente',
    'client-detail-test': selectedClientTest?.name || 'Detalhe do Cliente',
    'client-radar': selectedClientForRadar?.name || 'Radar do Cliente',
    'contract-detail': selectedContract?.contractNumber || 'Detalhe do Contrato',
    'schedule-view': 'Visão de Agendas',
    'contracts-menu': 'Operações',
    'contract-approval': 'Aprovação de Contratos',
    'contracts': 'Operações',
    'formalization': 'Formalização',
    'monitoring': 'Visão de volume',
    'contracts-monitoring': 'Contratos',
    'settlement-control': 'Liquidações',
    'receivables-ledger': 'Conta corrente das URs',
    'optin-control': 'Opt-in',
    'reports': 'Relatórios',
    'operation-parameters': 'Parâmetros de Operação',
    'opt-in': 'Opt-in',
    'notifications': 'Notificações',
    'settlement-domicile': 'Domicílio de Liquidação',
    'menu-setup': 'Configuração de Menus',
    'financial': 'Financeiro',
    'partner-registration': 'Cadastro de Clientes',
    'settlement-accounts': 'Contas de Liquidação',
    'reconciliation': 'Conciliação',
    'control-panel': 'Painel de Controle',
    'disputes': 'Contestações',
    'cnab-generator': 'Gerador de CNAB',
    'cnab-connections': 'Conexão Leitores',
    'support-tickets': 'Chamados em Aberto',
    'support-faq': 'FAQ',
    'file-processing': 'Processamento dos arquivos',
    'report-processing': 'Processamento dos relatórios',
    'chargeback-monitoring': 'Chargeback',
    'liquidation-problems': 'Problemas de liquidação',
  };

  const pageTitle = pageTitleMap[activeSection] || 'Dashboard';

  const renderContent = () => {
    if (activeSection === 'client-radar' && selectedClientForRadar) {
      return <ClientRadar client={selectedClientForRadar} onBack={handleBackFromRadar} />;
    }

    if (activeSection === 'client-detail' && selectedClient) {
      return <ClientDetail client={selectedClient} onBack={handleBackToClients} />;
    }

    if (activeSection === 'client-detail-test' && selectedClientTest) {
      return <ClientDetailTest client={selectedClientTest} onBack={handleBackToClientsTest} />;
    }

    if (activeSection === 'contract-detail' && selectedContract) {
      return (
        <React.Suspense fallback={<LoadingSpinner size="lg" text="Carregando detalhes do contrato..." fullScreen />}>
          <LazyContractDetail contract={selectedContract} onBack={handleBackToContracts} />
        </React.Suspense>
      );
    }

    switch (activeSection) {
      case 'overview':
        return <OverviewModule />;
      case 'guarantee':
        return (
          <ProductModule
            product={mockProducts[0]}
            clients={appClients.filter(c => c.status === 'active')}
            onClientClick={handleClientClick}
            onProblemCardClick={handleProblemCardClick}
          />
        );
      case 'extra-limit':
        return (
          <ProductModule
            product={mockProducts[1]}
            clients={appClients.filter(c => c.status === 'active')}
            onClientClick={handleClientClick}
            onProblemCardClick={handleProblemCardClick}
          />
        );
      case 'debt-settlement':
        return (
          <ProductModule
            product={mockProducts[2]}
            clients={appClients.filter(c => c.status === 'active')}
            onClientClick={handleClientClick}
            onProblemCardClick={handleProblemCardClick}
          />
        );
      case 'anticipation':
        return (
          <ProductModule
            product={mockProducts[3]}
            clients={appClients.filter(c => c.status === 'active')}
            onClientClick={handleClientClick}
            onProblemCardClick={handleProblemCardClick}
          />
        );
      case 'clients':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowImportClientsModal(true)}
                  className="bg-white text-gray-700 border border-gray-300 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center text-sm font-normal h-8"
                >
                  Importar
                </button>
                <button
                  onClick={() => setShowNewClientModal(true)}
                  className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-normal h-8"
                >
                  Novo Cliente
                </button>
              </div>
            </div>
            <ClientTable
              clients={appClients}
              showScheduleRequest={false}
              onClientClick={handleClientClick}
              onRadarClick={handleRadarClick}
            />
          </div>
        );
      case 'clients-test':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowImportClientsModal(true)}
                  className="bg-white text-gray-700 border border-gray-300 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center text-sm font-normal h-8"
                >
                  Importar
                </button>
                <button
                  onClick={() => setShowNewClientModal(true)}
                  className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-normal h-8"
                >
                  Novo Cliente
                </button>
              </div>
            </div>
            <ClientTable
              clients={appClients}
              showScheduleRequest={false}
              onClientClick={handleClientTestClick}
              onRadarClick={handleRadarClick}
            />
          </div>
        );
      case 'schedule-view':
        return <ScheduleView clients={appClients} />;
      case 'contracts-menu':
        return (
          <ContractTable
            contracts={appContracts.filter(c => c.status !== 'pending_approval')}
            onContractClick={handleContractClick}
            clients={appClients}
            simpleFilter={true}
          />
        );
      case 'contract-approval':
        return (
          <ContractApprovalBoard
            contracts={pendingApprovalContracts}
            clients={appClients}
            onApprove={handleApproveSingleContract}
            onApproveBatch={handleApproveContracts}
            onReject={handleRejectContract}
          />
        );
      case 'contracts':
        return (
          <ContractTable
            contracts={appContracts}
            onContractClick={handleContractClick}
            clients={appClients}
          />
        );
      case 'formalization':
        return <FormalizationModule clients={appClients} />;
      case 'monitoring':
        return <MonitoringVolumeDashboard onNavigate={setActiveSection} />;
      case 'contracts-monitoring':
        return <DailyMonitoringDashboard onContractClick={(contract) => handleContractClick(contract, 'monitoring')} />;
      case 'settlement-control':
        return <SettlementControlModule />;
      case 'optin-control':
        return <OptInModule />;
      case 'reports':
        return <ReportsModule reports={mockReceivableReports} />;
      case 'operation-parameters':
        return <OperationParametersModule />;
      case 'opt-in':
        return <OptInModule />;
      case 'notifications':
        return <NotificationsModule />;
      case 'settlement-domicile':
        return <SettlementDomicileModule />;
      case 'menu-setup':
        return <MenuSetupModule />;
      case 'financial':
        return <FinancialModule />;
      case 'partner-registration':
        return <PartnerRegistrationModule />;
      case 'settlement-accounts':
        return <SettlementAccountsModule />;
      case 'reconciliation':
        return <SettlementControlModule />;
      case 'control-panel':
        return (
          <ControlPanelModule
            initialOpenSection={controlPanelOpenSection}
            onSectionOpened={() => setControlPanelOpenSection(null)}
          />
        );
      case 'file-processing':
        return <MonitoriaModule view="file-processing" />;
      case 'report-processing':
        return <MonitoriaModule view="report-processing" />;
      case 'chargeback-monitoring':
        return <ChargebackMonitoringModule />;
      case 'liquidation-problems':
        return <LiquidationProblemModule />;
      case 'receivables-ledger':
        return <ReceivablesLedgerModule />;
      case 'disputes':
      case 'disputes-automation':
        return <DisputesModule />;
      case 'cnab-generator':
        return <CnabGeneratorModule />;
      case 'cnab-connections':
        return <CnabConnectionModule />;
      case 'support-tickets':
        return <SupportTicketsModule />;
      case 'support-faq':
        return <FaqModule />;
      default:
        return <OverviewModule />;
    }
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onHelpClick={() => setShowShortcutsModal(true)}
        />
        <Header
          onLogout={handleLogout}
          sidebarCollapsed={sidebarCollapsed}
          pageTitle={pageTitle}
          onSearchClick={() => setShowGlobalSearch(true)}
        />
        <button
          onClick={() => setSidebarCollapsed(false)}
          className={`fixed top-[18px] sm:top-[18px] left-3 sm:left-4 z-40 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-all text-gray-500 hover:text-gray-700 ${sidebarCollapsed ? 'lg:flex' : 'lg:hidden'} flex`}
          title="Abrir menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div className={`ml-0 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} px-3 sm:px-4 md:px-6 pb-6 pt-[72px] sm:pt-[88px] transition-all duration-300`}>
          {renderContent()}
        </div>
        <NewClientModal
          isOpen={showNewClientModal}
          onClose={() => setShowNewClientModal(false)}
          onSave={(clientData) => {
            addToast('success', 'Cliente criado!', `${clientData.name} foi adicionado com sucesso`);
            setShowNewClientModal(false);
          }}
        />
        <ImportClientsModal
          isOpen={showImportClientsModal}
          onClose={() => setShowImportClientsModal(false)}
          onImport={(clients) => {
            addToast('success', 'Importação concluída', `${clients.length} clientes importados`);
          }}
        />
        <GlobalSearch
          isOpen={showGlobalSearch}
          onClose={() => setShowGlobalSearch(false)}
          clients={appClients}
          contracts={appContracts}
          onNavigate={(type, id) => {
            if (type === 'section') {
              setActiveSection(id);
            } else if (type === 'client') {
              const client = appClients.find(c => c.id === id);
              if (client) {
                handleClientClick(client);
              }
            } else if (type === 'contract') {
              const contract = appContracts.find(c => c.id === id);
              if (contract) {
                setSelectedContract(contract);
                setActiveSection('contract-detail');
              }
            }
          }}
        />
        <KeyboardShortcutsModal
          isOpen={showShortcutsModal}
          onClose={() => setShowShortcutsModal(false)}
        />
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

export default App;
