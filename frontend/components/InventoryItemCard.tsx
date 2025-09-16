// 2025-09-16: Fixed types import path for Docker/Vite build.
import React from 'react';
import { InventoryItem, StockStatus } from '../types';
import { TrashIcon, AlertTriangleIcon, CheckCircleIcon, ClockIcon, PackageIcon, ChartBarIcon, WhatsAppIcon } from '../constants';

interface InventoryItemCardProps {
    item: InventoryItem;
    onDelete: (id: string) => void;
    onUpdate: (item: InventoryItem) => void;
}

const StatusIndicator: React.FC<{ status: StockStatus }> = ({ status }) => {
    const statusConfig = {
        [StockStatus.SAFE]: {
            bgColor: 'bg-emerald-100',
            textColor: 'text-emerald-800',
            borderColor: 'border-emerald-500',
            icon: <CheckCircleIcon />,
            text: 'Aman'
        },
        [StockStatus.WARNING]: {
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-800',
            borderColor: 'border-yellow-500',
            icon: <AlertTriangleIcon />,
            text: 'Segera Pesan'
        },
        [StockStatus.URGENT]: {
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
            borderColor: 'border-red-500',
            icon: <AlertTriangleIcon />,
            text: 'Kritis! Pesan Sekarang'
        },
    };

    const config = statusConfig[status];

    return (
        <div className={`flex items-center text-sm font-semibold px-3 py-1 rounded-full ${config.bgColor} ${config.textColor}`}>
            {config.icon}
            <span className="ml-2">{config.text}</span>
        </div>
    );
};


const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ item, onDelete, onUpdate }) => {
    const dailyRequirement = item.requirementPerRecipe * item.recipesToday;
    const stockDuration = dailyRequirement > 0 ? item.currentStock / dailyRequirement : Infinity;
    const reorderPoint = item.leadTime + 2; // Safety stock for 2 days

    let status: StockStatus;
    let recommendation: string;

    if (stockDuration <= item.leadTime) {
        status = StockStatus.URGENT;
        recommendation = `Segera Pesan Ulang Sekarang! Stok akan habis sebelum pesanan baru tiba.`;
    } else if (stockDuration <= reorderPoint) {
        status = StockStatus.WARNING;
        const orderInDays = Math.floor(stockDuration - item.leadTime);
        recommendation = `Waktunya memesan. Pesan dalam ${orderInDays} hari ke depan.`;
    } else {
        status = StockStatus.SAFE;
        const orderInDays = Math.floor(stockDuration - item.leadTime);
        recommendation = `Stok masih cukup. Waktu ideal memesan adalah dalam ${orderInDays} hari.`;
    }
    
    if (dailyRequirement === 0) {
        status = StockStatus.SAFE;
        recommendation = 'Tidak ada penggunaan harian, stok aman.';
    }

    const statusConfig = {
        [StockStatus.SAFE]: 'border-l-4 border-emerald-500',
        [StockStatus.WARNING]: 'border-l-4 border-yellow-500',
        [StockStatus.URGENT]: 'border-l-4 border-red-500',
    };

    const handleWhatsAppOrder = () => {
        if (!item.supplierWhatsapp) return;

        const cleanPhoneNumber = item.supplierWhatsapp.replace(/[^0-9+]/g, '');
        const message = `Halo, saya ingin memesan ulang ${item.name}. Stok kami saat ini sekitar ${item.currentStock} ${item.unit}. Terima kasih.`;
        const encodedMessage = encodeURIComponent(message);
        
        window.open(`https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className={`bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg ${statusConfig[status]}`}>
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{item.name}</h3>
                        <p className="text-sm text-slate-500">Stok Saat Ini: <span className="font-semibold">{item.currentStock} {item.unit}</span></p>
                    </div>
                    <div className="flex items-center space-x-2">
                         <StatusIndicator status={status} />
                         <button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50" aria-label={`Hapus ${item.name}`}>
                            <TrashIcon />
                        </button>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-slate-600">
                        <ChartBarIcon />
                        <span>Kebutuhan Harian: <strong className="text-slate-900">{dailyRequirement.toFixed(2)} {item.unit}</strong></span>
                    </div>
                     <div className="flex items-center text-slate-600">
                        <PackageIcon />
                        <span>Stok Bertahan: <strong className="text-slate-900">{isFinite(stockDuration) ? `${Math.floor(stockDuration)} hari` : '∞'}</strong></span>
                    </div>
                    <div className="flex items-center text-slate-600">
                        <ClockIcon />
                        <span>Waktu Tunggu: <strong className="text-slate-900">{item.leadTime} hari</strong></span>
                    </div>
                </div>

                <div className={`mt-4 p-3 rounded-lg flex justify-between items-center ${
                    status === StockStatus.URGENT ? 'bg-red-50 text-red-900' : 
                    status === StockStatus.WARNING ? 'bg-yellow-50 text-yellow-900' : 'bg-slate-100 text-slate-700'
                }`}>
                    <p className="text-sm flex-1"><span className="font-semibold">Rekomendasi: </span>{recommendation}</p>
                    {item.supplierWhatsapp && (
                        <button 
                            onClick={handleWhatsAppOrder}
                            className="ml-4 flex-shrink-0 flex items-center justify-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                        >
                            <WhatsAppIcon />
                            <span className="ml-2 hidden sm:inline">Pesan via WhatsApp</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryItemCard;