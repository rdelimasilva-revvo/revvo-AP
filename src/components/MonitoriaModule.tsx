import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';

export type MonitoriaView = 'file-processing' | 'report-processing';

interface FileProcessingRecord {
  id: string;
  layout: string;
  filename: string;
  date: string;
  status: 'success' | 'processing' | 'error';
  records?: number;
  description?: string;
}

const mockAp005Files: FileProcessingRecord[] = [
  {
    id: '1',
    layout: 'CERC-AP005',
    filename: 'CERC-AP005_53462828_20250223_0000001.csv',
    date: '2025-02-23 09:15:32',
    status: 'success',
    records: 248,
    description: 'Arquivo de agenda batch - Filtro de agendas',
  },
  {
    id: '2',
    layout: 'CERC-AP005',
    filename: 'CERC-AP005_53462828_20250222_0000002.csv',
    date: '2025-02-22 14:42:18',
    status: 'success',
    records: 512,
    description: 'Arquivo de agenda batch',
  },
];

const mockAp013Files: FileProcessingRecord[] = [
  {
    id: '1',
    layout: 'CERC-AP013',
    filename: 'CERC-AP013_53462828_20250223_0000001_ret.csv',
    date: '2025-02-23 13:02:45',
    status: 'success',
    records: 89,
    description: 'Arquivo de situação de contrato - saída',
  },
  {
    id: '2',
    layout: 'CERC-AP013A',
    filename: 'CERC-AP013A_53462828_20250223_0000001_ret.csv',
    date: '2025-02-23 13:02:46',
    status: 'success',
    records: 89,
    description: 'Arquivo de retorno - situação de contrato',
  },
  {
    id: '3',
    layout: 'CERC-AP013',
    filename: 'CERC-AP013_53462828_20250222_0000002_ret.csv',
    date: '2025-02-22 13:15:22',
    status: 'error',
    records: 0,
    description: 'Erro: formato inválido na linha 12',
  },
];

interface ReportProcessingRecord {
  id: string;
  reportId: string;
  type: string;
  requestedAt: string;
  status: 'ready' | 'processing' | 'error';
}

const mockReports: ReportProcessingRecord[] = [
  {
    id: '1',
    reportId: 'REL-20250223-001',
    type: 'Relatório de Constatação - Avaliação',
    requestedAt: '2025-02-23 10:30:00',
    status: 'ready',
  },
  {
    id: '2',
    reportId: 'REL-20250223-002',
    type: 'Download em Lote - Documentos Fiscais XML',
    requestedAt: '2025-02-23 11:15:22',
    status: 'error',
  },
  {
    id: '3',
    reportId: 'REL-20250222-003',
    type: 'Relatório de Retorno - Processamento',
    requestedAt: '2025-02-22 16:45:10',
    status: 'ready',
  },
];

interface MonitoriaModuleProps {
  view: MonitoriaView;
}

const FileProcessingSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLayout, setSelectedLayout] = useState<string>('all');

  const allFiles = [...mockAp005Files, ...mockAp013Files];
  const filteredFiles = allFiles.filter(
    (f) =>
      (selectedLayout === 'all' || f.layout.includes(selectedLayout)) &&
      (f.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.layout.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusIcon = (status: FileProcessingRecord['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: FileProcessingRecord['status']) => {
    switch (status) {
      case 'success':
        return 'Concluído';
      case 'processing':
        return 'Processando';
      case 'error':
        return 'Erro';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-emerald-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Processamento dos Arquivos</h2>
                <p className="text-sm text-gray-600">
                  Acompanhe o processamento de arquivos AP005 (agenda batch) e AP013 (situação de contrato)
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedLayout}
                onChange={(e) => setSelectedLayout(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white hover:border-gray-300"
              >
                <option value="all">Todos os layouts</option>
                <option value="AP005">AP005 - Agenda Batch</option>
                <option value="AP013">AP013 - Situação Contrato</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar arquivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Layout</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Arquivo</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data/Hora</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registros</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                      {file.layout}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{file.filename}</p>
                      {file.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{file.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{file.date}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{file.records ?? '-'}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(file.status)}
                      <span className="text-sm font-medium text-gray-700">{getStatusLabel(file.status)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {file.status === 'success' && (
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                        <Download className="w-4 h-4" />
                        Baixar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFiles.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum arquivo encontrado com os filtros aplicados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ReportProcessingSection: React.FC = () => {
  const getStatusBadge = (status: ReportProcessingRecord['status']) => {
    switch (status) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
            <CheckCircle className="w-3.5 h-3.5" />
            Disponível
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Processando
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
            <AlertCircle className="w-3.5 h-3.5" />
            Erro
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Processamento dos Relatórios</h2>
              <p className="text-sm text-gray-600">
                Acompanhe a geração e disponibilidade dos relatórios solicitados
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {mockReports.map((report) => (
            <div
              key={report.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-mono text-sm font-medium text-gray-900">{report.reportId}</p>
                <p className="text-sm text-gray-600 mt-1">{report.type}</p>
                <p className="text-xs text-gray-400 mt-2">Solicitado em {report.requestedAt}</p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(report.status)}
                {report.status === 'ready' && (
                  <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
                    <Download className="w-4 h-4" />
                    Baixar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MonitoriaModule: React.FC<MonitoriaModuleProps> = ({ view }) => {
  if (view === 'file-processing') {
    return <FileProcessingSection />;
  }
  return <ReportProcessingSection />;
};
