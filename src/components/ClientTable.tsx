import React, { useState, useMemo } from 'react';
import { Client } from '../types';
import { Eye, Edit, MoreVertical, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, X, Calendar, Radio, Users } from 'lucide-react';

interface ClientTableProps {
  clients: Client[];
  onClientClick: (client: Client) => void;
  showScheduleRequest?: boolean;
  onScheduleRequest?: (client: Client) => void;
  onRadarClick?: (client: Client) => void;
}

type SortField = keyof Client | 'none';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  search: string;
  status: string;
  minLimit: string;
  maxLimit: string;
  minUsed: string;
  maxUsed: string;
  minCollateral: string;
  maxCollateral: string;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  onClientClick,
  showScheduleRequest = false,
  onScheduleRequest,
  onRadarClick
}) => {
  const [sortField, setSortField] = useState<SortField>('none');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    minLimit: '',
    maxLimit: '',
    minUsed: '',
    maxUsed: '',
    minCollateral: '',
    maxCollateral: '',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Client['status']) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'pending': return 'Pendente';
      default: return 'Desconhecido';
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      minLimit: '',
      maxLimit: '',
      minUsed: '',
      maxUsed: '',
      minCollateral: '',
      maxCollateral: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const filteredAndSortedClients = useMemo(() => {
    const filtered = clients.filter(client => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.document.includes(filters.search);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && client.status !== filters.status) {
        return false;
      }

      // Limit filters
      if (filters.minLimit && client.totalLimit < parseFloat(filters.minLimit)) {
        return false;
      }
      if (filters.maxLimit && client.totalLimit > parseFloat(filters.maxLimit)) {
        return false;
      }

      // Used limit filters
      if (filters.minUsed && client.usedLimit < parseFloat(filters.minUsed)) {
        return false;
      }
      if (filters.maxUsed && client.usedLimit > parseFloat(filters.maxUsed)) {
        return false;
      }

      // Collateral filters
      if (filters.minCollateral && client.collateralValue < parseFloat(filters.minCollateral)) {
        return false;
      }
      if (filters.maxCollateral && client.collateralValue > parseFloat(filters.maxCollateral)) {
        return false;
      }

      return true;
    });

    // Sort
    if (sortField !== 'none') {
      filtered.sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        // Handle different data types
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [clients, filters, sortField, sortDirection]);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou documento..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center space-x-2 px-4 rounded-lg border transition-colors h-8 text-sm font-normal ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                  {Object.values(filters).filter(v => v !== '').length}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center space-x-2 px-3 text-gray-600 hover:text-gray-800 transition-colors h-8 text-sm font-normal"
              >
                <X className="w-4 h-4" />
                <span>Limpar</span>
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {filteredAndSortedClients.length} de {clients.length} clientes
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-8 text-sm"
              >
                <option value="">Todos</option>
                <option value="active">Ativo</option>
                <option value="pending">Pendente</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Limite Mínimo</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minLimit}
                onChange={(e) => setFilters(prev => ({ ...prev, minLimit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-8 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Limite Máximo</label>
              <input
                type="number"
                placeholder="999999999"
                value={filters.maxLimit}
                onChange={(e) => setFilters(prev => ({ ...prev, maxLimit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-8 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Utilizado Mínimo</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minUsed}
                onChange={(e) => setFilters(prev => ({ ...prev, minUsed: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-8 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Utilizado Máximo</label>
              <input
                type="number"
                placeholder="999999999"
                value={filters.maxUsed}
                onChange={(e) => setFilters(prev => ({ ...prev, maxUsed: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-8 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Garantia Mínima</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minCollateral}
                onChange={(e) => setFilters(prev => ({ ...prev, minCollateral: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-8 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Garantia Máxima</label>
              <input
                type="number"
                placeholder="999999999"
                value={filters.maxCollateral}
                onChange={(e) => setFilters(prev => ({ ...prev, maxCollateral: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-8 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                  >
                    <span>Cliente</span>
                    {getSortIcon('name')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('document')}
                    className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                  >
                    <span>Documento</span>
                    {getSortIcon('document')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                  >
                    <span>Status</span>
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('totalLimit')}
                    className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                  >
                    <span>Limite Total</span>
                    {getSortIcon('totalLimit')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('usedLimit')}
                    className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                  >
                    <span>Utilizado</span>
                    {getSortIcon('usedLimit')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('collateralValue')}
                    className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                  >
                    <span>Garantia</span>
                    {getSortIcon('collateralValue')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedClients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  onClick={() => onClientClick(client)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.document}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                      {getStatusLabel(client.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(client.totalLimit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(client.usedLimit)}
                      </div>
                      <div className="ml-2 text-xs text-gray-500">
                        ({((client.usedLimit / client.totalLimit) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(client.collateralValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {onRadarClick && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRadarClick(client);
                          }}
                          className="text-orange-600 hover:text-orange-800 transition-colors"
                          title="Radar"
                        >
                          <Radio className="w-4 h-4" />
                        </button>
                      )}
                      {showScheduleRequest && onScheduleRequest && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onScheduleRequest(client);
                          }}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Solicitar agenda"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                        title="Mais opções"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {showScheduleRequest && (
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td colSpan={7} className="px-6 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Total em garantia</span>
                      <span className="text-sm font-bold text-blue-900">
                        {formatCurrency(
                          filteredAndSortedClients.reduce((sum, client) => sum + client.availableLimit, 0)
                        )}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredAndSortedClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 mb-2">Nenhum cliente encontrado</div>
            <div className="text-sm text-gray-400">
              Tente ajustar os filtros ou termos de busca
            </div>
          </div>
        )}
      </div>
    </div>
  );
};