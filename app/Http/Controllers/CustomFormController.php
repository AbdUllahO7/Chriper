<?php

namespace App\Http\Controllers;

use App\Models\CustomForm;
use App\Models\CustomFormSubmission;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CustomFormController extends Controller
{
    /**
     * Pre-built Starter Intake Form Templates.
     */
    protected array $starterTemplates = [
        [
            'title' => 'Initial Chiropractic Health Intake',
            'description' => 'Comprehensive initial health history, chief complaints, and spine assessment questionnaire.',
            'fields' => [
                [
                    'id' => 'field_chief_complaint',
                    'label' => 'What is your primary reason for visiting our chiropractic clinic today?',
                    'type' => 'textarea',
                    'required' => true,
                    'placeholder' => 'Describe your symptoms, pain location, and how long you have experienced them...',
                    'help_text' => 'Include any specific movements or activities that worsen the pain.',
                ],
                [
                    'id' => 'field_pain_severity',
                    'label' => 'Current Pain Severity Level (1 - 10 Scale)',
                    'type' => 'number',
                    'required' => true,
                    'placeholder' => '1 = Mild Discomfort, 10 = Severe Unbearable Pain',
                    'help_text' => 'Enter a number between 1 and 10.',
                ],
                [
                    'id' => 'field_pain_frequency',
                    'label' => 'How frequently do you experience this pain?',
                    'type' => 'select',
                    'options' => ['Constant (76% - 100% of the day)', 'Frequent (51% - 75% of the day)', 'Occasional (26% - 50% of the day)', 'Intermittent (0% - 25% of the day)'],
                    'required' => true,
                ],
                [
                    'id' => 'field_prior_care',
                    'label' => 'Have you previously seen a Chiropractor, Physical Therapist, or Orthopedist?',
                    'type' => 'radio',
                    'options' => ['Yes, previously treated', 'No, this is my first chiropractic visit'],
                    'required' => true,
                ],
                [
                    'id' => 'field_symptoms_list',
                    'label' => 'Check all accompanying symptoms that apply:',
                    'type' => 'checkbox',
                    'options' => ['Numbness or Tingling', 'Muscle Spasms / Stiffness', 'Headaches / Migraines', 'Radiation down Arms or Legs', 'Lower Back Tightness', 'Difficulty Sleeping'],
                    'required' => false,
                ],
            ],
        ],
        [
            'title' => 'Spinal Pain & Functional Disability Assessment',
            'description' => 'Oswestry Low Back Disability and Neck Disability Index assessment for progress tracking.',
            'fields' => [
                [
                    'id' => 'field_pain_location',
                    'label' => 'Specific Spine Area Affected',
                    'type' => 'select',
                    'options' => ['Cervical Spine (Neck)', 'Thoracic Spine (Mid Back)', 'Lumbar Spine (Lower Back)', 'Sacroiliac (SI Joint & Pelvis)', 'Full Spine / Multiple Areas'],
                    'required' => true,
                ],
                [
                    'id' => 'field_daily_impact',
                    'label' => 'How does your spine pain affect daily activities (lifting, walking, sitting)?',
                    'type' => 'textarea',
                    'required' => true,
                    'placeholder' => 'Describe difficulty with work, sitting at computer, sleeping, or exercise...',
                ],
                [
                    'id' => 'field_onset_trigger',
                    'label' => 'Did a specific event trigger this episode?',
                    'type' => 'radio',
                    'options' => ['Work Incident', 'Auto Collision / Sudden Trauma', 'Sports or Physical Training', 'Gradual Onset over Time', 'Woke Up with Stiffness'],
                    'required' => true,
                ],
            ],
        ],
    ];

    /**
     * Display Custom Forms Builder Dashboard & Forms List.
     */
    public function index(Request $request): Response
    {
        // Seed default starter templates if no forms exist
        if (CustomForm::count() === 0) {
            foreach ($this->starterTemplates as $tpl) {
                CustomForm::create([
                    'title' => $tpl['title'],
                    'description' => $tpl['description'],
                    'fields' => $tpl['fields'],
                    'status' => 'published',
                    'is_active' => true,
                    'created_by_user_id' => $request->user()->id ?? null,
                ]);
            }
        }

        $forms = CustomForm::withCount('submissions')
            ->latest()
            ->get();

        $submissionsCount = CustomFormSubmission::count();
        $publishedCount = $forms->where('status', 'published')->count();
        $draftCount = $forms->where('status', 'draft')->count();

        return Inertia::render('CustomForms/Index', [
            'forms' => $forms,
            'metrics' => [
                'total_forms' => $forms->count(),
                'published_count' => $publishedCount,
                'draft_count' => $draftCount,
                'total_submissions' => $submissionsCount,
            ],
            'starterTemplates' => $this->starterTemplates,
        ]);
    }

    /**
     * Store a newly created custom form or clone a template.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'fields' => ['required', 'array', 'min:1'],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
        ]);

        $validated['created_by_user_id'] = $request->user()->id ?? null;
        $form = CustomForm::create($validated);

        return redirect()->route('custom-forms.builder', $form->id)
            ->with('message', "Custom form '{$form->title}' created successfully.");
    }

    /**
     * Display the No-Code Visual Form Builder canvas.
     */
    public function builder(CustomForm $form): Response
    {
        return Inertia::render('CustomForms/Builder', [
            'form' => $form,
        ]);
    }

    /**
     * Update custom form title, description, fields schema, and status.
     */
    public function update(Request $request, CustomForm $form)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'fields' => ['required', 'array', 'min:1'],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'is_active' => ['boolean'],
        ]);

        $form->update($validated);

        return redirect()->back()->with('message', "Form '{$form->title}' saved successfully.");
    }

    /**
     * One-click duplicate/clone a form template.
     */
    public function duplicate(CustomForm $form)
    {
        $cloned = CustomForm::create([
            'title' => "{$form->title} (Copy)",
            'description' => $form->description,
            'fields' => $form->fields,
            'status' => 'draft',
            'is_active' => true,
            'created_by_user_id' => auth()->id(),
        ]);

        return redirect()->route('custom-forms.builder', $cloned->id)
            ->with('message', "Cloned '{$form->title}' into a new draft.");
    }

    /**
     * Delete custom form.
     */
    public function destroy(CustomForm $form)
    {
        $title = $form->title;
        $form->delete();

        return redirect()->route('custom-forms.index')
            ->with('message', "Form '{$title}' deleted.");
    }

    /**
     * Patient-Facing Public Intake Form View.
     */
    public function publicShow(CustomForm $form): Response
    {
        if ($form->status !== 'published' || !$form->is_active) {
            abort(404, 'This intake form is currently not active.');
        }

        $patients = Patient::all(['id', 'first_name', 'last_name', 'email']);

        return Inertia::render('CustomForms/PublicIntake', [
            'form' => $form,
            'patients' => $patients,
        ]);
    }

    /**
     * Process dynamic intake form response submission.
     */
    public function publicSubmit(Request $request, CustomForm $form)
    {
        $validated = $request->validate([
            'patient_id' => ['nullable', 'exists:patients,id'],
            'submitted_by_name' => ['required', 'string', 'max:255'],
            'submitted_by_email' => ['nullable', 'email', 'max:255'],
            'response_data' => ['required', 'array'],
        ]);

        CustomFormSubmission::create([
            'custom_form_id' => $form->id,
            'patient_id' => $validated['patient_id'] ?? null,
            'submitted_by_name' => $validated['submitted_by_name'],
            'submitted_by_email' => $validated['submitted_by_email'] ?? null,
            'response_data' => $validated['response_data'],
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        return redirect()->back()->with('message', 'Thank you! Your intake form response has been submitted to the clinic.');
    }

    /**
     * Clinical Submissions Review Dashboard.
     */
    public function submissions(Request $request): Response
    {
        $formId = $request->input('custom_form_id');
        $patientId = $request->input('patient_id');

        $submissions = CustomFormSubmission::with(['form', 'patient'])
            ->when($formId, fn($q) => $q->where('custom_form_id', $formId))
            ->when($patientId, fn($q) => $q->where('patient_id', $patientId))
            ->latest('submitted_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('CustomForms/Submissions', [
            'submissions' => $submissions,
            'forms' => CustomForm::all(['id', 'title']),
            'patients' => Patient::all(['id', 'first_name', 'last_name']),
            'filters' => [
                'custom_form_id' => $formId ?? '',
                'patient_id' => $patientId ?? '',
            ],
        ]);
    }
}
