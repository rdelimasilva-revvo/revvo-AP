import React, { useState } from 'react';
import {
  Shield,
  ArrowRight,
  CreditCard,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { CreditRecoveryJourney } from './CreditRecoveryJourney';
import { GuaranteesJourney } from './GuaranteesJourney';
import { PrepaymentJourney } from './PrepaymentJourney';
import { AntecipationJourney } from './AntecipationJourney';

export const OverviewModule: React.FC = () => {
  const [isCreditRecoveryOpen, setIsCreditRecoveryOpen] = useState(false);
  const [isGuaranteesOpen, setIsGuaranteesOpen] = useState(false);
  const [isPrepaymentOpen, setIsPrepaymentOpen] = useState(false);
  const [isAntecipationOpen, setIsAntecipationOpen] = useState(false);

  const formatDate = () => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <button
          onClick={() => setIsCreditRecoveryOpen(true)}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all group text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Recuperação de Crédito</h3>
          <p className="text-sm text-gray-600">Gerencie processos de recuperação e inadimplência</p>
        </button>

        <button
          onClick={() => setIsGuaranteesOpen(true)}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-green-300 transition-all group text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Garantias</h3>
          <p className="text-sm text-gray-600">Monitore e gerencie garantias de contratos</p>
        </button>

        <button
          onClick={() => setIsPrepaymentOpen(true)}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-teal-300 transition-all group text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
              <DollarSign className="w-8 h-8 text-teal-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Pré-pagamentos</h3>
          <p className="text-sm text-gray-600">Controle solicitações de antecipação e pré-pagamentos</p>
        </button>

        <button
          onClick={() => setIsAntecipationOpen(true)}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-orange-300 transition-all group text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Antecipação</h3>
          <p className="text-sm text-gray-600">Antecipe recebíveis e melhore seu fluxo de caixa</p>
        </button>
      </div>

      <CreditRecoveryJourney
        isOpen={isCreditRecoveryOpen}
        onClose={() => setIsCreditRecoveryOpen(false)}
      />

      <GuaranteesJourney
        isOpen={isGuaranteesOpen}
        onClose={() => setIsGuaranteesOpen(false)}
      />

      <PrepaymentJourney
        isOpen={isPrepaymentOpen}
        onClose={() => setIsPrepaymentOpen(false)}
      />

      <AntecipationJourney
        isOpen={isAntecipationOpen}
        onClose={() => setIsAntecipationOpen(false)}
      />
    </div>
  );
};
