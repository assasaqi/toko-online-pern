import React from 'react';


export default function ProductFilter({
    categories = [],
    selectedCategory = 'all',
    onSelectCategory = () => { },
    searchTerm = '',
    onSearchChange = () => { },
}) {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            {/* Input Pencarian (Lebar Penuh di Mobile) */}
            <div className="relative w-full sm:w-72">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Cari produk..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
            </div>

            {/* Filter Kategori (Scroll Horizontal Otomatis jika Banyak di Mobile) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
                <button
                    onClick={() => onSelectCategory('all')}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all ${selectedCategory === 'all'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Semua
                </button>

                {Array.isArray(categories) &&
                    categories
                        .filter((cat) => cat !== null && cat !== undefined && cat !== '')
                        .map((cat, idx) => {
                            const categoryValue = typeof cat === 'object' ? cat.slug || cat.id || cat.name : cat;
                            const categoryLabel = typeof cat === 'object' ? cat.name || cat.slug : cat;
                            const keyVal = typeof cat === 'object' ? cat.id || cat.slug || idx : `${cat}-${idx}`;

                            return (
                                <button
                                    key={keyVal}
                                    onClick={() => onSelectCategory(categoryValue)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all ${selectedCategory === categoryValue
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {categoryLabel}
                                </button>
                            );
                        })}
            </div>
        </div>
    );
}
