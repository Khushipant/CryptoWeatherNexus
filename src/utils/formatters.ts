/**
 * Formats a number as currency (USD).
 * Returns '--.--' if the value is null or undefined.
 */
export const formatCurrency = (value: number | undefined | null): string => {
    if (value === null || typeof value === 'undefined') return '$--.--';
    try {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: value < 1 ? 6 : 2 // Show more digits for small values
        });
    } catch (e) {
        console.error("Currency formatting error:", e);
        return '$?.??';
    }
};

/**
 * Formats a number as a percentage change with a sign.
 * Returns '--.--%' if the value is null or undefined.
 */
export const formatPercentage = (value: number | undefined | null): string => {
    if (value === null || typeof value === 'undefined') return '--.--%';
    try {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    } catch (e) {
        console.error("Percentage formatting error:", e);
        return '?.??%';
    }
};

/**
 * Formats a date string or timestamp into a readable date.
 * Returns an empty string if formatting fails or input is invalid.
 */
export const formatDate = (dateInput: string | number | Date | undefined | null): string => {
    if (!dateInput) return ''
    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return ''; // Invalid date
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        console.error("Date formatting error:", e);
        return ''; // Return empty string on error
    }
};

/**
 * Formats a large number (like market cap) into a shorter string (e.g., $1.2T, $500B, $10M).
 * Returns '--.--' if the value is invalid.
 */
export const formatMarketCap = (value: number | undefined | null): string => {
    if (value === null || typeof value === 'undefined' || isNaN(value)) return '$--.--';

    const trillion = 1_000_000_000_000;
    const billion = 1_000_000_000;
    const million = 1_000_000;

    try {
        if (value >= trillion) {
            return `$${(value / trillion).toFixed(2)}T`;
        }
        if (value >= billion) {
            return `$${(value / billion).toFixed(2)}B`;
        }
        if (value >= million) {
            return `$${(value / million).toFixed(2)}M`;
        }
        // For smaller values, just format as currency
        return formatCurrency(value);
    } catch (e) {
        console.error("Market cap formatting error:", e);
        return '$?.??';
    }
};
