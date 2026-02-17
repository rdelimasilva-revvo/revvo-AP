import React, { useState } from 'react';
import { Users, Plus, Search, Edit2, Trash2, Percent, ChevronDown, ChevronUp, DollarSign, Package, X, Check } from 'lucide-react';
import { NewPartnerModal } from './NewPartnerModal';

type ProductType = 'debt-settlement' | 'guarantee' | 'extra-limit' | 'anticipation';

const PRODUCT_LABELS: Record<ProductType, string> = {
  'debt-settlement': 'Recuperação de crédito',
  'guarantee': 'Garantias',
  'extra-limit': 'Pré-pagamento',
  'anticipation': 'Antecipação',
};

const PRODUCT_COLORS: Record<ProductType, string> = {
  'debt-settlement': 'bg-orange-100 text-orange-700',
  'guarantee': 'bg-blue-100 text-blue-700',
  'extra-limit': 'bg-purple-100 text-purple-700',
  'anticipation': 'bg-green-100 text-green-700',
};

interface Partner {
  id: string;
  name: string;
  document: string;
  type: 'client';
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  hasCustomRates?: boolean;
  allowedProducts: ProductType[];
  totalLimit: number;
  usedLimit: number;
}

const mockPartners: Partner[] = [
  {
    id: '1',
    name: 'Empresa Cliente A',
    document: '12.345.678/0001-90',
    type: 'client',
    email: 'contato@clientea.com',
    phone: '(11) 98765-4321',
    status: 'active',
    hasCustomRates: true,
    allowedProducts: ['guarantee', 'anticipation', 'debt-settlement'],
    totalLimit: 5000000,
    usedLimit: 3200000,
  },
  {
    id: '2',
    name: 'Empresa Cliente B',
    document: '98.765.432/0001-10',
    type: 'client',
    email: 'financeiro@clienteb.com',
    phone: '(11) 91234-5678',
    status: 'active',
    hasCustomRates: false,
    allowedProducts: ['extra-limit', 'anticipation'],
    totalLimit: 2000000,
    usedLimit: 800000,
  }
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const PartnerRegistrationModule: React.FC = () => {
  const [isNewPartnerModalOpen, setIsNewPartnerModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [partners, setPartners] = useState<Partner[]>(mockPartners);
  const [expandedPartnerId, setExpandedPartnerId] = useState<string | null>(null);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [productFilter, setProductFilter] = useState<ProductType | ''>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredPartners = partners.filter(partner => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.document.includes(searchTerm);
    const matchesProduct = !productFilter || partner.allowedProducts.includes(productFilter);
    return matchesSearch && matchesProduct;
  });

  const handleNewPartner = () => {
    setEditingPartner(null);
    setIsNewPartnerModalOpen(true);
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    setIsNewPartnerModalOpen(true);
  };

  const handleDeletePartner = (partnerId: string) => {
    setPartners(prev => prev.filter(p => p.id !== partnerId));
    setDeleteConfirm(null);
  };

  const handleSavePartner = (partnerData: any) => {
    if (editingPartner) {
      setPartners(prev =>
        prev.map(p =>
          p.id === editingPartner.id
            ? {
                ...p,
                name: partnerData.name,
                document: partnerData.document,
                email: partnerData.email,
                phone: partnerData.phone,
                status: partnerData.status,
                allowedProducts: partnerData.allowedProducts || [],
                totalLimit: partnerData.totalLimit || 0,
              }
            : p
        )
      );
    } else {
      const newPartner: Partner = {
        id: String(Date.now()),
        name: partnerData.name,
        document: partnerData.document,
        type: 'client',
        email: partnerData.email,
        phone: partnerData.phone,
        status: partnerData.status,
        hasCustomRates: false,
        allowedProducts: partnerData.allowedProducts || [],
        totalLimit: partnerData.totalLimit || 0,
        usedLimit: 0,
      };
      setPartners(prev => [...prev, newPartner]);
    }
    setIsNewPartnerModalOpen(false);
    setEditingPartner(null);
  };

  const toggleExpanded = (partnerId: string) => {
    setExpandedPartnerId(prev => (prev === partnerId ? null : partnerId));
  };

  const totalLimitAll = partners.reduce((sum, p) => sum + p.totalLimit, 0);
  const usedLimitAll = partners.reduce((sum, p) => sum + p.usedLimit, 0);
  const availableLimitAll = totalLimitAll - usedLimitAll;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total de Clientes</p>
              <p className="text-xl font-bold text-gray-900">{partners.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Limite Total</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalLimitAll)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Limite Utilizado</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(usedLimitAll)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Limite Disponível</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(availableLimitAll)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value as ProductType | '')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos os produtos</option>
          {(Object.keys(PRODUCT_LABELS) as ProductType[]).map(key => (
            <option key={key} value={key}>{PRODUCT_LABELS[key]}</option>
          ))}
        </select>
        <button
          onClick={handleNewPartner}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {filteredPartners.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">Nenhum cliente encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700 w-8"></th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">Nome</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">CNPJ</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">Produtos</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">Limite Total</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">Limite Disponível</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">Taxas</th>
                    <th className="text-right py-3 px-3 text-sm font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartners.map((partner) => {
                    const availableLimit = partner.totalLimit - partner.usedLimit;
                    const usagePercent = partner.totalLimit > 0 ? (partner.usedLimit / partner.totalLimit) * 100 : 0;
                    const isExpanded = expandedPartnerId === partner.id;

                    return (
                      <React.Fragment key={partner.id}>
                        <tr
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleExpanded(partner.id)}
                        >
                          <td className="py-3 px-3 text-sm">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </td>
                          <td className="py-3 px-3 text-sm font-medium text-gray-900">{partner.name}</td>
                          <td className="py-3 px-3 text-sm text-gray-600">{partner.document}</td>
                          <td className="py-3 px-3 text-sm">
                            <div className="flex flex-wrap gap-1">
                              {partner.allowedProducts.length === 0 ? (
                                <span className="text-xs text-gray-400">Nenhum</span>
                              ) : (
                                partner.allowedProducts.slice(0, 2).map(prod => (
                                  <span
                                    key={prod}
                                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRODUCT_COLORS[prod]}`}
                                  >
                                    {PRODUCT_LABELS[prod]}
                                  </span>
                                ))
                              )}
                              {partner.allowedProducts.length > 2 && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  +{partner.allowedProducts.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-sm text-gray-900 font-medium">
                            {formatCurrency(partner.totalLimit)}
                          </td>
                          <td className="py-3 px-3 text-sm">
                            <div>
                              <span className={`font-medium ${availableLimit < partner.totalLimit * 0.2 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {formatCurrency(availableLimit)}
                              </span>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div
                                  className={`h-1.5 rounded-full ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                partner.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {partner.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-sm">
                            {partner.hasCustomRates ? (
                              <div className="flex items-center space-x-1 text-blue-600">
                                <Percent className="w-4 h-4" />
                                <span className="text-xs font-medium">Custom</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">Padrão</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-sm text-right">
                            <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleEditPartner(partner)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {deleteConfirm === partner.id ? (
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => handleDeletePartner(partner.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    title="Confirmar exclusão"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                    title="Cancelar"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(partner.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={9} className="bg-gray-50 px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Contact Info */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Informações de Contato</h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center text-sm">
                                      <span className="text-gray-500 w-20">Email:</span>
                                      <span className="text-gray-900">{partner.email}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                      <span className="text-gray-500 w-20">Telefone:</span>
                                      <span className="text-gray-900">{partner.phone}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Products & Limits */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Produtos Habilitados & Limites</h4>
                                  <div className="space-y-2">
                                    {(Object.keys(PRODUCT_LABELS) as ProductType[]).map(prod => {
                                      const isAllowed = partner.allowedProducts.includes(prod);
                                      return (
                                        <div key={prod} className="flex items-center justify-between text-sm">
                                          <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${isAllowed ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <span className={isAllowed ? 'text-gray-900' : 'text-gray-400'}>
                                              {PRODUCT_LABELS[prod]}
                                            </span>
                                          </div>
                                          <span className={`text-xs font-medium ${isAllowed ? 'text-green-600' : 'text-gray-400'}`}>
                                            {isAllowed ? 'Habilitado' : 'Desabilitado'}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="text-gray-500">Utilização do limite</span>
                                      <span className="font-medium text-gray-900">
                                        {partner.totalLimit > 0 ? Math.round((partner.usedLimit / partner.totalLimit) * 100) : 0}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                      <div
                                        className={`h-2 rounded-full ${
                                          (partner.usedLimit / partner.totalLimit) * 100 > 80
                                            ? 'bg-red-500'
                                            : (partner.usedLimit / partner.totalLimit) * 100 > 50
                                            ? 'bg-yellow-500'
                                            : 'bg-emerald-500'
                                        }`}
                                        style={{ width: `${Math.min((partner.usedLimit / partner.totalLimit) * 100, 100)}%` }}
                                      />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                      <div>
                                        <span className="text-gray-500">Total</span>
                                        <p className="font-medium text-gray-900">{formatCurrency(partner.totalLimit)}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Utilizado</span>
                                        <p className="font-medium text-gray-900">{formatCurrency(partner.usedLimit)}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Disponível</span>
                                        <p className="font-medium text-emerald-600">{formatCurrency(partner.totalLimit - partner.usedLimit)}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <NewPartnerModal
        isOpen={isNewPartnerModalOpen}
        onClose={() => {
          setIsNewPartnerModalOpen(false);
          setEditingPartner(null);
        }}
        onSave={handleSavePartner}
        editingPartner={editingPartner ? {
          name: editingPartner.name,
          document: editingPartner.document,
          email: editingPartner.email,
          phone: editingPartner.phone,
          status: editingPartner.status,
          allowedProducts: editingPartner.allowedProducts,
          totalLimit: editingPartner.totalLimit,
        } : undefined}
      />
    </div>
  );
};
