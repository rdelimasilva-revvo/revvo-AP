import type { Receivable, Contract, Client } from '../types';
import type { ContaCorrenteEntry, ContaCorrenteEvento } from '../types/contaCorrente';

export interface LiquidationProblemUr {
  id: string;
  contractId: string;
  client: string;
  acquirer: string;
  brand: string;
  expectedDate: string;
  actualDate: string | null;
  expectedAmount: number;
  realizedAmount: number;
  status: 'not_settled' | 'delayed' | 'partial';
}

export function getEstablishmentsFromEntries(entries: ContaCorrenteEntry[]): { merchantId: string; cnpj: string; nome: string }[] {
  const map = new Map<string, { merchantId: string; cnpj: string; nome: string }>();
  entries.forEach((e) => {
    if (!map.has(e.merchantId)) map.set(e.merchantId, { merchantId: e.merchantId, cnpj: e.cnpj, nome: e.nomeEstabelecimento });
  });
  return Array.from(map.values());
}

export interface LoadedData {
  receivables: Receivable[];
  contracts: Contract[];
  clients: Client[];
  contaCorrenteEntries: ContaCorrenteEntry[];
  liquidationProblems: LiquidationProblemUr[];
}

interface CsvRow {
  estabelecimento_cnpj: string;
  estabelecimento_nome: string;
  contrato_id: string;
  contrato_numero: string;
  data_inicio?: string;
  data_fim?: string;
  ur_id: string;
  client_id: string;
  merchant_id: string;
  credenciadora: string;
  bandeira: string;
  data_contrato: string;
  data_liquidacao_esperada: string;
  data_liquidacao_efetiva: string;
  tipo_evento: string;
  valor_ur_original: string;
  valor_ur_atual: string;
  valor_esperado: string;
  valor_liquidado: string;
  valor_chargeback: string;
  eh_futuro: string;
  chargeback_data: string;
  chargeback_motivo: string;
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        const next = text[i + 1];
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field);
        field = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += c;
      }
    }
  }

  row.push(field);
  if (row.length > 1 || row[0] !== '') rows.push(row);

  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  const output: Record<string, string>[] = [];
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    if (values.length === 1 && values[0].trim() === '') continue;
    const record: Record<string, string> = {};
    headers.forEach((h, j) => {
      record[h] = values[j]?.trim() ?? '';
    });
    output.push(record);
  }
  return output;
}

function mapTipoEventoToContaCorrente(tipo: string, valorChargeback: number, ehFuturo: boolean): ContaCorrenteEvento {
  switch (tipo) {
    case 'LIQUIDACAO_TOTAL':
      return 'liquidacao_total';
    case 'LIQUIDACAO_PARCIAL':
      return 'liquidacao_parcial';
    case 'NAO_LIQUIDADA':
      return 'nao_liquidada_na_data';
    case 'CHARGEBACK_PRE_LIQUIDACAO':
    case 'CHARGEBACK_POS_LIQUIDACAO':
      return 'chargeback';
    case 'UR_PREVISTA':
      return ehFuturo && valorChargeback > 0 ? 'liquidacao_prevista_com_chargeback' : 'liquidacao_prevista';
    default:
      return 'liquidacao_total';
  }
}

function toReceivableStatus(tipo: string): Receivable['status'] {
  switch (tipo) {
    case 'LIQUIDACAO_TOTAL':
      return 'settled';
    case 'LIQUIDACAO_PARCIAL':
      return 'encumbered';
    case 'NAO_LIQUIDADA':
      return 'available';
    case 'CHARGEBACK_PRE_LIQUIDACAO':
    case 'CHARGEBACK_POS_LIQUIDACAO':
      return 'chargeback';
    case 'UR_PREVISTA':
      return 'encumbered';
    default:
      return 'pending';
  }
}

interface ContratoCsvRow {
  contrato_id: string;
  contrato_numero: string;
  valor_total: string;
  [key: string]: string;
}

function getCsvUrl(filename: string): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return `${base}/${filename}`.replace(/\/+/g, '/');
}

export async function loadDataFromCsv(): Promise<LoadedData> {
  const res = await fetch(getCsvUrl('massa_ur.csv'));
  if (!res.ok) throw new Error(`CSV not found: ${res.status} ${res.statusText}`);
  const text = await res.text();
  const rows = parseCsv(text) as unknown as CsvRow[];

  // Carrega dados explícitos de contrato (valor_total = meta) quando disponível
  const contratosExplicitos = new Map<string, number>();
  try {
    const resContratos = await fetch(getCsvUrl('massa_contratos.csv'));
    if (resContratos.ok) {
      const textContratos = await resContratos.text();
      const rowsContratos = parseCsv(textContratos) as unknown as ContratoCsvRow[];
      for (const r of rowsContratos) {
        const val = parseFloat(r.valor_total) || 0;
        if (val > 0) contratosExplicitos.set(r.contrato_id, val);
      }
    }
  } catch {
    // massa_contratos.csv opcional - usa soma das URs como fallback
  }

  const num = (s: string) => parseFloat(s) || 0;
  const date = (s: string) => {
    if (!s) return new Date(0);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    const parsed = new Date(s);
    return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
  };

  const contaCorrenteEntries: ContaCorrenteEntry[] = [];
  const receivables: Receivable[] = [];
  const contractSums = new Map<
    string,
    {
      requested: number;
      encumbered: number;
      clientId: string;
      contractNumber: string;
      merchantId: string;
      clientName: string;
      createdAt: Date;
      dataInicio: Date;
      dataFim: Date;
      cnpj: string;
      acquirer: string;
      cardBrand: string;
    }
  >();
  const clientMap = new Map<string, { id: string; name: string; document: string }>();
  const liquidationProblems: LiquidationProblemUr[] = [];
  let entryId = 0;
  const newEntryId = () => `evt-${String(++entryId).padStart(5, '0')}`;

  for (const r of rows) {
    const valorOriginal = num(r.valor_ur_original);
    const valorAtual = num(r.valor_ur_atual);
    const valorLiquidado = num(r.valor_liquidado);
    const valorChargeback = num(r.valor_chargeback);
    const ehFuturo = r.eh_futuro === 'True' || r.eh_futuro === 'true';

    if (!clientMap.has(r.client_id)) {
      clientMap.set(r.client_id, {
        id: r.client_id,
        name: r.estabelecimento_nome,
        document: r.estabelecimento_cnpj,
      });
    }

    const dataContrato = date(r.data_contrato);
    const dataInicio = r.data_inicio ? date(r.data_inicio) : dataContrato;
    const dataFim = r.data_fim ? date(r.data_fim) : dataContrato;
    const sum = contractSums.get(r.contrato_id);
    const valorForEncumbered =
      r.tipo_evento === 'LIQUIDACAO_PARCIAL' && valorLiquidado > 0 ? valorLiquidado : valorAtual;
    if (!sum) {
      contractSums.set(r.contrato_id, {
        requested: valorOriginal,
        encumbered: valorForEncumbered,
        clientId: r.client_id,
        contractNumber: r.contrato_numero,
        merchantId: r.merchant_id,
        clientName: r.estabelecimento_nome,
        createdAt: dataContrato,
        dataInicio,
        dataFim,
        cnpj: r.estabelecimento_cnpj,
        acquirer: r.credenciadora,
        cardBrand: r.bandeira,
      });
    } else {
      sum.requested += valorOriginal;
      sum.encumbered += valorForEncumbered;
      if (dataContrato < sum.createdAt) sum.createdAt = dataContrato;
    }

    const dataEfetivaPreenchida = valorLiquidado > 0 && !!r.data_liquidacao_efetiva;

    const evento = mapTipoEventoToContaCorrente(r.tipo_evento, valorChargeback, ehFuturo);

    // Para liquidacao_parcial, valorAtual = valor efetivamente recebido (valorLiquidado)
    const valorAtualFinal =
      evento === 'liquidacao_parcial' && valorLiquidado > 0 ? valorLiquidado : valorAtual;

    const contaEntry: ContaCorrenteEntry = {
      id: newEntryId(),
      urId: r.ur_id,
      contractId: r.contrato_id,
      contractNumber: r.contrato_numero,
      merchantId: r.merchant_id,
      cnpj: r.estabelecimento_cnpj,
      nomeEstabelecimento: r.estabelecimento_nome,
      acquirer: r.credenciadora,
      cardBrand: r.bandeira,
      evento,
      valorEsperado: num(r.valor_esperado),
      valorLiquidado: valorLiquidado > 0 ? valorLiquidado : undefined,
      valorAtual: valorAtualFinal,
      chargebackValor: valorChargeback > 0 ? valorChargeback : undefined,
      valorFaltante:
        evento === 'nao_liquidada_na_data'
          ? valorOriginal
          : evento === 'liquidacao_parcial'
            ? valorOriginal - valorLiquidado
            : evento === 'chargeback'
              ? valorChargeback
              : evento === 'liquidacao_prevista_com_chargeback'
                ? valorChargeback
                : undefined,
      dataEsperada: date(r.data_liquidacao_esperada),
      dataEfetiva: dataEfetivaPreenchida ? date(r.data_liquidacao_efetiva) : undefined,
      dataChargeback: r.chargeback_data ? date(r.chargeback_data) : undefined,
      dataEvento: date(r.data_contrato),
      isFuturo: ehFuturo,
      debito: 0,
      credito: evento === 'liquidacao_total' ? valorLiquidado : evento === 'liquidacao_parcial' ? valorLiquidado : evento === 'chargeback' ? valorAtualFinal : evento.startsWith('liquidacao_prevista') ? valorAtualFinal : 0,
      isParcial: evento === 'liquidacao_parcial',
    };
    contaCorrenteEntries.push(contaEntry);

    receivables.push({
      id: r.ur_id,
      contractId: r.contrato_id,
      acquirer: r.credenciadora,
      cardBrand: r.bandeira,
      transactionDate: date(r.data_contrato),
      settlementDate: date(r.data_liquidacao_esperada),
      settledAt: valorLiquidado > 0 ? date(r.data_liquidacao_efetiva) : undefined,
      originalValue: valorOriginal,
      encumberedValue: valorAtual,
      status: toReceivableStatus(r.tipo_evento),
      merchantId: r.merchant_id,
      terminalId: `TERM-${r.ur_id.slice(0, 8)}`,
      authorizationCode: `AUTH-${r.ur_id.slice(0, 8)}`,
      nsu: `NSU-${r.ur_id.slice(0, 8)}`,
      installments: 1,
      installmentNumber: 1,
      fee: 0,
      netValue: valorAtual,
      chargebackDate: r.chargeback_data ? date(r.chargeback_data) : undefined,
      chargebackReason: r.chargeback_motivo || undefined,
      operationType: 'debit',
    });

    if (r.tipo_evento === 'NAO_LIQUIDADA' || r.tipo_evento === 'LIQUIDACAO_PARCIAL') {
      liquidationProblems.push({
        id: r.ur_id,
        contractId: r.contrato_numero,
        client: r.estabelecimento_nome,
        acquirer: r.credenciadora,
        brand: r.bandeira,
        expectedDate: r.data_liquidacao_esperada,
        actualDate: r.data_liquidacao_efetiva && valorLiquidado > 0 ? r.data_liquidacao_efetiva : null,
        expectedAmount: valorOriginal,
        realizedAmount: valorLiquidado,
        status: r.tipo_evento === 'NAO_LIQUIDADA' ? 'not_settled' : 'partial',
      });
    }
  }

  for (const [contractId, s] of contractSums.entries()) {
    const firstRow = rows.find((r) => r.contrato_id === contractId);
    if (!firstRow) continue;
    const valorTotal = contratosExplicitos.get(contractId) ?? s.requested;
    const contratoCriadoEntry: ContaCorrenteEntry = {
      id: newEntryId(),
      urId: '',
      contractId,
      contractNumber: s.contractNumber,
      merchantId: s.merchantId,
      cnpj: s.cnpj,
      nomeEstabelecimento: s.clientName,
      acquirer: s.acquirer,
      cardBrand: s.cardBrand,
      evento: 'contrato_criado',
      valorEsperado: valorTotal,
      valorAtual: valorTotal,
      dataEsperada: s.dataInicio,
      dataEvento: s.dataInicio,
      isFuturo: false,
      debito: valorTotal,
      credito: 0,
    };
    contaCorrenteEntries.push(contratoCriadoEntry);
  }

  contaCorrenteEntries.sort((a, b) => {
    const cmpMerchant = a.merchantId.localeCompare(b.merchantId);
    if (cmpMerchant !== 0) return cmpMerchant;
    const dateA = a.evento === 'contrato_criado' ? a.dataEvento : (a.dataEfetiva ?? a.dataEsperada ?? a.dataEvento);
    const dateB = b.evento === 'contrato_criado' ? b.dataEvento : (b.dataEfetiva ?? b.dataEsperada ?? b.dataEvento);
    const cmpDate = dateA.getTime() - dateB.getTime();
    if (cmpDate !== 0) return cmpDate;
    const orderEvento: Record<ContaCorrenteEvento, number> = {
      contrato_criado: 0,
      liquidacao_total: 1,
      liquidacao_parcial: 2,
      nao_liquidada_na_data: 3,
      chargeback: 4,
      liquidacao_prevista: 5,
      liquidacao_prevista_com_chargeback: 6,
    };
    return orderEvento[a.evento] - orderEvento[b.evento];
  });

  const contractEntries = Array.from(contractSums.entries());
  const contracts: Contract[] = contractEntries.map(([id, s], idx) => {
    const valorTotal = contratosExplicitos.get(id) ?? s.requested;
    // Make ~30% of contracts pending_approval so the approval board has data
    const status = idx % 3 === 0 ? 'pending_approval' as const : 'active' as const;
    const productTypes: Contract['productType'][] = ['guarantee', 'extra-limit', 'debt-settlement', 'anticipation'];
    return {
      id,
      clientId: s.clientId,
      contractNumber: s.contractNumber,
      status,
      hasRevolvency: idx % 2 === 0,
      productType: productTypes[idx % productTypes.length],
      createdAt: s.createdAt,
      hasAutomaticCapture: true,
      operationMode: 'both' as const,
      hasRecaptureTrigger: false,
      requestedValue: valorTotal,
      encumberedValue: s.encumbered,
    expectedSettlementValue: valorTotal,
    actualSettlementValue: s.encumbered,
    acquirers: [],
    cardBrands: [],
    chargeback: { quantity: 0, totalValue: 0, percentage: 0 },
    operations: [],
  };
  });

  const clients: Client[] = Array.from(clientMap.values()).map((c) => ({
    ...c,
    email: '',
    phone: '',
    status: 'active' as const,
    totalLimit: 1000000,
    usedLimit: 500000,
    availableLimit: 500000,
    collateralValue: 400000,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  return {
    receivables,
    contracts,
    clients,
    contaCorrenteEntries,
    liquidationProblems,
  };
}
