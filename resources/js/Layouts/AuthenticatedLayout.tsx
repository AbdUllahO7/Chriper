import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans selection:bg-purple-500 selection:text-white">
            {/* Header Navigation */}
            <nav className="glass-nav sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 justify-between items-center">
                        <div className="flex items-center gap-8">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo />
                                </Link>
                            </div>

                            <div className="hidden space-x-3 sm:flex items-center">
                                <Link
                                    href={route('dashboard')}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                        route().current('dashboard')
                                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    Dashboard
                                </Link>

                                <Link
                                    href={route('patients.index')}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                        route().current('patients.*')
                                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    Patients
                                </Link>

                                <Link
                                    href={route('doctors.index')}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                        route().current('doctors.*')
                                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    Doctors
                                </Link>

                                {user.role === 'admin' && (
                                    <Link
                                        href={route('admin.users.index')}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                            route().current('admin.users.*')
                                                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        User Management
                                    </Link>
                                )}
                            </div>


                        </div>

                        <div className="hidden sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-xl">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-3 rounded-xl glass-card px-4 py-2 text-sm font-medium text-gray-200 transition-all hover:bg-white/10 hover:text-white focus:outline-none border border-white/10"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-left">
                                                    <span className="block font-semibold text-xs text-white">{user.name}</span>
                                                    <span className="block text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                                                        {user.role}
                                                    </span>
                                                </div>


                                                <svg
                                                    className="-me-0.5 ms-1 h-4 w-4 text-gray-400"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile Settings
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>

                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-xl p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden border-t border-white/10 bg-[#0b0f19]/95 backdrop-blur-lg'
                    }
                >
                    <div className="space-y-1 p-4">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                            className="text-white"
                        >
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-white/10 p-4">
                        <div className="px-2 mb-3">
                            <div className="text-base font-semibold text-white">
                                {user.name}
                            </div>
                            <div className="text-xs text-gray-400">
                                {user.email}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="border-b border-white/5 bg-white/[0.02]">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
        </div>
    );
}
