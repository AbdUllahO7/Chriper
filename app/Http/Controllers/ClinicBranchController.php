<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\ClinicBranch;
use App\Models\Doctor;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ClinicBranchController extends Controller
{
    /**
     * Default Seed Clinic Branches.
     */
    protected array $seedBranches = [
        [
            'name' => 'Chirper Central - Downtown HQ',
            'code' => 'MAIN',
            'address' => '742 Evergreen Terrace, Suite 100, Downtown',
            'phone' => '(555) 019-2831',
            'email' => 'downtown@chirperspine.com',
            'is_main_branch' => true,
            'is_active' => true,
        ],
        [
            'name' => 'Chirper North - Medical Hub',
            'code' => 'NORTH',
            'address' => '1200 North Healthcare Blvd, Building B',
            'phone' => '(555) 018-9922',
            'email' => 'north@chirperspine.com',
            'is_main_branch' => false,
            'is_active' => true,
        ],
        [
            'name' => 'Chirper West - Wellness Pavilion',
            'code' => 'WEST',
            'address' => '450 Westridge Ave, Suite 305',
            'phone' => '(555) 017-4411',
            'email' => 'west@chirperspine.com',
            'is_main_branch' => false,
            'is_active' => true,
        ],
    ];

    /**
     * Display Multi-Clinic Branch Management Hub & Analytics.
     */
    public function index(Request $request): Response
    {
        // Seed default clinic branches if database is fresh
        if (ClinicBranch::count() === 0) {
            foreach ($this->seedBranches as $bData) {
                ClinicBranch::create($bData);
            }
        }

        $mainBranch = ClinicBranch::where('is_main_branch', true)->first() ?? ClinicBranch::first();

        // Assign unassigned appointments, doctors, patients, invoices to main branch
        if ($mainBranch) {
            Appointment::whereNull('clinic_branch_id')->update(['clinic_branch_id' => $mainBranch->id]);
            Doctor::whereNull('clinic_branch_id')->update(['clinic_branch_id' => $mainBranch->id]);
            Patient::whereNull('clinic_branch_id')->update(['clinic_branch_id' => $mainBranch->id]);
            Invoice::whereNull('clinic_branch_id')->update(['clinic_branch_id' => $mainBranch->id]);
        }

        $branches = ClinicBranch::withCount(['doctors', 'appointments', 'patients'])
            ->get();

        $activeBranchId = session('active_branch_id', 'all');

        // Calculate branch-specific financial & appointment metrics
        $startOfMonth = Carbon::now()->startOfMonth();

        $branchesWithStats = $branches->map(function ($branch) use ($startOfMonth) {
            $monthlyRevenue = Invoice::where('clinic_branch_id', $branch->id)
                ->where('created_at', '>=', $startOfMonth)
                ->sum('amount_paid');

            $monthlyAppointments = Appointment::where('clinic_branch_id', $branch->id)
                ->where('appointment_date', '>=', $startOfMonth)
                ->count();

            return [
                'id' => $branch->id,
                'name' => $branch->name,
                'code' => $branch->code,
                'address' => $branch->address,
                'phone' => $branch->phone,
                'email' => $branch->email,
                'is_main_branch' => $branch->is_main_branch,
                'is_active' => $branch->is_active,
                'doctors_count' => $branch->doctors_count,
                'appointments_count' => $branch->appointments_count,
                'patients_count' => $branch->patients_count,
                'monthly_revenue' => (float) $monthlyRevenue,
                'monthly_appointments' => $monthlyAppointments,
            ];
        });

        // Total multi-clinic metrics
        $totalRevenue = Invoice::where('created_at', '>=', $startOfMonth)->sum('amount_paid');
        $totalAppointments = Appointment::where('appointment_date', '>=', $startOfMonth)->count();

        return Inertia::render('Branches/Index', [
            'branches' => $branchesWithStats,
            'activeBranchId' => $activeBranchId,
            'metrics' => [
                'total_branches' => $branches->count(),
                'active_branches_count' => $branches->where('is_active', true)->count(),
                'total_doctors' => Doctor::count(),
                'total_monthly_revenue' => (float) $totalRevenue,
                'total_monthly_appointments' => $totalAppointments,
            ],
        ]);
    }

    /**
     * Store new clinic branch location.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:clinic_branches,code'],
            'address' => ['nullable', 'string', 'max:1000'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'is_main_branch' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        if (!empty($validated['is_main_branch'])) {
            ClinicBranch::where('is_main_branch', true)->update(['is_main_branch' => false]);
        }

        $branch = ClinicBranch::create($validated);

        return redirect()->back()->with('message', "Clinic branch location '{$branch->name}' created successfully.");
    }

    /**
     * Update clinic branch details.
     */
    public function update(Request $request, ClinicBranch $branch)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', Rule::unique('clinic_branches')->ignore($branch->id)],
            'address' => ['nullable', 'string', 'max:1000'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'is_main_branch' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        if (!empty($validated['is_main_branch'])) {
            ClinicBranch::where('is_main_branch', true)->where('id', '!=', $branch->id)->update(['is_main_branch' => false]);
        }

        $branch->update($validated);

        return redirect()->back()->with('message', "Branch '{$branch->name}' details updated.");
    }

    /**
     * Delete clinic branch location.
     */
    public function destroy(ClinicBranch $branch)
    {
        if ($branch->is_main_branch) {
            return redirect()->back()->with('error', 'Cannot delete the main HQ clinic branch.');
        }

        $name = $branch->name;
        $branch->delete();

        return redirect()->back()->with('message', "Branch location '{$name}' removed.");
    }

    /**
     * Switch Active Branch Context.
     */
    public function switchBranch(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => ['required', 'string'],
        ]);

        session(['active_branch_id' => $validated['branch_id']]);

        return redirect()->back()->with('message', 'Active clinic branch context switched.');
    }
}
