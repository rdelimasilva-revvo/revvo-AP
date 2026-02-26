export interface NonAcceptanceCriteria {
  termEnabled: boolean;
  minTerm: string;
  maxTerm: string;
  valueEnabled: boolean;
  minValue: string;
  maxValue: string;
}

export const STORAGE_PREFIX = 'nonAcceptanceCriteria_';

export const defaultCriteria: NonAcceptanceCriteria = {
  termEnabled: false,
  minTerm: '',
  maxTerm: '',
  valueEnabled: false,
  minValue: '',
  maxValue: '',
};

export const loadCriteria = (clientId: string): NonAcceptanceCriteria => {
  const saved = localStorage.getItem(STORAGE_PREFIX + clientId);
  if (saved) {
    return { ...defaultCriteria, ...JSON.parse(saved) };
  }
  return defaultCriteria;
};

export const hasClientCriteria = (clientId: string): boolean => {
  const saved = localStorage.getItem(STORAGE_PREFIX + clientId);
  if (!saved) return false;
  const criteria = JSON.parse(saved) as NonAcceptanceCriteria;
  return criteria.termEnabled || criteria.valueEnabled;
};
