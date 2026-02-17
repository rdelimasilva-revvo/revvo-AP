import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface LockAmountInputProps {
  available: number;
  suggested?: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function LockAmountInput({
  available,
  suggested,
  value,
  onChange,
  disabled = false
}: LockAmountInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const parseValue = (str: string): number => {
    const cleanStr = str.replace(/[^\d]/g, '');
    return cleanStr ? parseInt(cleanStr, 10) : 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);
    const numericValue = parseValue(rawValue);
    onChange(numericValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setInputValue(value.toString());
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    e.target.select();
  };

  const useSuggested = () => {
    if (suggested) {
      onChange(suggested);
    }
  };

  const isValid = value <= available && value > 0;
  const isOverLimit = value > available;
  const percentage = available > 0 ? (value / available) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={isFocused ? inputValue : formatCurrency(value)}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled || available === 0}
          className={`w-full pl-3 pr-10 py-2 border rounded-lg text-right font-medium transition-colors ${
            disabled || available === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isOverLimit
              ? 'border-red-300 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-500'
              : isValid
              ? 'border-green-300 bg-green-50 text-green-900 focus:ring-2 focus:ring-green-500'
              : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
          }`}
          placeholder="0"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isValid && value > 0 && (
            <CheckCircle className="w-4 h-4 text-green-600" />
          )}
          {isOverLimit && (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {isValid && value > 0 && (
            <span className="text-green-600 font-medium">
              {percentage.toFixed(1)}% do disponível
            </span>
          )}
          {isOverLimit && (
            <span className="text-red-600 font-medium">
              Excede em {formatCurrency(value - available)}
            </span>
          )}
          {!isValid && value === 0 && available > 0 && (
            <span className="text-gray-500">
              Defina o valor a travar
            </span>
          )}
          {available === 0 && (
            <span className="text-gray-500">
              Sem recebíveis disponíveis
            </span>
          )}
        </div>

        {suggested && suggested <= available && value !== suggested && (
          <button
            onClick={useSuggested}
            disabled={disabled}
            className="text-blue-600 hover:text-blue-700 font-medium underline disabled:opacity-50"
          >
            Usar sugerido ({formatCurrency(suggested)})
          </button>
        )}
      </div>

      {percentage > 80 && percentage <= 100 && (
        <div className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Alto percentual de utilização ({percentage.toFixed(0)}%). Considere deixar margem para variações.
          </span>
        </div>
      )}
    </div>
  );
}
