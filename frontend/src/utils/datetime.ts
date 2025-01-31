import { format } from 'date-fns';

export function formatDate(date: number | Date | undefined) {
  return date ? format(date, 'yyyy-MM-dd') : '';
}

export function formatDateYYYYMMMDD(date: number | Date | undefined) {
  return date ? format(date, 'yyyy-MMM-dd') : '';
}

export function formatDateTime(date: number | Date | undefined) {
  return date ? format(date, 'MM/dd/yyyy HH:mm:ss') : '';
}

export function formatDateTimeLong(date: number | Date | undefined) {
  return date ? format(date, 'yyyy-MMM-dd hh:mm:ss a') : '';
}

export function calculateAge(dateOfBirth: Date | undefined, dateOfInterest: Date | undefined) {
  if (!dateOfBirth || !dateOfInterest) {
    return '';
  }
  if (
    dateOfBirth.getMonth() > dateOfInterest.getMonth() ||
    (dateOfBirth.getMonth() === dateOfInterest.getMonth() && dateOfBirth.getDate() > dateOfInterest.getDate())
  ) {
    return dateOfInterest.getFullYear() - dateOfBirth.getFullYear() - 1;
  } else {
    return dateOfInterest.getFullYear() - dateOfBirth.getFullYear();
  }
}
