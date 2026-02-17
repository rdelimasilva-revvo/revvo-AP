import React, { useState } from 'react';
import {
  Monitor,
  Wifi,
  WifiOff,
  Calendar,
  AlertTriangle,
  TrendingDown,
  Shield,
  RefreshCw,
  Building2,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RegistryStatus, RegistryProblem } from '../types';
import { mockRegistryStatus, mockRegistryProblems } from '../data/mockData';
import { RegistryProblemDetail } from './RegistryProblemDetail';

interface ControlPanelModuleProps {
  initialOpenSection?: string | null;
  onSectionOpened?: () => void;
}

export const ControlPanelModule: React.FC<ControlPanelModuleProps> = ({ 
  initialOpenSection, 
  onSectionOpened 
}) => {
  const [selectedProblem, setSelectedProblem] = useState<{
    type: RegistryProblem['type'];
    acquirer: string;
    registry: string;
  } | null>(null);
  const [expandedSections, setExpandedSections] = useState<{
    domicile: boolean;
    chargeback: boolean;
    lock: boolean;
    filters: boolean;
  }>({
    domicile: initialOpenSection === 'domicile',
    chargeback: initialOpenSection === 'chargeback', 
    lock: initialOpenSection === 'lock',
    filters: false
  });
  const [filters, setFilters] = useState({
    registry: 'all',
    acquirer: 'all',
    problemTypes: [] as string[]
  });

  // Auto-scroll to section when it's opened from navigation
  React.useEffect(() => {
    if (initialOpenSection && onSectionOpened) {
      // Small delay to ensure the section is rendered
      const timer = setTimeout(() => {
        const sectionId = `section-${initialOpenSection}`;
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
        onSectionOpened();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [initialOpenSection, onSectionOpened]);
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: RegistryStatus['status']) => {
    return status === 'online' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: RegistryStatus['status']) => {
    return status === 'online' ? (
      <Wifi className="w-5 h-5 text-green-600" />
    ) : (
      <WifiOff className="w-5 h-5 text-red-600" />
    );
  };

  const getStatusLabel = (status: RegistryStatus['status']) => {
    return status === 'online' ? 'Online' : 'Offline';
  };

  // Group problems by type
  const problemsByType = {
    domicile_change_rejected: mockRegistryProblems.filter(p => {
      const matchesType = p.type === 'domicile_change_rejected';
      const matchesRegistry = filters.registry === 'all' || p.registry === filters.registry;
      const matchesAcquirer = filters.acquirer === 'all' || p.acquirer === filters.acquirer;
      const matchesProblemType = filters.problemTypes.length === 0 || filters.problemTypes.includes('domicile_change_rejected');
      return matchesType && matchesRegistry && matchesAcquirer && matchesProblemType;
    }),
    chargeback: mockRegistryProblems.filter(p => {
      const matchesType = p.type === 'chargeback';
      const matchesRegistry = filters.registry === 'all' || p.registry === filters.registry;
      const matchesAcquirer = filters.acquirer === 'all' || p.acquirer === filters.acquirer;
      const matchesProblemType = filters.problemTypes.length === 0 || filters.problemTypes.includes('chargeback');
      return matchesType && matchesRegistry && matchesAcquirer && matchesProblemType;
    }),
    lock_application_failed: mockRegistryProblems.filter(p => {
      const matchesType = p.type === 'lock_application_failed';
      const matchesRegistry = filters.registry === 'all' || p.registry === filters.registry;
      const matchesAcquirer = filters.acquirer === 'all' || p.acquirer === filters.acquirer;
      const matchesProblemType = filters.problemTypes.length === 0 || filters.problemTypes.includes('lock_application_failed');
      return matchesType && matchesRegistry && matchesAcquirer && matchesProblemType;
    })
  };

  const handleProblemClick = (type: RegistryProblem['type'], acquirer: string, registry: string) => {
    setSelectedProblem({ type, acquirer, registry });
  };

  const handleBackToPanel = () => {
    setSelectedProblem(null);
  };

  const handleProblemTypeToggle = (problemType: string) => {
    setFilters(prev => ({
      ...prev,
      problemTypes: prev.problemTypes.includes(problemType)
        ? prev.problemTypes.filter(type => type !== problemType)
        : [...prev.problemTypes, problemType]
    }));
  };

  const clearFilters = () => {
    setFilters({
      registry: 'all',
      acquirer: 'all',
      problemTypes: []
    });
  };

  const hasActiveFilters = filters.registry !== 'all' || filters.acquirer !== 'all' || filters.problemTypes.length > 0;

  const toggleSection = (section: 'domicile' | 'chargeback' | 'lock') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    
    // Call onSectionOpened when a section is opened
    if (onSectionOpened && !expandedSections[section]) {
      onSectionOpened();
    }
  };

  const toggleFiltersSection = () => {
    setExpandedSections(prev => ({
      ...prev,
      filters: !prev.filters
    }));
  };

  // If a problem detail is selected, show the detail view
  if (selectedProblem) {
    const problemsForDetail = mockRegistryProblems.filter(
      p => p.type === selectedProblem.type && 
           p.acquirer === selectedProblem.acquirer && 
           p.registry === selectedProblem.registry
    );
    
    return (
      <RegistryProblemDetail
        problemType={selectedProblem.type}
        acquirer={selectedProblem.acquirer}
        registry={selectedProblem.registry}
        problems={problemsForDetail}
        onBack={handleBackToPanel}
      />
    );
  }

  // Calculate overall statistics
  const totalProblems = mockRegistryProblems.reduce((sum, p) => sum + p.count, 0);
  const onlineRegistries = mockRegistryStatus.filter(r => r.status === 'online').length;
  const totalSchedules = mockRegistryStatus.reduce((sum, r) => sum + r.schedulesReceived, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition-colors h-8 flex items-center justify-center text-sm font-normal">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Status
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Registradoras Online</p>
              <p className="text-2xl font-bold text-green-600">{onlineRegistries}/{mockRegistryStatus.length}</p>
            </div>
            <Monitor className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Agendas</p>
              <p className="text-2xl font-bold text-blue-600">{totalSchedules.toLocaleString()}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Problemas Ativos</p>
              <p className="text-2xl font-bold text-red-600">{totalProblems}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Última Atualização</p>
              <p className="text-lg font-bold text-gray-900">
                {formatDateTime(new Date()).split(' ')[1]}
              </p>
              <p className="text-xs text-gray-500">
                {formatDateTime(new Date()).split(' ')[0]}
              </p>
            </div>
            <Clock className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Registry Status Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Status das Registradoras</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockRegistryStatus.map((registry) => (
            <div
              key={registry.id}
              className={`border-2 rounded-lg p-4 transition-all ${
                registry.status === 'online' 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{registry.name}</h4>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(registry.status)}
                  <span className={`font-medium ${getStatusColor(registry.status)}`}>
                    {getStatusLabel(registry.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Última Atualização</p>
                  <p className="font-medium text-gray-900">{formatDateTime(registry.lastUpdate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Agendas Recebidas</p>
                  <p className="text-xl font-bold text-blue-600">{registry.schedulesReceived.toLocaleString()}</p>
                </div>
              </div>

              {registry.status === 'offline' && (
                <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Registradora Offline</span>
                  </div>
                  <p className="text-xs text-red-700 mt-1">
                    Última conexão há {Math.floor((new Date().getTime() - registry.lastUpdate.getTime()) / (1000 * 60))} minutos
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div 
            className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 -mx-6 px-6 py-3 rounded-t-xl transition-colors"
            onClick={toggleFiltersSection}
          >
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            <div className="flex items-center space-x-1">
              {expandedSections.filters ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {expandedSections.filters && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Registry Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registradora
                </label>
                <select
                  value={filters.registry}
                  onChange={(e) => setFilters(prev => ({ ...prev, registry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas as registradoras</option>
                  <option value="CERC">CERC</option>
                  <option value="Núclea">Núclea</option>
                  <option value="B3">B3</option>
                </select>
              </div>

              {/* Acquirer Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credenciadora
                </label>
                <select
                  value={filters.acquirer}
                  onChange={(e) => setFilters(prev => ({ ...prev, acquirer: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas as credenciadoras</option>
                  <option value="Dock">Dock</option>
                  <option value="Cielo">Cielo</option>
                  <option value="PagSeguro">PagSeguro</option>
                  <option value="Stone">Stone</option>
                  <option value="Rede">Rede</option>
                  <option value="GetNet">GetNet</option>
                  <option value="Safrapay">Safrapay</option>
                  <option value="Mercado Pago">Mercado Pago</option>
                </select>
              </div>

              {/* Problem Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Ocorrência
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.problemTypes.includes('domicile_change_rejected')}
                      onChange={() => handleProblemTypeToggle('domicile_change_rejected')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Troca de domicílio não acatada</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.problemTypes.includes('chargeback')}
                      onChange={() => handleProblemTypeToggle('chargeback')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Chargebacks</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.problemTypes.includes('lock_application_failed')}
                      onChange={() => handleProblemTypeToggle('lock_application_failed')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Aplicação de trava do recebível</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Filter Summary */}
            {hasActiveFilters && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Filtros ativos: 
                    {filters.registry !== 'all' && ` Registradora: ${filters.registry}`}
                    {filters.acquirer !== 'all' && ` • Credenciadora: ${filters.acquirer}`}
                    {filters.problemTypes.length > 0 && ` • ${filters.problemTypes.length} tipo(s) selecionado(s)`}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Problems Sections */}
      <div className="space-y-6">
        {/* Domicile Change Problems */}
        <div id="section-domicile" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Troca de Domicílio Não Acatada</h3>
                <p className="text-sm text-gray-600">Recebíveis com rejeição na mudança de conta de liquidação</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-600 text-white">
                {problemsByType.domicile_change_rejected.reduce((sum, p) => sum + p.count, 0)}
              </span>
              <button
                onClick={() => toggleSection('domicile')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {expandedSections.domicile ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {expandedSections.domicile && (
            <>
              {problemsByType.domicile_change_rejected.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {problemsByType.domicile_change_rejected.map((problem) => (
                    <div
                      key={problem.id}
                      onClick={() => handleProblemClick(problem.type, problem.acquirer, problem.registry)}
                      className="border border-orange-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer bg-orange-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{problem.acquirer}</h4>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{problem.registry}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-orange-600">{problem.count}</span>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">URs afetadas</p>
                          <p className="text-sm font-medium text-gray-900">{problem.details.affectedReceivables}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum problema de troca de domicílio</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Chargeback Problems */}
        <div id="section-chargeback" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-red-100">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Chargebacks</h3>
                <p className="text-sm text-gray-600">Recebíveis que sofreram chargeback</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-600 text-white">
                {problemsByType.chargeback.reduce((sum, p) => sum + p.count, 0)}
              </span>
              <button
                onClick={() => toggleSection('chargeback')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {expandedSections.chargeback ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {expandedSections.chargeback && (
            <>
              {problemsByType.chargeback.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {problemsByType.chargeback.map((problem) => (
                    <div
                      key={problem.id}
                      onClick={() => handleProblemClick(problem.type, problem.acquirer, problem.registry)}
                      className="border border-red-200 rounded-lg p-4 hover:border-red-300 hover:shadow-md transition-all cursor-pointer bg-red-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{problem.acquirer}</h4>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{problem.registry}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-red-600">{problem.count}</span>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Valor</p>
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(problem.totalValue || 0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum chargeback registrado</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Lock Application Problems */}
        <div id="section-lock" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Aplicação de Trava do Recebível</h3>
                <p className="text-sm text-gray-600">Recebíveis com falha na aplicação de trava</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-600 text-white">
                {problemsByType.lock_application_failed.reduce((sum, p) => sum + p.count, 0)}
              </span>
              <button
                onClick={() => toggleSection('lock')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {expandedSections.lock ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {expandedSections.lock && (
            <>
              {problemsByType.lock_application_failed.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {problemsByType.lock_application_failed.map((problem) => (
                    <div
                      key={problem.id}
                      onClick={() => handleProblemClick(problem.type, problem.acquirer, problem.registry)}
                      className="border border-yellow-200 rounded-lg p-4 hover:border-yellow-300 hover:shadow-md transition-all cursor-pointer bg-yellow-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{problem.acquirer}</h4>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{problem.registry}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-yellow-600">{problem.count}</span>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">URs afetadas</p>
                          <p className="text-sm font-medium text-gray-900">{problem.details.affectedReceivables}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum problema de aplicação de trava</p>
                </div>
              )}
            </>
          )}
        </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>

      {/* Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Monitor className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Sobre o Painel de Controle</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• <strong>Status em Tempo Real:</strong> Monitore a disponibilidade das registradoras</li>
              <li>• <strong>Problemas Organizados:</strong> Visualize problemas agrupados por tipo e origem</li>
              <li>• <strong>Ação Rápida:</strong> Clique nos cards para ver detalhes e tomar ações</li>
              <li>• <strong>Painel Limpo:</strong> Ausência de cards indica que não há problemas</li>
              <li>• <strong>Atualização Automática:</strong> Dados atualizados automaticamente a cada 5 minutos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};