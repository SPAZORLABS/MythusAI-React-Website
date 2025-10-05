/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format a date for input fields (YYYY-MM-DD)
 */
export const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format duration in minutes to readable format
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return `${hours}h ${mins}m`;
};

/**
 * Format page numbers (e.g., "1.5" becomes "1 1/2")
 */
export const formatPageNumber = (pages: number): string => {
  const wholePages = Math.floor(pages);
  const fraction = pages - wholePages;
  
  if (fraction === 0) {
    return wholePages.toString();
  }
  
  if (fraction === 0.5) {
    return `${wholePages} 1/2`;
  }
  
  if (fraction === 0.25) {
    return `${wholePages} 1/4`;
  }
  
  if (fraction === 0.75) {
    return `${wholePages} 3/4`;
  }
  
  // For other fractions, show as decimal
  return pages.toFixed(1);
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Truncate text to specified length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Format time of day for display
 */
export const formatTimeOfDay = (timeOfDay: string): string => {
  switch (timeOfDay.toLowerCase()) {
    case 'day':
      return 'Day';
    case 'night':
      return 'Night';
    case 'dawn':
      return 'Dawn';
    case 'dusk':
      return 'Dusk';
    case 'continuous':
      return 'Continuous';
    default:
      return capitalizeWords(timeOfDay);
  }
};

/**
 * Format scene heading
 */
export const formatSceneHeading = (location: string, timeOfDay: string, type?: 'interior' | 'exterior'): string => {
  const prefix = type === 'interior' ? 'INT.' : type === 'exterior' ? 'EXT.' : '';
  const time = formatTimeOfDay(timeOfDay);
  
  if (prefix) {
    return `${prefix} ${location.toUpperCase()} - ${time.toUpperCase()}`;
  }
  
  return `${location.toUpperCase()} - ${time.toUpperCase()}`;
};

export default {
  formatDate,
  formatDateForInput,
  formatFileSize,
  formatDuration,
  formatPageNumber,
  capitalizeWords,
  truncateText,
  formatTimeOfDay,
  formatSceneHeading
}; 