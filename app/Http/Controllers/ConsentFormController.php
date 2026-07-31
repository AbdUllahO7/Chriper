<?php

namespace App\Http\Controllers;

use App\Models\ConsentForm;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ConsentFormController extends Controller
{
    /**
     * Default legal templates for chiropractic digital consent forms.
     */
    public static array $templates = [
        'initial_consent' => [
            'title' => 'Initial Chiropractic Care & Examination Informed Consent',
            'content' => "I hereby request and consent to the performance of chiropractic examinations, spinal manipulations/adjustments, physical therapy procedures, and diagnostic X-rays on me (or on the patient named below, for whom I am legally responsible) by the licensed doctors of chiropractic at this facility.\n\nI understand that, as in the practice of medicine, in the practice of chiropractic there are risks to treatment, including but not limited to fractures, disc injuries, strokes, dislocation, and sprains. I do not expect the doctor to be able to anticipate and explain all risks and complications. I wish to rely on the doctor to exercise clinical judgment during the course of the procedure which the doctor feels at the time, based upon the facts then known, is in my best interest.\n\nI have read, or have had read to me, the above consent. I have also had an opportunity to ask questions about its content. By signing below, I agree to the treatment prescribed.",
        ],
        'privacy_policy' => [
            'title' => 'HIPAA Notice of Privacy Practices & Patient Data Authorization',
            'content' => "This Notice describes how medical information about you may be used and disclosed and how you can get access to this information. Please review it carefully.\n\nWe are required by law to maintain the privacy of protected health information (PHI) and to provide individuals with notice of our legal duties and privacy practices with respect to PHI. We reserve the right to change our privacy practices and the terms of this Notice at any time.\n\nYou have the right to request restrictions on certain uses and disclosures of your health information, inspect and copy your records, and receive an accounting of disclosures. By electronically signing below, you acknowledge receipt of our HIPAA Notice of Privacy Practices and authorize data sharing for treatment and billing purposes.",
        ],
        'treatment_consent' => [
            'title' => 'Spinal Adjustment & Decompression Therapy Authorization',
            'content' => "I authorize the attending doctor of chiropractic to perform spinal decompression therapy, manual chiropractic manipulation, thermal therapy, and rehabilitative exercises as part of my prescribed clinical treatment plan.\n\nI acknowledge that results cannot be guaranteed and that full compliance with home exercises and posture recommendations is required for optimal recovery. I agree to inform the clinical team immediately if I experience any unexpected discomfort or changes in symptoms.\n\nBy signing below, I voluntarily grant authorization for this therapeutic care program.",
        ],
    ];

    /**
     * Display a listing of digital consent forms.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $patientId = $request->input('patient_id');
        $status = $request->input('status');

        $consentForms = ConsentForm::with('patient')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($pq) use ($search) {
                          $pq->where('first_name', 'like', "%{$search}%")
                             ->orWhere('last_name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($patientId, function ($query, $patientId) {
                $query->where('patient_id', $patientId);
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $patients = Patient::where('status', 'active')->get(['id', 'first_name', 'last_name', 'email']);

        return Inertia::render('ConsentForms/Index', [
            'consentForms' => $consentForms,
            'patients' => $patients,
            'templates' => self::$templates,
            'filters' => [
                'search' => $search ?? '',
                'patient_id' => $patientId ?? '',
                'status' => $status ?? '',
            ],
        ]);
    }

    /**
     * Display detailed consent document & interactive signature interface.
     */
    public function show(ConsentForm $consentForm): Response
    {
        $consentForm->load('patient');

        return Inertia::render('ConsentForms/Show', [
            'consentForm' => $consentForm,
        ]);
    }

    /**
     * Issue a new consent form to a patient using template or custom text.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'form_type' => ['required', 'in:initial_consent,privacy_policy,treatment_consent,custom'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
        ]);

        $form = ConsentForm::create([
            'patient_id' => $validated['patient_id'],
            'form_type' => $validated['form_type'],
            'title' => $validated['title'],
            'content' => $validated['content'],
            'status' => 'pending',
        ]);

        return redirect()->route('consent-forms.show', $form->id)
            ->with('message', 'Digital Consent Form issued successfully.');
    }

    /**
     * Record electronic signature submission for a consent form.
     */
    public function sign(Request $request, ConsentForm $consentForm)
    {
        $validated = $request->validate([
            'signer_name' => ['required', 'string', 'max:255'],
            'signature_data' => ['required', 'string'], // Base64 data URL png
        ]);

        $base64Image = $validated['signature_data'];
        $signaturePath = null;

        // Process Base64 PNG signature image and save to public disk
        if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
            $data = substr($base64Image, strpos($base64Image, ',') + 1);
            $data = base64_decode($data);

            if ($data !== false) {
                $filename = 'signatures/sig_' . $consentForm->id . '_' . time() . '.png';
                Storage::disk('public')->put($filename, $data);
                $signaturePath = $filename;
            }
        }

        $consentForm->update([
            'signer_name' => $validated['signer_name'],
            'signature_data' => $base64Image,
            'signature_path' => $signaturePath,
            'signed_at' => now(),
            'ip_address' => $request->ip(),
            'status' => 'signed',
        ]);

        return redirect()->back()->with('message', 'Electronic signature recorded and verified.');
    }

    /**
     * Delete a consent form.
     */
    public function destroy(ConsentForm $consentForm)
    {
        if ($consentForm->signature_path) {
            Storage::disk('public')->delete($consentForm->signature_path);
        }

        $consentForm->delete();

        return redirect()->route('consent-forms.index')
            ->with('message', 'Consent form removed.');
    }
}
