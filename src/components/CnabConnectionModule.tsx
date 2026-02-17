import React, { useState } from 'react';
import {
  Server,
  Plus,
  Trash2,
  Pencil,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  ArrowUpDown,
  X,
  Loader2,
  Shield,
  Wifi
} from 'lucide-react';

interface SftpConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  remoteDirectory: string;
  schedule: 'manual' | 'daily' | 'hourly' | 'weekly';
  scheduleTime?: string;
  isActive: boolean;
  lastTestStatus: 'success' | 'failed' | 'untested';
  lastTestDate?: Date;
}

interface TransferLog {
  id: string;
  connectionId: string;
  connectionName: string;
  fileName: string;
  fileSize: string;
  status: 'success' | 'failed' | 'sending';
  timestamp: Date;
  errorMessage?: string;
}

const mockConnections: SftpConnection[] = [
  {
    id: 'conn-1',
    name: 'Bradesco - Remessa CNAB',
    host: 'sftp.bradesco.com.br',
    port: 22,
    username: 'revvo_prod',
    password: '••••••••••',
    remoteDirectory: '/incoming/cnab/',
    schedule: 'daily',
    scheduleTime: '06:00',
    isActive: true,
    lastTestStatus: 'success',
    lastTestDate: new Date('2026-02-14T10:30:00'),
  },
  {
    id: 'conn-2',
    name: 'Itaú - Retorno',
    host: 'sftp.itau.com.br',
    port: 2222,
    username: 'revvo_ret',
    password: '••••••••••',
    remoteDirectory: '/files/retorno/',
    schedule: 'hourly',
    isActive: true,
    lastTestStatus: 'failed',
    lastTestDate: new Date('2026-02-13T15:45:00'),
  },
  {
    id: 'conn-3',
    name: 'Fundo ABC - Garantias',
    host: '192.168.1.100',
    port: 22,
    username: 'fundo_abc',
    password: '••••••••••',
    remoteDirectory: '/data/',
    schedule: 'manual',
    isActive: false,
    lastTestStatus: 'untested',
  },
];

const mockLogs: TransferLog[] = [
  { id: 'log-1', connectionId: 'conn-1', connectionName: 'Bradesco - Remessa CNAB', fileName: 'CNAB400_REM_20260215_001.txt', fileSize: '2.4 MB', status: 'success', timestamp: new Date('2026-02-15T06:02:13') },
  { id: 'log-2', connectionId: 'conn-1', connectionName: 'Bradesco - Remessa CNAB', fileName: 'CNAB400_REM_20260214_001.txt', fileSize: '2.1 MB', status: 'success', timestamp: new Date('2026-02-14T06:01:45') },
  { id: 'log-3', connectionId: 'conn-2', connectionName: 'Itaú - Retorno', fileName: 'CNAB240_RET_20260214_003.txt', fileSize: '1.8 MB', status: 'failed', timestamp: new Date('2026-02-14T15:45:22'), errorMessage: 'Connection refused: host unreachable' },
  { id: 'log-4', connectionId: 'conn-2', connectionName: 'Itaú - Retorno', fileName: 'CNAB240_RET_20260214_002.txt', fileSize: '1.6 MB', status: 'success', timestamp: new Date('2026-02-14T12:00:10') },
  { id: 'log-5', connectionId: 'conn-1', connectionName: 'Bradesco - Remessa CNAB', fileName: 'CNAB400_REM_20260213_001.txt', fileSize: '2.3 MB', status: 'success', timestamp: new Date('2026-02-13T06:01:58') },
  { id: 'log-6', connectionId: 'conn-2', connectionName: 'Itaú - Retorno', fileName: 'CNAB240_RET_20260213_001.txt', fileSize: '1.5 MB', status: 'success', timestamp: new Date('2026-02-13T08:00:05') },
];

const scheduleLabels: Record<string, string> = {
  manual: 'Manual',
  daily: 'Diário',
  hourly: 'A cada hora',
  weekly: 'Semanal',
};

export const CnabConnectionModule: React.FC = () => {
  const [connections, setConnections] = useState<SftpConnection[]>(mockConnections);
  const [logs] = useState<TransferLog[]>(mockLogs);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
  const [logFilter, setLogFilter] = useState<string>('all');

  // Form state
  const [formName, setFormName] = useState('');
  const [formHost, setFormHost] = useState('');
  const [formPort, setFormPort] = useState('22');
  const [formUser, setFormUser] = useState('');
  const [formPass, setFormPass] = useState('');
  const [formDir, setFormDir] = useState('');
  const [formSchedule, setFormSchedule] = useState<SftpConnection['schedule']>('manual');
  const [formTime, setFormTime] = useState('06:00');

  const resetForm = () => {
    setFormName('');
    setFormHost('');
    setFormPort('22');
    setFormUser('');
    setFormPass('');
    setFormDir('/');
    setFormSchedule('manual');
    setFormTime('06:00');
    setEditingId(null);
  };

  const handleOpenNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (conn: SftpConnection) => {
    setEditingId(conn.id);
    setFormName(conn.name);
    setFormHost(conn.host);
    setFormPort(String(conn.port));
    setFormUser(conn.username);
    setFormPass('');
    setFormDir(conn.remoteDirectory);
    setFormSchedule(conn.schedule);
    setFormTime(conn.scheduleTime || '06:00');
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formName.trim() || !formHost.trim() || !formUser.trim()) return;

    if (editingId) {
      setConnections(prev => prev.map(c =>
        c.id === editingId
          ? {
              ...c,
              name: formName.trim(),
              host: formHost.trim(),
              port: parseInt(formPort) || 22,
              username: formUser.trim(),
              password: formPass || c.password,
              remoteDirectory: formDir.trim() || '/',
              schedule: formSchedule,
              scheduleTime: formSchedule !== 'manual' ? formTime : undefined,
            }
          : c
      ));
    } else {
      const newConn: SftpConnection = {
        id: `conn-${Date.now()}`,
        name: formName.trim(),
        host: formHost.trim(),
        port: parseInt(formPort) || 22,
        username: formUser.trim(),
        password: formPass || '••••••••••',
        remoteDirectory: formDir.trim() || '/',
        schedule: formSchedule,
        scheduleTime: formSchedule !== 'manual' ? formTime : undefined,
        isActive: true,
        lastTestStatus: 'untested',
      };
      setConnections(prev => [...prev, newConn]);
    }

    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
    setConfirmDeleteId(null);
  };

  const handleToggleActive = (id: string) => {
    setConnections(prev => prev.map(c =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const handleTestConnection = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setConnections(prev => prev.map(c =>
        c.id === id
          ? { ...c, lastTestStatus: 'success', lastTestDate: new Date() }
          : c
      ));
      setTestingId(null);
    }, 2000);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredLogs = logFilter === 'all'
    ? logs
    : logs.filter(l => l.connectionId === logFilter);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).format(date);

  const formatDateShort = (date: Date) =>
    new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }).format(date);

  return (
    <div className="space-y-4">
      {/* Connections */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Server className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Conexões SFTP</h2>
              <p className="text-xs text-gray-500">Gerencie as conexões para envio e recebimento de arquivos CNAB</p>
            </div>
          </div>
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Conexão
          </button>
        </div>

        {connections.length === 0 ? (
          <div className="p-10 text-center">
            <Server className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">Nenhuma conexão configurada</p>
            <p className="text-xs text-gray-400">Adicione uma conexão SFTP para enviar arquivos CNAB</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {connections.map(conn => (
              <div key={conn.id} className="p-4">
                <div className="flex items-start gap-4">
                  {/* Status indicator */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    !conn.isActive
                      ? 'bg-gray-100 text-gray-400'
                      : conn.lastTestStatus === 'success'
                      ? 'bg-green-100 text-green-600'
                      : conn.lastTestStatus === 'failed'
                      ? 'bg-red-100 text-red-500'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {conn.lastTestStatus === 'success' ? (
                      <Wifi className="w-5 h-5" />
                    ) : conn.lastTestStatus === 'failed' ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <Server className="w-5 h-5" />
                    )}
                  </div>

                  {/* Connection info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{conn.name}</span>
                      {!conn.isActive && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">Inativo</span>
                      )}
                      {conn.isActive && conn.lastTestStatus === 'success' && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">Conectado</span>
                      )}
                      {conn.isActive && conn.lastTestStatus === 'failed' && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium">Falha</span>
                      )}
                      {conn.isActive && conn.lastTestStatus === 'untested' && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded font-medium">Não testado</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1.5 mt-2">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Host</p>
                        <p className="text-xs text-gray-700 font-mono">{conn.host}:{conn.port}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Usuário</p>
                        <p className="text-xs text-gray-700 font-mono">{conn.username}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Diretório</p>
                        <p className="text-xs text-gray-700 font-mono">{conn.remoteDirectory}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Agendamento</p>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-700">
                            {scheduleLabels[conn.schedule]}
                            {conn.scheduleTime && ` às ${conn.scheduleTime}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {conn.lastTestDate && (
                      <p className="text-[10px] text-gray-400 mt-2">
                        Último teste: {formatDateShort(conn.lastTestDate)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleTestConnection(conn.id)}
                      disabled={testingId === conn.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {testingId === conn.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      Testar
                    </button>
                    <button
                      onClick={() => handleToggleActive(conn.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        conn.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={conn.isActive ? 'Desativar' : 'Ativar'}
                    >
                      {conn.isActive ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(conn)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {confirmDeleteId === conn.id ? (
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          onClick={() => handleDelete(conn.id)}
                          className="px-2 py-1 text-[10px] font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-[10px] font-medium text-gray-500 hover:bg-gray-100 rounded transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(conn.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transfer logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">Histórico de Transferências</h3>
            <span className="text-xs text-gray-400">({filteredLogs.length})</span>
          </div>
          <select
            value={logFilter}
            onChange={e => setLogFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">Todas as conexões</option>
            {connections.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Conexão</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Arquivo</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tamanho</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Data/Hora</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Detalhe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {log.status === 'success' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Sucesso
                      </span>
                    ) : log.status === 'failed' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" />
                        Falha
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Enviando
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700">{log.connectionName}</td>
                  <td className="px-4 py-3 text-xs text-gray-700 font-mono">{log.fileName}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{log.fileSize}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(log.timestamp)}</td>
                  <td className="px-4 py-3 text-xs text-red-500">{log.errorMessage || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => { setShowForm(false); resetForm(); }} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] sm:max-w-lg">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {editingId ? 'Editar Conexão' : 'Nova Conexão SFTP'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Configure os dados de acesso ao servidor</p>
                </div>
                <button
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Conexão *</label>
                  <input
                    type="text"
                    placeholder="Ex: Bradesco - Remessa CNAB"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                {/* Host + Port */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Host *</label>
                    <input
                      type="text"
                      placeholder="sftp.exemplo.com.br"
                      value={formHost}
                      onChange={e => setFormHost(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Porta</label>
                    <input
                      type="number"
                      value={formPort}
                      onChange={e => setFormPort(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                    />
                  </div>
                </div>

                {/* Username + Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuário *</label>
                    <input
                      type="text"
                      placeholder="usuario_sftp"
                      value={formUser}
                      onChange={e => setFormUser(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha {editingId && <span className="text-gray-400 font-normal">(deixe vazio para manter)</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.has('form') ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formPass}
                        onChange={e => setFormPass(e.target.value)}
                        className="w-full px-3 py-2 pr-9 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('form')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.has('form') ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remote directory */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diretório Remoto</label>
                  <input
                    type="text"
                    placeholder="/incoming/cnab/"
                    value={formDir}
                    onChange={e => setFormDir(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                  />
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agendamento</label>
                    <select
                      value={formSchedule}
                      onChange={e => setFormSchedule(e.target.value as SftpConnection['schedule'])}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="manual">Manual</option>
                      <option value="hourly">A cada hora</option>
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                    </select>
                  </div>
                  {formSchedule !== 'manual' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                      <input
                        type="time"
                        value={formTime}
                        onChange={e => setFormTime(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Security note */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    As credenciais são armazenadas de forma criptografada. A conexão utiliza protocolo SFTP com criptografia SSH.
                  </p>
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 flex justify-end gap-2">
                <button
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formName.trim() || !formHost.trim() || !formUser.trim()}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    formName.trim() && formHost.trim() && formUser.trim()
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {editingId ? 'Atualizar' : 'Salvar Conexão'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
