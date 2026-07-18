export const formatTimeLabel = (timestamp: number): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  } catch { return ''; }
};

export const formatValueWithUnit = (value: number, unit: string): string => {
  if (value === undefined || value === null) return 'N/A';
  return `${value.toLocaleString()}${unit}`;
};