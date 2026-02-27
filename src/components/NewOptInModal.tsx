import React, { useState, useEffect } from 'react';
import { X, FileText, Send, Loader2, Search, Plus, Upload, ChevronRight } from 'lucide-react';
import { NewClientModal } from './NewClientModal';
import { ImportClientsModal } from './ImportClientsModal';
import { showToast } from '../hooks/useToast';

interface NewOptInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Client {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
}

interface NewClientPayload {
  document: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const NewOptInModal: React.FC<NewOptInModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'select-client' | 'opt-in-details'>('select-client');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [formData, setFormData] = useState({
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && step === 'select-client') {
      loadClients();
    }
  }, [isOpen, step]);

  const loadClients = async () => {
    setIsLoadingClients(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/rest/v1/clients?select=*&order=created_at.desc`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const handleSaveNewClient = async (clientData: NewClientPayload | NewClientPayload[]) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const clientsToCreate = Array.isArray(clientData) ? clientData : [clientData];

      for (const client of clientsToCreate) {
        const response = await fetch(`${supabaseUrl}/rest/v1/clients`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            name: client.document,
            document: client.document,
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || ''
          })
        });

        if (!response.ok) {
          throw new Error('Erro ao criar cliente');
        }
      }

      await loadClients();
      setShowNewClientModal(false);
    } catch (err) {
      console.error('Error creating client:', err);
      showToast('error', 'Erro ao criar cliente');
    }
  };

  const handleImportClients = async (importedClients: NewClientPayload[]) => {
    await handleSaveNewClient(importedClients);
    setShowImportModal(false);
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setStep('opt-in-details');
  };

  const handleBack = () => {
    setStep('select-client');
    setSelectedClient(null);
  };

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient) {
      setError('Por favor, selecione um cliente');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/rest/v1/opt_in_requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          client_name: selectedClient.name,
          client_document: selectedClient.document,
          client_email: selectedClient.email,
          client_phone: selectedClient.phone,
          client_address: selectedClient.address,
          expiry_date: new Date(formData.expiryDate).toISOString(),
          status: 'pending_signature'
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar opt-in');
      }

      const [createdOptIn] = await response.json();

      const signatureUrl = `${window.location.origin}/optin-signature/${createdOptIn.signature_token}`;

      await navigator.clipboard.writeText(signatureUrl);

      showToast('success', 'Opt-in criado com sucesso!', 'Link de assinatura copiado para a área de transferência.');

      setFormData({
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      setStep('select-client');
      setSelectedClient(null);

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.document.includes(searchTerm)
  );

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Novo Opt-In</h2>
                <p className="text-sm text-gray-600">
                  {step === 'select-client' ? 'Selecione um cliente' : 'Dados do opt-in'}
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

          {step === 'select-client' ? (
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou CNPJ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Cliente</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
                >
                  <Upload className="w-4 h-4" />
                  <span>Importar</span>
                </button>
              </div>

              {isLoadingClients ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhum cliente encontrado</p>
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowNewClientModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Cadastrar Cliente</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowImportModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Importar Clientes</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleSelectClient(client)}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">{client.document}</div>
                          {client.email && (
                            <div className="text-xs text-gray-400">{client.email}</div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {selectedClient && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Cliente Selecionado</h3>
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Alterar
                    </button>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{selectedClient.name}</div>
                    <div className="text-gray-600">{selectedClient.document}</div>
                    {selectedClient.email && <div className="text-gray-500">{selectedClient.email}</div>}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Vencimento do Opt-In
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Como funciona?
                    </h4>
                    <p className="text-sm text-blue-700">
                      Ao criar o opt-in, um link exclusivo de assinatura será gerado.
                      Envie este link para o cliente assinar o termo de consentimento digitalmente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Criando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Criar Opt-In</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <NewClientModal
        isOpen={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        onSave={handleSaveNewClient}
      />

      <ImportClientsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportClients}
      />
    </>
  );
};
