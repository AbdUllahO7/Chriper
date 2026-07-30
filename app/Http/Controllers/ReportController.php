<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Display reports dashboard with 5 report tabs and date range filters.
     */
    public function index(Request $request): Response
    {
        $range = $request->input('range', 'this_month');
        $activeTab = $request->input('tab', 'revenue');

        $dateFilter = $this->getDateRangeFilter($range);
        $startDate = $dateFilter['start'];
        $endDate = $dateFilter['end'];

        // 1. Revenue Report
        $revenueReport = [
            'totalInvoiced' => (float) Invoice::whereBetween('created_at', [$startDate, $endDate])->sum('total_amount'),
            'totalCollected' => (float) Payment::whereBetween('payment_date', [$startDate, $endDate])->sum('amount'),
            'balanceDue' => (float) (Invoice::whereBetween('created_at', [$startDate, $endDate])
                ->selectRaw('SUM(total_amount - amount_paid) as bal')->value('bal') ?? 0),
            'paymentMethods' => [
                'card' => (float) Payment::whereBetween('payment_date', [$startDate, $endDate])->where('payment_method', 'card')->sum('amount'),
                'cash' => (float) Payment::whereBetween('payment_date', [$startDate, $endDate])->where('payment_method', 'cash')->sum('amount'),
                'insurance' => (float) Payment::whereBetween('payment_date', [$startDate, $endDate])->where('payment_method', 'insurance')->sum('amount'),
            ],
        ];

        // 2. Appointments Report
        $appointmentsQuery = Appointment::whereBetween('appointment_date', [$startDate, $endDate]);
        $appointmentsReport = [
            'total' => $appointmentsQuery->count(),
            'completed' => (clone $appointmentsQuery)->where('status', 'completed')->count(),
            'scheduled' => (clone $appointmentsQuery)->where('status', 'scheduled')->count(),
            'in_progress' => (clone $appointmentsQuery)->where('status', 'in_progress')->count(),
            'checked_in' => (clone $appointmentsQuery)->where('status', 'checked_in')->count(),
            'cancelled' => (clone $appointmentsQuery)->where('status', 'cancelled')->count(),
            'no_show' => (clone $appointmentsQuery)->where('status', 'no_show')->count(),
            'list' => (clone $appointmentsQuery)->with(['patient', 'chiropractor'])->latest('appointment_date')->take(15)->get(),
        ];

        // 3. Patients Report
        $patientsReport = [
            'totalPatients' => Patient::count(),
            'newPatients' => Patient::whereBetween('created_at', [$startDate, $endDate])->count(),
            'activePatients' => Patient::where('status', 'active')->count(),
            'inactivePatients' => Patient::where('status', 'inactive')->count(),
            'insuranceBreakdown' => Patient::selectRaw('insurance, count(*) as count')->groupBy('insurance')->get(),
            'recentList' => Patient::latest()->take(15)->get(),
        ];

        // 4. Chiropractor Performance Report
        $doctors = Doctor::withCount(['appointments as completed_visits' => function ($q) use ($startDate, $endDate) {
            $q->where('status', 'completed')->whereBetween('appointment_date', [$startDate, $endDate]);
        }, 'appointments as total_appointments' => function ($q) use ($startDate, $endDate) {
            $q->whereBetween('appointment_date', [$startDate, $endDate]);
        }])->get();

        $performanceReport = $doctors->map(function ($doc) use ($startDate, $endDate) {
            $revenueGenerated = (float) Invoice::where('doctor_id', $doc->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('amount_paid');

            $completionRate = $doc->total_appointments > 0
                ? round(($doc->completed_visits / $doc->total_appointments) * 100, 1)
                : 100;

            return [
                'id' => $doc->id,
                'name' => $doc->name,
                'specialty' => $doc->specialty,
                'room_number' => $doc->room_number,
                'completed_visits' => $doc->completed_visits,
                'total_appointments' => $doc->total_appointments,
                'completion_rate' => $completionRate,
                'revenue_generated' => $revenueGenerated,
            ];
        });

        // 5. Outstanding Payments (Aging) Report
        $outstandingInvoices = Invoice::with(['patient', 'doctor'])
            ->whereIn('status', ['unpaid', 'partially_paid', 'overdue'])
            ->latest('due_date')
            ->get()
            ->map(function ($inv) {
                $dueDate = Carbon::parse($inv->due_date);
                $daysPastDue = $dueDate->isPast() ? (int) $dueDate->diffInDays(now()) : 0;

                return [
                    'id' => $inv->id,
                    'invoice_number' => $inv->invoice_number,
                    'patient_name' => $inv->patient ? $inv->patient->full_name : 'N/A',
                    'patient_phone' => $inv->patient ? $inv->patient->phone : 'N/A',
                    'total_amount' => $inv->total_amount,
                    'amount_paid' => $inv->amount_paid,
                    'balance_due' => $inv->balance_due,
                    'issue_date' => $inv->issue_date->format('Y-m-d'),
                    'due_date' => $inv->due_date->format('Y-m-d'),
                    'days_past_due' => $daysPastDue,
                    'status' => $inv->status,
                ];
            });

        return Inertia::render('Reports/Index', [
            'revenueReport' => $revenueReport,
            'appointmentsReport' => $appointmentsReport,
            'patientsReport' => $patientsReport,
            'performanceReport' => $performanceReport,
            'outstandingReport' => $outstandingInvoices,
            'filters' => [
                'range' => $range,
                'tab' => $activeTab,
            ],
        ]);
    }

    /**
     * Export report data as downloadable CSV.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $type = $request->input('type', 'revenue');
        $range = $request->input('range', 'this_month');
        $dateFilter = $this->getDateRangeFilter($range);
        $startDate = $dateFilter['start'];
        $endDate = $dateFilter['end'];

        $fileName = "chirper_report_{$type}_".date('Y-m-d').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ];

        $callback = function () use ($type, $startDate, $endDate) {
            $handle = fopen('php://output', 'w');

            if ($type === 'appointments') {
                fputcsv($handle, ['ID', 'Patient Name', 'Chiropractor', 'Service Type', 'Date', 'Status', 'Duration (Mins)']);
                $records = Appointment::with(['patient', 'chiropractor'])
                    ->whereBetween('appointment_date', [$startDate, $endDate])
                    ->get();
                foreach ($records as $row) {
                    fputcsv($handle, [
                        $row->id,
                        $row->patient ? $row->patient->full_name : 'N/A',
                        $row->chiropractor ? $row->chiropractor->name : 'N/A',
                        $row->service_type,
                        $row->appointment_date,
                        $row->status,
                        $row->duration_minutes,
                    ]);
                }
            } elseif ($type === 'patients') {
                fputcsv($handle, ['ID', 'Full Name', 'Email', 'Phone', 'Gender', 'Status', 'Insurance']);
                $records = Patient::whereBetween('created_at', [$startDate, $endDate])->get();
                foreach ($records as $row) {
                    fputcsv($handle, [$row->id, $row->full_name, $row->email, $row->phone, $row->gender, $row->status, $row->insurance]);
                }
            } elseif ($type === 'outstanding') {
                fputcsv($handle, ['Invoice #', 'Patient Name', 'Total Amount', 'Amount Paid', 'Balance Due', 'Due Date', 'Status']);
                $records = Invoice::with('patient')->whereIn('status', ['unpaid', 'partially_paid', 'overdue'])->get();
                foreach ($records as $row) {
                    fputcsv($handle, [
                        $row->invoice_number,
                        $row->patient ? $row->patient->full_name : 'N/A',
                        $row->total_amount,
                        $row->amount_paid,
                        $row->balance_due,
                        $row->due_date ? $row->due_date->format('Y-m-d') : 'N/A',
                        $row->status,
                    ]);
                }
            } else {
                // Default Revenue
                fputcsv($handle, ['ID', 'Invoice #', 'Patient', 'Total Amount', 'Amount Paid', 'Status', 'Issue Date']);
                $records = Invoice::with('patient')->whereBetween('created_at', [$startDate, $endDate])->get();
                foreach ($records as $row) {
                    fputcsv($handle, [
                        $row->id,
                        $row->invoice_number,
                        $row->patient ? $row->patient->full_name : 'N/A',
                        $row->total_amount,
                        $row->amount_paid,
                        $row->status,
                        $row->issue_date ? $row->issue_date->format('Y-m-d') : 'N/A',
                    ]);
                }
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Render printable PDF report template layout.
     */
    public function exportPdf(Request $request): Response
    {
        $range = $request->input('range', 'this_month');
        $tab = $request->input('tab', 'revenue');

        return Inertia::render('Reports/PdfView', [
            'range' => $range,
            'tab' => $tab,
            'generatedAt' => Carbon::now()->toDayDateTimeString(),
        ]);
    }

    /**
     * Helper to compute start & end Carbon dates.
     */
    private function getDateRangeFilter(string $range): array
    {
        $now = Carbon::now();

        switch ($range) {
            case 'this_month':
                return ['start' => $now->copy()->startOfMonth(), 'end' => $now->copy()->endOfMonth()];
            case 'last_month':
                return ['start' => $now->copy()->subMonth()->startOfMonth(), 'end' => $now->copy()->subMonth()->endOfMonth()];
            case 'this_year':
                return ['start' => $now->copy()->startOfYear(), 'end' => $now->copy()->endOfYear()];
            case 'all_time':
            default:
                return ['start' => Carbon::parse('2020-01-01'), 'end' => $now->copy()->addYears(5)];
        }
    }
}
