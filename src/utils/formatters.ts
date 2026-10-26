import React from 'react';

/**
 * Clean currency formatting that displays reliably on all platforms without missing glyphs.
 */
export function formatMoney(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
