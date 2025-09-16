import React from 'react';
import { InventoryItem, SortOption, FilterStatus, StockStatus } from '../types';
import InventoryItemCard from './InventoryItemCard';
import { SearchIcon } from '../constants';

interface InventoryListProps {
    items: InventoryItem[];
    onDeleteItem: (id: string) => void;
    onUpdateItem: (item: InventoryItem) => void;
    currentSort: SortOption;
    onSortChange: (sort: SortOption) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filterStatus: FilterStatus;
    onFilterChange: (status: FilterStatus) => void;
    totalItemsCount: number;
}

const sortOptions: { value: SortOption; label: string }[] = [
    { value: SortOption.DEFAULT, label: 'Urutan Default' },
    { value: SortOption.STOCK_DESC, label: 'Stok (Tertinggi ke Terendah)' },
    { value: SortOption.STOCK_ASC, label: 'Stok (Terendah ke Tertinggi)' },
    { value: SortOption.DURATION_DESC, label: 'Stok Bertahan (Paling Lama)' },
    { value: SortOption.DURATION_ASC, label: 'Stok Bertahan (Paling Cepat Habis)' },
    { value: SortOption.LEAD_TIME_DESC, label: 'Waktu Tunggu (Terlama)' },
    { value: SortOption.LEAD_TIME_ASC, label: 'Waktu Tunggu (Tercepat)' },
];

const filterOptions: { value: FilterStatus; label: string; color: string }[] = [
    { value: 'ALL', label: 'Semua', color: 'bg-slate-200 text-slate-800' },
    { value: StockStatus.URGENT, label: 'Kritis', color: 'bg-red-100 text-red-800' },
    { value: StockStatus.WARNING, label: 'Segera Pesan', color: 'bg-yellow-100 text-yellow-800' },
    { value: StockStatus.SAFE, label: 'Aman', color: 'bg-emerald-100 text-emerald-800' },
]


const InventoryList: React.FC<InventoryListProps> = ({ 
    items, 
    onDeleteItem, 
    onUpdateItem, 
    currentSort, 
    onSortChange,
    searchQuery,
    onSearchChange,
    filterStatus,
    onFilterChange,
    totalItemsCount
}) => {
    const isListEmpty = totalItemsCount === 0;
    const noResultsMatch = !isListEmpty && items.length === 0;

    return (
        <div>
            <div className="bg-white p-4 rounded-xl shadow-md mb-6 space-y-4">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <h2 className="text-2xl font-semibold text-slate-700 mb-2 sm:mb-0 shrink-0">Daftar Stok Barang</h2>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <label htmlFor="sort-by" className="text-sm font-medium text-slate-600 shrink-0">Urutkan:</label>
                        <select
                            id="sort-by"
                            value={currentSort}
                            onChange={(e) => onSortChange(e.target.value as SortOption)}
                            className="block w-full sm:w-auto pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                       <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nama barang..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="block w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-slate-500 focus:border-sky-500 focus:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm"
                    />
                </div>
                
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                    <span className="text-sm font-medium text-slate-600 shrink-0">Filter Status:</span>
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => onFilterChange(option.value)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full transition-all shrink-0 ${
                                filterStatus === option.value
                                ? `${option.color} ring-2 ring-offset-1 ring-sky-500`
                                : `bg-slate-100 text-slate-600 hover:bg-slate-200`
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {isListEmpty ? (
                <div className="bg-white text-center p-10 rounded-xl shadow-md">
                    <p className="text-slate-500">Belum ada barang di dalam daftar.</p>
                    <p className="text-slate-400 text-sm mt-2">Silakan tambahkan barang baru menggunakan form di samping.</p>
                </div>
            ) : noResultsMatch ? (
                 <div className="bg-white text-center p-10 rounded-xl shadow-md">
                    <p className="text-slate-500">Tidak ada hasil yang cocok.</p>
                    <p className="text-slate-400 text-sm mt-2">Coba ubah kata kunci pencarian atau filter status Anda.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map(item => (
                        <InventoryItemCard key={item.id} item={item} onDelete={onDeleteItem} onUpdate={onUpdateItem}/>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InventoryList;
