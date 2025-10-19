/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'USD')
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  // Convert to number and handle edge cases
  const numAmount = Number(amount)
  
  // Return $0.00 for invalid amounts
  if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
    return '$0.00'
  }
  
  // Format using Intl.NumberFormat for proper localization
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

/**
 * Format a number with commas for thousands separators
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(num: number | string | null | undefined, decimals: number = 2): string {
  const number = Number(num)
  
  if (isNaN(number)) {
    return '0.00'
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
}

/**
 * Format litres with proper units
 * @param litres - The number of litres
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted litres string
 */
export function formatLitres(litres: number | string | null | undefined, decimals: number = 1): string {
  const number = Number(litres)
  
  if (isNaN(number)) {
    return '0.0L'
  }
  
  return `${formatNumber(number, decimals)}L`
}
