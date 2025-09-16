// 2025-09-16: Fixed types import path; converted list to full-width table layout.
// 2025-09-17: Added inline edit flow directly in table rows (Edit/Save/Cancel).
import React, { useState } from 'react';
import { InventoryItem, SortOption, FilterStatus, StockStatus } from '../types';
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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<InventoryItem>>({});

    const beginEdit = (it: InventoryItem) => {
        setEditingId(it.id);
        setEditData({ ...it });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    const saveEdit = (original: InventoryItem) => {
        const updated: InventoryItem = {
            ...original,
            name: String(editData.name ?? original.name),
            unit: String(editData.unit ?? original.unit),
            currentStock: Number(editData.currentStock ?? original.currentStock),
            requirementPerRecipe: Number(editData.requirementPerRecipe ?? original.requirementPerRecipe),
            recipesToday: Number(editData.recipesToday ?? original.recipesToday),
            leadTime: Number(editData.leadTime ?? original.leadTime),
            supplierWhatsapp: (editData.supplierWhatsapp ?? original.supplierWhatsapp) as string | undefined,
        };
        onUpdateItem(updated);
        cancelEdit();
    };
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
                    <p className="text-slate-400 text-sm mt-2">Silakan tambahkan barang baru menggunakan tombol "Tambah Barang".</p>
                </div>
            ) : noResultsMatch ? (
                 <div className="bg-white text-center p-10 rounded-xl shadow-md">
                    <p className="text-slate-500">Tidak ada hasil yang cocok.</p>
                    <p className="text-slate-400 text-sm mt-2">Coba ubah kata kunci pencarian atau filter status Anda.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nama</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Satuan</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Stok</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Kebutuhan/Hari</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Bertahan</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Lead Time</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {items.map((item) => {
                          const dailyRequirement = item.requirementPerRecipe * item.recipesToday;
                          const stockDuration = dailyRequirement > 0 ? item.currentStock / dailyRequirement : Infinity;
                          const reorderPoint = item.leadTime + 2;
                          let status: StockStatus;
                          if (dailyRequirement === 0) {
                            status = StockStatus.SAFE;
                          } else if (stockDuration <= item.leadTime) {
                            status = StockStatus.URGENT;
                          } else if (stockDuration <= reorderPoint) {
                            status = StockStatus.WARNING;
                          } else {
                            status = StockStatus.SAFE;
                          }
                          const statusBadge: Record<StockStatus, string> = {
                            [StockStatus.SAFE]: 'bg-emerald-100 text-emerald-800',
                            [StockStatus.WARNING]: 'bg-yellow-100 text-yellow-800',
                            [StockStatus.URGENT]: 'bg-red-100 text-red-800',
                          };
                          const statusLabel: Record<StockStatus, string> = {
                            [StockStatus.SAFE]: 'Aman',
                            [StockStatus.WARNING]: 'Segera Pesan',
                            [StockStatus.URGENT]: 'Kritis',
                          };
                          const isEditing = editingId === item.id;
                          return (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={(editData.name as string) ?? item.name}
                                    onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                                    className="w-full max-w-xs px-2 py-1 border border-slate-300 rounded"
                                  />
                                ) : (
                                  item.name
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                {isEditing ? (
                                  <select
                                    value={(editData.unit as string) ?? item.unit}
                                    onChange={(e) => setEditData((d) => ({ ...d, unit: e.target.value }))}
                                    className="w-full max-w-[7rem] px-2 py-1 border border-slate-300 rounded"
                                  >
                                    <option>kg</option>
                                    <option>gram</option>
                                    <option>liter</option>
                                    <option>ml</option>
                                    <option>pcs</option>
                                    <option>box</option>
                                    <option>roll</option>
                                  </select>
                                ) : (
                                  item.unit
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800 text-right">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={String((editData.currentStock as number | undefined) ?? item.currentStock)}
                                    onChange={(e) => setEditData((d) => ({ ...d, currentStock: Number(e.target.value) }))}
                                    className="w-full max-w-[7rem] px-2 py-1 border border-slate-300 rounded text-right"
                                  />
                                ) : (
                                  item.currentStock
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800 text-right">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={String((editData.requirementPerRecipe as number | undefined) ?? item.requirementPerRecipe)}
                                    onChange={(e) => setEditData((d) => ({ ...d, requirementPerRecipe: Number(e.target.value) }))}
                                    className="w-full max-w-[7rem] px-2 py-1 border border-slate-300 rounded text-right"
                                  />
                                ) : (
                                  dailyRequirement.toFixed(2)
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800 text-right">
                                {isEditing ? (
                                  <span className="text-slate-500">—</span>
                                ) : (
                                  isFinite(stockDuration) ? `${Math.floor(stockDuration)} hari` : '∞'
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800 text-right">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={String((editData.leadTime as number | undefined) ?? item.leadTime)}
                                    onChange={(e) => setEditData((d) => ({ ...d, leadTime: Number(e.target.value) }))}
                                    className="w-full max-w-[7rem] px-2 py-1 border border-slate-300 rounded text-right"
                                  />
                                ) : (
                                  `${item.leadTime} hari`
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge[status]}`}>{statusLabel[status]}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => saveEdit(item)}
                                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                    >
                                      Simpan
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
                                    >
                                      Batal
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => beginEdit(item)}
                                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => onDeleteItem(item.id)}
                                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                      Hapus
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
            )}
        </div>
    );
};

export default InventoryList;
