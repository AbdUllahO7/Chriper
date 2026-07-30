import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export type InvoiceStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
export type PaymentMethod = 'cash' | 'card' | 'insurance';

export interface LineItem {
    description: string;
    qty: number;
    unit_price: number;
    total: number;
}

export interface InvoiceItem {
    id: number;
    invoice_number: string;
    patient_id: number;
    doctor_id: number | null;
    issue_date: string;
    due_date: string;
    subtotal: number;
    tax: number;
    total_amount: number;
    amount_paid: number;
    balance_due: number;
    status: InvoiceStatus;
    line_items: LineItem[] | null;
    notes: string | null;
    patient?: { id: number; first_name: string; last_name: string; email: string };
    doctor?: { id: number; name: string };
    payments?: PaymentItem[];
}


export interface PaymentItem {
    id: number;
    amount: number;
    payment_method: PaymentMethod;
    reference_number: string | null;
    payment_date: string;
    patient?: { first_name: string; last_name: string };
    invoice?: { invoice_number: string };
}

interface IndexProps {
    invoices: InvoiceItem[];
    payments: PaymentItem[];
    patients: Array<{ id: number; first_name: string; last_name: string }>;
    doctors: Array<{ id: number; name: string; specialty: string }>;
    metrics: {
        totalBilled: number;
        totalRevenue: number;
        totalBalanceDue: number;
        paidInvoicesCount: number;
    };
    filters: { search: string; status: string };
}

export default function Index({
    invoices,
    payments,
    patients,
    doctors,
    metrics,
    filters,
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [recordingPaymentInvoice, setRecordingPaymentInvoice] = useState<InvoiceItem | null>(null);
    const [deletingInvoice, setDeletingInvoice] = useState<InvoiceItem | null>(null);

    // Create Invoice Form
    const createForm = useForm({
        patient_id: patients[0]?.id || '',
        doctor_id: doctors[0]?.id || '',
        issue_date: new Date().toISOString().substring(0, 10),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        tax: 0,
        notes: '',
        line_items: [
            { description: 'Spinal Decompression & Chiropractic Adjustment', qty: 1, unit_price: 150 },
        ],
    });

    // Record Payment Form
    const paymentForm = useForm({
        amount: 0,
        payment_method: 'card' as PaymentMethod,
        reference_number: '',
        payment_date: new Date().toISOString().substring(0, 10),
        notes: '',
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('billing.index'), { search, status: statusFilter }, { preserveState: true });
    };

    const handleStatusFilterChange = (st: string) => {
        setStatusFilter(st);
        router.get(route('billing.index'), { search, status: st }, { preserveState: true });
    };

    const handleAddLineItem = () => {
        createForm.setData('line_items', [
            ...createForm.data.line_items,
            { description: '', qty: 1, unit_price: 0 },
        ]);
    };

    const handleRemoveLineItem = (index: number) => {
        const items = [...createForm.data.line_items];
        items.splice(index, 1);
        createForm.setData('line_items', items);
    };

    const handleLineItemChange = (index: number, field: string, value: any) => {
        const items = [...createForm.data.line_items];
        items[index] = { ...items[index], [field]: value };
        createForm.setData('line_items', items);
    };

    const handleCreateInvoice = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('invoices.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const openRecordPaymentModal = (invoice: InvoiceItem) => {
        setRecordingPaymentInvoice(invoice);
        paymentForm.setData({
            amount: invoice.balance_due,
            payment_method: 'card',
            reference_number: '',
            payment_date: new Date().toISOString().substring(0, 10),
            notes: '',
        });
    };

    const handleRecordPaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!recordingPaymentInvoice) return;

        paymentForm.post(route('invoices.record-payment', recordingPaymentInvoice.id), {
            onSuccess: () => {
                setRecordingPaymentInvoice(null);
            },
        });
    };

    const confirmDeleteInvoice = () => {
        if (deletingInvoice) {
            router.delete(route('invoices.destroy', deletingInvoice.id));
        }
    };

    const getStatusBadge = (status: InvoiceStatus) => {
        switch (status) {
            case 'paid':
                return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            case 'partially_paid':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'overdue':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            case 'unpaid':
            default:
                return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        }
    };

    const getPaymentMethodIcon = (method: PaymentMethod) => {
        switch (method) {
            case 'cash':
                return '💵 Cash';
            case 'card':
                return '💳 Card';
            case 'insurance':
                return '🏥 Insurance';
            default:
                return method;
        }
    };

    // Subtotal calculation preview
    const calculatedSubtotal = createForm.data.line_items.reduce(
        (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.unit_price) || 0),
        0
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Billing & <span className="gradient-text">Invoices</span>
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Invoice creation, line items, payment processing (Cash, Card, Insurance) and printable receipts.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/25 active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>+ Create New Invoice</span>
                    </button>
                </div>
            }
        >
            <Head title="Billing & Invoices" />

            {/* Financial KPI Dashboard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
                <div className="glass-card rounded-2xl p-5 border border-white/10">
                    <span className="text-xs text-gray-400 uppercase font-semibold">Total Invoiced Amount</span>
                    <span className="text-3xl font-extrabold text-white block mt-1">
                        ${metrics.totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-emerald-500/20">
                    <span className="text-xs text-emerald-400 uppercase font-semibold">Total Revenue Collected</span>
                    <span className="text-3xl font-extrabold text-emerald-300 block mt-1">
                        ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-amber-500/20">
                    <span className="text-xs text-amber-400 uppercase font-semibold">Outstanding Balance Due</span>
                    <span className="text-3xl font-extrabold text-amber-300 block mt-1">
                        ${metrics.totalBalanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-purple-500/20">
                    <span className="text-xs text-purple-400 uppercase font-semibold">Paid Invoices Count</span>
                    <span className="text-3xl font-extrabold text-purple-300 block mt-1">
                        {metrics.paidInvoicesCount} Paid
                    </span>
                </div>
            </div>

            {/* Search & Status Filters */}
            <div className="glass-card rounded-2xl p-4 mb-6 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex items-center gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by invoice number or patient name..."
                        className="w-full bg-[#0b0f19]/80 text-white text-sm rounded-xl px-4 py-2.5 border border-white/10 focus:border-purple-500 outline-none"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors"
                    >
                        Search
                    </button>
                </form>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                    <button
                        onClick={() => handleStatusFilterChange('')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                            statusFilter === '' ? 'bg-purple-600 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                    >
                        All Statuses
                    </button>
                    {['unpaid', 'partially_paid', 'paid', 'overdue'].map((st) => (
                        <button
                            key={st}
                            onClick={() => handleStatusFilterChange(st)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                                statusFilter === st ? 'bg-purple-600 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                        >
                            {st.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Invoices Directory Table */}
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-white/[0.03] text-xs uppercase font-semibold text-gray-400 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Invoice #</th>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Issue & Due Dates</th>
                                <th className="px-6 py-4">Total & Paid</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        No invoices found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={route('invoices.show', inv.id)}
                                                className="font-mono font-bold text-purple-300 hover:text-purple-200 transition-colors text-sm"
                                            >
                                                {inv.invoice_number}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-white block">
                                                {inv.patient ? `${inv.patient.first_name} ${inv.patient.last_name}` : 'N/A'}
                                            </span>
                                            <span className="text-xs text-gray-400">{inv.patient?.email}</span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">
                                            <span className="block text-gray-300">Issued: {inv.issue_date}</span>
                                            <span className="text-gray-400">Due: {inv.due_date}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-extrabold text-white block">
                                                ${inv.total_amount.toFixed(2)}
                                            </span>
                                            {inv.amount_paid > 0 && (
                                                <span className="text-xs text-emerald-400 font-mono block">
                                                    Paid: ${inv.amount_paid.toFixed(2)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusBadge(inv.status)}`}>
                                                {inv.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {inv.status !== 'paid' && (
                                                    <button
                                                        onClick={() => openRecordPaymentModal(inv)}
                                                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 text-xs font-semibold transition-colors"
                                                    >
                                                        + Record Payment
                                                    </button>
                                                )}
                                                <Link
                                                    href={route('invoices.show', inv.id)}
                                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-purple-300 hover:bg-purple-600/20 text-xs font-semibold transition-colors"
                                                >
                                                    🖨️ Print PDF
                                                </Link>
                                                <button
                                                    onClick={() => setDeletingInvoice(inv)}
                                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Payments Log */}
            <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-2xl mb-8 space-y-4">
                <h3 className="text-lg font-bold text-white">Recent Payment Transactions (Cash, Card, Insurance)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-white/[0.03] text-xs uppercase font-semibold text-gray-400 border-b border-white/10">
                            <tr>
                                <th className="px-4 py-3">Payment Date</th>
                                <th className="px-4 py-3">Patient</th>
                                <th className="px-4 py-3">Invoice #</th>
                                <th className="px-4 py-3">Payment Method</th>
                                <th className="px-4 py-3">Reference / Claim #</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                                        {new Date(p.payment_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-white">
                                        {p.patient ? `${p.patient.first_name} ${p.patient.last_name}` : 'Patient'}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-purple-300 text-xs">
                                        {p.invoice?.invoice_number || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs font-bold border border-white/10">
                                            {getPaymentMethodIcon(p.payment_method)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                                        {p.reference_number || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-extrabold text-emerald-400">
                                        +${p.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Confirm Delete Modal */}
            <ConfirmModal
                isOpen={!!deletingInvoice}
                title="Delete Invoice"
                message={`Are you sure you want to delete invoice "${deletingInvoice?.invoice_number}"?`}
                confirmText="Delete Invoice"
                onConfirm={confirmDeleteInvoice}
                onClose={() => setDeletingInvoice(null)}
            />

            {/* Create Invoice Modal with Dynamic Line Items */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-white/10 shadow-2xl my-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white">Create New Clinic Invoice</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleCreateInvoice} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Select Patient *</label>
                                    <select
                                        value={createForm.data.patient_id}
                                        onChange={(e) => createForm.setData('patient_id', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    >
                                        {patients.map((p) => (
                                            <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Attending Doctor</label>
                                    <select
                                        value={createForm.data.doctor_id}
                                        onChange={(e) => createForm.setData('doctor_id', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    >
                                        {doctors.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Issue Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={createForm.data.issue_date}
                                        onChange={(e) => createForm.setData('issue_date', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Due Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={createForm.data.due_date}
                                        onChange={(e) => createForm.setData('due_date', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            {/* Itemized Charges Line Items Builder */}
                            <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Itemized Services & Charges</span>
                                    <button
                                        type="button"
                                        onClick={handleAddLineItem}
                                        className="text-xs font-bold text-purple-400 hover:text-purple-300"
                                    >
                                        + Add Charge Row
                                    </button>
                                </div>

                                {createForm.data.line_items.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Service Description"
                                            value={item.description}
                                            onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                                            className="col-span-6 bg-[#0b0f19] text-white text-xs rounded-xl p-2.5 border border-white/10 outline-none"
                                        />
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            placeholder="Qty"
                                            value={item.qty}
                                            onChange={(e) => handleLineItemChange(idx, 'qty', e.target.value)}
                                            className="col-span-2 bg-[#0b0f19] text-white text-xs rounded-xl p-2.5 border border-white/10 outline-none text-center"
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            required
                                            placeholder="Price ($)"
                                            value={item.unit_price}
                                            onChange={(e) => handleLineItemChange(idx, 'unit_price', e.target.value)}
                                            className="col-span-3 bg-[#0b0f19] text-white text-xs rounded-xl p-2.5 border border-white/10 outline-none"
                                        />
                                        {createForm.data.line_items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveLineItem(idx)}
                                                className="col-span-1 text-red-400 hover:text-red-300 text-xs font-bold text-center"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs font-bold text-white">
                                    <span>Subtotal Preview:</span>
                                    <span className="text-purple-300 font-mono text-sm">${calculatedSubtotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30"
                                >
                                    Save & Issue Invoice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Record Payment Modal (Cash, Card, Insurance) */}
            {recordingPaymentInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/10 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">Record Payment</h3>
                                <span className="text-xs text-purple-400 font-mono">Invoice #{recordingPaymentInvoice.invoice_number}</span>
                            </div>
                            <button onClick={() => setRecordingPaymentInvoice(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Select Payment Method *</label>
                                <select
                                    value={paymentForm.data.payment_method}
                                    onChange={(e) => paymentForm.setData('payment_method', e.target.value as PaymentMethod)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm font-bold"
                                >
                                    <option value="card">💳 Credit / Debit Card</option>
                                    <option value="cash">💵 Cash Payment</option>
                                    <option value="insurance">🏥 Health Insurance Claim</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Payment Amount ($) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={paymentForm.data.amount}
                                    onChange={(e) => paymentForm.setData('amount', Number(e.target.value))}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm font-mono font-bold"
                                />
                                <span className="text-[11px] text-gray-400 mt-1 block">
                                    Balance Due: ${recordingPaymentInvoice.balance_due.toFixed(2)}
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Reference Code / Claim #</label>
                                <input
                                    type="text"
                                    value={paymentForm.data.reference_number}
                                    onChange={(e) => paymentForm.setData('reference_number', e.target.value)}
                                    placeholder="e.g. CARD-AUTH-9481 or INS-CLAIM-882"
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Payment Date</label>
                                <input
                                    type="date"
                                    required
                                    value={paymentForm.data.payment_date}
                                    onChange={(e) => paymentForm.setData('payment_date', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setRecordingPaymentInvoice(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={paymentForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/30"
                                >
                                    Record Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
