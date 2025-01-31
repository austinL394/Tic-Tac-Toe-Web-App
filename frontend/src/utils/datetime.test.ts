import { formatDate, formatDateTime } from './datetime';
import { test, expect } from 'vitest';

test('formatDate -> formats a Date object correctly', () => {
  const date = new Date(new Date(2022, 0, 1));
  const formattedDate = formatDate(date);
  expect(formattedDate).toBe('2022-01-01');
});

test('formatDate -> returns an empty string if the date is undefined', () => {
  const formattedDate = formatDate(undefined);
  expect(formattedDate).toBe('');
});

test('formatDateTime -> formats a Date object correctly', () => {
  const date = new Date(new Date(2022, 0, 1, 9, 32, 25));
  const formattedDate = formatDateTime(date);
  expect(formattedDate).toBe('01/01/2022 09:32:25');
});
test('formatDateTime -> returns an empty string if the date is undefined', () => {
  const formattedDate = formatDateTime(undefined);
  expect(formattedDate).toBe('');
});
