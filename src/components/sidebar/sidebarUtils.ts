// Utility functions for sidebar components

export const truncateTitle = (title: string, maxLength: number = 25): string => {
  if (title.length <= maxLength) return title;
  const name = title;
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

// Debounce function for search input
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}; 