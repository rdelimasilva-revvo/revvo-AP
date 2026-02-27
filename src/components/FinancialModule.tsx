import React, { useState } from 'react';
import {
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  Trash2,
  Save,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  Scissors,
  ShieldX,
  Clock,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { NonAcceptanceCriteria, STORAGE_PREFIX, defaultCriteria, loadCriteria, hasClientCriteria } from '../utils/nonAcceptanceCriteria';

interface InterestCurvePoint {
  days: number;
  rate: number;
}

interface ClientRate {
  daysFrom: number;
  daysTo: number;
  rate: number;
}

export const FinancialModule: React.FC = () => {
  const { clients } = useData();
  const [activeTab, setActiveTab] = useState<'rates' | 'curve' | 'haircut' | 'criteria'>('rates');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [clientRates, setClientRates] = useState<Map<string, ClientRate[]>>(
    () => {
      const map = new Map();
      clients.forEach(c => {
        const saved = localStorage.getItem(`clientDiscountRates_${c.id}`);
        if (saved) {
          map.set(c.id, JSON.parse(saved));
        }
      });
      return map;
    }
  );
  const [interestCurve, setInterestCurve] = useState<InterestCurvePoint[]>(() => {
    const saved = localStorage.getItem('interestCurve');
    return saved ? JSON.parse(saved) : [
      { days: 30, rate: 1.5 },
      { days: 60, rate: 1.8 },
      { days: 90, rate: 2.1 },
      { days: 180, rate: 2.8 },
      { days: 360, rate: 3.5 },
    ];
  });
  const [defaultHaircut, setDefaultHaircut] = useState<number>(() => {
    const saved = localStorage.getItem('defaultHaircut');
    return saved ? Number(saved) : 0;
  });
  const [clientHaircuts, setClientHaircuts] = useState<Map<string, number>>(() => {
    const map = new Map<string, number>();
    clients.forEach(c => {
      const saved = localStorage.getItem(`clientHaircut_${c.id}`);
      if (saved) {
        map.set(c.id, Number(saved));
      }
    });
    return map;
  });
  const [haircutSearchTerm, setHaircutSearchTerm] = useState('');
  const [expandedHaircutClient, setExpandedHaircutClient] = useState<string | null>(null);
  const [defaultRates, setDefaultRates] = useState<ClientRate[]>(() => {
    const saved = localStorage.getItem('defaultDiscountRates');
    return saved ? JSON.parse(saved) : [{ daysFrom: 1, daysTo: 30, rate: 2.5 }];
  });
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [savedSection, setSavedSection] = useState('');

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document.includes(searchTerm)
  );

  const getClientRates = (clientId: string) => {
    return clientRates.get(clientId) || [{ daysFrom: 1, daysTo: 30, rate: 2.5 }];
  };

  const updateClientRate = (clientId: string, index: number, field: keyof ClientRate, value: number) => {
    const rates = [...getClientRates(clientId)];
    rates[index][field] = value;
    setClientRates(prev => {
      const newMap = new Map(prev);
      newMap.set(clientId, rates);
      return newMap;
    });
  };

  const addClientRate = (clientId: string) => {
    const rates = getClientRates(clientId);
    const last = rates[rates.length - 1];
    const newRate = {
      daysFrom: last ? last.daysTo + 1 : 1,
      daysTo: last ? last.daysTo + 30 : 30,
      rate: 2.5,
    };
    setClientRates(prev => {
      const newMap = new Map(prev);
      newMap.set(clientId, [...rates, newRate]);
      return newMap;
    });
  };

  const removeClientRate = (clientId: string, index: number) => {
    const rates = getClientRates(clientId);
    if (rates.length <= 1) return;
    setClientRates(prev => {
      const newMap = new Map(prev);
      newMap.set(clientId, rates.filter((_, i) => i !== index));
      return newMap;
    });
  };

  const saveClientRates = (clientId: string) => {
    const rates = getClientRates(clientId);
    localStorage.setItem(`clientDiscountRates_${clientId}`, JSON.stringify(rates));
    setSavedSection(clientId);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const updateDefaultRate = (index: number, field: keyof ClientRate, value: number) => {
    setDefaultRates(prev => {
      const newRates = [...prev];
      newRates[index] = { ...newRates[index], [field]: value };
      return newRates;
    });
  };

  const addDefaultRate = () => {
    const last = defaultRates[defaultRates.length - 1];
    setDefaultRates(prev => [...prev, {
      daysFrom: last ? last.daysTo + 1 : 1,
      daysTo: last ? last.daysTo + 30 : 30,
      rate: 2.5,
    }]);
  };

  const removeDefaultRate = (index: number) => {
    if (defaultRates.length <= 1) return;
    setDefaultRates(prev => prev.filter((_, i) => i !== index));
  };

  const saveDefaultRates = () => {
    localStorage.setItem('defaultDiscountRates', JSON.stringify(defaultRates));
    setSavedSection('defaultRates');
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const addCurvePoint = () => {
    const last = interestCurve[interestCurve.length - 1];
    setInterestCurve([...interestCurve, {
      days: last ? last.days + 30 : 30,
      rate: last ? last.rate + 0.3 : 1.5,
    }]);
  };

  const removeCurvePoint = (index: number) => {
    if (interestCurve.length <= 1) return;
    setInterestCurve(interestCurve.filter((_, i) => i !== index));
  };

  const updateCurvePoint = (index: number, field: keyof InterestCurvePoint, value: number) => {
    const newCurve = [...interestCurve];
    newCurve[index][field] = value;
    setInterestCurve(newCurve);
  };

  const saveCurve = () => {
    localStorage.setItem('interestCurve', JSON.stringify(interestCurve));
    setSavedSection('curve');
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const filteredHaircutClients = clients.filter(c =>
    c.name.toLowerCase().includes(haircutSearchTerm.toLowerCase()) ||
    c.document.includes(haircutSearchTerm)
  );

  const saveDefaultHaircut = () => {
    localStorage.setItem('defaultHaircut', String(defaultHaircut));
    setSavedSection('haircut');
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const saveClientHaircut = (clientId: string) => {
    const value = clientHaircuts.get(clientId) ?? defaultHaircut;
    localStorage.setItem(`clientHaircut_${clientId}`, String(value));
    setSavedSection(clientId);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const updateClientHaircut = (clientId: string, value: number) => {
    setClientHaircuts(prev => {
      const newMap = new Map(prev);
      newMap.set(clientId, value);
      return newMap;
    });
  };

  const removeClientHaircut = (clientId: string) => {
    setClientHaircuts(prev => {
      const newMap = new Map(prev);
      newMap.delete(clientId);
      return newMap;
    });
    localStorage.removeItem(`clientHaircut_${clientId}`);
    setSavedSection(clientId);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  // --- Não Aceite (Criteria) ---
  const [criteriaSearchTerm, setCriteriaSearchTerm] = useState('');
  const [expandedCriteriaClient, setExpandedCriteriaClient] = useState<string | null>(null);
  const [clientCriteria, setClientCriteria] = useState<Map<string, NonAcceptanceCriteria>>(() => {
    const map = new Map<string, NonAcceptanceCriteria>();
    clients.forEach(c => {
      const saved = localStorage.getItem(STORAGE_PREFIX + c.id);
      if (saved) {
        map.set(c.id, { ...defaultCriteria, ...JSON.parse(saved) });
      }
    });
    return map;
  });

  const filteredCriteriaClients = clients.filter(c =>
    c.name.toLowerCase().includes(criteriaSearchTerm.toLowerCase()) ||
    c.document.includes(criteriaSearchTerm)
  );

  const getCriteria = (clientId: string): NonAcceptanceCriteria => {
    return clientCriteria.get(clientId) || { ...defaultCriteria };
  };

  const updateCriteria = (clientId: string, partial: Partial<NonAcceptanceCriteria>) => {
    setClientCriteria(prev => {
      const newMap = new Map(prev);
      newMap.set(clientId, { ...getCriteria(clientId), ...partial });
      return newMap;
    });
  };

  const saveCriteria = (clientId: string) => {
    const criteria = getCriteria(clientId);
    localStorage.setItem(STORAGE_PREFIX + clientId, JSON.stringify(criteria));
    setSavedSection('criteria');
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const removeCriteria = (clientId: string) => {
    localStorage.removeItem(STORAGE_PREFIX + clientId);
    setClientCriteria(prev => {
      const newMap = new Map(prev);
      newMap.delete(clientId);
      return newMap;
    });
    setSavedSection('criteria');
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const formatCurrencyInput = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const amount = parseInt(numbers, 10) / 100;
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('rates')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all text-sm ${
            activeTab === 'rates'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Taxas por Cliente</span>
        </button>
        <button
          onClick={() => setActiveTab('curve')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all text-sm ${
            activeTab === 'curve'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Curva de Juros</span>
        </button>
        <button
          onClick={() => setActiveTab('haircut')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all text-sm ${
            activeTab === 'haircut'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Redutor de URs</span>
        </button>
        <button
          onClick={() => setActiveTab('criteria')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all text-sm ${
            activeTab === 'criteria'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <ShieldX className="w-4 h-4" />
          <span>Não Aceite</span>
        </button>
      </div>

      {/* Saved message */}
      {showSavedMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium text-sm">
            {savedSection === 'curve'
              ? 'Curva de juros salva com sucesso!'
              : savedSection === 'haircut'
              ? 'Redutor padrão salvo com sucesso!'
              : savedSection === 'criteria'
              ? 'Critérios de não aceite salvos com sucesso!'
              : savedSection === 'defaultRates'
              ? 'Taxa padrão salva com sucesso!'
              : 'Taxas salvas com sucesso!'}
          </p>
        </div>
      )}

      {/* Taxas por Cliente */}
      {activeTab === 'rates' && (
        <div className="space-y-4">
          {/* Taxa Padrão (Global) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Taxa Padrão</h2>
              <p className="text-sm text-gray-600 mt-1">
                Faixas de taxa aplicadas para todos os clientes que não possuem taxas personalizadas
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dias De</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dias Até</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Taxa (% a.m.)</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {defaultRates.map((rate, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={rate.daysFrom}
                          onChange={(e) => updateDefaultRate(index, 'daysFrom', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={rate.daysTo}
                          onChange={(e) => updateDefaultRate(index, 'daysTo', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={rate.rate}
                          step="0.01"
                          onChange={(e) => updateDefaultRate(index, 'rate', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removeDefaultRate(index)}
                          disabled={defaultRates.length === 1}
                          className={`p-1 rounded ${defaultRates.length === 1 ? 'text-gray-300' : 'text-red-500 hover:bg-red-50'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                onClick={addDefaultRate}
                className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar faixa</span>
              </button>
              <button
                onClick={saveDefaultRates}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                <Save className="w-4 h-4" />
                <span>Salvar</span>
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mt-4 flex items-center gap-2">
              <span className="text-xs font-medium text-amber-800">A taxa padrão só é aplicada para clientes que não possuem taxa específica cadastrada.</span>
            </div>
          </div>

          {/* Taxas por Cliente */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Taxas por Cliente</h2>
                <p className="text-sm text-gray-600 mt-1">Configure taxas personalizadas para clientes específicos (sobrescrevem a taxa padrão)</p>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="space-y-3">
              {filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nenhum cliente encontrado</p>
                </div>
              ) : (
                filteredClients.map((client) => {
                  const isExpanded = expandedClient === client.id;
                  const rates = getClientRates(client.id);
                  const hasCustom = clientRates.has(client.id);

                  return (
                    <div key={client.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${hasCustom ? 'bg-blue-500' : 'bg-gray-300'}`} />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{client.name}</p>
                            <p className="text-xs text-gray-500">{client.document}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasCustom && (
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              Taxa personalizada
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
                          <table className="min-w-full">
                            <thead>
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dias De</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dias Até</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Taxa (% a.m.)</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-16"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {rates.map((rate, index) => (
                                <tr key={index}>
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      value={rate.daysFrom}
                                      onChange={(e) => updateClientRate(client.id, index, 'daysFrom', Number(e.target.value))}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      value={rate.daysTo}
                                      onChange={(e) => updateClientRate(client.id, index, 'daysTo', Number(e.target.value))}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      value={rate.rate}
                                      step="0.01"
                                      onChange={(e) => updateClientRate(client.id, index, 'rate', Number(e.target.value))}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <button
                                      onClick={() => removeClientRate(client.id, index)}
                                      disabled={rates.length === 1}
                                      className={`p-1 rounded ${rates.length === 1 ? 'text-gray-300' : 'text-red-500 hover:bg-red-50'}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <div className="flex items-center justify-between pt-2">
                            <button
                              onClick={() => addClientRate(client.id)}
                              className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded text-sm"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Adicionar faixa</span>
                            </button>
                            <button
                              onClick={() => saveClientRates(client.id)}
                              className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              <Save className="w-4 h-4" />
                              <span>Salvar</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Redutor de URs (Haircut) */}
      {activeTab === 'haircut' && (
        <div className="space-y-4">
          {/* Redutor Padrão (Global) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Redutor Padrão</h2>
              <p className="text-sm text-gray-600 mt-1">
                Percentual redutor aplicado sobre o valor de captura das URs para todos os clientes (exceto os que possuem valor personalizado)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <input
                  type="number"
                  value={defaultHaircut}
                  onChange={(e) => setDefaultHaircut(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
              <button
                onClick={saveDefaultHaircut}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                <Save className="w-4 h-4" />
                <span>Salvar</span>
              </button>
            </div>
          </div>

          {/* Redutores por Cliente */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Redutores por Cliente</h2>
                <p className="text-sm text-gray-600 mt-1">Configure redutores personalizados para clientes específicos</p>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou CNPJ..."
                value={haircutSearchTerm}
                onChange={(e) => setHaircutSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="space-y-3">
              {filteredHaircutClients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nenhum cliente encontrado</p>
                </div>
              ) : (
                filteredHaircutClients.map((client) => {
                  const isExpanded = expandedHaircutClient === client.id;
                  const hasCustom = clientHaircuts.has(client.id);
                  const currentValue = clientHaircuts.get(client.id) ?? defaultHaircut;

                  return (
                    <div key={client.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedHaircutClient(isExpanded ? null : client.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${hasCustom ? 'bg-blue-500' : 'bg-gray-300'}`} />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{client.name}</p>
                            <p className="text-xs text-gray-500">{client.document}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasCustom && (
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              Redutor personalizado
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700">Redutor (%)</label>
                            <div className="relative flex-1 max-w-xs">
                              <input
                                type="number"
                                value={currentValue}
                                onChange={(e) => updateClientHaircut(client.id, Number(e.target.value))}
                                min="0"
                                max="100"
                                step="0.01"
                                className="w-full px-3 py-1.5 pr-8 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            {hasCustom ? (
                              <button
                                onClick={() => removeClientHaircut(client.id)}
                                className="flex items-center gap-1 text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded text-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Usar padrão</span>
                              </button>
                            ) : (
                              <span className="text-xs text-gray-500">Usando redutor padrão ({defaultHaircut}%)</span>
                            )}
                            <button
                              onClick={() => saveClientHaircut(client.id)}
                              className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              <Save className="w-4 h-4" />
                              <span>Salvar</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Scissors className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 text-sm mb-1">O que é o Redutor de Captura (Haircut)?</h3>
                <p className="text-xs text-blue-800">
                  O redutor de captura (haircut) é um percentual aplicado sobre o valor da UR para reduzir o montante
                  efetivamente considerado na operação. Por exemplo, um haircut de 10% sobre uma UR de R$ 100,00
                  fará com que apenas R$ 90,00 sejam considerados. Clientes com redutor personalizado utilizam
                  seu valor específico; os demais utilizam o redutor padrão global.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Não Aceite (Criteria) */}
      {activeTab === 'criteria' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Critérios de Não Aceite por Cliente</h2>
                <p className="text-sm text-gray-600 mt-1">Configure critérios de prazo e valor de URs para rejeição automática por cliente</p>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou CNPJ..."
                value={criteriaSearchTerm}
                onChange={(e) => setCriteriaSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="space-y-3">
              {filteredCriteriaClients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nenhum cliente encontrado</p>
                </div>
              ) : (
                filteredCriteriaClients.map((client) => {
                  const isExpanded = expandedCriteriaClient === client.id;
                  const criteria = getCriteria(client.id);
                  const isConfigured = hasClientCriteria(client.id);

                  return (
                    <div key={client.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedCriteriaClient(isExpanded ? null : client.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-red-500' : 'bg-gray-300'}`} />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{client.name}</p>
                            <p className="text-xs text-gray-500">{client.document}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isConfigured && (
                            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                              Configurado
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                          {/* Bloco Prazo */}
                          <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">Prazo de URs (dias)</span>
                              </div>
                              <button
                                onClick={() => updateCriteria(client.id, { termEnabled: !criteria.termEnabled })}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                  criteria.termEnabled ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                    criteria.termEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                                  }`}
                                />
                              </button>
                            </div>
                            {criteria.termEnabled && (
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <label className="text-xs text-gray-500 mb-1 block">Mínimo</label>
                                  <input
                                    type="number"
                                    value={criteria.minTerm}
                                    onChange={(e) => updateCriteria(client.id, { minTerm: e.target.value })}
                                    placeholder="0"
                                    min="0"
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <span className="text-gray-400 mt-5">—</span>
                                <div className="flex-1">
                                  <label className="text-xs text-gray-500 mb-1 block">Máximo</label>
                                  <input
                                    type="number"
                                    value={criteria.maxTerm}
                                    onChange={(e) => updateCriteria(client.id, { maxTerm: e.target.value })}
                                    placeholder="0"
                                    min="0"
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Bloco Valor */}
                          <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">Valor de URs (R$)</span>
                              </div>
                              <button
                                onClick={() => updateCriteria(client.id, { valueEnabled: !criteria.valueEnabled })}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                  criteria.valueEnabled ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                    criteria.valueEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                                  }`}
                                />
                              </button>
                            </div>
                            {criteria.valueEnabled && (
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <label className="text-xs text-gray-500 mb-1 block">Mínimo</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                                    <input
                                      type="text"
                                      value={criteria.minValue}
                                      onChange={(e) => updateCriteria(client.id, { minValue: formatCurrencyInput(e.target.value) })}
                                      placeholder="0,00"
                                      className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>
                                <span className="text-gray-400 mt-5">—</span>
                                <div className="flex-1">
                                  <label className="text-xs text-gray-500 mb-1 block">Máximo</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                                    <input
                                      type="text"
                                      value={criteria.maxValue}
                                      onChange={(e) => updateCriteria(client.id, { maxValue: formatCurrencyInput(e.target.value) })}
                                      placeholder="0,00"
                                      className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Botões */}
                          <div className="flex items-center justify-between pt-2">
                            {isConfigured ? (
                              <button
                                onClick={() => removeCriteria(client.id)}
                                className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded text-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Remover Critérios</span>
                              </button>
                            ) : (
                              <span />
                            )}
                            <button
                              onClick={() => saveCriteria(client.id)}
                              className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              <Save className="w-4 h-4" />
                              <span>Salvar</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ShieldX className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 text-sm mb-1">O que são Critérios de Não Aceite?</h3>
                <p className="text-xs text-blue-800">
                  Os critérios de não aceite permitem definir regras automáticas para rejeição de URs por cliente,
                  com base no prazo e no valor. Quando ativados, URs com prazo ou valor fora dos intervalos
                  configurados (mínimo e máximo) serão automaticamente marcadas como não aceitas.
                  As configurações realizadas aqui são compartilhadas com o cadastro de clientes e vice-versa.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Curva de Juros */}
      {activeTab === 'curve' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Curva de Juros</h2>
            <p className="text-sm text-gray-600 mt-1">
              Defina a curva de juros utilizada como referência nas operações de antecipação
            </p>
          </div>

          {/* Visual da curva */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-end gap-1 h-40">
              {interestCurve
                .sort((a, b) => a.days - b.days)
                .map((point, index) => {
                  const maxRate = Math.max(...interestCurve.map(p => p.rate));
                  const heightPercent = maxRate > 0 ? (point.rate / maxRate) * 100 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-blue-700">{point.rate}%</span>
                      <div
                        className="w-full bg-blue-500 rounded-t-sm min-h-[4px] transition-all"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-xs text-gray-500">{point.days}d</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Tabela editável */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prazo (dias)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxa (% a.m.)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {interestCurve.map((point, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={point.days}
                        onChange={(e) => updateCurvePoint(index, 'days', Number(e.target.value))}
                        min="1"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={point.rate}
                        onChange={(e) => updateCurvePoint(index, 'rate', Number(e.target.value))}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeCurvePoint(index)}
                        disabled={interestCurve.length === 1}
                        className={`p-1.5 rounded ${interestCurve.length === 1 ? 'text-gray-300' : 'text-red-500 hover:bg-red-50'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={addCurvePoint}
              className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Ponto</span>
            </button>
            <button
              onClick={saveCurve}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Curva</span>
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 text-sm mb-1">Informação</h3>
                <p className="text-xs text-blue-800">
                  A curva de juros serve como referência base para o cálculo de desconto nas operações de antecipação.
                  As taxas por cliente, quando configuradas, sobrescrevem os valores desta curva.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
