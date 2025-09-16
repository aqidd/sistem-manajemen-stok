
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4 md:px-8 py-6">
                <h1 className="text-3xl font-bold text-sky-600">
                    Sistem Manajemen Stok Cerdas
                </h1>
                <p className="text-slate-500 mt-1">
                    Prediksi Kebutuhan & Waktu Tepat untuk Restock
                </p>
            </div>
        </header>
    );
};

export default Header;
