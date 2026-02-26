import React from 'react';
import { Client, Contract } from '../types';
import { MetricCard } from './MetricCard';
import { ContractDetail } from './ContractDetail';
import { PieChart } from './PieChart';
import { NewOperationModal } from './NewOperationModal';
import { ScheduleModal } from './ScheduleModal';
import { HistoricalValuesTable } from './HistoricalValuesTable';
import { Breadcrumb } from './Breadcrumb';
import { ClientRatesManager } from './ClientRatesManager';
import { useData } from '../context/DataContext';
import {
  DollarSign,
  CreditCard,
  Shield,
  TrendingUp,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Eye,
  ArrowDown,
  RotateCw,
  Edit,
  ChevronUp,
  ChevronDown,
  Info,
  Percent
} from 'lucide-react';

interface ClientDetailProps {
  client: Client;
  onBack: () => void;
}

export const ClientDetail: React.FC<ClientDetailProps> = ({ client, onBack }) => {
  const { contracts } = useData();
  const [selectedContract, setSelectedContract] = React.useState<Contract | null>(null);
  const [showNewOperationModal, setShowNewOperationModal] = React.useState(false);
  const [showScheduleModal, setShowScheduleModal] = React.useState(false);
  const [contractsExpanded, setContractsExpanded] = React.useState(true);
  const [clientInfoExpanded, setClientInfoExpanded] = React.useState(false);
  const [clientRatesExpanded, setClientRatesExpanded] = React.useState(false);
  const contractsSectionRef = React.useRef<HTMLDivElement>(null);
  
  // Get contracts for this client
  const clientContracts = contracts.filter(contract => contract.clientId === client.id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const getProductTypeLabel = (productType: Contract['productType']) => {
    switch (productType) {
      case 'guarantee': return 'Garantia';
      case 'extra-limit': return 'Crédito Pontual';
      case 'debt-settlement': return 'Quitação';
      case 'anticipation': return 'Antecipação';
      default: return 'Desconhecido';
    }
  };

  const getProductTypeColor = (productType: Contract['productType']) => {
    switch (productType) {
      case 'guarantee': return 'bg-green-100 text-green-800';
      case 'extra-limit': return 'bg-purple-100 text-purple-800';
      case 'debt-settlement': return 'bg-red-100 text-red-800';
      case 'anticipation': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductTypeIcon = (productType: Contract['productType']) => {
    switch (productType) {
      case 'guarantee': return <Shield className="w-4 h-4" />;
      case 'extra-limit': return <CreditCard className="w-4 h-4" />;
      case 'debt-settlement': return <DollarSign className="w-4 h-4" />;
      case 'anticipation': return <TrendingUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleContractClick = (contract: Contract) => {
    setSelectedContract(contract);
  };

  const handleBackToClient = () => {
    setSelectedContract(null);
  };

  const handleViewActiveContracts = () => {
    setContractsExpanded(true);
    setTimeout(() => {
      contractsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Define guarantee distribution data for the pie chart
  const guaranteeDistribution = [
    { name: 'Dock', value: 82, color: '#4285F4' },
    { name: 'Cielo', value: 7, color: '#00C49A' },
    { name: 'PagSeguro', value: 4, color: '#FFBB28' },
    { name: 'Stone', value: 4, color: '#A259F7' },
    { name: 'Rede', value: 3, color: '#FF5C5C' },
  ];

  // If a contract is selected, show contract detail
  if (selectedContract) {
    return <ContractDetail contract={selectedContract} onBack={handleBackToClient} />;
  }

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: 'Clientes', onClick: onBack },
          { label: client.name },
        ]}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 transition-colors h-8 flex items-center justify-center text-sm font-normal"
          >
            ← Voltar
          </button>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowScheduleModal(true)}
            className="bg-white text-blue-600 border border-blue-600 px-4 rounded-lg hover:bg-blue-50 transition-colors h-8 flex items-center justify-center text-sm font-normal"
          >
            Consultar Agenda
          </button>
          <button 
            onClick={() => setShowNewOperationModal(true)}
            className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition-colors h-8 flex items-center justify-center text-sm font-normal"
          >
            Nova Operação
          </button>
        </div>
      </div>

      {/* Client Info - Collapsible */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-6 px-6 py-3 rounded-t-xl transition-colors"
          onClick={() => setClientInfoExpanded(!clientInfoExpanded)}
        >
          <div className="flex items-center space-x-3">
            <Info className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Informações do Cliente</h3>
              {!clientInfoExpanded && (
                <p className="text-sm text-gray-500">{client.document} • Cliente desde {formatDate(client.createdAt)}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle edit action
              }}
              className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50"
            >
              <Edit className="w-5 h-5" />
            </button>
            {clientInfoExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {clientInfoExpanded && (
          <div className="border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium text-gray-900">{client.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{client.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium text-gray-900">{client.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Cliente desde</p>
                  <p className="font-medium text-gray-900">{formatDate(client.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Client Discount Rates - Collapsible */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div
          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-6 px-6 py-3 rounded-t-xl transition-colors"
          onClick={() => setClientRatesExpanded(!clientRatesExpanded)}
        >
          <div className="flex items-center space-x-3">
            <Percent className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Taxas de Desconto</h3>
              {!clientRatesExpanded && (
                <p className="text-sm text-gray-500">Configure taxas personalizadas para este cliente</p>
              )}
            </div>
          </div>
          {clientRatesExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {clientRatesExpanded && (
          <div className="border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-xl">
            <ClientRatesManager
              clientId={client.id}
              clientName={client.name}
              onSave={(_rates) => {
                // rates saved
              }}
            />
          </div>
        )}
      </div>

      {/* Client Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
        <MetricCard
          title="Limite Total"
          value={formatCurrency(client.totalLimit)}
          color="text-blue-600"
        />
        <MetricCard
          title="Limite Utilizado"
          value={formatCurrency(client.usedLimit)}
          subtitle={`${((client.usedLimit / client.totalLimit) * 100).toFixed(1)}% do total`}
          color="text-green-600"
        />
        <MetricCard
          title="Limite Disponível"
          value={formatCurrency(client.availableLimit)}
          color="text-purple-600"
        />
        <MetricCard
          title="Garantia Antecipada"
          value="R$ 138.150,00"
          color="text-orange-600"
        />
      </div>

      {/* Dashboard Complement - Chart and Pie Chart Section */}
      <div className="grid grid-cols-11 gap-6 mb-4">
        {/* Middle - Chart */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 h-full flex flex-col max-h-80">
            <div className="mb-2">
              <div className="flex items-baseline space-x-2 mb-1">
                <span className="text-3xl font-bold text-gray-900">92%</span>
                <span className="text-sm font-medium text-green-600">+4%</span>
              </div>
              <p className="text-sm text-gray-600">Taxa de sucesso - {client.name}</p>
            </div>
            {/* Área branca do gráfico com legenda na base */}
            <div className="flex flex-col justify-between flex-1 w-full">
              <div className="relative w-full flex-1">
                <svg className="w-full h-full max-h-48" viewBox="0 0 520 230" preserveAspectRatio="xMidYMid meet">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid-client" width="40" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-client)" />

                  {/* Y-axis left (Valores) */}
                  {[0, 20, 40, 60, 80, 100].map((v, i) => (
                    <g key={i}>
                      <text x="10" y={190 - (v / 100) * 160 + 5} className="text-xs fill-gray-400">{v}</text>
                      <line x1="40" y1={190 - (v / 100) * 160} x2="500" y2={190 - (v / 100) * 160} stroke="#f3f4f6" strokeWidth="1" />
                    </g>
                  ))}
                  <text x="10" y="15" className="text-xs fill-gray-500 font-bold">Valor</text>

                  {/* Y-axis right (%) */}
                  {[0, 25, 50, 75, 100].map((p, i) => (
                    <g key={i}>
                      <text x="505" y={190 - (p / 100) * 160 + 5} className="text-xs fill-green-500" textAnchor="start">{p}%</text>
                    </g>
                  ))}
                  <text x="495" y="15" className="text-xs fill-green-600 font-bold" textAnchor="end">%</text>

                  {/* Client-specific chart data */}
                  {[
                    { month: 'Jan', value: 25, percentage: 78 },
                    { month: 'Fev', value: 32, percentage: 82 },
                    { month: 'Mar', value: 28, percentage: 85 },
                    { month: 'Abr', value: 35, percentage: 88 },
                    { month: 'Mai', value: 42, percentage: 90 },
                    { month: 'Jun', value: 38, percentage: 87 },
                    { month: 'Jul', value: 45, percentage: 91 },
                    { month: 'Ago', value: 52, percentage: 93 },
                    { month: 'Set', value: 48, percentage: 89 },
                    { month: 'Out', value: 55, percentage: 94 },
                    { month: 'Nov', value: 60, percentage: 92 },
                    { month: 'Dez', value: 58, percentage: 91 },
                    { month: 'Jan', value: 62, percentage: 92 },
                  ].map((item, index) => (
                    <g key={index}>
                      <rect
                        x={50 + index * 35}
                        y={190 - (item.value / 100) * 160}
                        width="24"
                        height={(item.value / 100) * 160}
                        fill="#06b6d4"
                        className="opacity-80 hover:opacity-100 transition-opacity"
                        rx="2"
                      >
                        <title>
                          {item.month}: R$ {item.value}k
                        </title>
                      </rect>
                    </g>
                  ))}

                  {/* X-axis (months) */}
                  {[
                    { month: 'Jan', value: 25, percentage: 78 },
                    { month: 'Fev', value: 32, percentage: 82 },
                    { month: 'Mar', value: 28, percentage: 85 },
                    { month: 'Abr', value: 35, percentage: 88 },
                    { month: 'Mai', value: 42, percentage: 90 },
                    { month: 'Jun', value: 38, percentage: 87 },
                    { month: 'Jul', value: 45, percentage: 91 },
                    { month: 'Ago', value: 52, percentage: 93 },
                    { month: 'Set', value: 48, percentage: 89 },
                    { month: 'Out', value: 55, percentage: 94 },
                    { month: 'Nov', value: 60, percentage: 92 },
                    { month: 'Dez', value: 58, percentage: 91 },
                    { month: 'Jan', value: 62, percentage: 92 },
                  ].map((item, index) => (
                    <text 
                      key={index}
                      x={60 + index * 35} 
                      y="210" 
                      className="text-xs fill-gray-600 text-anchor-middle"
                      textAnchor="middle"
                    >
                      {item.month}
                    </text>
                  ))}
                  <line x1="40" y1="190" x2="500" y2="190" stroke="#d1d5db" strokeWidth="2" />

                  {/* Line chart (% em garantias) */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={[
                      { month: 'Jan', value: 25, percentage: 78 },
                      { month: 'Fev', value: 32, percentage: 82 },
                      { month: 'Mar', value: 28, percentage: 85 },
                      { month: 'Abr', value: 35, percentage: 88 },
                      { month: 'Mai', value: 42, percentage: 90 },
                      { month: 'Jun', value: 38, percentage: 87 },
                      { month: 'Jul', value: 45, percentage: 91 },
                      { month: 'Ago', value: 52, percentage: 93 },
                      { month: 'Set', value: 48, percentage: 89 },
                      { month: 'Out', value: 55, percentage: 94 },
                      { month: 'Nov', value: 60, percentage: 92 },
                      { month: 'Dez', value: 58, percentage: 91 },
                      { month: 'Jan', value: 62, percentage: 92 },
                    ].map((item, index) => 
                      `${62 + index * 35},${190 - (item.percentage / 100) * 160}`
                    ).join(' ')}
                  />
                  {/* Line chart points */}
                  {[
                    { month: 'Jan', value: 25, percentage: 78 },
                    { month: 'Fev', value: 32, percentage: 82 },
                    { month: 'Mar', value: 28, percentage: 85 },
                    { month: 'Abr', value: 35, percentage: 88 },
                    { month: 'Mai', value: 42, percentage: 90 },
                    { month: 'Jun', value: 38, percentage: 87 },
                    { month: 'Jul', value: 45, percentage: 91 },
                    { month: 'Ago', value: 52, percentage: 93 },
                    { month: 'Set', value: 48, percentage: 89 },
                    { month: 'Out', value: 55, percentage: 94 },
                    { month: 'Nov', value: 60, percentage: 92 },
                    { month: 'Dez', value: 58, percentage: 91 },
                    { month: 'Jan', value: 62, percentage: 92 },
                  ].map((item, index) => (
                    <circle
                      key={index}
                      cx={62 + index * 35}
                      cy={190 - (item.percentage / 100) * 160}
                      r="4"
                      fill="#10b981"
                      className="hover:r-5 transition-all"
                    >
                      <title>
                        {item.month}: {item.percentage}% em garantias
                      </title>
                    </circle>
                  ))}
                </svg>
              </div>
              {/* Legenda separada do gráfico */}
              <div className="flex items-center justify-center gap-8 pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <svg width="20" height="14" className="inline-block">
                    <rect x="2" y="4" width="16" height="8" rx="2" fill="#06b6d4" opacity="0.8"/>
                  </svg>
                  <span className="text-sm text-gray-700 font-medium">Valor gerado (mil) - Dock</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg width="20" height="14" className="inline-block">
                    <polyline points="2,10 10,4 18,7" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round"/>
                    <circle cx="10" cy="4" r="3" fill="#10b981"/>
                  </svg>
                  <span className="text-sm text-gray-700 font-medium">% sucesso travas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Combined Credenciadoras and Bandeiras Pie charts */}
        <div className="col-span-5">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 h-full flex flex-col max-h-80">
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Credenciadoras */}
              <div className="flex flex-col">
                <div className="mb-2">
                  <span className="text-lg font-bold text-gray-900">82%</span>
                  <span className="text-xs font-normal text-gray-600"> Dock</span>
                  <p className="text-xs font-medium text-gray-600">Credenciadoras</p>
                </div>
                <div className="flex justify-center items-center flex-1">
                  <PieChart data={guaranteeDistribution} />
                </div>
              </div>
              
              {/* Bandeiras */}
              <div className="flex flex-col">
                <div className="mb-2">
                  <span className="text-lg font-bold text-gray-900">52%</span>
                  <span className="text-xs font-normal text-gray-600"> Mastercard</span>
                  <p className="text-xs font-medium text-gray-600">Bandeiras</p>
                </div>
                <div className="flex justify-center items-center flex-1">
                  <PieChart data={[
                    { name: 'Mastercard', value: 52, color: '#DC2626' },
                    { name: 'Visa', value: 28, color: '#7C3AED' },
                    { name: 'Elo', value: 15, color: '#059669' },
                    { name: 'Hipercard', value: 5, color: '#EA580C' }
                  ]} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Domicílio - Horizontal Bar Chart */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 h-full flex flex-col max-h-80">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="text-xl font-bold text-gray-900">R$ 12,8Mi</span>
                  <span className="text-sm font-medium text-green-600">+4%</span>
                </div>
                <p className="text-sm text-gray-600">Valor Total</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="text-xl font-bold text-gray-900">R$ 2,1Mi</span>
                </div>
                <p className="text-sm text-gray-600">Valor Travado</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Domicílio</p>
            <div className="flex items-center space-x-4 mt-2 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">Valor Total</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span className="text-gray-600">Valor Travado</span>
              </div>
            </div>
            <div className="flex-1 space-y-2 text-xs overflow-y-auto">
              {[
                { name: 'BANCO DO BRASIL', total: 6107850, travado: 4500000 },
                { name: 'BANCO SANTANDER', total: 2165421, travado: 1200000 },
                { name: 'MONEY PLUS', total: 1774691, travado: 800000 },
                { name: 'BANCO SAFRA', total: 1738090, travado: 950000 },
                { name: 'BANCO ABC BRASIL', total: 738698, travado: 400000 },
                { name: 'CEF', total: 77226, travado: 35000 },
                { name: 'MERCADO.COM', total: 1652, travado: 800 },
                { name: 'BANCO ITAÚ UNIBANCO', total: 0, travado: 0 }
              ].map((bank, index) => {
                const maxValue = 6107850;
                const totalWidth = (bank.total / maxValue) * 100;
                const travadoWidth = (bank.travado / maxValue) * 100;
                
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-32 text-right text-gray-600 font-medium whitespace-nowrap" style={{ fontSize: '10px' }}>
                      {bank.name}
                    </div>
                    <div className="flex-1 relative h-4 ml-2">
                      {/* Barra total (cinza) */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-gray-300 rounded"
                        style={{ width: `${totalWidth}%` }}
                        title={`${bank.name} - Valor Total: R$ ${bank.total.toLocaleString()}`}
                      ></div>
                      {/* Barra travado (vermelha) */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-red-600 rounded"
                        style={{ width: `${travadoWidth}%` }}
                        title={`${bank.name} - Valor Travado: R$ ${bank.travado.toLocaleString()}`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos Ativos</h3>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Garantias</p>
                    <p className="text-sm text-gray-600">2 operações ativas</p>
                  </div>
                </div>
                
                {/* Métricas de Garantia */}
                <div className="flex items-center space-x-4">
                  <div className="text-left">
                    <p className="text-xs text-green-700 mb-1">Travado em Garantia</p>
                    <p className="text-sm font-bold text-green-900">R$ 268.470,00</p>
                    <p className="text-xs text-green-600">+12.5%</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-green-700 mb-1">Garantias Solicitadas</p>
                    <p className="text-sm font-bold text-green-900">R$ 285.000,00</p>
                    <p className="text-xs text-green-600">+5.2%</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-green-700 mb-1">Taxa de Sucesso</p>
                    <p className="text-sm font-bold text-green-900">94.2%</p>
                    <p className="text-xs text-green-600">+2.1%</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-gray-600">Valor total das operações</p>
                  <p className="font-medium text-gray-900">R$ 295.000,00</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Crédito Pontual</p>
                  <p className="text-sm text-gray-600">1 operação ativa</p>
                </div>
              </div>
                
                {/* Métricas de Crédito Pontual */}
                <div className="flex items-center space-x-4">
                  <div className="text-left">
                    <p className="text-xs text-purple-700 mb-1">Travado em Garantia</p>
                    <p className="text-sm font-bold text-purple-900">R$ 25.000,00</p>
                    <p className="text-xs text-purple-600">+8.3%</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-purple-700 mb-1">Garantias Solicitadas</p>
                    <p className="text-sm font-bold text-purple-900">R$ 15.000,00</p>
                    <p className="text-xs text-purple-600">60%</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-purple-700 mb-1">Taxa de Sucesso</p>
                    <p className="text-sm font-bold text-purple-900">87.5%</p>
                    <p className="text-xs text-purple-600">+3.2%</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-gray-600">Valor total das operações</p>
                  <p className="font-medium text-gray-900">R$ 30.000,00</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-gray-900">Antecipação</p>
                  <p className="text-sm text-gray-600">3 operações ativas</p>
                </div>
              </div>
                
                {/* Métricas de Antecipação */}
                <div className="flex items-center space-x-4">
                  <div className="text-left">
                    <p className="text-xs text-orange-700 mb-1">Travado em Garantia</p>
                    <p className="text-sm font-bold text-orange-900">R$ 150.000,00</p>
                    <p className="text-xs text-orange-600">+15.7%</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-orange-700 mb-1">Garantias Solicitadas</p>
                    <p className="text-sm font-bold text-orange-900">R$ 120.000,00</p>
                    <p className="text-xs text-orange-600">80%</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-orange-700 mb-1">Taxa de Sucesso</p>
                    <p className="text-sm font-bold text-orange-900">96.8%</p>
                    <p className="text-xs text-orange-600">+4.1%</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-gray-600">Valor total das operações</p>
                  <p className="font-medium text-gray-900">R$ 165.000,00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Agenda de Recebimento</h3>
            <div className="text-right">
              <p className="text-sm text-gray-500">Atualizado em:</p>
              <p className="text-sm text-gray-600">{formatDate(new Date())}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {/* Cards - 2/3 da largura */}
            <div className="col-span-2 space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Valor total de recebíveis</p>
                  <p className="text-xs text-gray-500">soma de todos os recebíveis</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">R$ 450.000,00</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-red-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Agenda travada para SC</p>
                  <p className="text-xs text-gray-500">em recebíveis</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">R$ 125.000,00</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Agenda travada outros</p>
                  <p className="text-xs text-gray-500">em recebíveis</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">R$ 85.000,00</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Agenda disponível</p>
                  <p className="text-xs text-gray-500">em recebíveis</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">R$ 240.000,00</p>
                </div>
              </div>
            </div>
            </div>
            
            {/* Gráfico de Donut - 1/3 da largura */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              <div className="mb-4 text-center">
                <div className="flex items-baseline space-x-2 mb-1 justify-center">
                  <span className="text-2xl font-bold text-gray-900">53%</span>
                  <span className="text-sm font-medium text-green-600">Livre</span>
                </div>
                <p className="text-sm text-gray-600">Distribuição da Agenda</p>
              </div>
              
              {/* Donut Chart */}
              <div className="relative w-40 h-40">
                <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="20"
                  />
                  
                  {/* Total Travado (46.7% = 210k de 450k) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="20"
                    strokeDasharray={`${(210/450) * 377} 377`}
                    strokeDashoffset="0"
                    className="transition-all duration-300"
                  >
                    <title>Total Travado: R$ 210.000,00 (46.7%)</title>
                  </circle>
                  
                  {/* Total Livre (53.3% = 240k de 450k) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="20"
                    strokeDasharray={`${(240/450) * 377} 377`}
                    strokeDashoffset={`-${(210/450) * 377}`}
                    className="transition-all duration-300"
                  >
                    <title>Total Livre: R$ 240.000,00 (53.3%)</title>
                  </circle>
                </svg>
                
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-lg font-bold text-gray-900">R$ 450k</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Total Livre</span>
                  <span className="font-semibold text-gray-900">R$ 240k</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Total Travado</span>
                  <span className="font-semibold text-gray-900">R$ 210k</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Active Contracts Button */}
      <div className="flex justify-center my-6">
        <button
          onClick={handleViewActiveContracts}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <FileText className="w-5 h-5" />
          <span className="font-medium">Ver Contratos Ativos</span>
        </button>
      </div>

      {/* Contracts Section */}
      <div ref={contractsSectionRef} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div 
          className="flex items-center justify-between mb-6 cursor-pointer hover:bg-gray-50 -mx-6 px-6 py-3 rounded-t-xl transition-colors"
          onClick={() => setContractsExpanded(!contractsExpanded)}
        >
          <h3 className="text-lg font-semibold text-gray-900">Contratos de Recebíveis</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {clientContracts.length} contrato(s)
            </span>
            {contractsExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {contractsExpanded && (
          <>
            {clientContracts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum contrato encontrado</h4>
                <p className="text-gray-600 mb-4">Este cliente ainda não possui contratos de recebíveis.</p>
                <button className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition-colors h-8 flex items-center justify-center text-sm font-normal">
                  Criar Primeiro Contrato
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {clientContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleContractClick(contract)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{contract.contractNumber}</h4>
                        <p className="text-sm text-gray-600">
                          Criado em {formatDate(contract.createdAt)}
                          {contract.closedAt && ` • Encerrado em ${formatDate(contract.closedAt)}`}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProductTypeColor(contract.productType)}`}>
                          {getProductTypeIcon(contract.productType)}
                          <span className="ml-1">{getProductTypeLabel(contract.productType)}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Valor Onerado</p>
                        <p className="font-medium text-gray-900">{formatCurrency(contract.encumberedValue)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Liquidado</p>
                        <p className="font-medium text-gray-900">{formatCurrency(contract.actualSettlementValue)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Chargebacks</p>
                        <p className="font-medium text-red-600">{contract.chargeback.quantity} ({contract.chargeback.percentage.toFixed(1)}%)</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          contract.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {contract.status === 'active' ? 'Ativo' : 'Encerrado'}
                        </span>
                        <div className="flex items-center space-x-1">
                          {contract.hasRevolvency ? (
                            <RotateCw 
                              className="w-4 h-4 text-green-600" 
                              title="Contrato com revolvência"
                            />
                          ) : (
                            <ArrowDown 
                              className="w-4 h-4 text-gray-600" 
                              title="Contrato sem revolvência"
                            />
                          )}
                        </div>
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* New Operation Modal */}
      <NewOperationModal
        isOpen={showNewOperationModal}
        onClose={() => setShowNewOperationModal(false)}
        client={client}
      />

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        clientName={client.name}
      />

      {/* Historical Values Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Histórico de Valores</h3>
          <div className="flex items-center space-x-4">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
              <option value="all">Todos os CNPJs</option>
              <option value="12.345.678/0001-90">12.345.678/0001-90 - ABC Comércio S.A.</option>
              <option value="12.345.678/0002-71">12.345.678/0002-71 - ABC Filial SP</option>
              <option value="12.345.678/0003-52">12.345.678/0003-52 - ABC Filial RJ</option>
            </select>
          </div>
        </div>

        <HistoricalValuesTable />
      </div>
    </div>
  );
};