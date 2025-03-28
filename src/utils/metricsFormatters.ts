
/**
 * Format seconds to minutes and seconds display (e.g., "5:45")
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted time string
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds && seconds !== 0) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format seconds to minutes display (e.g., "5 min")
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted minutes string
 */
export const formatDurationMinutes = (seconds: number): string => {
  if (!seconds && seconds !== 0) return '0';
  return Math.round(seconds / 60).toString();
};

/**
 * Format percentage values for display
 * @param {number} value - Decimal value (0-1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  if (value === undefined || value === null) return '0%';
  // Convert from decimal to percentage and round
  return `${Math.round(value * 100)}%`;
};

/**
 * Format sentiment score for display
 * @param {number} sentiment - Sentiment value (0-1)
 * @returns {string} Categorized sentiment string
 */
export const formatSentimentCategory = (sentiment: number): string => {
  if (sentiment === undefined || sentiment === null) return 'Neutral';
  
  if (sentiment >= 0.67) return 'Positive';
  if (sentiment <= 0.33) return 'Negative';
  return 'Neutral';
};

/**
 * Format dates for display
 * @param {string | Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return 'Unknown';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format the change value for metrics
 * @param {number} change - Percentage change
 * @returns {string} Formatted change string with + or - prefix
 */
export const formatChange = (change: number): string => {
  if (change === 0) return '0%';
  return `${change > 0 ? '+' : ''}${change}%`;
};

/**
 * Format number to have comma separators
 * @param {number} value - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (value: number): string => {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString('en-US');
};
