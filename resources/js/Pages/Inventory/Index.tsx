import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export interface InventoryItem {
    id: number;
    name: string;
    sku: string;
    category: string;
    quantity: number;
    reorder_threshold: number;
    unit: string;
    unit_cost: number;
    supplier_name: string | null;
    storage_location: string | null;
    last_restocked_at: string | null;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    is_low_stock: boolean;
}

interface IndexProps {
    inventoryItems: {
        data: InventoryItem[];
        links: any[];
    };
    lowStockItems: InventoryItem[];
    filters: { search: string; category: string; low_stock_only: boolean };
    categories: string[];
}

export default function Index({ inventoryItems, lowStockItems, filters, categories }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    const [lowStockOnly, setLowStockOnly] = useState(filters.low_stock_only || false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null);
    const [consumingItem, setConsumingItem] = useState<InventoryItem | null>(null);
    const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

    // Add Form
    const addForm = useForm({
        name: '',
        sku: '',
        category: categories[0] || 'Towels & Linen',
        quantity: 20,
        reorder_threshold: 10,
        unit: 'packs',
        unit_cost: 15.00,
        supplier_name: '',
        storage_location: '',
    });

    // Restock Form
    const restockForm = useForm({
        amount: 10,
    });

    // Consume Form
    const consumeForm = useForm({
        amount: 1,
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('inventory.index'),
            { search, category: categoryFilter, low_stock_only: lowStockOnly },
            { preserveState: true }
        );
    };

    const handleCategoryChange = (cat: string) => {
        setCategoryFilter(cat);
        router.get(
            route('inventory.index'),
            { search, category: cat, low_stock_only: lowStockOnly },
            { preserveState: true }
        );
    };

    const handleToggleLowStockOnly = () => {
        const nextState = !lowStockOnly;
        setLowStockOnly(nextState);
        router.get(
            route('inventory.index'),
            { search, category: categoryFilter, low_stock_only: nextState },
            { preserveState: true }
        );
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('inventory.store'), {
            onSuccess: () => {
                addForm.reset();
                setIsAddModalOpen(false);
            },
        });
    };

    const handleRestockSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!restockingItem) return;

        restockForm.post(route('inventory.restock', restockingItem.id), {
            onSuccess: () => setRestockingItem(null),
        });
    };

    const handleConsumeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!consumingItem) return;

        consumeForm.post(route('inventory.consume', consumingItem.id), {
            onSuccess: () => setConsumingItem(null),
        });
    };

    const getCategoryIcon = (cat: string) => {
        if (cat.includes('Towels')) return '🧺';
        if (cat.includes('Electrotherapy')) return '⚡';
        if (cat.includes('Oils')) return '🧴';
        if (cat.includes('Medical')) return '🩺';
        return '🧼';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Clinic Inventory & <span className="gradient-text">Supply Stock</span>
                        </h1>
                        <p className="text-sm text-gray-400">
                            Track clinic supplies (Towels, Electrotherapy Pads, Oils, Medical items) and receive low-stock alerts.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
                    >
                        <span>📦</span>
                        <span>Add Supply Item</span>
                    </button>
                </div>
            }
        >
            <Head title="Clinic Inventory Management" />

            <div className="space-y-6">
                {/* Low-Stock Alert Callout Banner */}
                {lowStockItems.length > 0 && (
                    <div className="glass-card rounded-3xl p-6 border border-amber-500/40 shadow-2xl bg-amber-950/20 space-y-3">
                        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                            <h3 className="text-sm font-extrabold text-amber-300 flex items-center gap-2">
                                <span className="animate-ping w-2 h-2 rounded-full bg-amber-400"></span>
                                <span>⚠️ Low-Stock Alert Action Required ({lowStockItems.length} Items Below Threshold)</span>
                            </h3>
                            <span className="text-xs font-mono text-amber-400">Automatic Reorder Trigger</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                            {lowStockItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 flex items-center justify-between gap-3 text-xs font-mono"
                                >
                                    <div>
                                        <span className="text-white font-extrabold block truncate max-w-[160px]">{item.name}</span>
                                        <span className="text-amber-400 font-bold block">
                                            {item.quantity} / {item.reorder_threshold} {item.unit} left
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setRestockingItem(item)}
                                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-bold transition-colors shrink-0"
                                    >
                                        + Restock
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search & Category Filter Bar */}
                <div className="glass-card rounded-3xl p-4 sm:p-6 border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search item name, SKU, or supplier..."
                            className="w-full bg-[#0b0f19] text-white rounded-xl px-4 py-2.5 border border-white/15 focus:border-purple-500 outline-none text-xs"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 font-bold text-xs hover:bg-purple-600/30 transition-colors"
                        >
                            Search
                        </button>
                    </form>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleToggleLowStockOnly}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                lowStockOnly
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md'
                                    : 'bg-white/5 text-gray-400 hover:text-white border-white/10'
                            }`}
                        >
                            ⚠️ Low Stock Only
                        </button>

                        {['', ...categories].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    categoryFilter === cat
                                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                        : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                                }`}
                            >
                                {cat === '' ? 'All Categories' : cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Inventory Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inventoryItems.data.length === 0 ? (
                        <div className="col-span-full glass-card rounded-3xl p-12 text-center border border-white/10 space-y-3">
                            <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl mx-auto border border-purple-500/20">
                                📦
                            </div>
                            <h3 className="text-lg font-bold text-white">No Clinic Supply Items Found</h3>
                            <p className="text-xs text-gray-400 max-w-md mx-auto">
                                Add clinic supplies to track towels, electrotherapy pads, massage oils, and medical items.
                            </p>
                        </div>
                    ) : (
                        inventoryItems.data.map((item) => {
                            const isLow = item.is_low_stock || item.quantity <= item.reorder_threshold;
                            const isOut = item.quantity === 0;

                            return (
                                <div
                                    key={item.id}
                                    className={`glass-card rounded-3xl p-6 border shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group ${
                                        isOut
                                            ? 'border-red-500/40 bg-red-950/10'
                                            : isLow
                                            ? 'border-amber-500/40 bg-amber-950/10'
                                            : 'border-white/10 hover:border-purple-500/40'
                                    }`}
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold border uppercase font-mono ${
                                                    isOut
                                                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                                        : isLow
                                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                                                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                }`}
                                            >
                                                {isOut ? 'Out of Stock' : isLow ? '⚠️ Low Stock' : 'In Stock'}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs text-purple-300 font-mono mt-0.5">
                                                SKU: <span className="text-white font-bold">{item.sku}</span> • {item.category}
                                            </p>
                                        </div>

                                        {/* Stock Level Gauge */}
                                        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                                            <div className="flex items-center justify-between text-xs font-mono">
                                                <span className="text-gray-400">Current Stock:</span>
                                                <span className={`font-extrabold text-sm ${isLow ? 'text-amber-400' : 'text-emerald-300'}`}>
                                                    {item.quantity} {item.unit}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
                                                <span>Reorder Threshold:</span>
                                                <span>{item.reorder_threshold} {item.unit}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-400 border-t border-white/10 pt-3">
                                            <div>
                                                <span className="block text-[9px] uppercase">Unit Cost</span>
                                                <span className="text-white font-bold">${item.unit_cost.toFixed(2)}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[9px] uppercase">Supplier</span>
                                                <span className="text-purple-300 font-bold truncate block">{item.supplier_name || 'General Supplier'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
                                        <button
                                            onClick={() => setDeletingItem(item)}
                                            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 text-xs font-bold transition-colors"
                                        >
                                            Delete
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setConsumingItem(item)}
                                                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold border border-white/10 transition-colors"
                                            >
                                                - Consume
                                            </button>
                                            <button
                                                onClick={() => setRestockingItem(item)}
                                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-md shadow-purple-600/30 transition-all"
                                            >
                                                + Restock
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Confirm Delete Item Modal */}
            <ConfirmModal
                isOpen={!!deletingItem}
                title="Delete Supply Item"
                message="Are you sure you want to delete this item from inventory?"
                confirmText="Delete Item"
                onConfirm={() => deletingItem && router.delete(route('inventory.destroy', deletingItem.id))}
                onClose={() => setDeletingItem(null)}
            />

            {/* Add New Supply Item Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/15 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                <span>📦 Add New Supply Item</span>
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white font-bold">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Supply Item Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Premium Cotton Therapy Towels"
                                    value={addForm.data.name}
                                    onChange={(e) => addForm.setData('name', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">SKU / Item Code *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="SUP-TOWL-01"
                                        value={addForm.data.sku}
                                        onChange={(e) => addForm.setData('sku', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Category *</label>
                                    <select
                                        value={addForm.data.category}
                                        onChange={(e) => addForm.setData('category', e.target.value as any)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                    >
                                        {categories.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Initial Quantity</label>
                                    <input
                                        type="number"
                                        value={addForm.data.quantity}
                                        onChange={(e) => addForm.setData('quantity', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-amber-400 mb-1">Reorder Alert Limit</label>
                                    <input
                                        type="number"
                                        value={addForm.data.reorder_threshold}
                                        onChange={(e) => addForm.setData('reorder_threshold', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Unit (e.g. packs)</label>
                                    <input
                                        type="text"
                                        value={addForm.data.unit}
                                        onChange={(e) => addForm.setData('unit', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Unit Cost ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={addForm.data.unit_cost}
                                        onChange={(e) => addForm.setData('unit_cost', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Supplier Name</label>
                                    <input
                                        type="text"
                                        value={addForm.data.supplier_name}
                                        onChange={(e) => addForm.setData('supplier_name', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-xs text-gray-400">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg">
                                    Add Supply Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Restock Item Modal */}
            {restockingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/15 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <span>+ Restock '{restockingItem.name}'</span>
                            </h3>
                            <button onClick={() => setRestockingItem(null)} className="text-gray-400 hover:text-white font-bold">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleRestockSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-purple-300 mb-1">
                                    Add Units to Stock ({restockingItem.unit}) *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={restockForm.data.amount}
                                    onChange={(e) => restockForm.setData('amount', Number(e.target.value))}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3.5 border border-white/15 text-sm font-mono font-bold"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setRestockingItem(null)} className="px-4 py-2 text-xs text-gray-400">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg">
                                    Confirm Restock
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Record Usage Modal */}
            {consumingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/15 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <span>- Record Stock Usage</span>
                            </h3>
                            <button onClick={() => setConsumingItem(null)} className="text-gray-400 hover:text-white font-bold">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleConsumeSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-purple-300 mb-1">
                                    Deduct Units Used ({consumingItem.unit}) *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={consumingItem.quantity}
                                    required
                                    value={consumeForm.data.amount}
                                    onChange={(e) => consumeForm.setData('amount', Number(e.target.value))}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3.5 border border-white/15 text-sm font-mono font-bold"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setConsumingItem(null)} className="px-4 py-2 text-xs text-gray-400">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg">
                                    Record Usage
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
