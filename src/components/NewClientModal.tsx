import React, { useState } from 'react';
import { X, Plus, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { CNPJInput } from './MaskedInput';
import { useEscapeKey } from '../hooks/useKeyboardShortcuts';

interface SettlementAccountForm {
  bank: string;
  bankCode: string;
  agency: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
  holder: string;
}

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (clientData: any) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose, onSave }) => {
  const [cnpjList, setCnpjList] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSettlementAccount, setShowSettlementAccount] = useState(false);
  const [settlementAccount, setSettlementAccount] = useState<SettlementAccountForm>({
    bank: '',
    bankCode: '',
    agency: '',
    accountNumber: '',
    accountType: 'checking',
    holder: '',
  });

  useEscapeKey(() => {
    if (isOpen) onClose();
  });

  if (!isOpen) return null;

  const handleCnpjChange = (index: number, value: string) => {
    const newList = [...cnpjList];
    newList[index] = value;
    setCnpjList(newList);
    if (errors[`cnpj-${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`cnpj-${index}`];
      setErrors(newErrors);
    }
  };

  const addCnpjField = () => {
    setCnpjList([...cnpjList, '']);
  };

  const removeCnpjField = (index: number) => {
    if (cnpjList.length > 1) {
      const newList = cnpjList.filter((_, i) => i !== index);
      setCnpjList(newList);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    cnpjList.forEach((cnpj, index) => {
      if (!cnpj.trim()) {
        newErrors[`cnpj-${index}`] = 'CNPJ é obrigatório';
      } else {
        const cleanDoc = cnpj.replace(/\D/g, '');
        if (cleanDoc.length !== 14) {
          newErrors[`cnpj-${index}`] = 'CNPJ deve ter 14 dígitos';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const hasAccount = showSettlementAccount && settlementAccount.bank.trim();
    const clientsData = cnpjList.map((cnpj, index) => ({
      id: `client-${Date.now()}-${index}`,
      name: cnpj,
      email: '',
      document: cnpj,
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      totalLimit: 0,
      usedLimit: 0,
      availableLimit: 0,
      collateralValue: 0,
      status: 'pending',
      ...(hasAccount ? { settlementAccount: { ...settlementAccount } } : {}),
    }));

    if (onSave) {
      if (clientsData.length === 1) {
        onSave(clientsData[0]);
      } else {
        onSave(clientsData);
      }
    }

    handleClose();
  };

  const handleClose = () => {
    setCnpjList(['']);
    setErrors({});
    setShowSettlementAccount(false);
    setSettlementAccount({
      bank: '',
      bankCode: '',
      agency: '',
      accountNumber: '',
      accountType: 'checking',
      holder: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Novo Cliente</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            {cnpjList.map((cnpj, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ {index + 1} <span className="text-red-500">*</span>
                  </label>
                  <CNPJInput
                    value={cnpj}
                    onChange={(e) => {
                      handleCnpjChange(index, e.target.value);
                    }}
                    placeholder="00.000.000/0000-00"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors[`cnpj-${index}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    name={`cnpj-${index}`}
                  />
                  {errors[`cnpj-${index}`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`cnpj-${index}`]}</p>
                  )}
                </div>
                {cnpjList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCnpjField(index)}
                    className="mt-7 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addCnpjField}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Adicionar outro CNPJ</span>
            </button>
          </div>

          {/* Conta de Liquidação */}
          <div className="border border-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => setShowSettlementAccount(!showSettlementAccount)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-gray-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">Conta de Liquidação</p>
                  <p className="text-xs text-gray-500">Cadastrar conta bancária para liquidação dos recebíveis</p>
                </div>
              </div>
              {showSettlementAccount ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showSettlementAccount && (
              <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                    <input
                      type="text"
                      value={settlementAccount.bank}
                      onChange={(e) => setSettlementAccount(prev => ({ ...prev, bank: e.target.value }))}
                      placeholder="Ex: Banco do Brasil"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código do Banco</label>
                    <input
                      type="text"
                      value={settlementAccount.bankCode}
                      onChange={(e) => setSettlementAccount(prev => ({ ...prev, bankCode: e.target.value }))}
                      placeholder="Ex: 001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agência</label>
                    <input
                      type="text"
                      value={settlementAccount.agency}
                      onChange={(e) => setSettlementAccount(prev => ({ ...prev, agency: e.target.value }))}
                      placeholder="Ex: 1234-5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número da Conta</label>
                    <input
                      type="text"
                      value={settlementAccount.accountNumber}
                      onChange={(e) => setSettlementAccount(prev => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder="Ex: 12345678-9"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conta</label>
                    <select
                      value={settlementAccount.accountType}
                      onChange={(e) => setSettlementAccount(prev => ({ ...prev, accountType: e.target.value as 'checking' | 'savings' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="checking">Conta Corrente</option>
                      <option value="savings">Conta Poupança</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titular</label>
                    <input
                      type="text"
                      value={settlementAccount.holder}
                      onChange={(e) => setSettlementAccount(prev => ({ ...prev, holder: e.target.value }))}
                      placeholder="Nome do titular"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar {cnpjList.length > 1 ? `${cnpjList.length} Clientes` : 'Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
