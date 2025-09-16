import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { PlusIcon } from '../constants';

interface AddItemFormProps {
    onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onAddItem }) => {
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('kg');
    const [currentStock, setCurrentStock] = useState('');
    const [requirementPerRecipe, setRequirementPerRecipe] = useState('');
    const [recipesToday, setRecipesToday] = useState('');
    const [leadTime, setLeadTime] = useState('');
    const [supplierWhatsapp, setSupplierWhatsapp] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !currentStock || !requirementPerRecipe || !recipesToday || !leadTime) {
            alert('Mohon isi semua field yang wajib diisi.');
            return;
        }

        onAddItem({
            name,
            unit,
            currentStock: parseFloat(currentStock),
            requirementPerRecipe: parseFloat(requirementPerRecipe),
            recipesToday: parseInt(recipesToday, 10),
            leadTime: parseInt(leadTime, 10),
            supplierWhatsapp: supplierWhatsapp || undefined,
        });

        // Reset form
        setName('');
        setUnit('kg');
        setCurrentStock('');
        setRequirementPerRecipe('');
        setRecipesToday('');
        setLeadTime('');
        setSupplierWhatsapp('');
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md sticky top-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-700">Tambah Barang Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-600">Nama Barang</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Tepung Terigu"
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="currentStock" className="block text-sm font-medium text-slate-600">Stok Saat Ini</label>
                        <input
                            type="number"
                            id="currentStock"
                            value={currentStock}
                            onChange={(e) => setCurrentStock(e.target.value)}
                            placeholder="50"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="unit" className="block text-sm font-medium text-slate-600">Satuan</label>
                        <select
                            id="unit"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        >
                            <option>kg</option>
                            <option>gram</option>
                            <option>liter</option>
                            <option>ml</option>
                            <option>pcs</option>
                            <option>box</option>
                            <option>roll</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="requirementPerRecipe" className="block text-sm font-medium text-slate-600">Kebutuhan / Resep</label>
                        <input
                            type="number"
                            id="requirementPerRecipe"
                            value={requirementPerRecipe}
                            onChange={(e) => setRequirementPerRecipe(e.target.value)}
                             placeholder="0.5"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="recipesToday" className="block text-sm font-medium text-slate-600">Jumlah Resep / Hari</label>
                        <input
                            type="number"
                            id="recipesToday"
                            value={recipesToday}
                            onChange={(e) => setRecipesToday(e.target.value)}
                             placeholder="20"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                            required
                        />
                    </div>
                </div>
                 <div>
                    <label htmlFor="leadTime" className="block text-sm font-medium text-slate-600">Waktu Tunggu Pesanan (Hari)</label>
                    <input
                        type="number"
                        id="leadTime"
                        value={leadTime}
                        onChange={(e) => setLeadTime(e.target.value)}
                        placeholder="3"
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="supplierWhatsapp" className="block text-sm font-medium text-slate-600">No. WhatsApp Supplier <span className="text-slate-400">(Opsional)</span></label>
                    <input
                        type="text"
                        id="supplierWhatsapp"
                        value={supplierWhatsapp}
                        onChange={(e) => setSupplierWhatsapp(e.target.value)}
                        placeholder="+6281234567890"
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                >
                    <PlusIcon />
                    <span className="ml-2">Tambah Barang</span>
                </button>
            </form>
        </div>
    );
};

export default AddItemForm;