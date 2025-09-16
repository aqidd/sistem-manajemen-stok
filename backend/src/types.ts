// 2025-09-16: Added shared types for backend to mirror frontend InventoryItem

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

export type NewInventoryItem = Omit<InventoryItem, 'id'>;
