// 2025-09-16: Added SQLite DB setup with items table and seed logic using better-sqlite3

import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { InventoryItem, NewInventoryItem } from './types.js';

const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
const DB_FILE = process.env.DB_FILE || path.join(DATA_DIR, 'inventory.db');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const db = new Database(DB_FILE);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    currentStock REAL NOT NULL,
    requirementPerRecipe REAL NOT NULL,
    recipesToday INTEGER NOT NULL,
    leadTime INTEGER NOT NULL,
    supplierWhatsapp TEXT
  );
`);

export function countItems(): number {
  const row = db.prepare('SELECT COUNT(*) as c FROM items').get() as { c: number };
  return row.c;
}

export function seedIfEmpty(): void {
  if (countItems() > 0) return;
  const initialData: InventoryItem[] = [
    { id: '1', name: 'Tepung Terigu', unit: 'kg', currentStock: 50, requirementPerRecipe: 0.5, recipesToday: 20, leadTime: 3, supplierWhatsapp: '+6281234567890' },
    { id: '2', name: 'Gula Pasir', unit: 'kg', currentStock: 20, requirementPerRecipe: 0.2, recipesToday: 20, leadTime: 2, supplierWhatsapp: '+6281234567891' },
    { id: '3', name: 'Kotak Kemasan', unit: 'pcs', currentStock: 200, requirementPerRecipe: 1, recipesToday: 80, leadTime: 5, supplierWhatsapp: '+6281234567892' },
    { id: '4', name: 'Mentega', unit: 'kg', currentStock: 5, requirementPerRecipe: 0.1, recipesToday: 20, leadTime: 1 },
  ];
  const insert = db.prepare(`INSERT INTO items (id, name, unit, currentStock, requirementPerRecipe, recipesToday, leadTime, supplierWhatsapp)
    VALUES (@id, @name, @unit, @currentStock, @requirementPerRecipe, @recipesToday, @leadTime, @supplierWhatsapp)`);
  const tx = db.transaction((items: InventoryItem[]) => {
    for (const it of items) insert.run({ ...it, supplierWhatsapp: it.supplierWhatsapp ?? null });
  });
  tx(initialData);
}

export function getAllItems(): InventoryItem[] {
  const rows = db.prepare('SELECT * FROM items ORDER BY CAST(id AS INTEGER)').all();
  return rows as InventoryItem[];
}

export function createItem(item: NewInventoryItem): InventoryItem {
  const newItem: InventoryItem = {
    ...item,
    id: Date.now().toString(),
  };
  db.prepare(`INSERT INTO items (id, name, unit, currentStock, requirementPerRecipe, recipesToday, leadTime, supplierWhatsapp)
    VALUES (@id, @name, @unit, @currentStock, @requirementPerRecipe, @recipesToday, @leadTime, @supplierWhatsapp)`).run({
      ...newItem,
      supplierWhatsapp: newItem.supplierWhatsapp ?? null,
    });
  return newItem;
}

export function updateItem(id: string, item: NewInventoryItem | InventoryItem): InventoryItem | null {
  const exists = db.prepare('SELECT id FROM items WHERE id = ?').get(id) as { id: string } | undefined;
  if (!exists) return null;
  // Accept either with or without id in payload; keep route id as source of truth
  const updated: InventoryItem = {
    id,
    name: (item as InventoryItem).name,
    unit: (item as InventoryItem).unit,
    currentStock: (item as InventoryItem).currentStock,
    requirementPerRecipe: (item as InventoryItem).requirementPerRecipe,
    recipesToday: (item as InventoryItem).recipesToday,
    leadTime: (item as InventoryItem).leadTime,
    supplierWhatsapp: (item as InventoryItem).supplierWhatsapp,
  };
  db.prepare(`UPDATE items SET name=@name, unit=@unit, currentStock=@currentStock, requirementPerRecipe=@requirementPerRecipe,
              recipesToday=@recipesToday, leadTime=@leadTime, supplierWhatsapp=@supplierWhatsapp WHERE id=@id`).run({
                ...updated,
                supplierWhatsapp: updated.supplierWhatsapp ?? null,
              });
  return updated;
}

export function deleteItem(id: string): boolean {
  const info = db.prepare('DELETE FROM items WHERE id = ?').run(id);
  return info.changes > 0;
}
