<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $notificationData = ['unreadCount' => 0, 'latest' => []];

        if ($user) {
            try {
                if (Schema::hasTable('notifications')) {
                    $notificationData = [
                        'unreadCount' => \App\Models\Notification::whereNull('read_at')->count(),
                        'latest' => \App\Models\Notification::with('patient')
                            ->whereNull('read_at')
                            ->latest('scheduled_at')
                            ->take(5)
                            ->get(),
                    ];
                }
            } catch (\Throwable $e) {
                $notificationData = ['unreadCount' => 0, 'latest' => []];
            }
        }

        $branchesData = [];
        $activeBranchId = session('active_branch_id', 'all');

        if ($user) {
            try {
                if (Schema::hasTable('clinic_branches')) {
                    $branchesData = \App\Models\ClinicBranch::where('is_active', true)
                        ->get(['id', 'name', 'code', 'is_main_branch']);
                }
            } catch (\Throwable $e) {
                $branchesData = [];
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'receptionist',
                    'permissions' => $user->permissions ?? [],
                    'email_verified_at' => $user->email_verified_at,
                ] : null,
            ],
            'notifications' => $user ? $notificationData : null,
            'clinicBranches' => $branchesData,
            'activeBranchId' => $activeBranchId,
        ];
    }
}
