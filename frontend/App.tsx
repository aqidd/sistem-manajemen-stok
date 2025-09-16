import React, { useState, useEffect, useMemo } from 'react';
import { InventoryItem, SortOption, StockStatus, FilterStatus } from './types';
import Header from './components/Header';
import AddItemForm from './components/AddItemForm';
import InventoryList from './components/InventoryList';
import { fetchItems, createItem, deleteItem, updateItem } from './mockApi';

const getStockStatus = (item: InventoryItem): StockStatus => {
    const dailyRequirement = item.requirementPerRecipe * item.recipesToday;
    if (dailyRequirement === 0) return StockStatus.SAFE;

    const stockDuration = item.currentStock / dailyRequirement;
    const reorderPoint = item.leadTime + 2; // Safety stock for 2 days

    if (stockDuration <= item.leadTime) {
        return StockStatus.URGENT;
    } else if (stockDuration <= reorderPoint) {
        return StockStatus.WARNING;
    } else {
        return StockStatus.SAFE;
    }
};

const App: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>(SortOption.DEFAULT);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');

    useEffect(() => {
        const loadItems = async () => {
            try {
                setIsLoading(true);
                const fetchedItems = await fetchItems();
                setItems(fetchedItems);
                setError(null);
            } catch (err) {
                setError("Gagal memuat data inventaris. Silakan coba lagi nanti.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadItems();
    }, []);

    const handleAddItem = async (item: Omit<InventoryItem, 'id'>) => {
        try {
            const newItem = await createItem(item);
            setItems(prevItems => [...prevItems, newItem]);
        } catch (err) {
            alert("Gagal menambahkan barang.");
            console.error(err);
        }
    };

    const handleDeleteItem = async (id: string) => {
        try {
            await deleteItem(id);
            setItems(prevItems => prevItems.filter(item => item.id !== id));
        } catch (err) {
            alert("Gagal menghapus barang.");
            console.error(err);
        }
    };
    
    const handleUpdateItem = async (updatedItem: InventoryItem) => {
        try {
            await updateItem(updatedItem);
            setItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item));
        } catch(err) {
            alert("Gagal memperbarui barang.");
            console.error(err);
        }
    };

    const filteredAndSortedItems = useMemo(() => {
        let filteredItems = [...items];

        // 1. Filter by search query
        if (searchQuery) {
            filteredItems = filteredItems.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 2. Filter by status
        if (filterStatus !== 'ALL') {
            filteredItems = filteredItems.filter(item => getStockStatus(item) === filterStatus);
        }

        // 3. Sort the filtered items
        const calculateStockDuration = (item: InventoryItem): number => {
            const dailyRequirement = item.requirementPerRecipe * item.recipesToday;
            return dailyRequirement > 0 ? item.currentStock / dailyRequirement : Infinity;
        };

        filteredItems.sort((a, b) => {
            switch (sortBy) {
                case SortOption.STOCK_ASC:
                    return a.currentStock - b.currentStock;
                case SortOption.STOCK_DESC:
                    return b.currentStock - a.currentStock;
                case SortOption.DURATION_ASC:
                    return calculateStockDuration(a) - calculateStockDuration(b);
                case SortOption.DURATION_DESC:
                    return calculateStockDuration(b) - calculateStockDuration(a);
                case SortOption.LEAD_TIME_ASC:
                    return a.leadTime - b.leadTime;
                case SortOption.LEAD_TIME_DESC:
                    return b.leadTime - a.leadTime;
                case SortOption.DEFAULT:
                default:
                    return 0;
            }
        });
        return filteredItems;
    }, [items, sortBy, searchQuery, filterStatus]);


    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <AddItemForm onAddItem={handleAddItem} />
                    </div>
                    <div className="lg:col-span-2">
                         {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                                <p className="font-bold">Terjadi Kesalahan</p>
                                <p>{error}</p>
                            </div>
                        ) : (
                            <InventoryList 
                                items={filteredAndSortedItems} 
                                onDeleteItem={handleDeleteItem} 
                                onUpdateItem={handleUpdateItem}
                                currentSort={sortBy}
                                onSortChange={setSortBy}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                filterStatus={filterStatus}
                                onFilterChange={setFilterStatus}
                                totalItemsCount={items.length}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
