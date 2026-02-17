import React, { useState, useMemo } from 'react';
import { Calendar, DollarSign, TrendingUp, Download, Upload, CheckCircle, AlertTriangle, XCircle, FileText, Building2, ChevronDown } from 'lucide-react';
import { BankStatementReconciliation, ReconciliationData } from './BankStatementReconciliation';
import { showToast } from '../hooks/useToast';

interface SettlementComparison {
  id: string;
  contractId: string;
  client: string;
  merchant: string;
  expectedDate: string;
  expectedAmount: number;
  realizedDate: string | null;
  realizedAmount: number | null;
  status: 'completed' | 'partial' | 'pending' | 'failed';
  difference: number;
  urs: {
    id: string;
    acquirer: string;
    brand: string;
    expectedAmount: number;
    realizedAmount: number;
    settlementDate: string;
  }[];
}

interface BankReconciliation {
  settlementId: string;
  contractId: string;
  client: string;
  merchant: string;
  expectedAmount: number;
  realizedAmount: number;
  bankAmount: number;
  status: 'matched' | 'divergent' | 'missing';
  difference: number;
}

export const SettlementControlModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settlements' | 'bank'>('settlements');
  const [expandedRows] = useState<Set<string>>(new Set());
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementComparison | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterClients, setFilterClients] = useState<string[]>([]);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [bankFilterClients, setBankFilterClients] = useState<string[]>([]);
  const [bankClientSearchTerm, setBankClientSearchTerm] = useState('');
  const [showBankClientDropdown, setShowBankClientDropdown] = useState(false);
  const [bankStartDate, setBankStartDate] = useState('');
  const [bankEndDate, setBankEndDate] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<string>('all');
  const [contestUr, setContestUr] = useState<{ id: string; acquirer: string; brand: string; diff: number } | null>(null);
  const [contestMessage, setContestMessage] = useState('');

  const fakeBankData: ReconciliationData = {
    fileName: 'extrato_banco_29_11_2025.csv',
    totalTransactions: 46,
    settlements: [
      { contractId: 'CTR-2025-001', matchedAmount: 44550, confidence: 100 },
      { contractId: 'CTR-2025-002', matchedAmount: 30000, confidence: 100 },
      { contractId: 'CTR-2025-005', matchedAmount: 0, confidence: 0 },
      { contractId: 'CTR-2025-006', matchedAmount: 38200, confidence: 100 },
      { contractId: 'CTR-2025-007', matchedAmount: 94100, confidence: 100 },
      { contractId: 'CTR-2025-008', matchedAmount: 28600, confidence: 100 },
      { contractId: 'CTR-2025-009', matchedAmount: 58900, confidence: 100 },
      { contractId: 'CTR-2025-010', matchedAmount: 125000, confidence: 100 },
      { contractId: 'CTR-2025-016', matchedAmount: 67800, confidence: 100 },
      { contractId: 'CTR-2025-017', matchedAmount: 42300, confidence: 100 },
      { contractId: 'CTR-2025-018', matchedAmount: 53100, confidence: 100 },
      { contractId: 'CTR-2025-019', matchedAmount: 88400, confidence: 100 },
      { contractId: 'CTR-2025-020', matchedAmount: 71200, confidence: 100 },
      { contractId: 'CTR-2025-021', matchedAmount: 35600, confidence: 100 },
      { contractId: 'CTR-2025-022', matchedAmount: 156000, confidence: 100 },
      { contractId: 'CTR-2025-023', matchedAmount: 210500, confidence: 100 },
      { contractId: 'CTR-2025-024', matchedAmount: 92800, confidence: 100 },
      { contractId: 'CTR-2025-025', matchedAmount: 68900, confidence: 100 },
      { contractId: 'CTR-2025-026', matchedAmount: 52400, confidence: 100 },
      { contractId: 'CTR-2025-027', matchedAmount: 76800, confidence: 100 },
      { contractId: 'CTR-2025-028', matchedAmount: 58900, confidence: 100 },
      { contractId: 'CTR-2025-029', matchedAmount: 39700, confidence: 100 },
      { contractId: 'CTR-2025-030', matchedAmount: 64800, confidence: 100 },
      { contractId: 'CTR-2025-031', matchedAmount: 80200, confidence: 100 },
      { contractId: 'CTR-2025-032', matchedAmount: 112000, confidence: 100 },
      { contractId: 'CTR-2025-033', matchedAmount: 93800, confidence: 100 },
      { contractId: 'CTR-2025-034', matchedAmount: 48700, confidence: 100 },
      { contractId: 'CTR-2025-035', matchedAmount: 56200, confidence: 100 },
      { contractId: 'CTR-2025-036', matchedAmount: 42800, confidence: 100 },
      { contractId: 'CTR-2025-037', matchedAmount: 38200, confidence: 100 },
      { contractId: 'CTR-2025-038', matchedAmount: 138000, confidence: 100 },
      { contractId: 'CTR-2025-039', matchedAmount: 172000, confidence: 100 },
      { contractId: 'CTR-2025-040', matchedAmount: 192000, confidence: 100 },
      { contractId: 'CTR-2025-041', matchedAmount: 232500, confidence: 100 },
      { contractId: 'CTR-2025-042', matchedAmount: 65400, confidence: 100 },
      { contractId: 'CTR-2025-043', matchedAmount: 48600, confidence: 100 },
      { contractId: 'CTR-2025-044', matchedAmount: 54200, confidence: 100 },
      { contractId: 'CTR-2025-045', matchedAmount: 71500, confidence: 100 },
      { contractId: 'CTR-2025-046', matchedAmount: 32400, confidence: 100 },
      { contractId: 'CTR-2025-047', matchedAmount: 28900, confidence: 100 },
      { contractId: 'CTR-2025-048', matchedAmount: 44200, confidence: 100 },
      { contractId: 'CTR-2025-049', matchedAmount: 38700, confidence: 100 },
      { contractId: 'CTR-2025-051', matchedAmount: 41200, confidence: 100 },
      { contractId: 'CTR-2025-052', matchedAmount: 36500, confidence: 100 },
      { contractId: 'CTR-2025-053', matchedAmount: 47100, confidence: 100 },
      { contractId: 'CTR-2025-054', matchedAmount: 54900, confidence: 100 }
    ]
  };

  const [bankReconciliationData, setBankReconciliationData] = useState<ReconciliationData | null>(fakeBankData);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const settlements: SettlementComparison[] = [
    {
      id: '1',
      contractId: 'CTR-2025-001',
      client: 'Tech Solutions Ltda',
      merchant: 'Loja Tech Center',
      expectedDate: '2025-11-25',
      expectedAmount: 44550,
      realizedDate: '2025-11-25',
      realizedAmount: 44550,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR001', acquirer: 'Stone', brand: 'Visa', expectedAmount: 15000, realizedAmount: 15000, settlementDate: '2025-11-25' },
        { id: 'UR002', acquirer: 'Stone', brand: 'Mastercard', expectedAmount: 20000, realizedAmount: 20000, settlementDate: '2025-11-25' },
        { id: 'UR003', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 9550, realizedAmount: 9550, settlementDate: '2025-11-25' }
      ]
    },
    {
      id: '2',
      contractId: 'CTR-2025-002',
      client: 'Comercial Santos',
      merchant: 'Santos Matriz',
      expectedDate: '2025-11-26',
      expectedAmount: 31680,
      realizedDate: '2025-11-26',
      realizedAmount: 30000,
      status: 'partial',
      difference: -1680,
      urs: [
        { id: 'UR004', acquirer: 'Rede', brand: 'Mastercard', expectedAmount: 18000, realizedAmount: 18000, settlementDate: '2025-11-26' },
        { id: 'UR005', acquirer: 'Cielo', brand: 'Elo', expectedAmount: 13680, realizedAmount: 12000, settlementDate: '2025-11-26' }
      ]
    },
    {
      id: '3',
      contractId: 'CTR-2025-003',
      client: 'Indústria XYZ',
      merchant: 'XYZ Fábrica',
      expectedDate: '2025-11-27',
      expectedAmount: 77220,
      realizedDate: null,
      realizedAmount: null,
      status: 'pending',
      difference: 0,
      urs: [
        { id: 'UR006', acquirer: 'Stone', brand: 'Visa', expectedAmount: 25000, realizedAmount: 0, settlementDate: '2025-11-27' },
        { id: 'UR007', acquirer: 'Stone', brand: 'Visa', expectedAmount: 30000, realizedAmount: 0, settlementDate: '2025-11-27' },
        { id: 'UR008', acquirer: 'Cielo', brand: 'Mastercard', expectedAmount: 22220, realizedAmount: 0, settlementDate: '2025-11-27' }
      ]
    },
    {
      id: '4',
      contractId: 'CTR-2025-004',
      client: 'Varejo Digital SA',
      merchant: 'Varejo E-commerce',
      expectedDate: '2025-11-28',
      expectedAmount: 52300,
      realizedDate: null,
      realizedAmount: null,
      status: 'pending',
      difference: 0,
      urs: [
        { id: 'UR009', acquirer: 'Rede', brand: 'Visa', expectedAmount: 28000, realizedAmount: 0, settlementDate: '2025-11-28' },
        { id: 'UR010', acquirer: 'Getnet', brand: 'Mastercard', expectedAmount: 24300, realizedAmount: 0, settlementDate: '2025-11-28' }
      ]
    },
    {
      id: '5',
      contractId: 'CTR-2025-005',
      client: 'Serviços ABC',
      merchant: 'ABC Unidade 1',
      expectedDate: '2025-11-19',
      expectedAmount: 15000,
      realizedDate: '2025-11-19',
      realizedAmount: 0,
      status: 'failed',
      difference: -15000,
      urs: [
        { id: 'UR011', acquirer: 'Cielo', brand: 'Elo', expectedAmount: 15000, realizedAmount: 0, settlementDate: '2025-11-19' }
      ]
    },
    {
      id: '6',
      contractId: 'CTR-2025-006',
      client: 'Restaurante Bom Sabor',
      merchant: 'Bom Sabor Shopping',
      expectedDate: '2025-11-25',
      expectedAmount: 38200,
      realizedDate: '2025-11-25',
      realizedAmount: 38200,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR012', acquirer: 'Stone', brand: 'Mastercard', expectedAmount: 22000, realizedAmount: 22000, settlementDate: '2025-11-25' },
        { id: 'UR013', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 16200, realizedAmount: 16200, settlementDate: '2025-11-25' }
      ]
    },
    {
      id: '7',
      contractId: 'CTR-2025-007',
      client: 'Loja de Eletrônicos MAX',
      merchant: 'MAX Filial Centro',
      expectedDate: '2025-11-26',
      expectedAmount: 95800,
      realizedDate: '2025-11-26',
      realizedAmount: 94100,
      status: 'partial',
      difference: -1700,
      urs: [
        { id: 'UR014', acquirer: 'Rede', brand: 'Visa', expectedAmount: 48000, realizedAmount: 48000, settlementDate: '2025-11-26' },
        { id: 'UR015', acquirer: 'Stone', brand: 'Mastercard', expectedAmount: 32800, realizedAmount: 31500, settlementDate: '2025-11-26' },
        { id: 'UR016', acquirer: 'Cielo', brand: 'Elo', expectedAmount: 15000, realizedAmount: 14600, settlementDate: '2025-11-26' }
      ]
    },
    {
      id: '8',
      contractId: 'CTR-2025-008',
      client: 'Academia Fitness Pro',
      merchant: 'Fitness Pro Norte',
      expectedDate: '2025-11-26',
      expectedAmount: 28600,
      realizedDate: '2025-11-26',
      realizedAmount: 28600,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR017', acquirer: 'Stone', brand: 'Visa', expectedAmount: 18600, realizedAmount: 18600, settlementDate: '2025-11-26' },
        { id: 'UR018', acquirer: 'Cielo', brand: 'Mastercard', expectedAmount: 10000, realizedAmount: 10000, settlementDate: '2025-11-26' }
      ]
    },
    {
      id: '9',
      contractId: 'CTR-2025-009',
      client: 'Farmácia Saúde Total',
      merchant: 'Saúde Total - Loja 1',
      expectedDate: '2025-11-27',
      expectedAmount: 61400,
      realizedDate: '2025-11-27',
      realizedAmount: 58900,
      status: 'partial',
      difference: -2500,
      urs: [
        { id: 'UR019', acquirer: 'Rede', brand: 'Visa', expectedAmount: 35000, realizedAmount: 35000, settlementDate: '2025-11-27' },
        { id: 'UR020', acquirer: 'Stone', brand: 'Mastercard', expectedAmount: 26400, realizedAmount: 23900, settlementDate: '2025-11-27' }
      ]
    },
    {
      id: '10',
      contractId: 'CTR-2025-010',
      client: 'Posto de Combustível Rodovia',
      merchant: 'Posto Rodovia BR-101',
      expectedDate: '2025-11-27',
      expectedAmount: 125000,
      realizedDate: '2025-11-27',
      realizedAmount: 125000,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR021', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 55000, realizedAmount: 55000, settlementDate: '2025-11-27' },
        { id: 'UR022', acquirer: 'Rede', brand: 'Mastercard', expectedAmount: 45000, realizedAmount: 45000, settlementDate: '2025-11-27' },
        { id: 'UR023', acquirer: 'Stone', brand: 'Elo', expectedAmount: 25000, realizedAmount: 25000, settlementDate: '2025-11-27' }
      ]
    },
    {
      id: '11',
      contractId: 'CTR-2025-011',
      client: 'Supermercado Bom Preço',
      merchant: 'Bom Preço Centro',
      expectedDate: '2025-11-28',
      expectedAmount: 182500,
      realizedDate: null,
      realizedAmount: null,
      status: 'pending',
      difference: 0,
      urs: [
        { id: 'UR024', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 85000, realizedAmount: 0, settlementDate: '2025-11-28' },
        { id: 'UR025', acquirer: 'Rede', brand: 'Mastercard', expectedAmount: 67500, realizedAmount: 0, settlementDate: '2025-11-28' },
        { id: 'UR026', acquirer: 'Stone', brand: 'Elo', expectedAmount: 30000, realizedAmount: 0, settlementDate: '2025-11-28' }
      ]
    },
    {
      id: '12',
      contractId: 'CTR-2025-012',
      client: 'Clínica Médica Vida Saudável',
      merchant: 'Clínica Vida - Jardins',
      expectedDate: '2025-11-28',
      expectedAmount: 45800,
      realizedDate: null,
      realizedAmount: null,
      status: 'pending',
      difference: 0,
      urs: [
        { id: 'UR027', acquirer: 'Stone', brand: 'Visa', expectedAmount: 28000, realizedAmount: 0, settlementDate: '2025-11-28' },
        { id: 'UR028', acquirer: 'Cielo', brand: 'Mastercard', expectedAmount: 17800, realizedAmount: 0, settlementDate: '2025-11-28' }
      ]
    },
    {
      id: '13',
      contractId: 'CTR-2025-013',
      client: 'Pet Shop Animal Feliz',
      merchant: 'Pet Shop - Loja Tech Center',
      expectedDate: '2025-11-29',
      expectedAmount: 19200,
      realizedDate: null,
      realizedAmount: null,
      status: 'pending',
      difference: 0,
      urs: [
        { id: 'UR029', acquirer: 'Stone', brand: 'Visa', expectedAmount: 12000, realizedAmount: 0, settlementDate: '2025-11-29' },
        { id: 'UR030', acquirer: 'Cielo', brand: 'Mastercard', expectedAmount: 7200, realizedAmount: 0, settlementDate: '2025-11-29' }
      ]
    },
    {
      id: '14',
      contractId: 'CTR-2025-014',
      client: 'Concessionária Auto Premium',
      merchant: 'Auto Premium Showroom',
      expectedDate: '2025-11-29',
      expectedAmount: 340000,
      realizedDate: null,
      realizedAmount: null,
      status: 'pending',
      difference: 0,
      urs: [
        { id: 'UR031', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 150000, realizedAmount: 0, settlementDate: '2025-11-29' },
        { id: 'UR032', acquirer: 'Rede', brand: 'Mastercard', expectedAmount: 120000, realizedAmount: 0, settlementDate: '2025-11-29' },
        { id: 'UR033', acquirer: 'Stone', brand: 'Elo', expectedAmount: 70000, realizedAmount: 0, settlementDate: '2025-11-29' }
      ]
    },
    {
      id: '15',
      contractId: 'CTR-2025-015',
      client: 'Hotel Beira Mar',
      merchant: 'Hotel Beira Mar - Recepção',
      expectedDate: '2025-11-30',
      expectedAmount: 98500,
      realizedDate: null,
      realizedAmount: null,
      status: 'pending',
      difference: 0,
      urs: [
        { id: 'UR034', acquirer: 'Stone', brand: 'Visa', expectedAmount: 52000, realizedAmount: 0, settlementDate: '2025-11-30' },
        { id: 'UR035', acquirer: 'Cielo', brand: 'Mastercard', expectedAmount: 35500, realizedAmount: 0, settlementDate: '2025-11-30' },
        { id: 'UR036', acquirer: 'Rede', brand: 'Elo', expectedAmount: 11000, realizedAmount: 0, settlementDate: '2025-11-30' }
      ]
    },
    {
      id: '16',
      contractId: 'CTR-2025-016',
      client: 'Tech Solutions Ltda',
      merchant: 'Loja Tech Sul',
      expectedDate: '2025-11-26',
      expectedAmount: 67800,
      realizedDate: '2025-11-26',
      realizedAmount: 67800,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR037', acquirer: 'Stone', brand: 'Visa', expectedAmount: 35000, realizedAmount: 35000, settlementDate: '2025-11-26' },
        { id: 'UR038', acquirer: 'Cielo', brand: 'Mastercard', expectedAmount: 32800, realizedAmount: 32800, settlementDate: '2025-11-26' }
      ]
    },
    {
      id: '17',
      contractId: 'CTR-2025-017',
      client: 'Comercial Santos',
      merchant: 'Santos Filial Norte',
      expectedDate: '2025-11-27',
      expectedAmount: 42300,
      realizedDate: '2025-11-27',
      realizedAmount: 42300,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR039', acquirer: 'Rede', brand: 'Visa', expectedAmount: 25000, realizedAmount: 25000, settlementDate: '2025-11-27' },
        { id: 'UR040', acquirer: 'Stone', brand: 'Elo', expectedAmount: 17300, realizedAmount: 17300, settlementDate: '2025-11-27' }
      ]
    },
    {
      id: '18',
      contractId: 'CTR-2025-018',
      client: 'Restaurante Bom Sabor',
      merchant: 'Bom Sabor Centro',
      expectedDate: '2025-11-26',
      expectedAmount: 54200,
      realizedDate: '2025-11-26',
      realizedAmount: 53100,
      status: 'partial',
      difference: -1100,
      urs: [
        { id: 'UR041', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 30000, realizedAmount: 30000, settlementDate: '2025-11-26' },
        { id: 'UR042', acquirer: 'Stone', brand: 'Mastercard', expectedAmount: 24200, realizedAmount: 23100, settlementDate: '2025-11-26' }
      ]
    },
    {
      id: '19',
      contractId: 'CTR-2025-019',
      client: 'Loja de Eletrônicos MAX',
      merchant: 'MAX Filial Oeste',
      expectedDate: '2025-11-27',
      expectedAmount: 88400,
      realizedDate: '2025-11-27',
      realizedAmount: 88400,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR043', acquirer: 'Stone', brand: 'Visa', expectedAmount: 45000, realizedAmount: 45000, settlementDate: '2025-11-27' },
        { id: 'UR044', acquirer: 'Rede', brand: 'Mastercard', expectedAmount: 28400, realizedAmount: 28400, settlementDate: '2025-11-27' },
        { id: 'UR045', acquirer: 'Cielo', brand: 'Elo', expectedAmount: 15000, realizedAmount: 15000, settlementDate: '2025-11-27' }
      ]
    },
    {
      id: '20',
      contractId: 'CTR-2025-020',
      client: 'Farmácia Saúde Total',
      merchant: 'Saúde Total - Loja 2',
      expectedDate: '2025-11-27',
      expectedAmount: 73500,
      realizedDate: '2025-11-27',
      realizedAmount: 71200,
      status: 'partial',
      difference: -2300,
      urs: [
        { id: 'UR046', acquirer: 'Stone', brand: 'Visa', expectedAmount: 42000, realizedAmount: 42000, settlementDate: '2025-11-27' },
        { id: 'UR047', acquirer: 'Cielo', brand: 'Mastercard', expectedAmount: 31500, realizedAmount: 29200, settlementDate: '2025-11-27' }
      ]
    },
    {
      id: '21',
      contractId: 'CTR-2025-021',
      client: 'Academia Fitness Pro',
      merchant: 'Fitness Pro Sul',
      expectedDate: '2025-11-28',
      expectedAmount: 35600,
      realizedDate: '2025-11-28',
      realizedAmount: 35600,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR048', acquirer: 'Stone', brand: 'Visa', expectedAmount: 22000, realizedAmount: 22000, settlementDate: '2025-11-28' },
        { id: 'UR049', acquirer: 'Rede', brand: 'Mastercard', expectedAmount: 13600, realizedAmount: 13600, settlementDate: '2025-11-28' }
      ]
    },
    {
      id: '22',
      contractId: 'CTR-2025-022',
      client: 'Posto de Combustível Rodovia',
      merchant: 'Posto Rodovia BR-381',
      expectedDate: '2025-11-28',
      expectedAmount: 156000,
      realizedDate: '2025-11-28',
      realizedAmount: 156000,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR050', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 68000, realizedAmount: 68000, settlementDate: '2025-11-28' },
        { id: 'UR051', acquirer: 'Rede', brand: 'Mastercard', expectedAmount: 58000, realizedAmount: 58000, settlementDate: '2025-11-28' },
        { id: 'UR052', acquirer: 'Stone', brand: 'Elo', expectedAmount: 30000, realizedAmount: 30000, settlementDate: '2025-11-28' }
      ]
    },
    {
      id: '23',
      contractId: 'CTR-2025-023',
      client: 'Supermercado Bom Preço',
      merchant: 'Bom Preço Oeste',
      expectedDate: '2025-11-28',
      expectedAmount: 215000,
      realizedDate: '2025-11-28',
      realizedAmount: 210500,
      status: 'partial',
      difference: -4500,
      urs: [
        { id: 'UR053', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 95000, realizedAmount: 95000, settlementDate: '2025-11-28' },
        { id: 'UR054', acquirer: 'Rede', brand: 'Mastercard', expectedAmount: 80000, realizedAmount: 80000, settlementDate: '2025-11-28' },
        { id: 'UR055', acquirer: 'Stone', brand: 'Elo', expectedAmount: 40000, realizedAmount: 35500, settlementDate: '2025-11-28' }
      ]
    },
    {
      id: '24',
      contractId: 'CTR-2025-024',
      client: 'Indústria XYZ',
      merchant: 'XYZ Filial 2',
      expectedDate: '2025-11-29',
      expectedAmount: 92800,
      realizedDate: '2025-11-29',
      realizedAmount: 92800,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR056', acquirer: 'Stone', brand: 'Visa', expectedAmount: 50000, realizedAmount: 50000, settlementDate: '2025-11-29' },
        { id: 'UR057', acquirer: 'Cielo', brand: 'Mastercard', expectedAmount: 42800, realizedAmount: 42800, settlementDate: '2025-11-29' }
      ]
    },
    {
      id: '25',
      contractId: 'CTR-2025-025',
      client: 'Varejo Digital SA',
      merchant: 'Varejo Marketplace',
      expectedDate: '2025-11-29',
      expectedAmount: 68900,
      realizedDate: '2025-11-29',
      realizedAmount: 68900,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR058', acquirer: 'Rede', brand: 'Visa', expectedAmount: 38000, realizedAmount: 38000, settlementDate: '2025-11-29' },
        { id: 'UR059', acquirer: 'Getnet', brand: 'Mastercard', expectedAmount: 30900, realizedAmount: 30900, settlementDate: '2025-11-29' }
      ]
    },
    {
      id: '26',
      contractId: 'CTR-2025-026',
      client: 'Tech Solutions Ltda',
      merchant: 'Loja Tech Norte',
      expectedDate: '2025-11-27',
      expectedAmount: 52400,
      realizedDate: '2025-11-27',
      realizedAmount: 52400,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR060', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 28000, realizedAmount: 28000, settlementDate: '2025-11-27' },
        { id: 'UR061', acquirer: 'Stone', brand: 'Mastercard', expectedAmount: 24400, realizedAmount: 24400, settlementDate: '2025-11-27' }
      ]
    },
    {
      id: '27',
      contractId: 'CTR-2025-027',
      client: 'Tech Solutions Ltda',
      merchant: 'Loja Tech Leste',
      expectedDate: '2025-11-28',
      expectedAmount: 78300,
      realizedDate: '2025-11-28',
      realizedAmount: 76800,
      status: 'partial',
      difference: -1500,
      urs: [
        { id: 'UR062', acquirer: 'Stone', brand: 'Visa', expectedAmount: 42000, realizedAmount: 42000, settlementDate: '2025-11-28' },
        { id: 'UR063', acquirer: 'Rede', brand: 'Mastercard', expectedAmount: 36300, realizedAmount: 34800, settlementDate: '2025-11-28' }
      ]
    },
    {
      id: '28',
      contractId: 'CTR-2025-028',
      client: 'Comercial Santos',
      merchant: 'Santos Shopping',
      expectedDate: '2025-11-28',
      expectedAmount: 58900,
      realizedDate: '2025-11-28',
      realizedAmount: 58900,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR064', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 33000, realizedAmount: 33000, settlementDate: '2025-11-28' },
        { id: 'UR065', acquirer: 'Stone', brand: 'Mastercard', expectedAmount: 25900, realizedAmount: 25900, settlementDate: '2025-11-28' }
      ]
    },
    {
      id: '29',
      contractId: 'CTR-2025-029',
      client: 'Comercial Santos',
      merchant: 'Santos Aeroporto',
      expectedDate: '2025-11-29',
      expectedAmount: 39700,
      realizedDate: '2025-11-29',
      realizedAmount: 39700,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR066', acquirer: 'Rede', brand: 'Visa', expectedAmount: 22000, realizedAmount: 22000, settlementDate: '2025-11-29' },
        { id: 'UR067', acquirer: 'Cielo', brand: 'Elo', expectedAmount: 17700, realizedAmount: 17700, settlementDate: '2025-11-29' }
      ]
    },
    {
      id: '30',
      contractId: 'CTR-2025-030',
      client: 'Restaurante Bom Sabor',
      merchant: 'Bom Sabor Aeroporto',
      expectedDate: '2025-11-27',
      expectedAmount: 64800,
      realizedDate: '2025-11-27',
      realizedAmount: 64800,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR068', acquirer: 'Stone', brand: 'Visa', expectedAmount: 38000, realizedAmount: 38000, settlementDate: '2025-11-27' },
        { id: 'UR069', acquirer: 'Cielo', brand: 'Mastercard', expectedAmount: 26800, realizedAmount: 26800, settlementDate: '2025-11-27' }
      ]
    },
    {
      id: '31',
      contractId: 'CTR-2025-031',
      client: 'Restaurante Bom Sabor',
      merchant: 'Bom Sabor Praia',
      expectedDate: '2025-11-29',
      expectedAmount: 82500,
      realizedDate: '2025-11-29',
      realizedAmount: 80200,
      status: 'partial',
      difference: -2300,
      urs: [
        { id: 'UR070', acquirer: 'Rede', brand: 'Visa', expectedAmount: 48000, realizedAmount: 48000, settlementDate: '2025-11-29' },
        { id: 'UR071', acquirer: 'Stone', brand: 'Mastercard', expectedAmount: 34500, realizedAmount: 32200, settlementDate: '2025-11-29' }
      ]
    },
    {
      id: '32',
      contractId: 'CTR-2025-032',
      client: 'Loja de Eletrônicos MAX',
      merchant: 'MAX Shopping Norte',
      expectedDate: '2025-11-28',
      expectedAmount: 112000,
      realizedDate: '2025-11-28',
      realizedAmount: 112000,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR072', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 58000, realizedAmount: 58000, settlementDate: '2025-11-28' },
        { id: 'UR073', acquirer: 'Rede', brand: 'Mastercard', expectedAmount: 38000, realizedAmount: 38000, settlementDate: '2025-11-28' },
        { id: 'UR074', acquirer: 'Stone', brand: 'Elo', expectedAmount: 16000, realizedAmount: 16000, settlementDate: '2025-11-28' }
      ]
    },
    {
      id: '33',
      contractId: 'CTR-2025-033',
      client: 'Loja de Eletrônicos MAX',
      merchant: 'MAX Outlet',
      expectedDate: '2025-11-29',
      expectedAmount: 95600,
      realizedDate: '2025-11-29',
      realizedAmount: 93800,
      status: 'partial',
      difference: -1800,
      urs: [
        { id: 'UR075', acquirer: 'Stone', brand: 'Visa', expectedAmount: 52000, realizedAmount: 52000, settlementDate: '2025-11-29' },
        { id: 'UR076', acquirer: 'Cielo', brand: 'Mastercard', expectedAmount: 43600, realizedAmount: 41800, settlementDate: '2025-11-29' }
      ]
    },
    {
      id: '34',
      contractId: 'CTR-2025-034',
      client: 'Farmácia Saúde Total',
      merchant: 'Saúde Total - Loja 3',
      expectedDate: '2025-11-28',
      expectedAmount: 48700,
      realizedDate: '2025-11-28',
      realizedAmount: 48700,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR077', acquirer: 'Stone', brand: 'Visa', expectedAmount: 28000, realizedAmount: 28000, settlementDate: '2025-11-28' },
        { id: 'UR078', acquirer: 'Cielo', brand: 'Mastercard', expectedAmount: 20700, realizedAmount: 20700, settlementDate: '2025-11-28' }
      ]
    },
    {
      id: '35',
      contractId: 'CTR-2025-035',
      client: 'Farmácia Saúde Total',
      merchant: 'Saúde Total - Loja 4',
      expectedDate: '2025-11-29',
      expectedAmount: 56200,
      realizedDate: '2025-11-29',
      realizedAmount: 56200,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR079', acquirer: 'Rede', brand: 'Visa', expectedAmount: 32000, realizedAmount: 32000, settlementDate: '2025-11-29' },
        { id: 'UR080', acquirer: 'Stone', brand: 'Mastercard', expectedAmount: 24200, realizedAmount: 24200, settlementDate: '2025-11-29' }
      ]
    },
    {
      id: '36',
      contractId: 'CTR-2025-036',
      client: 'Academia Fitness Pro',
      merchant: 'Fitness Pro Centro',
      expectedDate: '2025-11-27',
      expectedAmount: 42800,
      realizedDate: '2025-11-27',
      realizedAmount: 42800,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR081', acquirer: 'Stone', brand: 'Visa', expectedAmount: 26000, realizedAmount: 26000, settlementDate: '2025-11-27' },
        { id: 'UR082', acquirer: 'Cielo', brand: 'Mastercard', expectedAmount: 16800, realizedAmount: 16800, settlementDate: '2025-11-27' }
      ]
    },
    {
      id: '37',
      contractId: 'CTR-2025-037',
      client: 'Academia Fitness Pro',
      merchant: 'Fitness Pro Leste',
      expectedDate: '2025-11-29',
      expectedAmount: 39500,
      realizedDate: '2025-11-29',
      realizedAmount: 38200,
      status: 'partial',
      difference: -1300,
      urs: [
        { id: 'UR083', acquirer: 'Rede', brand: 'Visa', expectedAmount: 24000, realizedAmount: 24000, settlementDate: '2025-11-29' },
        { id: 'UR084', acquirer: 'Stone', brand: 'Mastercard', expectedAmount: 15500, realizedAmount: 14200, settlementDate: '2025-11-29' }
      ]
    },
    {
      id: '38',
      contractId: 'CTR-2025-038',
      client: 'Posto de Combustível Rodovia',
      merchant: 'Posto Rodovia BR-040',
      expectedDate: '2025-11-27',
      expectedAmount: 138000,
      realizedDate: '2025-11-27',
      realizedAmount: 138000,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR085', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 62000, realizedAmount: 62000, settlementDate: '2025-11-27' },
        { id: 'UR086', acquirer: 'Rede', brand: 'Mastercard', expectedAmount: 51000, realizedAmount: 51000, settlementDate: '2025-11-27' },
        { id: 'UR087', acquirer: 'Stone', brand: 'Elo', expectedAmount: 25000, realizedAmount: 25000, settlementDate: '2025-11-27' }
      ]
    },
    {
      id: '39',
      contractId: 'CTR-2025-039',
      client: 'Posto de Combustível Rodovia',
      merchant: 'Posto Rodovia BR-116',
      expectedDate: '2025-11-29',
      expectedAmount: 172000,
      realizedDate: '2025-11-29',
      realizedAmount: 172000,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR088', acquirer: 'Stone', brand: 'Visa', expectedAmount: 78000, realizedAmount: 78000, settlementDate: '2025-11-29' },
        { id: 'UR089', acquirer: 'Cielo', brand: 'Mastercard', expectedAmount: 65000, realizedAmount: 65000, settlementDate: '2025-11-29' },
        { id: 'UR090', acquirer: 'Rede', brand: 'Elo', expectedAmount: 29000, realizedAmount: 29000, settlementDate: '2025-11-29' }
      ]
    },
    {
      id: '40',
      contractId: 'CTR-2025-040',
      client: 'Supermercado Bom Preço',
      merchant: 'Bom Preço Sul',
      expectedDate: '2025-11-27',
      expectedAmount: 192000,
      realizedDate: '2025-11-27',
      realizedAmount: 192000,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR091', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 88000, realizedAmount: 88000, settlementDate: '2025-11-27' },
        { id: 'UR092', acquirer: 'Rede', brand: 'Mastercard', expectedAmount: 72000, realizedAmount: 72000, settlementDate: '2025-11-27' },
        { id: 'UR093', acquirer: 'Stone', brand: 'Elo', expectedAmount: 32000, realizedAmount: 32000, settlementDate: '2025-11-27' }
      ]
    },
    {
      id: '41',
      contractId: 'CTR-2025-041',
      client: 'Supermercado Bom Preço',
      merchant: 'Bom Preço Norte',
      expectedDate: '2025-11-29',
      expectedAmount: 238000,
      realizedDate: '2025-11-29',
      realizedAmount: 232500,
      status: 'partial',
      difference: -5500,
      urs: [
        { id: 'UR094', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 105000, realizedAmount: 105000, settlementDate: '2025-11-29' },
        { id: 'UR095', acquirer: 'Rede', brand: 'Mastercard', expectedAmount: 88000, realizedAmount: 88000, settlementDate: '2025-11-29' },
        { id: 'UR096', acquirer: 'Stone', brand: 'Elo', expectedAmount: 45000, realizedAmount: 39500, settlementDate: '2025-11-29' }
      ]
    },
    {
      id: '42',
      contractId: 'CTR-2025-042',
      client: 'Indústria XYZ',
      merchant: 'XYZ Escritório',
      expectedDate: '2025-11-28',
      expectedAmount: 65400,
      realizedDate: '2025-11-28',
      realizedAmount: 65400,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR097', acquirer: 'Stone', brand: 'Visa', expectedAmount: 38000, realizedAmount: 38000, settlementDate: '2025-11-28' },
        { id: 'UR098', acquirer: 'Cielo', brand: 'Mastercard', expectedAmount: 27400, realizedAmount: 27400, settlementDate: '2025-11-28' }
      ]
    },
    {
      id: '43',
      contractId: 'CTR-2025-043',
      client: 'Indústria XYZ',
      merchant: 'XYZ Loja Fábrica',
      expectedDate: '2025-11-29',
      expectedAmount: 48600,
      realizedDate: '2025-11-29',
      realizedAmount: 48600,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR099', acquirer: 'Rede', brand: 'Visa', expectedAmount: 28000, realizedAmount: 28000, settlementDate: '2025-11-29' },
        { id: 'UR100', acquirer: 'Stone', brand: 'Mastercard', expectedAmount: 20600, realizedAmount: 20600, settlementDate: '2025-11-29' }
      ]
    },
    {
      id: '44',
      contractId: 'CTR-2025-044',
      client: 'Varejo Digital SA',
      merchant: 'Varejo App',
      expectedDate: '2025-11-27',
      expectedAmount: 54200,
      realizedDate: '2025-11-27',
      realizedAmount: 54200,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR101', acquirer: 'Getnet', brand: 'Visa', expectedAmount: 32000, realizedAmount: 32000, settlementDate: '2025-11-27' },
        { id: 'UR102', acquirer: 'Rede', brand: 'Mastercard', expectedAmount: 22200, realizedAmount: 22200, settlementDate: '2025-11-27' }
      ]
    },
    {
      id: '45',
      contractId: 'CTR-2025-045',
      client: 'Varejo Digital SA',
      merchant: 'Varejo Express',
      expectedDate: '2025-11-28',
      expectedAmount: 72800,
      realizedDate: '2025-11-28',
      realizedAmount: 71500,
      status: 'partial',
      difference: -1300,
      urs: [
        { id: 'UR103', acquirer: 'Rede', brand: 'Visa', expectedAmount: 42000, realizedAmount: 42000, settlementDate: '2025-11-28' },
        { id: 'UR104', acquirer: 'Getnet', brand: 'Mastercard', expectedAmount: 30800, realizedAmount: 29500, settlementDate: '2025-11-28' }
      ]
    },
    {
      id: '46',
      contractId: 'CTR-2025-046',
      client: 'Serviços ABC',
      merchant: 'ABC Unidade 1',
      expectedDate: '2025-11-26',
      expectedAmount: 32400,
      realizedDate: '2025-11-26',
      realizedAmount: 32400,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR105', acquirer: 'Stone', brand: 'Visa', expectedAmount: 18000, realizedAmount: 18000, settlementDate: '2025-11-26' },
        { id: 'UR106', acquirer: 'Cielo', brand: 'Mastercard', expectedAmount: 14400, realizedAmount: 14400, settlementDate: '2025-11-26' }
      ]
    },
    {
      id: '47',
      contractId: 'CTR-2025-047',
      client: 'Serviços ABC',
      merchant: 'ABC Unidade 1',
      expectedDate: '2025-11-27',
      expectedAmount: 28900,
      realizedDate: '2025-11-27',
      realizedAmount: 28900,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR107', acquirer: 'Rede', brand: 'Visa', expectedAmount: 16000, realizedAmount: 16000, settlementDate: '2025-11-27' },
        { id: 'UR108', acquirer: 'Stone', brand: 'Mastercard', expectedAmount: 12900, realizedAmount: 12900, settlementDate: '2025-11-27' }
      ]
    },
    {
      id: '48',
      contractId: 'CTR-2025-048',
      client: 'Serviços ABC',
      merchant: 'ABC Unidade 1',
      expectedDate: '2025-11-28',
      expectedAmount: 45600,
      realizedDate: '2025-11-28',
      realizedAmount: 44200,
      status: 'partial',
      difference: -1400,
      urs: [
        { id: 'UR109', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 26000, realizedAmount: 26000, settlementDate: '2025-11-28' },
        { id: 'UR110', acquirer: 'Stone', brand: 'Mastercard', expectedAmount: 19600, realizedAmount: 18200, settlementDate: '2025-11-28' }
      ]
    },
    {
      id: '49',
      contractId: 'CTR-2025-049',
      client: 'Serviços ABC',
      merchant: 'ABC Unidade 1',
      expectedDate: '2025-11-29',
      expectedAmount: 38700,
      realizedDate: '2025-11-29',
      realizedAmount: 38700,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR111', acquirer: 'Stone', brand: 'Visa', expectedAmount: 22000, realizedAmount: 22000, settlementDate: '2025-11-29' },
        { id: 'UR112', acquirer: 'Rede', brand: 'Mastercard', expectedAmount: 16700, realizedAmount: 16700, settlementDate: '2025-11-29' }
      ]
    },
    {
      id: '50',
      contractId: 'CTR-2025-050',
      client: 'Serviços ABC',
      merchant: 'ABC Unidade 1',
      expectedDate: '2025-11-30',
      expectedAmount: 52800,
      realizedDate: null,
      realizedAmount: null,
      status: 'pending',
      difference: 0,
      urs: [
        { id: 'UR113', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 30000, realizedAmount: 0, settlementDate: '2025-11-30' },
        { id: 'UR114', acquirer: 'Stone', brand: 'Mastercard', expectedAmount: 22800, realizedAmount: 0, settlementDate: '2025-11-30' }
      ]
    },
    {
      id: '51',
      contractId: 'CTR-2025-051',
      client: 'Serviços ABC',
      merchant: 'ABC Unidade 2',
      expectedDate: '2025-11-26',
      expectedAmount: 41200,
      realizedDate: '2025-11-26',
      realizedAmount: 41200,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR115', acquirer: 'Stone', brand: 'Visa', expectedAmount: 24000, realizedAmount: 24000, settlementDate: '2025-11-26' },
        { id: 'UR116', acquirer: 'Cielo', brand: 'Mastercard', expectedAmount: 17200, realizedAmount: 17200, settlementDate: '2025-11-26' }
      ]
    },
    {
      id: '52',
      contractId: 'CTR-2025-052',
      client: 'Serviços ABC',
      merchant: 'ABC Unidade 2',
      expectedDate: '2025-11-27',
      expectedAmount: 36500,
      realizedDate: '2025-11-27',
      realizedAmount: 36500,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR117', acquirer: 'Rede', brand: 'Visa', expectedAmount: 21000, realizedAmount: 21000, settlementDate: '2025-11-27' },
        { id: 'UR118', acquirer: 'Stone', brand: 'Elo', expectedAmount: 15500, realizedAmount: 15500, settlementDate: '2025-11-27' }
      ]
    },
    {
      id: '53',
      contractId: 'CTR-2025-053',
      client: 'Serviços ABC',
      merchant: 'ABC Unidade 3',
      expectedDate: '2025-11-28',
      expectedAmount: 48300,
      realizedDate: '2025-11-28',
      realizedAmount: 47100,
      status: 'partial',
      difference: -1200,
      urs: [
        { id: 'UR119', acquirer: 'Cielo', brand: 'Visa', expectedAmount: 28000, realizedAmount: 28000, settlementDate: '2025-11-28' },
        { id: 'UR120', acquirer: 'Stone', brand: 'Mastercard', expectedAmount: 20300, realizedAmount: 19100, settlementDate: '2025-11-28' }
      ]
    },
    {
      id: '54',
      contractId: 'CTR-2025-054',
      client: 'Serviços ABC',
      merchant: 'ABC Unidade 3',
      expectedDate: '2025-11-29',
      expectedAmount: 54900,
      realizedDate: '2025-11-29',
      realizedAmount: 54900,
      status: 'completed',
      difference: 0,
      urs: [
        { id: 'UR121', acquirer: 'Stone', brand: 'Visa', expectedAmount: 32000, realizedAmount: 32000, settlementDate: '2025-11-29' },
        { id: 'UR122', acquirer: 'Rede', brand: 'Mastercard', expectedAmount: 22900, realizedAmount: 22900, settlementDate: '2025-11-29' }
      ]
    }
  ];

  const uniqueClients = useMemo(() => {
    const clients = settlements.map(s => s.client);
    return Array.from(new Set(clients)).sort();
  }, [settlements]);

  const filteredSettlements = useMemo(() => {
    return settlements.filter(settlement => {
      const settlementDate = new Date(settlement.expectedDate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && settlementDate < start) return false;
      if (end && settlementDate > end) return false;
      if (filterClients.length > 0 && !filterClients.includes(settlement.client)) return false;
      return true;
    });
  }, [settlements, startDate, endDate, filterClients]);

  const uniqueMerchants = useMemo(() => {
    const merchants = settlements.map(s => s.merchant);
    return Array.from(new Set(merchants)).sort();
  }, [settlements]);

  const bankReconciliations: BankReconciliation[] = useMemo(() => {
    if (!bankReconciliationData) return [];

    return settlements
      .filter(s => s.realizedAmount !== null)
      .map(settlement => {
        const bankMatch = bankReconciliationData.settlements.find(
          s => s.contractId === settlement.contractId
        );

        const bankAmount = bankMatch?.matchedAmount || 0;
        const difference = bankAmount - (settlement.realizedAmount || 0);

        let status: 'matched' | 'divergent' | 'missing' = 'missing';
        if (bankAmount > 0) {
          status = Math.abs(difference) < 1 ? 'matched' : 'divergent';
        }

        return {
          settlementId: settlement.id,
          contractId: settlement.contractId,
          client: settlement.client,
          merchant: settlement.merchant,
          expectedAmount: settlement.expectedAmount,
          realizedAmount: settlement.realizedAmount || 0,
          bankAmount,
          status,
          difference
        };
      });
  }, [bankReconciliationData, settlements]);

  const filteredBankReconciliations = useMemo(() => {
    return bankReconciliations.filter(reconciliation => {
      const settlement = settlements.find(s => s.contractId === reconciliation.contractId);
      if (!settlement) return false;

      if (selectedMerchant !== 'all' && reconciliation.merchant !== selectedMerchant) {
        return false;
      }

      const settlementDate = new Date(settlement.expectedDate);
      const start = bankStartDate ? new Date(bankStartDate) : null;
      const end = bankEndDate ? new Date(bankEndDate) : null;

      if (start && settlementDate < start) return false;
      if (end && settlementDate > end) return false;
      if (bankFilterClients.length > 0 && !bankFilterClients.includes(reconciliation.client)) return false;
      return true;
    });
  }, [bankReconciliations, settlements, bankStartDate, bankEndDate, selectedMerchant, bankFilterClients]);

  const handleBankReconciliation = (data: ReconciliationData) => {
    setBankReconciliationData(data);
    setActiveTab('bank');
  };

  const bankStats = {
    matched: filteredBankReconciliations.filter(r => r.status === 'matched').length,
    divergent: filteredBankReconciliations.filter(r => r.status === 'divergent').length,
    missing: filteredBankReconciliations.filter(r => r.status === 'missing').length,
    totalDifference: filteredBankReconciliations.reduce((sum, r) => sum + Math.abs(r.difference), 0)
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      pending: <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendente</span>,
      completed: <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completo</span>,
      partial: <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Parcial</span>,
      failed: <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Falhou</span>,
      matched: <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" />Conciliado</span>,
      divergent: <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800"><AlertTriangle className="w-3 h-3" />Divergência</span>,
      missing: <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"><XCircle className="w-3 h-3" />Não Encontrado</span>
    };
    return badges[status] || null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('settlements')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settlements'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Previsto vs Realizado
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {settlements.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'bank'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Conciliação Bancária
                {bankReconciliationData && (
                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    {bankReconciliations.length}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>

        {activeTab === 'settlements' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Período:</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">De:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Até:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="relative flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Empresa:</span>
                <button
                  onClick={() => setShowClientDropdown(!showClientDropdown)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[180px] text-left flex items-center justify-between gap-2"
                >
                  <span className="truncate">
                    {filterClients.length === 0
                      ? 'Todas'
                      : filterClients.length === 1
                        ? filterClients[0]
                        : `${filterClients.length} selecionadas`}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                </button>
                {showClientDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => { setShowClientDropdown(false); setClientSearchTerm(''); }} />
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-2 border-b border-gray-100">
                        <input
                          type="text"
                          placeholder="Buscar empresa..."
                          value={clientSearchTerm}
                          onChange={(e) => setClientSearchTerm(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto p-1">
                        {uniqueClients
                          .filter(c => c.toLowerCase().includes(clientSearchTerm.toLowerCase()))
                          .map(client => (
                            <label
                              key={client}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={filterClients.includes(client)}
                                onChange={() => {
                                  setFilterClients(prev =>
                                    prev.includes(client)
                                      ? prev.filter(c => c !== client)
                                      : [...prev, client]
                                  );
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-gray-700 truncate">{client}</span>
                            </label>
                          ))}
                        {uniqueClients.filter(c => c.toLowerCase().includes(clientSearchTerm.toLowerCase())).length === 0 && (
                          <p className="px-3 py-2 text-sm text-gray-400">Nenhuma empresa encontrada</p>
                        )}
                      </div>
                      {filterClients.length > 0 && (
                        <div className="p-2 border-t border-gray-100">
                          <button
                            onClick={() => setFilterClients([])}
                            className="w-full px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            Limpar seleção
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              {(startDate || endDate || filterClients.length > 0) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setFilterClients([]);
                  }}
                  className="ml-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Limpar
                </button>
              )}
              <div className="ml-auto flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {filteredSettlements.length} de {settlements.length} liquidações
                </span>
                <button
                  onClick={() => setShowReconciliationModal(true)}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                >
                  <Upload className="w-4 h-4" />
                  Importar Extrato
                </button>
                <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap">
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contrato</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Previsto</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Realizado</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Diferença</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSettlements.map((settlement) => (
                    <React.Fragment key={settlement.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-gray-900">{settlement.contractId}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{settlement.client}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{formatDate(settlement.expectedDate)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm text-gray-600">{formatCurrency(settlement.expectedAmount)}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {settlement.realizedAmount !== null ? formatCurrency(settlement.realizedAmount) : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`text-sm font-semibold ${
                            settlement.difference > 0 ? 'text-green-600' :
                            settlement.difference < 0 ? 'text-red-600' : 'text-gray-400'
                          }`}>
                            {settlement.difference !== 0 ? formatCurrency(Math.abs(settlement.difference)) : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(settlement.status)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => setSelectedSettlement(settlement)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Ver Analítico
                          </button>
                        </td>
                      </tr>
                      {expandedRows.has(settlement.id) && (
                        <tr>
                          <td colSpan={9} className="px-4 py-4 bg-gray-50">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Unidades de Recebíveis (URs)</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {settlement.urs.map((ur) => (
                                  <div key={ur.id} className="bg-white p-3 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-medium text-gray-900">{ur.id}</span>
                                      <span className="text-xs text-gray-600">{formatDate(ur.settlementDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        {ur.acquirer}
                                      </span>
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        {ur.brand}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-gray-600">Previsto:</span>
                                        <div className="font-semibold text-gray-900">{formatCurrency(ur.expectedAmount)}</div>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Realizado:</span>
                                        <div className="font-semibold text-gray-900">
                                          {ur.realizedAmount > 0 ? formatCurrency(ur.realizedAmount) : '-'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="p-6 space-y-6">
            {!bankReconciliationData ? (
              <div className="text-center py-12">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum extrato importado</h3>
                <p className="text-gray-600 mb-6">Importe um extrato bancário para visualizar a conciliação</p>
                <button
                  onClick={() => setShowReconciliationModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Upload className="w-5 h-5" />
                  Importar Extrato Bancário
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Período:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">De:</label>
                    <input
                      type="date"
                      value={bankStartDate}
                      onChange={(e) => setBankStartDate(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Até:</label>
                    <input
                      type="date"
                      value={bankEndDate}
                      onChange={(e) => setBankEndDate(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="relative flex items-center gap-2 sm:pl-4 sm:border-l border-gray-300">
                    <span className="text-sm font-medium text-gray-700">Empresa:</span>
                    <button
                      onClick={() => setShowBankClientDropdown(!showBankClientDropdown)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[180px] text-left flex items-center justify-between gap-2"
                    >
                      <span className="truncate">
                        {bankFilterClients.length === 0
                          ? 'Todas'
                          : bankFilterClients.length === 1
                            ? bankFilterClients[0]
                            : `${bankFilterClients.length} selecionadas`}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    </button>
                    {showBankClientDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => { setShowBankClientDropdown(false); setBankClientSearchTerm(''); }} />
                        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                          <div className="p-2 border-b border-gray-100">
                            <input
                              type="text"
                              placeholder="Buscar empresa..."
                              value={bankClientSearchTerm}
                              onChange={(e) => setBankClientSearchTerm(e.target.value)}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto p-1">
                            {uniqueClients
                              .filter(c => c.toLowerCase().includes(bankClientSearchTerm.toLowerCase()))
                              .map(client => (
                                <label
                                  key={client}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-sm"
                                >
                                  <input
                                    type="checkbox"
                                    checked={bankFilterClients.includes(client)}
                                    onChange={() => {
                                      setBankFilterClients(prev =>
                                        prev.includes(client)
                                          ? prev.filter(c => c !== client)
                                          : [...prev, client]
                                      );
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-gray-700 truncate">{client}</span>
                                </label>
                              ))}
                            {uniqueClients.filter(c => c.toLowerCase().includes(bankClientSearchTerm.toLowerCase())).length === 0 && (
                              <p className="px-3 py-2 text-sm text-gray-400">Nenhuma empresa encontrada</p>
                            )}
                          </div>
                          {bankFilterClients.length > 0 && (
                            <div className="p-2 border-t border-gray-100">
                              <button
                                onClick={() => setBankFilterClients([])}
                                className="w-full px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                              >
                                Limpar seleção
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {(bankStartDate || bankEndDate || selectedMerchant !== 'all' || bankFilterClients.length > 0) && (
                    <button
                      onClick={() => {
                        setBankStartDate('');
                        setBankEndDate('');
                        setSelectedMerchant('all');
                        setBankFilterClients([]);
                      }}
                      className="ml-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Limpar Filtros
                    </button>
                  )}
                  <div className="ml-auto text-sm text-gray-600">
                    {filteredBankReconciliations.length} de {bankReconciliations.length} conciliações
                  </div>
                </div>

                {selectedMerchant !== 'all' && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Estabelecimento Filtrado</p>
                        <p className="text-lg font-bold text-blue-700">{selectedMerchant}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contrato</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estabelecimento</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Previsto</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Realizado</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Banco</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Diferença</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBankReconciliations.map((reconciliation) => (
                        <tr key={reconciliation.settlementId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            {getStatusBadge(reconciliation.status)}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-medium text-gray-900">{reconciliation.contractId}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{reconciliation.client}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">{reconciliation.merchant}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="text-sm text-gray-600">{formatCurrency(reconciliation.expectedAmount)}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="text-sm font-medium text-gray-900">{formatCurrency(reconciliation.realizedAmount)}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className={`text-sm font-semibold ${
                              reconciliation.bankAmount > 0 ? 'text-blue-600' : 'text-gray-400'
                            }`}>
                              {reconciliation.bankAmount > 0 ? formatCurrency(reconciliation.bankAmount) : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className={`text-sm font-semibold ${
                              reconciliation.difference > 0 ? 'text-green-600' :
                              reconciliation.difference < 0 ? 'text-red-600' : 'text-gray-400'
                            }`}>
                              {reconciliation.difference !== 0 ? formatCurrency(Math.abs(reconciliation.difference)) : '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <BankStatementReconciliation
        isOpen={showReconciliationModal}
        onClose={() => setShowReconciliationModal(false)}
        onReconcile={handleBankReconciliation}
      />

      {selectedSettlement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Análise Detalhada da Liquidação</h2>
                <p className="text-sm text-gray-600">{selectedSettlement.contractId} - {selectedSettlement.client}</p>
              </div>
              <button
                onClick={() => setSelectedSettlement(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <p className="text-xs font-medium text-blue-900">Data Prevista</p>
                  </div>
                  <p className="text-lg font-bold text-blue-900">{formatDate(selectedSettlement.expectedDate)}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <p className="text-xs font-medium text-purple-900">Valor Previsto</p>
                  </div>
                  <p className="text-lg font-bold text-purple-900">{formatCurrency(selectedSettlement.expectedAmount)}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <p className="text-xs font-medium text-green-900">Valor Realizado</p>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {selectedSettlement.realizedAmount !== null
                      ? formatCurrency(selectedSettlement.realizedAmount)
                      : 'Pendente'}
                  </p>
                </div>

                <div className={`rounded-lg p-4 border ${
                  selectedSettlement.difference > 0
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                    : selectedSettlement.difference < 0
                    ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedSettlement.difference > 0 ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : selectedSettlement.difference < 0 ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-600" />
                    )}
                    <p className={`text-xs font-medium ${
                      selectedSettlement.difference > 0 ? 'text-green-900' :
                      selectedSettlement.difference < 0 ? 'text-red-900' : 'text-gray-900'
                    }`}>
                      Diferença
                    </p>
                  </div>
                  <p className={`text-lg font-bold ${
                    selectedSettlement.difference > 0 ? 'text-green-900' :
                    selectedSettlement.difference < 0 ? 'text-red-900' : 'text-gray-900'
                  }`}>
                    {selectedSettlement.difference !== 0
                      ? formatCurrency(Math.abs(selectedSettlement.difference))
                      : 'Sem diferença'}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-semibold text-blue-900">Status da Liquidação</h3>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedSettlement.status)}
                  <span className="text-sm text-blue-700">
                    {selectedSettlement.status === 'completed' && 'Liquidação executada com sucesso sem divergências'}
                    {selectedSettlement.status === 'partial' && 'Liquidação parcial - valor realizado menor que o previsto'}
                    {selectedSettlement.status === 'pending' && 'Aguardando liquidação na data prevista'}
                    {selectedSettlement.status === 'failed' && 'Liquidação falhou - nenhum valor recebido'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Unidades de Recebíveis (URs)</h3>
                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UR ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adquirente</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bandeira</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Previsto</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Realizado</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Diferença</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedSettlement.urs.map((ur) => {
                        const urDiff = ur.realizedAmount - ur.expectedAmount;
                        return (
                          <tr key={ur.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{ur.id}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {ur.acquirer}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {ur.brand}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(ur.settlementDate)}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(ur.expectedAmount)}</td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                              {ur.realizedAmount > 0 ? formatCurrency(ur.realizedAmount) : '-'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`text-sm font-semibold ${
                                urDiff > 0 ? 'text-green-600' :
                                urDiff < 0 ? 'text-red-600' : 'text-gray-400'
                              }`}>
                                {urDiff !== 0 ? formatCurrency(Math.abs(urDiff)) : '-'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {urDiff < 0 && (
                                <button
                                  onClick={() => setContestUr({ id: ur.id, acquirer: ur.acquirer, brand: ur.brand, diff: Math.abs(urDiff) })}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs font-medium"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  Contestar
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>

                        <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                          {formatCurrency(selectedSettlement.expectedAmount)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                          {selectedSettlement.realizedAmount !== null
                            ? formatCurrency(selectedSettlement.realizedAmount)
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-bold ${
                            selectedSettlement.difference > 0 ? 'text-green-600' :
                            selectedSettlement.difference < 0 ? 'text-red-600' : 'text-gray-400'
                          }`}>
                            {selectedSettlement.difference !== 0
                              ? formatCurrency(Math.abs(selectedSettlement.difference))
                              : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedSettlement(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Fechar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar Relatório
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Contestação */}
      {contestUr && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Abrir Contestação</h3>
              <p className="text-sm text-gray-500 mt-1">UR {contestUr.id} — {contestUr.acquirer} / {contestUr.brand}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-gray-700">Diferença a menor</span>
                <span className="text-sm font-semibold text-red-600">{formatCurrency(contestUr.diff)}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motivo da contestação</label>
                <textarea
                  value={contestMessage}
                  onChange={(e) => setContestMessage(e.target.value)}
                  placeholder="Descreva o motivo da contestação..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => { setContestUr(null); setContestMessage(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  showToast('success', 'Contestação enviada!', `UR: ${contestUr.id}`);
                  setContestUr(null);
                  setContestMessage('');
                }}
                disabled={!contestMessage.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
