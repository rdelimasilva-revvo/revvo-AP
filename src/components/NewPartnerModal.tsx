import React, { useState, useEffect } from 'react';
import { X, Users, Building2, DollarSign } from 'lucide-react';

type ProductType = 'debt-settlement' | 'guarantee' | 'extra-limit' | 'anticipation';

const PRODUCT_OPTIONS: { value: ProductType; label: string; description: string; color: string }[] = [
  { value: 'debt-settlement', label: 'Recuperação de crédito', description: 'Operações de recuperação e cobrança de créditos', color: 'border-orange-300 bg-orange-50 text-orange-700' },
  { value: 'guarantee', label: 'Garantias', description: 'Operações com garantias de recebíveis', color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { value: 'extra-limit', label: 'Pré-pagamento', description: 'Operações de pré-pagamento e limite extra', color: 'border-purple-300 bg-purple-50 text-purple-700' },
  { value: 'anticipation', label: 'Antecipação', description: 'Antecipação de recebíveis', color: 'border-green-300 bg-green-50 text-green-700' },
];

interface EditingPartnerData {
  name: string;
  document: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  allowedProducts: ProductType[];
  totalLimit: number;
}

interface NewPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerType?: 'client' | 'supplier';
  onSave: (data: PartnerFormData) => void;
  editingPartner?: EditingPartnerData;
}

interface PartnerFormData {
  partnerType: 'client' | 'supplier';
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: 'active' | 'inactive';
  allowedProducts: ProductType[];
  totalLimit: number;
}

const formatCurrencyInput = (value: string): string => {
  const num = value.replace(/\D/g, '');
  if (!num) return '';
  const cents = parseInt(num, 10);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
};

const parseCurrencyInput = (value: string): number => {
  const num = value.replace(/\D/g, '');
  if (!num) return 0;
  return parseInt(num, 10) / 100;
};

export const NewPartnerModal: React.FC<NewPartnerModalProps> = ({
  isOpen,
  onClose,
  partnerType: initialPartnerType,
  onSave,
  editingPartner,
}) => {
  const isEditing = !!editingPartner;

  const getInitialFormData = (): PartnerFormData => ({
    partnerType: initialPartnerType || 'client',
    name: editingPartner?.name || '',
    document: editingPartner?.document || '',
    email: editingPartner?.email || '',
    phone: editingPartner?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    status: editingPartner?.status || 'active',
    allowedProducts: editingPartner?.allowedProducts || [],
    totalLimit: editingPartner?.totalLimit || 0,
  });

  const [formData, setFormData] = useState<PartnerFormData>(getInitialFormData());
  const [limitDisplay, setLimitDisplay] = useState('');

  useEffect(() => {
    if (isOpen) {
      const initial = getInitialFormData();
      setFormData(initial);
      if (initial.totalLimit > 0) {
        setLimitDisplay(
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(initial.totalLimit)
        );
      } else {
        setLimitDisplay('');
      }
    }
  }, [isOpen, editingPartner]);

  const toggleProduct = (product: ProductType) => {
    setFormData(prev => ({
      ...prev,
      allowedProducts: prev.allowedProducts.includes(product)
        ? prev.allowedProducts.filter(p => p !== product)
        : [...prev.allowedProducts, product],
    }));
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatCurrencyInput(raw);
    setLimitDisplay(formatted);
    setFormData(prev => ({ ...prev, totalLimit: parseCurrencyInput(raw) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData(getInitialFormData());
    setLimitDisplay('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {formData.partnerType === 'client' ? (
                <Users className="w-6 h-6 text-blue-600" />
              ) : (
                <Building2 className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Atualize os dados do cliente' : 'Preencha os dados do cliente'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Dados Cadastrais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome / Razão Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address (only for new) */}
            {!isEditing && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Rua, Número, Complemento"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome da cidade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione</option>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="BA">Bahia</option>
                      <option value="PR">Paraná</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="RS">Rio Grande do Sul</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Products Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Produtos Habilitados</h3>
              <p className="text-xs text-gray-500 mb-3">Selecione quais produtos este cliente pode operar</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PRODUCT_OPTIONS.map(product => {
                  const isSelected = formData.allowedProducts.includes(product.value);
                  return (
                    <button
                      key={product.value}
                      type="button"
                      onClick={() => toggleProduct(product.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? `${product.color} border-current`
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{product.label}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-current bg-current' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <p className="text-xs mt-1 opacity-75">{product.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Limit Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Limite de Operação</h3>
              <p className="text-xs text-gray-500 mb-3">Defina o limite total disponível para este cliente</p>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={limitDisplay}
                  onChange={handleLimitChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="R$ 0,00"
                />
              </div>
              {formData.totalLimit > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Limite definido: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.totalLimit)}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
