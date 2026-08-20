export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red',
  CHECKED_IN: 'blue',
  CHECKED_OUT: 'purple',
  ARCHIVED: 'gray',
};

export const VISIT_STATUS_OPTIONS = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CHECKED_IN',
  'CHECKED_OUT',
];

export const formatVisitStatus = (status: string) => status.replaceAll('_', ' ');
