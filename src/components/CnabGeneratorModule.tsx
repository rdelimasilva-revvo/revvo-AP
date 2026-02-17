import React, { useState, useRef, useEffect } from 'react';
import {
  GripVertical,
  Database,
  FileSpreadsheet,
  ArrowRight,
  X,
  Search,
  Download,
  RotateCcw,
  Info,
  ChevronDown,
  ChevronRight,
  Save,
  FolderOpen,
  Trash2,
  Plus,
  Check,
  Copy,
  Pencil
} from 'lucide-react';

interface UrField {
  id: string;
  label: string;
  category: string;
  type: string;
  description: string;
}

interface CnabSlot {
  id: string;
  position: number;
  label: string;
  mappedField: UrField | null;
}

interface SavedLayout {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  mappings: { slotId: string; fieldId: string }[];
}

const urFields: UrField[] = [
  // Identificação
  { id: 'ur_id', label: 'ID da UR', category: 'Identificação', type: 'string', description: 'Identificador único da unidade de recebível' },
  { id: 'ur_external_id', label: 'ID Externo', category: 'Identificação', type: 'string', description: 'Identificador externo de referência' },
  { id: 'contract_number', label: 'Número do Contrato', category: 'Identificação', type: 'string', description: 'Número do contrato vinculado' },
  { id: 'client_document', label: 'CNPJ/CPF do Cliente', category: 'Identificação', type: 'string', description: 'Documento do estabelecimento comercial' },
  { id: 'client_name', label: 'Razão Social', category: 'Identificação', type: 'string', description: 'Nome ou razão social do cliente' },
  // Valores
  { id: 'gross_value', label: 'Valor Bruto', category: 'Valores', type: 'decimal', description: 'Valor bruto da UR antes de descontos' },
  { id: 'net_value', label: 'Valor Líquido', category: 'Valores', type: 'decimal', description: 'Valor líquido após taxas e descontos' },
  { id: 'discount_value', label: 'Valor de Desconto', category: 'Valores', type: 'decimal', description: 'Total de descontos aplicados' },
  { id: 'locked_value', label: 'Valor Gravado', category: 'Valores', type: 'decimal', description: 'Valor comprometido/gravado na agenda' },
  { id: 'available_value', label: 'Valor Disponível', category: 'Valores', type: 'decimal', description: 'Valor livre para negociação' },
  { id: 'settled_value', label: 'Valor Liquidado', category: 'Valores', type: 'decimal', description: 'Valor já liquidado da UR' },
  // Datas
  { id: 'creation_date', label: 'Data de Criação', category: 'Datas', type: 'date', description: 'Data em que a UR foi gerada' },
  { id: 'expected_settlement_date', label: 'Data de Liquidação Prevista', category: 'Datas', type: 'date', description: 'Data esperada para liquidação' },
  { id: 'actual_settlement_date', label: 'Data de Liquidação Efetiva', category: 'Datas', type: 'date', description: 'Data real em que ocorreu a liquidação' },
  { id: 'capture_date', label: 'Data de Captura', category: 'Datas', type: 'date', description: 'Data em que a UR foi capturada' },
  // Credenciadora & Bandeira
  { id: 'acquirer_code', label: 'Código Credenciadora', category: 'Credenciadora & Bandeira', type: 'string', description: 'Código da credenciadora (acquirer)' },
  { id: 'acquirer_name', label: 'Nome Credenciadora', category: 'Credenciadora & Bandeira', type: 'string', description: 'Nome da credenciadora' },
  { id: 'card_brand', label: 'Bandeira', category: 'Credenciadora & Bandeira', type: 'string', description: 'Bandeira do cartão (Visa, Master, etc.)' },
  { id: 'payment_arrangement', label: 'Arranjo de Pagamento', category: 'Credenciadora & Bandeira', type: 'string', description: 'Tipo de arranjo (crédito à vista, parcelado, débito)' },
  // Status & Operação
  { id: 'ur_status', label: 'Status da UR', category: 'Status & Operação', type: 'string', description: 'Status atual da unidade de recebível' },
  { id: 'operation_type', label: 'Tipo de Operação', category: 'Status & Operação', type: 'string', description: 'Tipo da operação (garantia, cessão, etc.)' },
  { id: 'settlement_domicile', label: 'Domicílio de Liquidação', category: 'Status & Operação', type: 'string', description: 'Conta/banco destino da liquidação' },
  { id: 'bank_code', label: 'Código do Banco', category: 'Status & Operação', type: 'string', description: 'Código ISPB ou COMPE do banco' },
  { id: 'branch_code', label: 'Agência', category: 'Status & Operação', type: 'string', description: 'Número da agência bancária' },
  { id: 'account_number', label: 'Conta', category: 'Status & Operação', type: 'string', description: 'Número da conta bancária' },
];

const createEmptySlots = (): CnabSlot[] => Array.from({ length: 15 }, (_, i) => ({
  id: `slot-${i + 1}`,
  position: i + 1,
  label: `Posição ${String(i + 1).padStart(2, '0')}`,
  mappedField: null,
}));

const STORAGE_KEY = 'cnab-saved-layouts';

const loadLayouts = (): SavedLayout[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  const parsed = JSON.parse(saved);
  return parsed.map((l: any) => ({
    ...l,
    createdAt: new Date(l.createdAt),
    updatedAt: new Date(l.updatedAt),
  }));
};

const saveLayouts = (layouts: SavedLayout[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
};

export const CnabGeneratorModule: React.FC = () => {
  const [cnabSlots, setCnabSlots] = useState<CnabSlot[]>(createEmptySlots);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(urFields.map(f => f.category))
  );
  const [draggedField, setDraggedField] = useState<UrField | null>(null);
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);
  const [tooltipField, setTooltipField] = useState<string | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  // Layout management state
  const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>(loadLayouts);
  const [activeLayoutId, setActiveLayoutId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLayoutsPanel, setShowLayoutsPanel] = useState(false);
  const [saveLayoutName, setSaveLayoutName] = useState('');
  const [saveLayoutDesc, setSaveLayoutDesc] = useState('');
  const [editingLayoutId, setEditingLayoutId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    saveLayouts(savedLayouts);
  }, [savedLayouts]);

  const categories = Array.from(new Set(urFields.map(f => f.category)));

  const filteredFields = urFields.filter(f =>
    f.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mappedFieldIds = new Set(
    cnabSlots.filter(s => s.mappedField).map(s => s.mappedField!.id)
  );

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, field: UrField) => {
    setDraggedField(field);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', field.id);
    if (dragNodeRef.current) {
      dragNodeRef.current.style.opacity = '0.5';
    }
  };

  const handleDragEnd = () => {
    setDraggedField(null);
    setDragOverSlotId(null);
    if (dragNodeRef.current) {
      dragNodeRef.current.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlotId(slotId);
  };

  const handleDragLeave = () => {
    setDragOverSlotId(null);
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDragOverSlotId(null);
    if (!draggedField) return;

    setCnabSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        return { ...slot, mappedField: draggedField };
      }
      if (slot.mappedField?.id === draggedField.id) {
        return { ...slot, mappedField: null };
      }
      return slot;
    }));
    setDraggedField(null);
  };

  const handleRemoveMapping = (slotId: string) => {
    setCnabSlots(prev => prev.map(slot =>
      slot.id === slotId ? { ...slot, mappedField: null } : slot
    ));
  };

  const handleReset = () => {
    setCnabSlots(createEmptySlots());
    setActiveLayoutId(null);
  };

  // Layout CRUD
  const getMappingsFromSlots = (): { slotId: string; fieldId: string }[] => {
    return cnabSlots
      .filter(s => s.mappedField)
      .map(s => ({ slotId: s.id, fieldId: s.mappedField!.id }));
  };

  const applySlotsFromMappings = (mappings: { slotId: string; fieldId: string }[]) => {
    const slots = createEmptySlots();
    mappings.forEach(m => {
      const slot = slots.find(s => s.id === m.slotId);
      const field = urFields.find(f => f.id === m.fieldId);
      if (slot && field) {
        slot.mappedField = field;
      }
    });
    setCnabSlots(slots);
  };

  const handleSaveLayout = () => {
    if (!saveLayoutName.trim()) return;
    const now = new Date();

    if (editingLayoutId) {
      setSavedLayouts(prev => prev.map(l =>
        l.id === editingLayoutId
          ? { ...l, name: saveLayoutName.trim(), description: saveLayoutDesc.trim(), updatedAt: now, mappings: getMappingsFromSlots() }
          : l
      ));
      setActiveLayoutId(editingLayoutId);
    } else {
      const newLayout: SavedLayout = {
        id: `layout-${Date.now()}`,
        name: saveLayoutName.trim(),
        description: saveLayoutDesc.trim(),
        createdAt: now,
        updatedAt: now,
        mappings: getMappingsFromSlots(),
      };
      setSavedLayouts(prev => [...prev, newLayout]);
      setActiveLayoutId(newLayout.id);
    }

    setShowSaveModal(false);
    setSaveLayoutName('');
    setSaveLayoutDesc('');
    setEditingLayoutId(null);
  };

  const handleLoadLayout = (layout: SavedLayout) => {
    applySlotsFromMappings(layout.mappings);
    setActiveLayoutId(layout.id);
    setShowLayoutsPanel(false);
  };

  const handleDuplicateLayout = (layout: SavedLayout) => {
    const now = new Date();
    const dup: SavedLayout = {
      id: `layout-${Date.now()}`,
      name: `${layout.name} (cópia)`,
      description: layout.description,
      createdAt: now,
      updatedAt: now,
      mappings: [...layout.mappings],
    };
    setSavedLayouts(prev => [...prev, dup]);
  };

  const handleDeleteLayout = (layoutId: string) => {
    setSavedLayouts(prev => prev.filter(l => l.id !== layoutId));
    if (activeLayoutId === layoutId) setActiveLayoutId(null);
    setConfirmDeleteId(null);
  };

  const handleEditLayout = (layout: SavedLayout) => {
    setEditingLayoutId(layout.id);
    setSaveLayoutName(layout.name);
    setSaveLayoutDesc(layout.description);
    applySlotsFromMappings(layout.mappings);
    setActiveLayoutId(layout.id);
    setShowLayoutsPanel(false);
    setShowSaveModal(true);
  };

  const handleOpenSaveNew = () => {
    setEditingLayoutId(null);
    setSaveLayoutName('');
    setSaveLayoutDesc('');
    setShowSaveModal(true);
  };

  const handleUpdateCurrent = () => {
    if (!activeLayoutId) return;
    const now = new Date();
    setSavedLayouts(prev => prev.map(l =>
      l.id === activeLayoutId
        ? { ...l, updatedAt: now, mappings: getMappingsFromSlots() }
        : l
    ));
  };

  const mappedCount = cnabSlots.filter(s => s.mappedField).length;
  const activeLayout = savedLayouts.find(l => l.id === activeLayoutId);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'decimal': return 'bg-blue-100 text-blue-700';
      case 'date': return 'bg-purple-100 text-purple-700';
      case 'string': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'decimal': return 'Número';
      case 'date': return 'Data';
      case 'string': return 'Texto';
      default: return type;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">Mapeamento de Campos</h2>
                {activeLayout && (
                  <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                    {activeLayout.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">Arraste os campos da base de URs para as posições do CNAB</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-500">Mapeados:</span>
              <span className="text-sm font-semibold text-emerald-600">{mappedCount}</span>
              <span className="text-xs text-gray-400">/ {cnabSlots.length}</span>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            {/* Layout actions */}
            <button
              onClick={() => setShowLayoutsPanel(!showLayoutsPanel)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Layouts
              {savedLayouts.length > 0 && (
                <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">
                  {savedLayouts.length}
                </span>
              )}
            </button>

            {activeLayoutId && mappedCount > 0 && (
              <button
                onClick={handleUpdateCurrent}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar
              </button>
            )}

            <button
              onClick={handleOpenSaveNew}
              disabled={mappedCount === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                mappedCount > 0
                  ? 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Layout
            </button>

            <div className="w-px h-6 bg-gray-200" />

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar
            </button>
            <button
              disabled={mappedCount === 0}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                mappedCount > 0
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Saved layouts panel */}
      {showLayoutsPanel && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">Layouts Salvos</h3>
              <span className="text-xs text-gray-400">({savedLayouts.length})</span>
            </div>
            <button
              onClick={() => setShowLayoutsPanel(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {savedLayouts.length === 0 ? (
            <div className="p-8 text-center">
              <FileSpreadsheet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">Nenhum layout salvo</p>
              <p className="text-xs text-gray-400">Mapeie campos e clique em "Novo Layout" para salvar</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {savedLayouts.map(layout => (
                <div
                  key={layout.id}
                  className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                    activeLayoutId === layout.id ? 'bg-emerald-50/50' : ''
                  }`}
                >
                  {/* Layout icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activeLayoutId === layout.id
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>

                  {/* Layout info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{layout.name}</span>
                      {activeLayoutId === layout.id && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">Ativo</span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">
                        {layout.mappings.length} campos
                      </span>
                    </div>
                    {layout.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{layout.description}</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">
                      Atualizado em {formatDate(layout.updatedAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleLoadLayout(layout)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Carregar
                    </button>
                    <button
                      onClick={() => handleEditLayout(layout)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicateLayout(layout)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Duplicar"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {confirmDeleteId === layout.id ? (
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          onClick={() => handleDeleteLayout(layout.id)}
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
                        onClick={() => setConfirmDeleteId(layout.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main drag-and-drop area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ minHeight: 'calc(100vh - 240px)' }}>
        {/* Left panel — UR fields */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">Campos Disponíveis (Base de URs)</h3>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar campo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {categories.map(category => {
              const categoryFields = filteredFields.filter(f => f.category === category);
              if (categoryFields.length === 0) return null;
              const isExpanded = expandedCategories.has(category);

              return (
                <div key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                    {category}
                    <span className="text-gray-400 font-normal normal-case">({categoryFields.length})</span>
                  </button>

                  {isExpanded && (
                    <div className="space-y-1 mt-1">
                      {categoryFields.map(field => {
                        const isMapped = mappedFieldIds.has(field.id);
                        return (
                          <div
                            key={field.id}
                            draggable={!isMapped}
                            onDragStart={(e) => handleDragStart(e, field)}
                            onDragEnd={handleDragEnd}
                            className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${
                              isMapped
                                ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                                : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm cursor-grab active:cursor-grabbing'
                            }`}
                          >
                            <GripVertical className={`w-3.5 h-3.5 flex-shrink-0 ${isMapped ? 'text-gray-300' : 'text-gray-400'}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm ${isMapped ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'}`}>
                                  {field.label}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getTypeColor(field.type)}`}>
                                  {getTypeLabel(field.type)}
                                </span>
                              </div>
                            </div>
                            <div className="relative">
                              <button
                                onMouseEnter={() => setTooltipField(field.id)}
                                onMouseLeave={() => setTooltipField(null)}
                                className="p-1 rounded text-gray-300 hover:text-gray-500 transition-colors"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                              {tooltipField === field.id && (
                                <div className="absolute right-0 bottom-full mb-1 w-52 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                                  {field.description}
                                  <div className="absolute bottom-0 right-3 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
                                </div>
                              )}
                            </div>
                            {isMapped && (
                              <span className="text-[10px] text-emerald-600 font-medium">Mapeado</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center arrow */}
        <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center gap-3">
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <ArrowRight className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Arrastar</span>
          </div>
          <div className="w-px h-32 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
          <div className="text-center">
            <p className="text-[10px] text-gray-400 leading-relaxed max-w-[120px]">
              Arraste campos da esquerda para as posições à direita
            </p>
          </div>
        </div>

        {/* Right panel — CNAB slots */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-gray-900">Layout CNAB</h3>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                Aguardando layout definitivo
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">Posições do arquivo CNAB para mapeamento</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cnabSlots.map(slot => (
              <div
                key={slot.id}
                onDragOver={(e) => handleDragOver(e, slot.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slot.id)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg border-2 transition-all ${
                  dragOverSlotId === slot.id
                    ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                    : slot.mappedField
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-dashed border-gray-200 bg-gray-50/50 hover:border-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  slot.mappedField
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {String(slot.position).padStart(2, '0')}
                </div>

                <div className="flex-1 min-w-0">
                  {slot.mappedField ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{slot.mappedField.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getTypeColor(slot.mappedField.type)}`}>
                        {getTypeLabel(slot.mappedField.type)}
                      </span>
                    </div>
                  ) : (
                    <span className={`text-sm ${
                      dragOverSlotId === slot.id ? 'text-emerald-600 font-medium' : 'text-gray-400 italic'
                    }`}>
                      {dragOverSlotId === slot.id ? 'Soltar aqui...' : 'Arraste um campo aqui'}
                    </span>
                  )}
                </div>

                {slot.mappedField && (
                  <button
                    onClick={() => handleRemoveMapping(slot.id)}
                    className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save layout modal */}
      {showSaveModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => { setShowSaveModal(false); setEditingLayoutId(null); }} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] sm:max-w-md">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">
                  {editingLayoutId ? 'Editar Layout' : 'Salvar Novo Layout'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {editingLayoutId
                    ? 'Atualize o nome e a descrição do layout'
                    : `O mapeamento atual (${mappedCount} campos) será salvo`
                  }
                </p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Layout *</label>
                  <input
                    type="text"
                    placeholder="Ex: CNAB 400 - Remessa"
                    value={saveLayoutName}
                    onChange={e => setSaveLayoutName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição (opcional)</label>
                  <textarea
                    placeholder="Descreva o propósito deste layout..."
                    value={saveLayoutDesc}
                    onChange={e => setSaveLayoutDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
              <div className="p-5 border-t border-gray-100 flex justify-end gap-2">
                <button
                  onClick={() => { setShowSaveModal(false); setEditingLayoutId(null); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveLayout}
                  disabled={!saveLayoutName.trim()}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    saveLayoutName.trim()
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingLayoutId ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
