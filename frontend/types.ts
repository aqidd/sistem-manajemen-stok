export interface InventoryItem {
  id: string;
  name: string;
  unit: string; // e.g., kg, liter, pcs
  currentStock: number;
  requirementPerRecipe: number;
  recipesToday: number;
  leadTime: number; // in days
  supplierWhatsapp?: string; // optional
}

export enum StockStatus {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  URGENT = 'URGENT',
}

export type FilterStatus = StockStatus | 'ALL';

export enum SortOption {
  DEFAULT = 'default',
  STOCK_ASC = 'stock_asc',
  STOCK_DESC = 'stock_desc',
  DURATION_ASC = 'duration_asc',
  DURATION_DESC = 'duration_desc',
  LEAD_TIME_ASC = 'lead_time_asc',
  LEAD_TIME_DESC = 'lead_time_desc',
}
