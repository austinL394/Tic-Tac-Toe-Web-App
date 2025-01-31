// Implementation of json-merge-patch: rfc7396 https://datatracker.ietf.org/doc/html/rfc7396
//
import { isEqual } from 'lodash';

export type Patch<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown> ? Patch<T[K]> | null : T[K] | null;
};

type Rec = Record<string, unknown>;

export const applyPatch = <T extends object>(data: T, patch: Patch<T>): T => {
  // data and patch must be JSON compatible so make sure they equal their json representation
  const patched = JSON.parse(JSON.stringify(data)) as T;
  if (!isEqual(data, patched)) throw new Error('data is not JSON compatible');

  const patchArg = patch;
  patch = JSON.parse(JSON.stringify(patch)) as object;
  if (!isEqual(patch, patchArg)) throw new Error('patch is not JSON compatible');

  _applyPatch(patched as Rec, patch);

  return patched;
};

const _applyPatch = (data: Rec, patch: object) => {
  for (const [key, value] of Object.entries(patch) as [string, unknown][]) {
    if (value === null || value === undefined) {
      delete data[key];
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        data[key] = value;
      } else {
        data[key] ??= {};
        _applyPatch(data[key] as Rec, value);
      }
    } else {
      data[key] = value;
    }
  }
};

// values in 'initial' that are absent (or undefined) in 'updated' are removed by setting the patch value to null.
export const createPatch = <T extends object>(initial: T, updated: T): Partial<T> => {
  initial = JSON.parse(JSON.stringify(initial)) as T;
  updated = JSON.parse(JSON.stringify(updated)) as T;

  return (_createPatch(initial, updated) as object | undefined) ?? {};
};

const _createPatch = (initial: unknown, updated: unknown): unknown => {
  if (isEqual(initial, updated)) return undefined;
  if (updated === undefined || updated === null) return null;

  if (typeof updated === 'object' && !Array.isArray(updated)) {
    if (!initial || typeof initial !== 'object' || Array.isArray(initial)) {
      initial = {};
    }
    const patch: Record<string, unknown> = {};
    const keys = new Set([...Object.keys(initial ?? {}), ...Object.keys(updated)]);
    for (const key of keys) {
      const patched = _createPatch((initial as Rec)[key], (updated as Rec)[key]);
      if (patched !== undefined) patch[key] = patched;
    }

    return patch;
  }

  return updated;
};
