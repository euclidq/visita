import '@tanstack/history';

declare module '@tanstack/history' {
  interface HistoryState {
    referenceNumber?: string;
    title?: string;
    message?: string;
  }
}