<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Invoice;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KpiDashboardController extends Controller
{
    /**
     * Display Executive Practice KPI Analytics Dashboard.
     */
    public function index(Request $request): Response
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();

        // Active clinic branch filter support
        $activeBranchId = session('active_branch_id', 'all');

        $patientQuery = Patient::query();
        $appointmentQuery = Appointment::query();
        $invoiceQuery = Invoice::query();

        if ($activeBranchId !== 'all') {
            $patientQuery->where('clinic_branch_id', $activeBranchId);
            $appointmentQuery->where('clinic_branch_id', $activeBranchId);
            $invoiceQuery->where('clinic_branch_id', $activeBranchId);
        }

        $totalPatients = (clone $patientQuery)->count();
        $totalAppointments = (clone $appointmentQuery)->count();

        // 1. New Patients This Month (vs Last Month)
        $newPatientsThisMonth = (clone $patientQuery)
            ->where('created_at', '>=', $startOfMonth)
            ->count();

        $newPatientsLastMonth = (clone $patientQuery)
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->count();

        $newPatientChangePct = $newPatientsLastMonth > 0
            ? round((($newPatientsThisMonth - $newPatientsLastMonth) / $newPatientsLastMonth) * 100, 1)
            : ($newPatientsThisMonth > 0 ? 100 : 0);

        // 2. Returning Patient Rate (%)
        // Patients who have completed 2 or more appointments
        $patientAppointmentCounts = (clone $appointmentQuery)
            ->where('status', 'completed')
            ->selectRaw('patient_id, COUNT(*) as visit_count')
            ->groupBy('patient_id')
            ->pluck('visit_count', 'patient_id');

        $returningPatientsCount = $patientAppointmentCounts->filter(fn($count) => $count >= 2)->count();
        $returningPatientRate = $totalPatients > 0
            ? round(($returningPatientsCount / $totalPatients) * 100, 1)
            : 0;

        // 3. Average Visits Per Patient
        $completedVisitsCount = (clone $appointmentQuery)->where('status', 'completed')->count();
        $avgVisitsPerPatient = $totalPatients > 0
            ? round($completedVisitsCount / $totalPatients, 2)
            : 0;

        // 4. Cancellation Rate (%)
        $cancelledCount = (clone $appointmentQuery)->where('status', 'cancelled')->count();
        $cancellationRate = $totalAppointments > 0
            ? round(($cancelledCount / $totalAppointments) * 100, 1)
            : 0;

        // 5. No-Show Rate (%)
        $noShowCount = (clone $appointmentQuery)->where('status', 'no_show')->count();
        $noShowRate = $totalAppointments > 0
            ? round(($noShowCount / $totalAppointments) * 100, 1)
            : 0;

        // 6. Average Revenue Per Patient (ARPP)
        $totalCollectedRevenue = (clone $invoiceQuery)->sum('amount_paid');
        $avgRevenuePerPatient = $totalPatients > 0
            ? round($totalCollectedRevenue / $totalPatients, 2)
            : 0;

        // Appointment Status Reliability Breakdown
        $statusBreakdown = [
            'completed' => (clone $appointmentQuery)->where('status', 'completed')->count(),
            'scheduled' => (clone $appointmentQuery)->where('status', 'scheduled')->count(),
            'cancelled' => $cancelledCount,
            'no_show' => $noShowCount,
        ];

        // 6-Month Historical KPI Trend Data
        $historicalTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $mStart = (clone $month)->startOfMonth();
            $mEnd = (clone $month)->endOfMonth();

            $mNewPatients = Patient::whereBetween('created_at', [$mStart, $mEnd])->count();
            $mAppts = Appointment::whereBetween('appointment_date', [$mStart, $mEnd])->get();

            $mTotalAppts = $mAppts->count();
            $mCancelled = $mAppts->where('status', 'cancelled')->count();
            $mNoShow = $mAppts->where('status', 'no_show')->count();

            $mCancRate = $mTotalAppts > 0 ? round(($mCancelled / $mTotalAppts) * 100, 1) : 0;
            $mNoShowRate = $mTotalAppts > 0 ? round(($mNoShow / $mTotalAppts) * 100, 1) : 0;

            $mRev = Invoice::whereBetween('created_at', [$mStart, $mEnd])->sum('amount_paid');

            $historicalTrend[] = [
                'month' => $month->format('M Y'),
                'new_patients' => $mNewPatients,
                'cancellation_rate' => $mCancRate,
                'no_show_rate' => $mNoShowRate,
                'revenue' => (float) $mRev,
            ];
        }

        // Chiropractor Performance KPI Leaderboard
        $doctors = Doctor::all();
        $doctorKpis = $doctors->map(function ($doc) {
            $docAppts = Appointment::where('doctor_id', $doc->id)->orWhere('chiropractor_id', $doc->user_id)->get();
            $totalDocAppts = $docAppts->count();
            $completedDocAppts = $docAppts->where('status', 'completed')->count();
            $cancelledDocAppts = $docAppts->where('status', 'cancelled')->count();
            $noShowDocAppts = $docAppts->where('status', 'no_show')->count();

            $docInvoices = Invoice::where('doctor_id', $doc->id)->get();
            $docRevenue = $docInvoices->sum('amount_paid');
            $docPatientsCount = $docAppts->pluck('patient_id')->unique()->count();

            $docCancRate = $totalDocAppts > 0 ? round(($cancelledDocAppts / $totalDocAppts) * 100, 1) : 0;
            $docNoShowRate = $totalDocAppts > 0 ? round(($noShowDocAppts / $totalDocAppts) * 100, 1) : 0;
            $docArpp = $docPatientsCount > 0 ? round($docRevenue / $docPatientsCount, 2) : 0;

            return [
                'id' => $doc->id,
                'name' => $doc->name,
                'specialty' => $doc->specialty,
                'completed_visits' => $completedDocAppts,
                'cancellation_rate' => $docCancRate,
                'no_show_rate' => $docNoShowRate,
                'revenue' => (float) $docRevenue,
                'arpp' => $docArpp,
            ];
        })->sortByDesc('completed_visits')->values();

        return Inertia::render('KpiDashboard/Index', [
            'metrics' => [
                'new_patients_this_month' => $newPatientsThisMonth,
                'new_patient_change' => $newPatientChangePct,
                'returning_patient_rate' => $returningPatientRate,
                'avg_visits_per_patient' => $avgVisitsPerPatient,
                'cancellation_rate' => $cancellationRate,
                'no_show_rate' => $noShowRate,
                'avg_revenue_per_patient' => $avgRevenuePerPatient,
                'total_patients' => $totalPatients,
                'total_appointments' => $totalAppointments,
                'total_revenue' => (float) $totalCollectedRevenue,
            ],
            'statusBreakdown' => $statusBreakdown,
            'historicalTrend' => $historicalTrend,
            'doctorKpis' => $doctorKpis,
        ]);
    }
}
