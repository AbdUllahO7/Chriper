<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the analytics dashboard with live database-driven KPI cards and charts.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. KPI Metric Card 1: Today's Appointments (DB Query)
        $todaysCount = Appointment::whereDate('appointment_date', Carbon::today())->count();
        $yesterdaysCount = Appointment::whereDate('appointment_date', Carbon::yesterday())->count();
        $completedToday = Appointment::whereDate('appointment_date', Carbon::today())
            ->where('status', 'completed')
            ->count();

        $appDiff = $todaysCount - $yesterdaysCount;
        $appChangeText = $yesterdaysCount > 0
            ? ($appDiff >= 0 ? "+{$appDiff}" : "{$appDiff}") . ' vs yesterday'
            : '+100%';

        // 2. KPI Metric Card 2: Active Patients (DB Query)
        $activePatientsCount = Patient::where('status', 'active')->count();
        $totalPatientsCount = Patient::count();
        $activePercent = $totalPatientsCount > 0 ? round(($activePatientsCount / $totalPatientsCount) * 100) : 0;

        // 3. KPI Metric Card 3: Total Patients (DB Query)
        $newThisMonth = Patient::whereYear('created_at', Carbon::now()->year)
            ->whereMonth('created_at', Carbon::now()->month)
            ->count();

        // 4. KPI Metric Card 4: Monthly Revenue (DB Query)
        $currentMonthRevenue = Payment::where('status', 'paid')
            ->whereYear('payment_date', Carbon::now()->year)
            ->whereMonth('payment_date', Carbon::now()->month)
            ->sum('amount');

        $lastMonthRevenue = Payment::where('status', 'paid')
            ->whereYear('payment_date', Carbon::now()->subMonth()->year)
            ->whereMonth('payment_date', Carbon::now()->subMonth()->month)
            ->sum('amount');

        $revDiff = $currentMonthRevenue - $lastMonthRevenue;
        $revPercentChange = $lastMonthRevenue > 0
            ? round(($revDiff / $lastMonthRevenue) * 100, 1)
            : 100;
        $revChangeText = ($revPercentChange >= 0 ? "+{$revPercentChange}%" : "{$revPercentChange}%");

        // 5. KPI Metric Card 5: Pending Payments (DB Query)
        $pendingPaymentsTotal = Payment::where('status', 'pending')->sum('amount');
        $pendingInvoicesCount = Payment::where('status', 'pending')->count();

        // Compile Database Cards Array (Clean integer formatting for currency)
        $cards = [
            'todaysAppointments' => [
                'title' => "Today's Appointments",
                'value' => (string) $todaysCount,
                'change' => $appChangeText,
                'trend' => 'up',
                'description' => "{$completedToday} completed today",
            ],
            'activePatients' => [
                'title' => 'Active Patients',
                'value' => (string) $activePatientsCount,
                'change' => "{$activePercent}% active",
                'trend' => 'up',
                'description' => 'on care plans',
            ],
            'totalPatients' => [
                'title' => 'Total Patients',
                'value' => (string) $totalPatientsCount,
                'change' => "+{$newThisMonth} new",
                'trend' => 'up',
                'description' => 'clinic records',
            ],
            'monthlyRevenue' => [
                'title' => 'Monthly Revenue',
                'value' => '$' . number_format($currentMonthRevenue, 0),
                'change' => $revChangeText,
                'trend' => 'up',
                'description' => 'vs last month ($' . number_format($lastMonthRevenue, 0) . ')',
            ],
            'pendingPayments' => [
                'title' => 'Pending Payments',
                'value' => '$' . number_format($pendingPaymentsTotal, 0),
                'change' => "{$pendingInvoicesCount} invoices",
                'trend' => 'warning',
                'description' => 'unpaid balances',
            ],
        ];

        // 6. DB Query Chart 1: Weekly Appointments (Mon to Sun)
        $startOfWeek = Carbon::now()->startOfWeek();
        $weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        $completedWeekly = [];
        $scheduledWeekly = [];

        for ($i = 0; $i < 7; $i++) {
            $date = (clone $startOfWeek)->addDays($i);
            $completedCount = Appointment::whereDate('appointment_date', $date)
                ->where('status', 'completed')
                ->count();
            $scheduledCount = Appointment::whereDate('appointment_date', $date)
                ->where('status', 'scheduled')
                ->count();

            $completedWeekly[] = $completedCount;
            $scheduledWeekly[] = $scheduledCount;
        }

        $weeklyAppointmentsChart = [
            'labels' => $weeklyLabels,
            'datasets' => [
                [
                    'label' => 'Completed Appointments',
                    'data' => $completedWeekly,
                    'backgroundColor' => 'rgba(168, 85, 247, 0.8)',
                    'borderColor' => '#a855f7',
                    'borderRadius' => 8,
                ],
                [
                    'label' => 'Scheduled / Pending',
                    'data' => $scheduledWeekly,
                    'backgroundColor' => 'rgba(99, 102, 241, 0.4)',
                    'borderColor' => '#6366f1',
                    'borderRadius' => 8,
                ],
            ],
        ];

        // 7. DB Query Chart 2: Monthly Income (Jan to Jul)
        $monthsLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
        $monthlyRevenueData = [];
        $monthlyTargetData = [15000, 16000, 18000, 18000, 20000, 22000, 24000];

        for ($m = 1; $m <= 7; $m++) {
            $sum = Payment::where('status', 'paid')
                ->whereYear('payment_date', Carbon::now()->year)
                ->whereMonth('payment_date', $m)
                ->sum('amount');
            $monthlyRevenueData[] = (float) $sum;
        }

        $monthlyIncomeChart = [
            'labels' => $monthsLabels,
            'datasets' => [
                [
                    'label' => 'Revenue ($)',
                    'data' => $monthlyRevenueData,
                    'fill' => true,
                    'backgroundColor' => 'rgba(168, 85, 247, 0.15)',
                    'borderColor' => '#a855f7',
                    'tension' => 0.4,
                    'pointBackgroundColor' => '#a855f7',
                ],
                [
                    'label' => 'Target ($)',
                    'data' => $monthlyTargetData,
                    'fill' => false,
                    'borderColor' => 'rgba(255, 255, 255, 0.3)',
                    'borderDash' => [5, 5],
                    'tension' => 0.4,
                ],
            ],
        ];

        // 8. DB Query Chart 3: New Patients Growth (Jan to Jul)
        $newPatientsData = [];
        for ($m = 1; $m <= 7; $m++) {
            $pCount = Patient::whereYear('created_at', Carbon::now()->year)
                ->whereMonth('created_at', $m)
                ->count();
            $newPatientsData[] = $pCount;
        }

        $newPatientsChart = [
            'labels' => $monthsLabels,
            'datasets' => [
                [
                    'label' => 'New Patients Registered',
                    'data' => $newPatientsData,
                    'fill' => true,
                    'backgroundColor' => 'rgba(59, 130, 246, 0.15)',
                    'borderColor' => '#3b82f6',
                    'tension' => 0.4,
                    'pointBackgroundColor' => '#3b82f6',
                ],
            ],
        ];

        return Inertia::render('Dashboard', [
            'cards' => $cards,
            'weeklyAppointments' => $weeklyAppointmentsChart,
            'monthlyIncome' => $monthlyIncomeChart,
            'newPatients' => $newPatientsChart,
        ]);
    }
}
