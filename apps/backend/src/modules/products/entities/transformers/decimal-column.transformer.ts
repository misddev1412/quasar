import { ValueTransformer } from 'typeorm';

export const decimalColumnTransformer: ValueTransformer = {
  to: (value?: number | null) => value ?? null,
  from: (value?: string | number | null): number | null => {
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value === 'number') {
      return value;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  },
};
