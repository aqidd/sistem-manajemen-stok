// 2025-09-16: Switched to full-width table and moved AddItemForm into a modal.
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
    const [showAddModal, setShowAddModal] = useState(false);

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
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-700">Inventaris</h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    >
                        + Tambah Barang
                    </button>
                </div>
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
            </main>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white w-full max-w-lg mx-4 rounded-xl shadow-xl p-6 relative">
                        <button
                            aria-label="Tutup"
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                        >
                            ×
                        </button>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Tambah Barang</h3>
                        <AddItemForm onAddItem={async (payload) => {
                            await handleAddItem(payload);
                            // keep modal open so user can see success popup; they can close it afterwards
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
