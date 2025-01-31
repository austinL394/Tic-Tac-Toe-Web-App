import { z } from 'zod';

export const booleanPreprocessor = (value: unknown): boolean | undefined | null => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
  } else if (typeof value === 'boolean') {
    return value;
  }
  throw new Error(`Invalid boolean: ${JSON.stringify(value)}`);
};

export const BooleanSchema = z.string().transform(booleanPreprocessor);

export const upperPreprocessor = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return value ? value.toUpperCase() : undefined;
  }
  return value;
};

export const OptionalDateSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z
    .string()
    .datetime()
    .transform((value) => new Date(value))
    .or(z.date())
    .optional(),
);
