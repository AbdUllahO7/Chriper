import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { InvoiceItem } from './Index';

interface InvoicePrintProps {
    invoice: InvoiceItem;
}

export default function InvoicePrint({ invoice }: InvoicePrintProps) {
    const handlePrint = () => {
        window.print();
    };

    const patientName = invoice.patient
        ? `${invoice.patient.first_name} ${invoice.patient.last_name}`
        : 'Patient';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('billing.index')}
                            className="p-2.5 rounded-xl glass-card text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to Billing
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                Printable Invoice <span className="gradient-text">PDF</span>
                            </h1>
                            <p className="text-sm text-gray-400">
                                Official invoice breakdown for {invoice.invoice_number}.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handlePrint}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/25 active:scale-95 flex items-center gap-2"
                    >
                        <span>🖨️ Print / Save as PDF</span>
                    </button>
                </div>
            }
        >
            <Head title={`Invoice ${invoice.invoice_number}`} />

            {/* Printable Invoice Container (Applies Light Clean Styling on Print) */}
            <div className="max-w-4xl mx-auto bg-[#0d121f] print:bg-white text-white print:text-black rounded-3xl p-8 sm:p-12 border border-white/10 print:border-none shadow-2xl space-y-8">
                {/* Invoice Letterhead Top Bar */}
                <div className="flex items-start justify-between border-b border-white/10 print:border-gray-300 pb-6">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white print:text-purple-900">
                            CHIRPER <span className="text-purple-400 print:text-purple-600">SPINE CLINIC</span>
                        </h2>
                        <p className="text-xs text-gray-400 print:text-gray-600 mt-1">
                            100 Health Care Boulevard, Suite 400<br />
                            Springfield, CA 90210 • Phone: (555) 019-2830
                        </p>
                    </div>

                    <div className="text-right">
                        <span className="text-2xl font-black font-mono text-purple-400 print:text-purple-800 block">
                            {invoice.invoice_number}
                        </span>
                        <span className="text-xs text-gray-400 print:text-gray-600 block mt-1">
                            Issue Date: {invoice.issue_date}
                        </span>
                        <span className="text-xs text-gray-400 print:text-gray-600 block">
                            Due Date: {invoice.due_date}
                        </span>
                    </div>
                </div>

                {/* Patient & Doctor Billed To Info */}
                <div className="grid grid-cols-2 gap-8 text-sm">
                    <div className="p-4 rounded-2xl bg-white/[0.03] print:bg-gray-50 border border-white/5 print:border-gray-200">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400 print:text-purple-700 block mb-1">
                            Billed To Patient:
                        </span>
                        <strong className="text-white print:text-black text-base block">{patientName}</strong>
                        <span className="text-xs text-gray-400 print:text-gray-600 block">{invoice.patient?.email}</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] print:bg-gray-50 border border-white/5 print:border-gray-200">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400 print:text-purple-700 block mb-1">
                            Attending Doctor / Suite:
                        </span>
                        <strong className="text-white print:text-black text-base block">
                            {invoice.doctor?.name || 'Dr. Marcus Wright'}
                        </strong>
                        <span className="text-xs text-gray-400 print:text-gray-600 block">
                            Chiropractic Care & Rehabilitation Suite
                        </span>
                    </div>
                </div>

                {/* Itemized Line Charges Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/[0.05] print:bg-gray-100 text-xs uppercase font-bold text-gray-400 print:text-gray-700 border-b border-white/10 print:border-gray-300">
                            <tr>
                                <th className="p-4">Item Description</th>
                                <th className="p-4 text-center">Qty</th>
                                <th className="p-4 text-right">Unit Price</th>
                                <th className="p-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 print:divide-gray-200">
                            {invoice.line_items && invoice.line_items.length > 0 ? (
                                invoice.line_items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.02] print:hover:bg-gray-50">
                                        <td className="p-4 font-semibold text-white print:text-gray-900">{item.description}</td>
                                        <td className="p-4 text-center font-mono">{item.qty}</td>
                                        <td className="p-4 text-right font-mono">${item.unit_price.toFixed(2)}</td>
                                        <td className="p-4 text-right font-mono font-bold">${item.total.toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-gray-500">
                                        Standard Chiropractic Care Services
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Subtotal & Total Breakdown Summary */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-white/10 print:border-gray-300 pt-6">
                    <div className="space-y-2 max-w-md">
                        {invoice.notes && (
                            <div className="p-4 rounded-2xl bg-white/[0.03] print:bg-gray-50 border border-white/5 print:border-gray-200 text-xs">
                                <span className="font-bold text-gray-400 print:text-gray-700 block mb-1">Invoice Notes:</span>
                                <p className="text-gray-300 print:text-gray-800">{invoice.notes}</p>
                            </div>
                        )}
                        <div className="text-xs text-gray-400 print:text-gray-600">
                            Payment Terms: Net 30. Thank you for choosing Chirper Spine Clinic for your care!
                        </div>
                    </div>

                    <div className="w-full sm:w-64 space-y-2 text-right text-sm">
                        <div className="flex justify-between text-gray-400 print:text-gray-600">
                            <span>Subtotal:</span>
                            <span className="font-mono text-white print:text-black">${invoice.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400 print:text-gray-600">
                            <span>Tax:</span>
                            <span className="font-mono text-white print:text-black">${invoice.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-extrabold text-base pt-2 border-t border-white/10 print:border-gray-300 text-white print:text-black">
                            <span>Total Amount:</span>
                            <span className="font-mono text-purple-400 print:text-purple-900">${invoice.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-emerald-400 font-semibold pt-1">
                            <span>Amount Paid:</span>
                            <span className="font-mono">${invoice.amount_paid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm text-amber-400 border-t border-white/10 print:border-gray-300 pt-2">
                            <span>Balance Due:</span>
                            <span className="font-mono">${invoice.balance_due.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Payments Recorded History */}
                {invoice.payments && invoice.payments.length > 0 && (
                    <div className="pt-6 border-t border-white/10 print:border-gray-300 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 print:text-purple-800">
                            Payment Transaction Receipts
                        </h4>
                        <div className="space-y-2">
                            {invoice.payments.map((p) => (
                                <div
                                    key={p.id}
                                    className="p-3 rounded-xl bg-white/[0.02] print:bg-gray-100 border border-white/5 print:border-gray-200 flex justify-between items-center text-xs"
                                >
                                    <span className="font-semibold text-white print:text-black">
                                        Paid via {p.payment_method.toUpperCase()} ({p.reference_number || 'N/A'})
                                    </span>
                                    <span className="font-mono font-bold text-emerald-400 print:text-emerald-800">
                                        +${p.amount.toFixed(2)} on {new Date(p.payment_date).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
