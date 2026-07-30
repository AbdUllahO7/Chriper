<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    /**
     * Display financial billing dashboard, invoice management, and payments.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');

        $invoices = Invoice::with(['patient', 'doctor', 'payments'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('invoice_number', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($pq) use ($search) {
                          $pq->where('first_name', 'like', "%{$search}%")
                             ->orWhere('last_name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest('issue_date')
            ->get();

        $payments = Payment::with(['patient', 'invoice'])
            ->latest('payment_date')
            ->take(20)
            ->get();

        $patients = Patient::where('status', 'active')->get(['id', 'first_name', 'last_name', 'email']);
        $doctors = Doctor::all(['id', 'name', 'specialty']);

        // Financial KPI Metrics
        $totalBilled = (float) Invoice::sum('total_amount');
        $totalRevenue = (float) Invoice::sum('amount_paid');
        $totalBalanceDue = (float) Invoice::selectRaw('SUM(total_amount - amount_paid) as balance')->value('balance');
        $paidInvoicesCount = Invoice::where('status', 'paid')->count();

        return Inertia::render('Billing/Index', [
            'invoices' => $invoices,
            'payments' => $payments,
            'patients' => $patients,
            'doctors' => $doctors,
            'metrics' => [
                'totalBilled' => $totalBilled,
                'totalRevenue' => $totalRevenue,
                'totalBalanceDue' => max(0, $totalBalanceDue),
                'paidInvoicesCount' => $paidInvoicesCount,
            ],
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? '',
            ],
        ]);
    }

    /**
     * Display printable PDF invoice page.
     */
    public function showInvoice(Invoice $invoice): Response
    {
        $invoice->load(['patient', 'doctor', 'payments']);

        return Inertia::render('Billing/InvoicePrint', [
            'invoice' => $invoice,
        ]);
    }

    /**
     * Create a new invoice with itemized line items.
     */
    public function storeInvoice(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:doctors,id'],
            'issue_date' => ['required', 'date'],
            'due_date' => ['required', 'date'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'line_items' => ['required', 'array', 'min:1'],
            'line_items.*.description' => ['required', 'string', 'max:255'],
            'line_items.*.qty' => ['required', 'integer', 'min:1'],
            'line_items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        // Calculate Subtotal & Total
        $subtotal = 0;
        $processedItems = [];
        foreach ($validated['line_items'] as $item) {
            $itemTotal = (int) $item['qty'] * (float) $item['unit_price'];
            $subtotal += $itemTotal;
            $processedItems[] = [
                'description' => $item['description'],
                'qty' => (int) $item['qty'],
                'unit_price' => (float) $item['unit_price'],
                'total' => $itemTotal,
            ];
        }

        $tax = (float) ($validated['tax'] ?? 0);
        $totalAmount = $subtotal + $tax;

        // Auto-generate invoice number
        $nextId = (Invoice::max('id') ?? 0) + 1;
        $invoiceNumber = 'INV-' . date('Y') . '-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

        $invoice = Invoice::create([
            'invoice_number' => $invoiceNumber,
            'patient_id' => $validated['patient_id'],
            'doctor_id' => $validated['doctor_id'],
            'issue_date' => $validated['issue_date'],
            'due_date' => $validated['due_date'],
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total_amount' => $totalAmount,
            'amount_paid' => 0,
            'status' => 'unpaid',
            'line_items' => $processedItems,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('billing.index')->with('message', "Invoice {$invoice->invoice_number} created successfully.");
    }

    /**
     * Record a payment (Cash, Card, Insurance) against an invoice.
     */
    public function recordPayment(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', Rule::in(['cash', 'card', 'insurance'])],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'payment_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $paymentAmount = (float) $validated['amount'];

        // Record payment
        Payment::create([
            'invoice_id' => $invoice->id,
            'patient_id' => $invoice->patient_id,
            'amount' => $paymentAmount,
            'payment_method' => $validated['payment_method'],
            'reference_number' => $validated['reference_number'] ?? strtoupper($validated['payment_method']) . '-' . rand(1000, 9999),
            'status' => 'completed',
            'payment_date' => Carbon::parse($validated['payment_date']),
            'notes' => $validated['notes'] ?? null,
        ]);

        // Update Invoice Amount Paid & Status
        $newAmountPaid = $invoice->amount_paid + $paymentAmount;
        $newStatus = 'unpaid';

        if ($newAmountPaid >= $invoice->total_amount) {
            $newStatus = 'paid';
        } elseif ($newAmountPaid > 0) {
            $newStatus = 'partially_paid';
        }

        $invoice->update([
            'amount_paid' => $newAmountPaid,
            'status' => $newStatus,
        ]);

        return redirect()->back()->with('message', "Payment of $" . number_format($paymentAmount, 2) . " recorded via " . strtoupper($validated['payment_method']));
    }

    /**
     * Delete an invoice.
     */
    public function destroyInvoice(Invoice $invoice)
    {
        $invoice->delete();

        return redirect()->back()->with('message', 'Invoice deleted successfully.');
    }
}
