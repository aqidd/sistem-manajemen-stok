// 2025-09-16: Switched to call backend /api with localStorage fallback. Kept API shape.
import { InventoryItem } from './types';

const STORAGE_KEY = 'inventoryItems';
const API_DELAY = 500; // keep small delay for UI consistency on fallback
const API_BASE = '/api';

const initialData: InventoryItem[] = [
    { id: '1', name: 'Tepung Terigu', unit: 'kg', currentStock: 50, requirementPerRecipe: 0.5, recipesToday: 20, leadTime: 3, supplierWhatsapp: '+6281234567890' },
    { id: '2', name: 'Gula Pasir', unit: 'kg', currentStock: 20, requirementPerRecipe: 0.2, recipesToday: 20, leadTime: 2, supplierWhatsapp: '+6281234567891' },
    { id: '3', name: 'Kotak Kemasan', unit: 'pcs', currentStock: 200, requirementPerRecipe: 1, recipesToday: 80, leadTime: 5, supplierWhatsapp: '+6281234567892' },
    { id: '4', name: 'Mentega', unit: 'kg', currentStock: 5, requirementPerRecipe: 0.1, recipesToday: 20, leadTime: 1 },
];

const getStoredItems = (): InventoryItem[] => {
    try {
        const savedItems = localStorage.getItem(STORAGE_KEY);
        if (savedItems) {
            return JSON.parse(savedItems);
        }
        // If no saved items, initialize with initialData
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        return initialData;
    } catch (error) {
        console.error("Could not access localStorage", error);
        return initialData; // return initial data as a fallback
    }
};

const setStoredItems = (items: InventoryItem[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.error("Could not write to localStorage", error);
    }
};

export const fetchItems = (): Promise<InventoryItem[]> => {
    // Try backend first, fallback to localStorage
    return fetch(`${API_BASE}/items`)
        .then(async (res) => {
            if (!res.ok) throw new Error('Failed to fetch');
            const data: InventoryItem[] = await res.json();
            // keep local cache in sync
            setStoredItems(data);
            return data;
        })
        .catch(() => new Promise((resolve) => {
            setTimeout(() => resolve(getStoredItems()), API_DELAY);
        }));
};

export const createItem = (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
    return fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    })
        .then(async (res) => {
            if (!res.ok) throw new Error('Failed to create');
            const created: InventoryItem = await res.json();
            // sync cache
            const items = getStoredItems();
            setStoredItems([...items, created]);
            return created;
        })
        .catch(() => new Promise<InventoryItem>((resolve) => {
            setTimeout(() => {
                const items = getStoredItems();
                const newItem: InventoryItem = { ...item, id: new Date().getTime().toString() };
                setStoredItems([...items, newItem]);
                resolve(newItem);
            }, API_DELAY);
        }));
};

export const deleteItem = (id: string): Promise<void> => {
    return fetch(`${API_BASE}/items/${encodeURIComponent(id)}`, { method: 'DELETE' })
        .then((res) => {
            if (!res.ok && res.status !== 204) throw new Error('Failed to delete');
            const items = getStoredItems();
            setStoredItems(items.filter(it => it.id !== id));
        })
        .catch(() => new Promise<void>((resolve) => {
            setTimeout(() => {
                const items = getStoredItems();
                setStoredItems(items.filter(it => it.id !== id));
                resolve();
            }, API_DELAY);
        }));
};

export const updateItem = (updatedItem: InventoryItem): Promise<InventoryItem> => {
     return fetch(`${API_BASE}/items/${encodeURIComponent(updatedItem.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: updatedItem.name,
            unit: updatedItem.unit,
            currentStock: updatedItem.currentStock,
            requirementPerRecipe: updatedItem.requirementPerRecipe,
            recipesToday: updatedItem.recipesToday,
            leadTime: updatedItem.leadTime,
            supplierWhatsapp: updatedItem.supplierWhatsapp,
        }),
     })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to update');
        const saved: InventoryItem = await res.json();
        const items = getStoredItems();
        setStoredItems(items.map(it => it.id === saved.id ? saved : it));
        return saved;
      })
      .catch(() => new Promise<InventoryItem>((resolve) => {
        setTimeout(() => {
            const items = getStoredItems();
            const updatedItems = items.map(item => item.id === updatedItem.id ? updatedItem : item);
            setStoredItems(updatedItems);
            resolve(updatedItem);
        }, API_DELAY);
      }));
};
