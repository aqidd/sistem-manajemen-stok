// Utility functions for date calculations and formatting

export const calculatePredictedEmptyDate = (
  currentStock: number,
  requirementPerRecipe: number,
  recipesToday: number
): Date | null => {
  const dailyRequirement = requirementPerRecipe * recipesToday;
  if (dailyRequirement <= 0) return null;
  
  const daysUntilEmpty = currentStock / dailyRequirement;
  if (!isFinite(daysUntilEmpty)) return null;
  
  const today = new Date();
  const emptyDate = new Date(today);
  emptyDate.setDate(today.getDate() + Math.floor(daysUntilEmpty));
  
  return emptyDate;
};

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '—';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '—';
  
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
};

export const formatDateShort = (date: Date | string | null | undefined): string => {
  if (!date) return '—';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '—';
  
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short'
  }).format(dateObj);
};

export const getDaysUntilDate = (date: Date | string | null | undefined): number | null => {
  if (!date) return null;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  const timeDiff = dateObj.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

export const getDateStatus = (predictedEmptyDate: Date | string | null | undefined, leadTime: number) => {
  const daysUntil = getDaysUntilDate(predictedEmptyDate);
  if (daysUntil === null) return 'safe';
  
  if (daysUntil <= leadTime) return 'urgent';
  if (daysUntil <= leadTime + 2) return 'warning';
  return 'safe';
};