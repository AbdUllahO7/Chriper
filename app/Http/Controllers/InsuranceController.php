<?php

namespace App\Http\Controllers;

use App\Models\InsuranceClaim;
use App\Models\InsurancePolicy;
use App\Models\Invoice;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InsuranceController extends Controller
{
    /**
     * Display Insurance Policies & Claims Lifecycle Dashboard.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $claimStatus = $request->input('claim_status');
        $patientId = $request->input('patient_id');

        $policies = InsurancePolicy::with('patient')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('insurance_company', 'like', "%{$search}%")
                      ->orWhere('policy_number', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($pq) use ($search) {
                          $pq->where('first_name', 'like', "%{$search}%")
                             ->orWhere('last_name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($patientId, function ($query, $patientId) {
                $query->where('patient_id', $patientId);
            })
            ->latest()
            ->get();

        $claims = InsuranceClaim::with(['patient', 'insurancePolicy', 'invoice'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('claim_number', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($pq) use ($search) {
                          $pq->where('first_name', 'like', "%{$search}%")
                             ->orWhere('last_name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($claimStatus, function ($query, $claimStatus) {
                $query->where('claim_status', $claimStatus);
            })
            ->latest('claim_date')
            ->paginate(15)
            ->withQueryString();

        $patients = Patient::where('status', 'active')->get(['id', 'first_name', 'last_name', 'email']);
        $invoices = Invoice::with('patient')->latest()->take(30)->get();

        return Inertia::render('Insurance/Index', [
            'policies' => $policies,
            'claims' => $claims,
            'patients' => $patients,
            'invoices' => $invoices,
            'filters' => [
                'search' => $search ?? '',
                'claim_status' => $claimStatus ?? '',
                'patient_id' => $patientId ?? '',
            ],
            'claimStatuses' => ['draft', 'submitted', 'in_review', 'approved', 'partially_paid', 'denied'],
            'insuranceCarriers' => [
                'BlueCross BlueShield',
                'Aetna Healthcare',
                'UnitedHealth Group',
                'Cigna Chiropractic',
                'Humana Health',
                'Kaiser Permanente',
                'Medicare / Medicaid',
            ],
        ]);
    }

    /**
     * Store a newly created patient insurance policy.
     */
    public function storePolicy(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'insurance_company' => ['required', 'string', 'max:255'],
            'policy_number' => ['required', 'string', 'max:255'],
            'group_number' => ['nullable', 'string', 'max:255'],
            'coverage_percentage' => ['required', 'numeric', 'between:0,100'],
            'copay_amount' => ['required', 'numeric', 'min:0'],
            'deductible_amount' => ['required', 'numeric', 'min:0'],
            'deductible_met' => ['nullable', 'numeric', 'min:0'],
            'max_visits_per_year' => ['required', 'integer', 'min:1'],
            'used_visits' => ['required', 'integer', 'min:0'],
            'effective_date' => ['nullable', 'date'],
            'expiration_date' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['active', 'expired', 'pending_verification'])],
        ]);

        $policy = InsurancePolicy::create($validated);

        return redirect()->back()
            ->with('message', "Insurance policy for {$policy->insurance_company} added successfully.");
    }

    /**
     * Update an existing insurance policy.
     */
    public function updatePolicy(Request $request, InsurancePolicy $policy)
    {
        $validated = $request->validate([
            'insurance_company' => ['required', 'string', 'max:255'],
            'policy_number' => ['required', 'string', 'max:255'],
            'group_number' => ['nullable', 'string', 'max:255'],
            'coverage_percentage' => ['required', 'numeric', 'between:0,100'],
            'copay_amount' => ['required', 'numeric', 'min:0'],
            'deductible_amount' => ['required', 'numeric', 'min:0'],
            'deductible_met' => ['nullable', 'numeric', 'min:0'],
            'max_visits_per_year' => ['required', 'integer', 'min:1'],
            'used_visits' => ['required', 'integer', 'min:0'],
            'status' => ['required', Rule::in(['active', 'expired', 'pending_verification'])],
        ]);

        $policy->update($validated);

        return redirect()->back()->with('message', 'Insurance policy details updated.');
    }

    /**
     * Delete an insurance policy.
     */
    public function destroyPolicy(InsurancePolicy $policy)
    {
        $policy->delete();

        return redirect()->back()->with('message', 'Insurance policy removed.');
    }

    /**
     * Submit a new insurance claim.
     */
    public function storeClaim(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'insurance_policy_id' => ['required', 'exists:insurance_policies,id'],
            'invoice_id' => ['nullable', 'exists:invoices,id'],
            'claim_date' => ['required', 'date'],
            'billed_amount' => ['required', 'numeric', 'min:0.01'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $claimNumber = 'CLM-' . strtoupper(substr(uniqid(), -6));

        $claim = InsuranceClaim::create([
            'patient_id' => $validated['patient_id'],
            'insurance_policy_id' => $validated['insurance_policy_id'],
            'invoice_id' => $validated['invoice_id'] ?? null,
            'claim_number' => $claimNumber,
            'claim_date' => $validated['claim_date'],
            'billed_amount' => $validated['billed_amount'],
            'allowed_amount' => $validated['billed_amount'],
            'paid_amount' => 0.00,
            'patient_responsibility' => $validated['billed_amount'],
            'claim_status' => 'submitted',
            'notes' => $validated['notes'] ?? null,
        ]);

        // Auto-increment used visits on the associated policy if active
        $policy = InsurancePolicy::find($validated['insurance_policy_id']);
        if ($policy && $policy->status === 'active') {
            $policy->increment('used_visits');
        }

        return redirect()->back()
            ->with('message', "Claim {$claim->claim_number} submitted to {$policy->insurance_company}.");
    }

    /**
     * Update claim status and adjudication details.
     */
    public function updateClaimStatus(Request $request, InsuranceClaim $claim)
    {
        $validated = $request->validate([
            'claim_status' => ['required', Rule::in(['draft', 'submitted', 'in_review', 'approved', 'partially_paid', 'denied'])],
            'allowed_amount' => ['nullable', 'numeric', 'min:0'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'patient_responsibility' => ['nullable', 'numeric', 'min:0'],
            'denial_reason' => ['nullable', 'string', 'max:1000'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $claim->update($validated);

        return redirect()->back()->with('message', "Claim {$claim->claim_number} status updated to " . ucfirst(str_replace('_', ' ', $validated['claim_status'])));
    }

    /**
     * Delete an insurance claim.
     */
    public function destroyClaim(InsuranceClaim $claim)
    {
        $claim->delete();

        return redirect()->back()->with('message', 'Insurance claim removed.');
    }
}
