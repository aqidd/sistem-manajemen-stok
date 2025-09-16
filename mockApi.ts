import { InventoryItem } from './types';

const STORAGE_KEY = 'inventoryItems';
const API_DELAY = 500; // 500ms delay to simulate network latency

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
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(getStoredItems());
        }, API_DELAY);
    });
};

export const createItem = (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const items = getStoredItems();
            const newItem: InventoryItem = {
                ...item,
                id: new Date().getTime().toString(),
            };
            const updatedItems = [...items, newItem];
            setStoredItems(updatedItems);
            resolve(newItem);
        }, API_DELAY);
    });
};

export const deleteItem = (id: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const items = getStoredItems();
            const updatedItems = items.filter(item => item.id !== id);
            setStoredItems(updatedItems);
            resolve();
        }, API_DELAY);
    });
};

export const updateItem = (updatedItem: InventoryItem): Promise<InventoryItem> => {
     return new Promise((resolve) => {
        setTimeout(() => {
            const items = getStoredItems();
            const updatedItems = items.map(item => item.id === updatedItem.id ? updatedItem : item);
            setStoredItems(updatedItems);
            resolve(updatedItem);
        }, API_DELAY);
    });
};
