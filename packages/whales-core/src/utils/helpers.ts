/**
 * Debounce function to limit how often a function can be called
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
};

/**
 * Format a number as currency
 * @param value - The number to format
 * @param locale - The locale to use for formatting
 * @param currency - The currency code
 * @returns A formatted currency string
 */
export const formatCurrency = (
  value: number,
  locale: string = "en-US",
  currency: string = "USD"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
};

/**
 * Truncate a string if it exceeds a certain length
 * @param str - The string to truncate
 * @param maxLength - The maximum length
 * @param suffix - The suffix to add to truncated strings
 * @returns The truncated string
 */
export const truncate = (
  str: string,
  maxLength: number = 50,
  suffix: string = "..."
): string => {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}${suffix}`;
};
