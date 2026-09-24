/**
 * Currency & Money utilities using integer minor units (cents).
 * Avoids all IEEE 754 floating-point inaccuracies.
 */

/**
 * Format integer cents into a localized currency string.
 * e.g., 285 -> "$2.85", -150 -> "-$1.50"
 */
export function formatCents(cents: number | null | undefined, currency: string = "USD"): string {
  if (cents === null || cents === undefined || isNaN(cents)) {
    return "$0.00";
  }

  const sign = cents < 0 ? "-" : "";
  const absoluteCents = Math.abs(Math.round(cents));
  const dollars = Math.floor(absoluteCents / 100);
  const remainingCents = absoluteCents % 100;
  const paddedCents = remainingCents.toString().padStart(2, "0");

  if (currency === "USD") {
    return `${sign}$${dollars.toLocaleString("en-US")}.${paddedCents}`;
  }

  return `${sign}${currency} ${dollars.toLocaleString()}.${paddedCents}`;
}

/**
 * Parse an arbitrary currency string or number to integer cents.
 * e.g. "$2.85" -> 285, "34.50" -> 3450, 1.25 -> 125
 */
export function parseDollarsToCents(val: string | number | null | undefined): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") {
    return Math.round(val * 100);
  }

  const cleaned = val.replace(/[^0-9.-]/g, "").trim();
  if (!cleaned) return 0;

  const floatVal = parseFloat(cleaned);
  if (isNaN(floatVal)) return 0;

  return Math.round(floatVal * 100);
}

/**
 * Multiply fractional quantity (e.g. 1.5 pallets or 3 items) by unit rate in cents.
 * Rounds to nearest integer cent.
 */
export function multiplyQuantity(quantity: number, unitRateCents: number): number {
  if (isNaN(quantity) || isNaN(unitRateCents)) return 0;
  return Math.round(quantity * unitRateCents);
}

/**
 * Calculate difference in cents (billed - expected).
 * Positive value means an overcharge (potential discrepancy).
 */
export function calculateDifference(billedCents: number, expectedCents: number): number {
  return billedCents - expectedCents;
}

/**
 * Calculate percentage overcharge/discrepancy.
 * e.g. (345 - 285) / 285 = +21.05%
 */
export function calculatePercentageDiff(billedCents: number, expectedCents: number): number {
  if (!expectedCents || expectedCents === 0) return 0;
  const diff = billedCents - expectedCents;
  return Number(((diff / expectedCents) * 100).toFixed(1));
}
