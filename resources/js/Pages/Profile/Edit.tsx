import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const user = usePage().props.auth.user;

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                    Profile & <span className="gradient-text">Role Settings</span>
                </h1>
            }
        >
            <Head title="Profile" />

            <div className="space-y-8 max-w-4xl mx-auto">
                {/* Role & Permissions Card */}
                <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white">Assigned Role & Permissions</h3>
                            <p className="text-xs text-gray-400">Your role governs your access rights across the platform.</p>
                        </div>
                        <span className="px-4 py-1.5 text-xs font-extrabold uppercase rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {user.role}
                        </span>
                    </div>

                    <div className="pt-2">
                        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                            Active Permissions ({user.permissions.length}):
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {user.permissions.map((perm) => (
                                <span
                                    key={perm}
                                    className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 text-xs font-mono border border-purple-500/20"
                                >
                                    ✓ {perm}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl text-gray-200"
                    />
                </div>

                <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
                    <UpdatePasswordForm className="max-w-xl text-gray-200" />
                </div>

                <div className="glass-card rounded-3xl p-6 sm:p-8 border border-red-500/20 shadow-2xl">
                    <DeleteUserForm className="max-w-xl text-gray-200" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
