import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Calendar,
  FileCheck,
  FileText,
  BarChart3,
  Wallet,
  Save,
  RotateCcw,
  CheckSquare,
  Building2,
  Users,
  LayoutDashboard,
  User,
  Shield,
  Crown,
  Bot,
  Sliders,
  Settings
} from 'lucide-react';

interface MenuVisibilitySettings {
  overview: boolean;
  scheduleView: boolean;
  formalization: boolean;
  contractsMenu: boolean;
  monitoring: boolean;
  settlementControl: boolean;
  optIn: boolean;
  settlementDomicile: boolean;
  partnerRegistration: boolean;
  aiTools: boolean;
  menuSetup: boolean;
  operationParameters: boolean;
  cnabGroup: boolean;
}

type ProfileType = 'analista' | 'coordenador' | 'master';

interface MenuVisibilityByProfile {
  analista: MenuVisibilitySettings;
  coordenador: MenuVisibilitySettings;
  master: MenuVisibilitySettings;
}

const defaultSettings: MenuVisibilitySettings = {
  overview: true,
  scheduleView: true,
  formalization: true,
  contractsMenu: true,
  monitoring: true,
  settlementControl: true,
  optIn: true,
  settlementDomicile: true,
  partnerRegistration: true,
  aiTools: true,
  menuSetup: true,
  operationParameters: true,
  cnabGroup: true,
};

const profiles = [
  { id: 'analista' as ProfileType, label: 'Analista', icon: User },
  { id: 'coordenador' as ProfileType, label: 'Coordenador', icon: Shield },
  { id: 'master' as ProfileType, label: 'Master', icon: Crown },
];

function loadProfileSettings(): MenuVisibilityByProfile {
  const saved = localStorage.getItem('menuVisibilityByProfile');
  if (saved) {
    return JSON.parse(saved);
  }
  // Migrate from old single key if it exists
  const legacy = localStorage.getItem('menuVisibilitySettings');
  const base = legacy ? JSON.parse(legacy) : { ...defaultSettings };
  return {
    analista: { ...defaultSettings },
    coordenador: { ...defaultSettings },
    master: { ...base },
  };
}

export const MenuSetupModule: React.FC = () => {
  const [activeProfile, setActiveProfile] = useState<ProfileType>('master');
  const [allSettings, setAllSettings] = useState<MenuVisibilityByProfile>(loadProfileSettings);
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  const settings = allSettings[activeProfile];

  // Sync sidebar compatibility key whenever allSettings change
  useEffect(() => {
    localStorage.setItem('menuVisibilitySettings', JSON.stringify(allSettings.master));
    window.dispatchEvent(new Event('menuVisibilityChanged'));
  }, [allSettings]);

  const mainMenuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Captura de Recebíveis', key: 'overview' as keyof MenuVisibilitySettings },
    { id: 'scheduleView', icon: Calendar, label: 'Visão de agendas', key: 'scheduleView' as keyof MenuVisibilitySettings },
    { id: 'formalization', icon: FileCheck, label: 'Formalização', key: 'formalization' as keyof MenuVisibilitySettings },
    { id: 'contractsMenu', icon: FileText, label: 'Operações', key: 'contractsMenu' as keyof MenuVisibilitySettings },
    { id: 'monitoring', icon: BarChart3, label: 'Monitoramento', key: 'monitoring' as keyof MenuVisibilitySettings },
    { id: 'settlementControl', icon: Wallet, label: 'Liquidações', key: 'settlementControl' as keyof MenuVisibilitySettings },
    { id: 'aiTools', icon: Bot, label: 'AI Tools', key: 'aiTools' as keyof MenuVisibilitySettings },
  ];

  const settingsMenuItems = [
    { id: 'optIn', icon: CheckSquare, label: 'Opt-in', key: 'optIn' as keyof MenuVisibilitySettings },
    { id: 'settlementDomicile', icon: Building2, label: 'Domicílio de Liquidação', key: 'settlementDomicile' as keyof MenuVisibilitySettings },
    { id: 'partnerRegistration', icon: Users, label: 'Cadastro de Parceiros', key: 'partnerRegistration' as keyof MenuVisibilitySettings },
    { id: 'menuSetup', icon: Sliders, label: 'Configuração de Menus', key: 'menuSetup' as keyof MenuVisibilitySettings },
    { id: 'operationParameters', icon: Settings, label: 'Parâmetros de Operação', key: 'operationParameters' as keyof MenuVisibilitySettings },
    { id: 'cnabGroup', icon: FileText, label: 'Gerador de CNAB', key: 'cnabGroup' as keyof MenuVisibilitySettings },
  ];

  const toggleVisibility = (key: keyof MenuVisibilitySettings) => {
    setAllSettings(prev => ({
      ...prev,
      [activeProfile]: {
        ...prev[activeProfile],
        [key]: !prev[activeProfile][key],
      },
    }));
  };

  const handleSave = () => {
    localStorage.setItem('menuVisibilityByProfile', JSON.stringify(allSettings));
    // Sidebar compat is handled by useEffect
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  const handleReset = () => {
    setAllSettings(prev => ({
      ...prev,
      [activeProfile]: { ...defaultSettings },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Profile Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
        {profiles.map((profile) => {
          const Icon = profile.icon;
          const isActive = activeProfile === profile.id;
          return (
            <button
              key={profile.id}
              onClick={() => setActiveProfile(profile.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              <span>{profile.label}</span>
            </button>
          );
        })}
      </div>

      {/* Save message */}
      {showSaveMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckSquare className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">
            Configurações do perfil <span className="capitalize">{activeProfile}</span> salvas com sucesso!
          </p>
        </div>
      )}

      {/* Menu cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Menu Principal</h2>
            <p className="text-sm text-gray-600 mt-1">Controle quais itens aparecem no menu principal</p>
          </div>

          <div className="p-6 space-y-3">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isVisible = settings[item.key];

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isVisible ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <h3 className={`font-medium ${isVisible ? 'text-gray-900' : 'text-gray-500'}`}>
                        {item.label}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {isVisible ? 'Visível no menu' : 'Oculto do menu'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleVisibility(item.key)}
                    className={`p-2 rounded-lg transition-colors ${
                      isVisible
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {isVisible ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Submenu de Configurações</h2>
            <p className="text-sm text-gray-600 mt-1">Controle os itens do submenu de configurações</p>
          </div>

          <div className="p-6 space-y-3">
            {settingsMenuItems.map((item) => {
              const Icon = item.icon;
              const isVisible = settings[item.key];

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isVisible ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <h3 className={`font-medium ${isVisible ? 'text-gray-900' : 'text-gray-500'}`}>
                        {item.label}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {isVisible ? 'Visível no submenu' : 'Oculto do submenu'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleVisibility(item.key)}
                    className={`p-2 rounded-lg transition-colors ${
                      isVisible
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {isVisible ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Informação</h3>
            <p className="text-sm text-blue-800">
              Cada perfil possui sua própria configuração de menus. As alterações só serão aplicadas após clicar em "Salvar".
              Atualmente o menu lateral utiliza a configuração do perfil <strong>Master</strong> como padrão.
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Editando perfil: <span className="font-semibold capitalize text-gray-700">{activeProfile}</span>
        </p>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restaurar Padrão</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </div>
    </div>
  );
};
