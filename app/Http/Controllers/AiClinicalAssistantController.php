<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiClinicalAssistantController extends Controller
{
    /**
     * Common Chiropractic ICD-10 Diagnostic Codes Knowledge Base.
     */
    protected array $icdKnowledgeBase = [
        [
            'code' => 'M99.01',
            'category' => 'Subluxation',
            'description' => 'Segmental and somatic dysfunction of cervical region',
            'keywords' => ['cervical', 'neck', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'subluxation', 'cervicalgia', 'occipital'],
            'clinical_justification' => 'Patient exhibits restricted cervical spine segment motion, muscle guarding, and localized tender points.',
        ],
        [
            'code' => 'M99.02',
            'category' => 'Subluxation',
            'description' => 'Segmental and somatic dysfunction of thoracic region',
            'keywords' => ['thoracic', 'mid back', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 't11', 't12', 'rhomboid', 'intercostal'],
            'clinical_justification' => 'Somatic dysfunction noted along thoracic vertebrae with postural stress and restricted spinal rotation.',
        ],
        [
            'code' => 'M99.03',
            'category' => 'Subluxation',
            'description' => 'Segmental and somatic dysfunction of lumbar region',
            'keywords' => ['lumbar', 'lower back', 'low back', 'l1', 'l2', 'l3', 'l4', 'l5', 'lumbago', 'erector spinae'],
            'clinical_justification' => 'Palpable segmental fixation in lumbar vertebrae accompanied by lumbar paraspinal hypertonicity.',
        ],
        [
            'code' => 'M99.04',
            'category' => 'Subluxation',
            'description' => 'Segmental and somatic dysfunction of sacral region',
            'keywords' => ['sacral', 'sacrum', 'sacroiliac', 'si joint', 'pelvis', 'hip', 'gluteal'],
            'clinical_justification' => 'Sacroiliac joint restriction detected on motion palpation with pelvic obliquity.',
        ],
        [
            'code' => 'M54.5',
            'category' => 'Spinal Pain',
            'description' => 'Low back pain (Lumbago)',
            'keywords' => ['low back pain', 'lower back pain', 'lumbago', 'dull ache', 'sacroiliac pain'],
            'clinical_justification' => 'Patient presents with mechanical low back pain exacerbated by prolonged sitting and bending.',
        ],
        [
            'code' => 'M54.2',
            'category' => 'Spinal Pain',
            'description' => 'Cervicalgia (Neck pain)',
            'keywords' => ['neck pain', 'cervical pain', 'trapezius', 'stiff neck'],
            'clinical_justification' => 'Cervical spinal stiffness and localized pain aggravated by head movement and desk work.',
        ],
        [
            'code' => 'M51.26',
            'category' => 'Disc Disorder',
            'description' => 'Other intervertebral disc displacement, lumbar region',
            'keywords' => ['disc displacement', 'herniation', 'bulging disc', 'sciatica', 'radiculopathy', 'disc bulge'],
            'clinical_justification' => 'Positive straight-leg raise test and MRI evidence of lumbar intervertebral disc protrusion.',
        ],
        [
            'code' => 'M54.41',
            'category' => 'Radiculopathy',
            'description' => 'Lumbago with sciatica, right side',
            'keywords' => ['sciatica', 'right leg', 'shooting pain', 'piriformis', 'nerve pain'],
            'clinical_justification' => 'Unilateral right lower extremity sharp radiation along the L5/S1 dermatome distribution.',
        ],
        [
            'code' => 'M62.830',
            'category' => 'Musculoskeletal',
            'description' => 'Muscle spasm of back',
            'keywords' => ['spasm', 'tightness', 'muscle spasm', 'stiffness', 'hypertonicity', 'trigger points'],
            'clinical_justification' => 'Palpable trigger points and acute paraspinal muscle spasms noted during objective physical palpation.',
        ],
    ];

    /**
     * Display AI Clinical Assistant Hub.
     */
    public function index(Request $request): Response
    {
        $patientId = $request->input('patient_id');
        $recordId = $request->input('medical_record_id');

        $patients = Patient::where('status', 'active')->get(['id', 'first_name', 'last_name', 'email']);
        $selectedPatient = $patientId ? Patient::with('medicalRecords')->find($patientId) : null;
        $selectedRecord = $recordId ? MedicalRecord::find($recordId) : null;

        return Inertia::render('AiAssistant/Index', [
            'patients' => $patients,
            'selectedPatient' => $selectedPatient,
            'selectedRecord' => $selectedRecord,
            'icdCodes' => $this->icdKnowledgeBase,
        ]);
    }

    /**
     * Generate SOAP Notes Clinical Summary.
     */
    public function summarizeSoap(Request $request)
    {
        $validated = $request->validate([
            'subjective' => ['nullable', 'string'],
            'objective' => ['nullable', 'string'],
            'assessment' => ['nullable', 'string'],
            'plan' => ['nullable', 'string'],
            'pain_level' => ['nullable', 'integer'],
        ]);

        $subjective = $validated['subjective'] ?? 'Patient presents for routine chiropractic assessment.';
        $objective = $validated['objective'] ?? 'Palpation reveals spinal segmental fixations.';
        $assessment = $validated['assessment'] ?? 'Spinal subluxation complex with muscular tension.';
        $plan = $validated['plan'] ?? 'High-velocity low-amplitude manual spinal adjustment.';

        $summary = "Clinical SOAP Summary:\n\n" .
            "• Subjective Highlights: " . (strlen($subjective) > 140 ? substr($subjective, 0, 140) . '...' : $subjective) . "\n" .
            "• Objective Physical Findings: " . (strlen($objective) > 140 ? substr($objective, 0, 140) . '...' : $objective) . "\n" .
            "• Clinical Diagnosis: " . (strlen($assessment) > 140 ? substr($assessment, 0, 140) . '...' : $assessment) . "\n" .
            "• Prescribed Treatment Plan: " . (strlen($plan) > 140 ? substr($plan, 0, 140) . '...' : $plan);

        $takeaways = [
            "Primary Chief Complaint: " . ($validated['subjective'] ? 'Documented in Subjective notes' : 'Spinal stiffness / Pain'),
            "Pain Intensity Rating: " . ($validated['pain_level'] ?? 5) . " / 10",
            "Recommended Action: Proceed with prescribed chiropractic adjustments and document patient response.",
        ];

        return response()->json([
            'summary' => $summary,
            'takeaways' => $takeaways,
            'disclaimer' => 'AI Clinical Assistant decision-support output. Always review and verify prior to signing medical charts.',
        ]);
    }

    /**
     * Suggest ICD-10 Diagnostic Codes based on clinical text.
     */
    public function suggestIcd(Request $request)
    {
        $validated = $request->validate([
            'text' => ['required', 'string'],
        ]);

        $textLower = strtolower($validated['text']);
        $matches = [];

        foreach ($this->icdKnowledgeBase as $item) {
            $score = 0;
            foreach ($item['keywords'] as $keyword) {
                if (str_contains($textLower, strtolower($keyword))) {
                    $score += 2;
                }
            }

            if ($score > 0 || str_contains($textLower, 'spine') || str_contains($textLower, 'pain')) {
                $matches[] = array_merge($item, ['confidence' => min(95, 60 + $score * 10)]);
            }
        }

        // Sort matches by confidence score
        usort($matches, fn($a, $b) => $b['confidence'] <=> $a['confidence']);

        if (empty($matches)) {
            $matches = array_slice($this->icdKnowledgeBase, 0, 3);
        }

        return response()->json([
            'suggested_codes' => array_slice($matches, 0, 4),
            'disclaimer' => 'AI suggestions are provided for diagnostic reference only and must be confirmed by the clinician.',
        ]);
    }

    /**
     * Draft Multi-Phase Chiropractic Treatment Plan.
     */
    public function draftPlan(Request $request)
    {
        $validated = $request->validate([
            'chief_complaint' => ['required', 'string'],
            'severity' => ['nullable', 'string'],
            'patient_goal' => ['nullable', 'string'],
        ]);

        $complaint = $validated['chief_complaint'];

        $planDraft = [
            'title' => "Custom Care Plan for {$complaint}",
            'total_weeks' => 8,
            'total_sessions' => 16,
            'frequency' => '2 sessions / week for 4 weeks, then 1 session / week for 4 weeks',
            'phases' => [
                [
                    'phase_number' => 1,
                    'name' => 'Phase 1: Acute Pain Relief & Inflammatory Control (Weeks 1-2)',
                    'goals' => 'Reduce acute pain, alleviate muscular spasms, restore basic segment mobility.',
                    'interventions' => ['Gentle manual spinal adjustments', 'Cryotherapy', 'Soft tissue myofascial release'],
                ],
                [
                    'phase_number' => 2,
                    'name' => 'Phase 2: Corrective Realignment & Stabilization (Weeks 3-5)',
                    'goals' => 'Correct vertebral subluxations, improve posture alignment, strengthen core stabilizers.',
                    'interventions' => ['Precision HVLA adjustments', 'Lumbar/cervical decompression therapy', 'Pelvic stabilization exercises'],
                ],
                [
                    'phase_number' => 3,
                    'name' => 'Phase 3: Functional Rehabilitation & Maintenance (Weeks 6-8)',
                    'goals' => 'Restore full spinal range of motion, prevent recurrence, transition to wellness care.',
                    'interventions' => ['Maintenance adjustments', 'Ergonomic posture instruction', 'Home strengthening program'],
                ],
            ],
            'home_care_instructions' => [
                'Perform daily cervical/lumbar chin tucks and pelvic tilts (3 sets of 10 reps).',
                'Apply ice pack to sore regions for 15 minutes after physical activity.',
                'Maintain proper ergonomic posture when sitting at desk.',
            ],
        ];

        return response()->json([
            'plan_draft' => $planDraft,
            'disclaimer' => 'AI Draft Plan is a recommendation template. Customize according to patient clinical presentation.',
        ]);
    }

    /**
     * Generate Patient Visit Summary Statement.
     */
    public function generateVisitSummary(Request $request)
    {
        $validated = $request->validate([
            'patient_name' => ['required', 'string'],
            'visit_date' => ['required', 'date'],
            'treatment_provided' => ['required', 'string'],
            'next_steps' => ['nullable', 'string'],
        ]);

        $name = $validated['patient_name'];
        $date = date('F j, Y', strtotime($validated['visit_date']));
        $treatment = $validated['treatment_provided'];
        $next = $validated['next_steps'] ?? 'Continue prescribed home stretches and attend scheduled follow-up.';

        $visitSummary = "PATIENT CLINICAL VISIT SUMMARY\n\n" .
            "Patient: {$name}\n" .
            "Date of Visit: {$date}\n\n" .
            "Summary of Care Provided:\n" .
            "Today's clinical session included {$treatment}. Patient tolerated treatment well with reported post-adjustment ease.\n\n" .
            "Home Care & Recommendations:\n" .
            "• {$next}\n" .
            "• Stay well-hydrated to support muscle recovery.\n" .
            "• Avoid strenuous heavy lifting over the next 24 hours.\n\n" .
            "Thank you for choosing our Chiropractic Care Center for your spinal health!";

        return response()->json([
            'visit_summary' => $visitSummary,
            'disclaimer' => 'Patient summary statement generated by AI Clinical Assistant. Review before issuing to patient.',
        ]);
    }
}
