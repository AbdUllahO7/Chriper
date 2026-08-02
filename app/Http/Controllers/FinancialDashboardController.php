<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\Invoice;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinancialDashboardController extends Controller
{
    /**
     * Display Financial Analytics Dashboard.
     */
    public function index(Request $request): Response
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $startOfMonth = Carbon::now()->startOfMonth();
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();

        // 1. Daily Income (Today vs Yesterday)
        $dailyIncome = Payment::whereDate('payment_date', $today)
            ->where('status', 'completed')
            ->sum('amount');

        $yesterdayIncome = Payment::whereDate('payment_date', $yesterday)
            ->where('status', 'completed')
            ->sum('amount');

        $dailyChange = $yesterdayIncome > 0
            ? round((($dailyIncome - $yesterdayIncome) / $yesterdayIncome) * 100, 1)
            : ($dailyIncome > 0 ? 100 : 0);

        // 2. Monthly Income (This Month vs Last Month)
        $monthlyIncome = Payment::where('payment_date', '>=', $startOfMonth)
            ->where('status', 'completed')
            ->sum('amount');

        $lastMonthIncome = Payment::whereBetween('payment_date', [$startOfLastMonth, $endOfLastMonth])
            ->where('status', 'completed')
            ->sum('amount');

        $monthlyChange = $lastMonthIncome > 0
            ? round((($monthlyIncome - $lastMonthIncome) / $lastMonthIncome) * 100, 1)
            : ($monthlyIncome > 0 ? 100 : 0);

        // 3. Outstanding Unpaid Payments
        $outstandingInvoices = Invoice::with(['patient', 'doctor'])
            ->whereIn('status', ['unpaid', 'partially_paid', 'overdue'])
            ->latest('issue_date')
            ->get();

        $totalOutstandingAmount = $outstandingInvoices->sum(function ($inv) {
            return max(0, (float) $inv->total_amount - (float) $inv->amount_paid);
        });

        // Year to Date Total Collected
        $ytdRevenue = Payment::whereYear('payment_date', Carbon::now()->year)
            ->where('status', 'completed')
            ->sum('amount');

        // 4. Revenue by Chiropractor (Doctor)
        $doctors = Doctor::all();
        $totalInvoicedRevenue = Invoice::sum('total_amount');

        $revenueByChiropractor = $doctors->map(function ($doc) use ($totalInvoicedRevenue) {
            $docInvoices = Invoice::where('doctor_id', $doc->id)->get();
            $doctorRevenue = $docInvoices->sum('total_amount');
            $paidRevenue = $docInvoices->sum('amount_paid');
            $invoiceCount = $docInvoices->count();

            $sharePct = $totalInvoicedRevenue > 0
                ? round(($doctorRevenue / $totalInvoicedRevenue) * 100, 1)
                : 0;

            return [
                'id' => $doc->id,
                'name' => $doc->name,
                'specialty' => $doc->specialty,
                'avatar' => $doc->avatar ?? null,
                'total_revenue' => (float) $doctorRevenue,
                'paid_revenue' => (float) $paidRevenue,
                'invoice_count' => $invoiceCount,
                'share_percentage' => $sharePct,
            ];
        })->sortByDesc('total_revenue')->values();

        // 5. Revenue by Service Category
        $serviceBreakdown = [
            'Spinal Adjustments (HVLA)' => ['revenue' => 0.0, 'count' => 0],
            'Lumbar & Cervical Decompression' => ['revenue' => 0.0, 'count' => 0],
            'Cold Laser Therapy' => ['revenue' => 0.0, 'count' => 0],
            'X-Ray & Diagnostic Imaging' => ['revenue' => 0.0, 'count' => 0],
            'Physical Rehabilitation Stretches' => ['revenue' => 0.0, 'count' => 0],
            'Initial Chiropractic Consultation' => ['revenue' => 0.0, 'count' => 0],
        ];

        $allInvoices = Invoice::all();
        foreach ($allInvoices as $inv) {
            $items = $inv->line_items ?? [];
            if (is_array($items)) {
                foreach ($items as $item) {
                    $desc = strtolower($item['description'] ?? '');
                    $amt = (float) ($item['total'] ?? $item['unit_price'] ?? 0);

                    if (str_contains($desc, 'adjustment') || str_contains($desc, 'spinal') || str_contains($desc, 'manipulation')) {
                        $serviceBreakdown['Spinal Adjustments (HVLA)']['revenue'] += $amt;
                        $serviceBreakdown['Spinal Adjustments (HVLA)']['count']++;
                    } elseif (str_contains($desc, 'decompression') || str_contains($desc, 'traction')) {
                        $serviceBreakdown['Lumbar & Cervical Decompression']['revenue'] += $amt;
                        $serviceBreakdown['Lumbar & Cervical Decompression']['count']++;
                    } elseif (str_contains($desc, 'laser') || str_contains($desc, 'light')) {
                        $serviceBreakdown['Cold Laser Therapy']['revenue'] += $amt;
                        $serviceBreakdown['Cold Laser Therapy']['count']++;
                    } elseif (str_contains($desc, 'x-ray') || str_contains($desc, 'mri') || str_contains($desc, 'imaging') || str_contains($desc, 'scan')) {
                        $serviceBreakdown['X-Ray & Diagnostic Imaging']['revenue'] += $amt;
                        $serviceBreakdown['X-Ray & Diagnostic Imaging']['count']++;
                    } elseif (str_contains($desc, 'rehab') || str_contains($desc, 'exercise') || str_contains($desc, 'therapy')) {
                        $serviceBreakdown['Physical Rehabilitation Stretches']['revenue'] += $amt;
                        $serviceBreakdown['Physical Rehabilitation Stretches']['count']++;
                    } else {
                        $serviceBreakdown['Initial Chiropractic Consultation']['revenue'] += $amt;
                        $serviceBreakdown['Initial Chiropractic Consultation']['count']++;
                    }
                }
            }
        }

        $totalServiceRevenue = array_sum(array_column($serviceBreakdown, 'revenue'));

        $revenueByService = [];
        foreach ($serviceBreakdown as $name => $data) {
            $revenueByService[] = [
                'name' => $name,
                'revenue' => (float) $data['revenue'],
                'count' => $data['count'],
                'share_percentage' => $totalServiceRevenue > 0
                    ? round(($data['revenue'] / $totalServiceRevenue) * 100, 1)
                    : 0,
            ];
        }

        // Sort by revenue descending
        usort($revenueByService, fn($a, $b) => $b['revenue'] <=> $a['revenue']);

        // 6-Month Historical Revenue Trend
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $rev = Payment::whereYear('payment_date', $month->year)
                ->whereMonth('payment_date', $month->month)
                ->where('status', 'completed')
                ->sum('amount');

            $monthlyTrend[] = [
                'month' => $month->format('M Y'),
                'revenue' => (float) $rev,
            ];
        }

        return Inertia::render('FinancialDashboard/Index', [
            'metrics' => [
                'daily_income' => (float) $dailyIncome,
                'daily_change' => $dailyChange,
                'monthly_income' => (float) $monthlyIncome,
                'monthly_change' => $monthlyChange,
                'outstanding_amount' => (float) $totalOutstandingAmount,
                'outstanding_count' => $outstandingInvoices->count(),
                'ytd_revenue' => (float) $ytdRevenue,
            ],
            'revenueByChiropractor' => $revenueByChiropractor,
            'revenueByService' => $revenueByService,
            'monthlyTrend' => $monthlyTrend,
            'outstandingInvoices' => $outstandingInvoices->map(function ($inv) {
                return [
                    'id' => $inv->id,
                    'invoice_number' => $inv->invoice_number,
                    'issue_date' => $inv->issue_date ? $inv->issue_date->format('Y-m-d') : null,
                    'due_date' => $inv->due_date ? $inv->due_date->format('Y-m-d') : null,
                    'total_amount' => (float) $inv->total_amount,
                    'amount_paid' => (float) $inv->amount_paid,
                    'balance_due' => (float) $inv->balance_due,
                    'status' => $inv->status,
                    'patient' => $inv->patient ? ['id' => $inv->patient->id, 'first_name' => $inv->patient->first_name, 'last_name' => $inv->patient->last_name] : null,
                    'doctor' => $inv->doctor ? ['id' => $inv->doctor->id, 'name' => $inv->doctor->name] : null,
                ];
            }),
        ]);
    }
}
