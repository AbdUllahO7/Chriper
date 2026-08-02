<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReferralController extends Controller
{
    /**
     * Referral Channels List
     */
    protected array $sources = [
        'doctor' => 'Medical Doctor / Specialist',
        'friend' => 'Friend / Family (Existing Patient)',
        'social_media' => 'Social Media (Instagram, Facebook, TikTok)',
        'google_search' => 'Google Search / Maps',
        'walk_in' => 'Walk-In / Signage',
        'advertisement' => 'Local Print / Radio Ad',
        'other' => 'Other / Events',
    ];

    /**
     * Display Referral Tracking & Analytics Dashboard.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $sourceFilter = $request->input('referral_source');

        // Seed sample referral data for existing patients if all are default walk_in
        $patients = Patient::all();
        if ($patients->count() > 0 && $patients->where('referral_source', '!=', 'walk_in')->count() === 0) {
            $sampleReferrers = [
                ['source' => 'doctor', 'name' => 'Dr. Sarah Jenkins (Orthopedist)'],
                ['source' => 'doctor', 'name' => 'Dr. Michael Chang (Neurologist)'],
                ['source' => 'friend', 'name' => 'John Doe (Existing Patient)'],
                ['source' => 'social_media', 'name' => 'Instagram @ChiroClinicPage'],
                ['source' => 'google_search', 'name' => 'Google Maps Review'],
                ['source' => 'friend', 'name' => 'Emma Watson (Existing Patient)'],
            ];

            foreach ($patients as $idx => $p) {
                if (isset($sampleReferrers[$idx])) {
                    $p->update([
                        'referral_source' => $sampleReferrers[$idx]['source'],
                        'referred_by_name' => $sampleReferrers[$idx]['name'],
                    ]);
                }
            }
        }

        $totalPatients = Patient::count();
        $referredPatientsCount = Patient::where('referral_source', '!=', 'walk_in')->count();
        $referralRate = $totalPatients > 0 ? round(($referredPatientsCount / $totalPatients) * 100, 1) : 0;

        // Total revenue generated from referred patients
        $referredPatientIds = Patient::where('referral_source', '!=', 'walk_in')->pluck('id');
        $revenueFromReferrals = Invoice::whereIn('patient_id', $referredPatientIds)->sum('total_amount');

        // Referral Source Breakdown Statistics
        $sourceStats = [];
        foreach (array_keys($this->sources) as $srcKey) {
            $count = Patient::where('referral_source', $srcKey)->count();
            $pct = $totalPatients > 0 ? round(($count / $totalPatients) * 100, 1) : 0;
            $sourceStats[] = [
                'key' => $srcKey,
                'label' => $this->sources[$srcKey],
                'count' => $count,
                'percentage' => $pct,
            ];
        }

        // Sort source stats by count descending
        usort($sourceStats, fn($a, $b) => $b['count'] <=> $a['count']);
        $topSourceLabel = $sourceStats[0]['label'] ?? 'Walk-In';

        // Top Referrer Champions Leaderboard (Doctors & Existing Patients)
        $championsGrouped = Patient::whereNotNull('referred_by_name')
            ->where('referred_by_name', '!=', '')
            ->get()
            ->groupBy('referred_by_name');

        $topReferrers = [];
        foreach ($championsGrouped as $referrerName => $patientGroup) {
            $count = $patientGroup->count();
            $patientIds = $patientGroup->pluck('id');
            $revenue = Invoice::whereIn('patient_id', $patientIds)->sum('total_amount');
            $sampleSource = $patientGroup->first()->referral_source;

            $topReferrers[] = [
                'name' => $referrerName,
                'source' => $sampleSource,
                'count' => $count,
                'revenue' => (float) $revenue,
            ];
        }

        usort($topReferrers, fn($a, $b) => $b['count'] <=> $a['count']);
        $topReferrers = array_slice($topReferrers, 0, 5);

        // Filtered Patient Referrals List
        $referralRegistry = Patient::with(['referredByPatient', 'invoices'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('referred_by_name', 'like', "%{$search}%");
                });
            })
            ->when($sourceFilter, function ($query, $sourceFilter) {
                $query->where('referral_source', $sourceFilter);
            })
            ->latest('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Referrals/Index', [
            'metrics' => [
                'total_patients' => $totalPatients,
                'total_referrals' => $referredPatientsCount,
                'referral_rate' => $referralRate,
                'top_source' => $topSourceLabel,
                'revenue_from_referrals' => (float) $revenueFromReferrals,
            ],
            'sourceStats' => $sourceStats,
            'topReferrers' => $topReferrers,
            'referralRegistry' => $referralRegistry,
            'patientsList' => Patient::all(['id', 'first_name', 'last_name']),
            'sources' => $this->sources,
            'filters' => [
                'search' => $search ?? '',
                'referral_source' => $sourceFilter ?? '',
            ],
        ]);
    }

    /**
     * Update referral details for a patient.
     */
    public function updatePatientReferral(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'referral_source' => ['required', Rule::in(['doctor', 'friend', 'social_media', 'google_search', 'walk_in', 'advertisement', 'other'])],
            'referred_by_name' => ['nullable', 'string', 'max:255'],
            'referred_by_patient_id' => ['nullable', 'exists:patients,id'],
            'referral_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $patient->update($validated);

        return redirect()->back()->with('message', "Referral source updated for {$patient->full_name}.");
    }
}
