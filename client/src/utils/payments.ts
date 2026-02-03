// Shared payment utilities for client-side usage
// Centralize currency formatting and annual total calculation

export type BasicPayment = {
  date: string;
  amount: number;
};

// Format currency amounts for Argentina with proper thousand separators and ARS symbol
export const formatCurrencyARS = (amount: number): string => {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback in case Intl fails
    return `$${Number(amount || 0).toLocaleString('es-AR')}`;
  }
};

// Calculate the annual total by summing real amounts for the specified year
export const calculateAnnualTotal = (
  payments: BasicPayment[],
  year: number
): number => {
  if (!Array.isArray(payments) || payments.length === 0) return 0;
  return payments
    .filter((p) => {
      const d = new Date(p.date);
      return !isNaN(d.getTime()) && d.getFullYear() === year;
    })
    .reduce((sum, p) => sum + (typeof p.amount === 'number' ? p.amount : 0), 0);
};