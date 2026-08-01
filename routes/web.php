<?php

use App\Http\Controllers\AiClinicalAssistantController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\ClinicSettingController;
use App\Http\Controllers\ConsentFormController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\MedicalImageController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TreatmentPlanController;
use App\Http\Controllers\TreatmentSessionController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureHasRole;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth'])->group(function () {
    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Patient Module Routes
    Route::resource('patients', PatientController::class);

    // Doctor Management Routes (Chiropractor Module)
    Route::resource('doctors', DoctorController::class);
    Route::patch('doctors/{doctor}/toggle-availability', [DoctorController::class, 'toggleAvailability'])
        ->name('doctors.toggle-availability');

    // Appointment Scheduling & Online Booking Module Routes
    Route::get('/booking', [AppointmentController::class, 'bookingPortal'])->name('booking.portal');
    Route::get('/appointments/available-slots', [AppointmentController::class, 'availableSlots'])->name('appointments.available-slots');
    Route::resource('appointments', AppointmentController::class);
    Route::patch('appointments/{appointment}/reschedule', [AppointmentController::class, 'reschedule'])
        ->name('appointments.reschedule');
    Route::post('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel'])
        ->name('appointments.cancel');

    // Medical Records Module Routes
    Route::resource('medical-records', MedicalRecordController::class);

    // Diagnostic Radiology & Medical Imaging Routes (X-Ray, MRI, CT Scan)
    Route::get('medical-images/compare', [MedicalImageController::class, 'compare'])->name('medical-images.compare');
    Route::resource('medical-images', MedicalImageController::class);

    // Treatment Sessions Module Routes
    Route::resource('treatment-sessions', TreatmentSessionController::class);

    // Treatment Plans Module Routes (Prescribed Multi-Session Plans)
    Route::resource('treatment-plans', TreatmentPlanController::class);
    Route::post('treatment-plans/{treatment_plan}/sessions/{session_number}/toggle', [TreatmentPlanController::class, 'toggleSession'])
        ->name('treatment-plans.toggle-session');

    // Digital Consent Forms Module Routes (E-Signatures)
    Route::resource('consent-forms', ConsentFormController::class);
    Route::post('consent-forms/{consent_form}/sign', [ConsentFormController::class, 'sign'])
        ->name('consent-forms.sign');

    // Billing & Invoices Module Routes
    Route::get('/billing', [BillingController::class, 'index'])->name('billing.index');
    Route::post('/invoices', [BillingController::class, 'storeInvoice'])->name('invoices.store');
    Route::get('/invoices/{invoice}', [BillingController::class, 'showInvoice'])->name('invoices.show');
    Route::delete('/invoices/{invoice}', [BillingController::class, 'destroyInvoice'])->name('invoices.destroy');
    Route::post('/invoices/{invoice}/record-payment', [BillingController::class, 'recordPayment'])->name('invoices.record-payment');

    // Analytics & Reports Module Routes
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export/csv', [ReportController::class, 'exportCsv'])->name('reports.export.csv');
    Route::get('/reports/export/pdf', [ReportController::class, 'exportPdf'])->name('reports.export.pdf');

    // Notifications Module Routes
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/send-reminder', [NotificationController::class, 'sendManualReminder'])->name('notifications.send-reminder');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::patch('/notifications/{notification}/mark-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Clinic Settings Module Routes
    Route::get('/settings', [ClinicSettingController::class, 'edit'])->name('settings.edit');
    Route::post('/settings', [ClinicSettingController::class, 'update'])->name('settings.update');

    // AI Clinical Assistant Module Routes
    Route::get('/ai-assistant', [AiClinicalAssistantController::class, 'index'])->name('ai-assistant.index');
    Route::post('/ai-assistant/summarize-soap', [AiClinicalAssistantController::class, 'summarizeSoap'])->name('ai-assistant.summarize-soap');
    Route::post('/ai-assistant/suggest-icd', [AiClinicalAssistantController::class, 'suggestIcd'])->name('ai-assistant.suggest-icd');
    Route::post('/ai-assistant/draft-plan', [AiClinicalAssistantController::class, 'draftPlan'])->name('ai-assistant.draft-plan');
    Route::post('/ai-assistant/visit-summary', [AiClinicalAssistantController::class, 'generateVisitSummary'])->name('ai-assistant.visit-summary');

    // Admin User Management Routes
    Route::middleware(EnsureHasRole::class . ':admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });
});

require __DIR__.'/auth.php';
