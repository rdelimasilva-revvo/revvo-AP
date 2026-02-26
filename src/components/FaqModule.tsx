import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle, BookOpen, Shield, Settings, FileText, CreditCard } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  items: FaqItem[];
}

const faqData: FaqCategory[] = [
  {
    id: 'geral',
    label: 'Geral',
    icon: BookOpen,
    items: [
      {
        question: 'O que é a plataforma de Captura de Recebíveis?',
        answer: 'A plataforma permite a gestão completa de operações de recebíveis, incluindo registro de contratos, monitoramento de liquidações, gestão de opt-in e controle de garantias junto às registradoras como a CERC.',
      },
      {
        question: 'Como faço para acessar o sistema?',
        answer: 'Utilize suas credenciais (e-mail e senha) na tela de login. Caso não possua uma conta, solicite ao administrador da sua empresa ou clique em "Criar nova conta" na tela de login.',
      },
      {
        question: 'Onde posso buscar algo rapidamente na plataforma?',
        answer: 'Use o atalho Ctrl+K para abrir a busca global. Você pode pesquisar por clientes, contratos ou seções da plataforma. Também é possível pressionar "?" para ver todos os atalhos de teclado disponíveis.',
      },
    ],
  },
  {
    id: 'optin',
    label: 'Opt-in',
    icon: Shield,
    items: [
      {
        question: 'O que é o Opt-in?',
        answer: 'O Opt-in é a autorização formal do cliente (estabelecimento comercial) para que seus recebíveis de cartão possam ser consultados e utilizados como garantia em operações de crédito. Sem o Opt-in ativo, não é possível registrar operações para o cliente.',
      },
      {
        question: 'Como envio um Opt-in para um cliente?',
        answer: 'Acesse a seção Configurações > Opt-in, clique em "Novo Opt-in", busque o cliente desejado, configure a data de expiração e envie. O cliente receberá um link para assinar digitalmente.',
      },
      {
        question: 'Quanto tempo leva para o Opt-in ser processado?',
        answer: 'Após a assinatura digital pelo cliente, o Opt-in é enviado para a registradora e normalmente é processado em até 24 horas úteis.',
      },
    ],
  },
  {
    id: 'contratos',
    label: 'Contratos e Operações',
    icon: FileText,
    items: [
      {
        question: 'Como registro uma nova operação?',
        answer: 'Acesse a tela de detalhes do cliente e clique em "Registrar Operação". Preencha o valor mensal, data de início, duração do contrato e configurações avançadas (bandeiras, credenciadoras, tipo de transação). Após o envio, a operação ficará pendente de aprovação.',
      },
      {
        question: 'O que significa cada status de contrato?',
        answer: 'Pendente: aguardando aprovação interna. Ativo: contrato em vigor com travas aplicadas. Encerrado: contrato finalizado ou cancelado. Em Atraso: contrato com problemas de liquidação.',
      },
      {
        question: 'Como aprovo contratos em lote?',
        answer: 'Acesse Operações > Aprovação de contratos. Selecione os contratos desejados usando as caixas de seleção e clique em "Aprovar em lote". Confirme a ação no modal de confirmação. Atenção: esta ação é irreversível.',
      },
    ],
  },
  {
    id: 'liquidacao',
    label: 'Liquidação e Monitoramento',
    icon: CreditCard,
    items: [
      {
        question: 'O que é uma UR (Unidade de Recebível)?',
        answer: 'UR é a Unidade de Recebível, que representa um fluxo de pagamento futuro de cartão de crédito ou débito. Cada UR está vinculada a um estabelecimento, credenciadora, bandeira e data de liquidação.',
      },
      {
        question: 'Como contesto uma liquidação incorreta?',
        answer: 'Na seção Relatórios > Liquidações, identifique a UR com divergência entre valor previsto e realizado. Clique no botão de contestação, informe o motivo e confirme. Você pode acompanhar suas contestações na seção Contestação.',
      },
      {
        question: 'O que é Chargeback?',
        answer: 'Chargeback é a reversão de uma transação de cartão, geralmente solicitada pelo portador do cartão. Isso reduz o valor dos recebíveis do estabelecimento e pode impactar as operações de garantia registradas.',
      },
      {
        question: 'O que é o CNAB?',
        answer: 'CNAB (Centro Nacional de Automação Bancária) é um padrão de arquivo utilizado para troca de informações entre instituições financeiras. Na plataforma, o Gerador de CNAB permite criar arquivos nos formatos padronizados para envio às registradoras.',
      },
    ],
  },
  {
    id: 'config',
    label: 'Configurações',
    icon: Settings,
    items: [
      {
        question: 'Como configuro notificações?',
        answer: 'Acesse Configurações > Notificações. Você pode ativar alertas para eventos como trava não aplicada, troca de domicílio e chargeback. Para cada regra, é possível atribuir usuários responsáveis que receberão os alertas.',
      },
      {
        question: 'O que é Domicílio de Liquidação?',
        answer: 'É a conta bancária onde os recebíveis do estabelecimento são creditados. Alterar o domicílio significa redirecionar os pagamentos para outra conta. Essa informação é fundamental para garantir que as liquidações cheguem ao destino correto.',
      },
      {
        question: 'Como importo clientes em massa?',
        answer: 'Na tela de Clientes, clique em "Importar". Faça o download do template Excel, preencha com os dados dos clientes (CNPJ obrigatório) e arraste o arquivo para a área de upload ou clique para selecionar. O sistema validará cada linha e informará erros individuais.',
      },
    ],
  },
];

export const FaqModule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleItem = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const filteredData = faqData
    .map(category => ({
      ...category,
      items: category.items.filter(item => {
        const query = searchQuery.toLowerCase();
        if (!query) return true;
        return (
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
        );
      }),
    }))
    .filter(category => {
      if (activeCategory && category.id !== activeCategory) return false;
      return category.items.length > 0;
    });

  const totalResults = filteredData.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Perguntas Frequentes</h2>
            <p className="text-sm text-gray-500">Encontre respostas para as dúvidas mais comuns sobre a plataforma</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por palavras-chave..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
          {searchQuery && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {totalResults} resultado{totalResults !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Category filter chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !activeCategory
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {faqData.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeCategory === category.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ items */}
      {filteredData.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Nenhum resultado encontrado</p>
          <p className="text-sm text-gray-400 mt-1">Tente buscar com outras palavras-chave</p>
        </div>
      ) : (
        filteredData.map(category => {
          const Icon = category.icon;
          return (
            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-gray-900 text-sm">{category.label}</h3>
                <span className="text-xs text-gray-400 ml-auto">{category.items.length} pergunta{category.items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {category.items.map((item, index) => {
                  const itemKey = `${category.id}-${index}`;
                  const isOpen = openItems.has(itemKey);
                  return (
                    <div key={itemKey}>
                      <button
                        onClick={() => toggleItem(itemKey)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm font-medium text-gray-800 pr-4">{item.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-4">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Help footer */}
      <div className="bg-purple-50 rounded-xl border border-purple-100 p-6 text-center">
        <p className="text-sm text-purple-800 font-medium">Não encontrou o que procurava?</p>
        <p className="text-xs text-purple-600 mt-1">
          Abra um chamado na seção <strong>Ajuda e Suporte &gt; Chamados em aberto</strong> e nossa equipe responderá em breve.
        </p>
      </div>
    </div>
  );
};
