import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const isClinicalActive =
        route().current('medical-records.*') || route().current('treatment-sessions.*');

    return (
        <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans selection:bg-purple-500 selection:text-white">
            {/* Top Navigation Bar */}
            <nav className="glass-nav sticky top-0 z-50 border-b border-white/10 shadow-2xl backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        {/* Left Logo */}
                        <div className="flex items-center gap-6 shrink-0">
                            <Link href="/" className="hover:opacity-90 transition-opacity">
                                <ApplicationLogo />
                            </Link>

                            {/* Main Desktop Navigation Items */}
                            <div className="hidden lg:flex items-center gap-1.5">
                                <Link
                                    href={route('dashboard')}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        route().current('dashboard')
                                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span>📊</span>
                                    <span>Dashboard</span>
                                </Link>

                                <Link
                                    href={route('appointments.index')}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        route().current('appointments.*')
                                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span>📅</span>
                                    <span>Appointments</span>
                                </Link>

                                <Link
                                    href={route('patients.index')}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        route().current('patients.*')
                                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span>👥</span>
                                    <span>Patients</span>
                                </Link>

                                <Link
                                    href={route('doctors.index')}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        route().current('doctors.*')
                                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span>🩺</span>
                                    <span>Doctors</span>
                                </Link>

                                {/* Clinical Group Dropdown (Medical Records & Treatment Sessions) */}
                                <div className="relative">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                    isClinicalActive
                                                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                                                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                                                }`}
                                            >
                                                <span>📋</span>
                                                <span>Clinical Care</span>
                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content>
                                            <Dropdown.Link href={route('medical-records.index')} className="flex items-center gap-2">
                                                <span>🩺 Medical Records (SOAP)</span>
                                            </Dropdown.Link>
                                            <Dropdown.Link href={route('medical-images.index')} className="flex items-center gap-2">
                                                <span>🩻 X-Ray & MRI Viewer</span>
                                            </Dropdown.Link>
                                            <Dropdown.Link href={route('consent-forms.index')} className="flex items-center gap-2">
                                                <span>✍️ Consent Forms (E-Sign)</span>
                                            </Dropdown.Link>
                                            <Dropdown.Link href={route('treatment-plans.index')} className="flex items-center gap-2">
                                                <span>📋 Treatment Plans</span>
                                            </Dropdown.Link>
                                            <Dropdown.Link href={route('treatment-sessions.index')} className="flex items-center gap-2">
                                                <span>🦴 Treatment Sessions</span>
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>

                                <Link
                                    href={route('billing.index')}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        route().current('billing.*') || route().current('invoices.*')
                                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span>💳</span>
                                    <span>Billing</span>
                                </Link>

                                <Link
                                    href={route('reports.index')}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        route().current('reports.*')
                                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span>📈</span>
                                    <span>Reports</span>
                                </Link>

                                <Link
                                    href={route('ai-assistant.index')}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        route().current('ai-assistant.*')
                                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span>✨</span>
                                    <span>AI Assistant</span>
                                </Link>


                                {user.role === 'admin' && (
                                    <Link
                                        href={route('admin.users.index')}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            route().current('admin.users.*')
                                                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                                                : 'text-gray-300 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <span>⚙️</span>
                                        <span>Users</span>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Right Quick Actions, Notifications & User Profile Menu */}
                        <div className="hidden lg:flex lg:items-center lg:gap-3">
                            {/* Notification Bell Dropdown Widget */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="relative p-2 rounded-xl bg-white/[0.04] text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        {(usePage().props as any).notifications?.unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-[#0b0f19] animate-pulse">
                                                {(usePage().props as any).notifications?.unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content width="80" align="right">
                                    <div className="p-3 border-b border-white/10 flex items-center justify-between">
                                        <span className="text-xs font-bold text-white">Clinical Reminders & Alerts</span>
                                        <Link href={route('notifications.index')} className="text-[11px] font-bold text-purple-400 hover:text-purple-300">
                                            View All →
                                        </Link>
                                    </div>
                                    <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
                                        {((usePage().props as any).notifications?.latest || []).length === 0 ? (
                                            <div className="p-4 text-center text-xs text-gray-500">
                                                No unread reminders.
                                            </div>
                                        ) : (
                                            ((usePage().props as any).notifications?.latest || []).map((notif: any) => (
                                                <Link
                                                    key={notif.id}
                                                    href={notif.action_url || route('notifications.index')}
                                                    className="p-3 block hover:bg-white/[0.04] transition-colors"
                                                >
                                                    <span className="font-bold text-xs text-white block">
                                                        {notif.type === 'appointment_reminder' && '📅 '}
                                                        {notif.type === 'payment_reminder' && '💳 '}
                                                        {notif.type === 'birthday_reminder' && '🎂 '}
                                                        {notif.type === 'followup_reminder' && '🩺 '}
                                                        {notif.title}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 block line-clamp-2 mt-0.5">
                                                        {notif.message}
                                                    </span>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                </Dropdown.Content>
                            </Dropdown>

                            {/* Quick Action Button Dropdown */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span>Quick Action</span>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('appointments.index')}>
                                        📅 Book Appointment
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('patients.index')}>
                                        👥 Register Patient
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('treatment-sessions.index')}>
                                        🦴 Log Session
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('billing.index')}>
                                        💳 Issue Invoice
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>


                            {/* User Profile Pill Menu */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-gray-200 transition-all hover:bg-white/10 border border-white/10 hover:border-purple-500/30"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shadow-inner">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left hidden xl:block">
                                            <span className="block font-bold text-white text-xs leading-none">{user.name}</span>
                                            <span className="text-[10px] uppercase font-mono font-bold text-purple-400 tracking-wider">
                                                {user.role}
                                            </span>
                                        </div>
                                        <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <div className="px-4 py-2 border-b border-white/10">
                                        <p className="text-xs font-bold text-white">{user.name}</p>
                                        <p className="text-[11px] text-gray-400 font-mono truncate">{user.email}</p>
                                    </div>
                                    <Dropdown.Link href={route('settings.edit')}>
                                        ⚙️ Clinic Settings
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        👤 Account Settings
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    >
                                        🚪 Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>


                        {/* Hamburger Button for Mobile */}
                        <div className="flex items-center lg:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="inline-flex items-center justify-center rounded-xl p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-all border border-white/10"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Drawer Menu */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' lg:hidden border-t border-white/10 bg-[#0b0f19]/95 backdrop-blur-xl'}>
                    <div className="space-y-1 p-4">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            📊 Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('appointments.index')} active={route().current('appointments.*')}>
                            📅 Appointments
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('patients.index')} active={route().current('patients.*')}>
                            👥 Patients
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('doctors.index')} active={route().current('doctors.*')}>
                            🩺 Doctors
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('medical-records.index')} active={route().current('medical-records.*')}>
                            📝 Medical Records
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('treatment-sessions.index')} active={route().current('treatment-sessions.*')}>
                            🦴 Treatment Sessions
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('billing.index')} active={route().current('billing.*')}>
                            💳 Billing & Invoices
                        </ResponsiveNavLink>
                        {user.role === 'admin' && (
                            <ResponsiveNavLink href={route('admin.users.index')} active={route().current('admin.users.*')}>
                                ⚙️ User Management
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-white/10 p-4">
                        <div className="px-2 mb-3">
                            <div className="text-base font-semibold text-white">{user.name}</div>
                            <div className="text-xs text-gray-400 font-mono">{user.email}</div>
                        </div>

                        <div className="space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Account Settings
                            </ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="border-b border-white/5 bg-white/[0.02]">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
        </div>
    );
}
