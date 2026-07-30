<?php

namespace App\Http\Controllers;

use App\Models\ClinicSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ClinicSettingController extends Controller
{
    /**
     * Display clinic settings manager UI.
     */
    public function edit(): Response
    {
        $settings = ClinicSetting::current();

        $currencies = [
            ['code' => 'USD', 'symbol' => '$', 'name' => 'US Dollar ($)'],
            ['code' => 'EUR', 'symbol' => '€', 'name' => 'Euro (€)'],
            ['code' => 'GBP', 'symbol' => '£', 'name' => 'British Pound (£)'],
            ['code' => 'CAD', 'symbol' => '$', 'name' => 'Canadian Dollar ($)'],
            ['code' => 'AUD', 'symbol' => '$', 'name' => 'Australian Dollar ($)'],
            ['code' => 'SAR', 'symbol' => 'ر.س', 'name' => 'Saudi Riyal (ر.س)'],
            ['code' => 'AED', 'symbol' => 'د.إ', 'name' => 'UAE Dirham (د.إ)'],
        ];

        return Inertia::render('Settings/Edit', [
            'settings' => $settings,
            'currencies' => $currencies,
        ]);
    }

    /**
     * Update clinic configuration settings & logo.
     */
    public function update(Request $request)
    {
        $settings = ClinicSetting::current();

        $validated = $request->validate([
            'clinic_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'working_hours' => ['required', 'string', 'max:255'],
            'currency_code' => ['required', 'string', 'max:10'],
            'currency_symbol' => ['required', 'string', 'max:10'],
            'tax_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'services' => ['nullable', 'array'],
            'services.*.name' => ['required', 'string', 'max:255'],
            'services.*.category' => ['nullable', 'string', 'max:100'],
            'services.*.price' => ['required', 'numeric', 'min:0'],
            'services.*.duration_minutes' => ['required', 'integer', 'min:5'],
        ]);

        if ($request->hasFile('logo')) {
            if ($settings->logo_path) {
                Storage::disk('public')->delete($settings->logo_path);
            }
            $validated['logo_path'] = $request->file('logo')->store('clinic_logos', 'public');
        }

        unset($validated['logo']);

        $settings->update($validated);

        return redirect()->back()->with('message', 'Clinic settings updated successfully.');
    }
}
