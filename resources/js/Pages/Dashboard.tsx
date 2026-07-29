import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard() {
    const user = usePage().props.auth.user;

    const [message, setMessage] = useState('');
    const [chirps, setChirps] = useState([
        {
            id: 1,
            user: 'Sara Jenkins',
            handle: '@sara_j',
            time: '20m ago',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            content: 'Just updated our clinic intake flow! Check-ins are 50% faster now.',
            likes: 18,
            liked: false,
            reposts: 5,
        },
        {
            id: 2,
            user: 'Dr. Marcus Wright',
            handle: '@marcus_chiro',
            time: '1h ago',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            content: 'Completed spinal adjustment sessions for today. Great patient progress all around!',
            likes: 42,
            liked: true,
            reposts: 12,
        },
    ]);

    const handlePostChirp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setChirps([
            {
                id: Date.now(),
                user: user.name,
                handle: `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
                time: 'Just now',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=fff`,
                content: message,
                likes: 0,
                liked: false,
                reposts: 0,
            },
            ...chirps,
        ]);
        setMessage('');
    };

    const toggleLike = (id: number) => {
        setChirps(
            chirps.map((c) =>
                c.id === id
                    ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
                    : c
            )
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                Welcome back, <span className="gradient-text">{user.name}</span>
                            </h1>
                            <span className="px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {user.role}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Role-Scoped Workspace • Granted Permissions: <span className="text-purple-300 font-mono text-xs">{user.permissions.length} active</span>
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Feed" />

            {/* Role Scoped Header Widgets */}
            {user.role === 'admin' && (
                <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="glass-card rounded-2xl p-6 border border-purple-500/30 bg-purple-900/10">
                        <span className="text-xs font-bold uppercase text-purple-400 tracking-wider">Role Power</span>
                        <h3 className="text-xl font-bold text-white mt-1">System Administrator</h3>
                        <p className="text-xs text-gray-400 mt-1">Full access to User Management, Role Assignments, and Audit Logs.</p>
                    </div>
                    <div className="glass-card rounded-2xl p-6 border border-blue-500/30 bg-blue-900/10">
                        <span className="text-xs font-bold uppercase text-blue-400 tracking-wider">Active Staff</span>
                        <h3 className="text-xl font-bold text-white mt-1">3 Active Roles</h3>
                        <p className="text-xs text-gray-400 mt-1">Admin, Receptionist, Chiropractor roles configured.</p>
                    </div>
                    <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-emerald-900/10">
                        <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">Security</span>
                        <h3 className="text-xl font-bold text-white mt-1">RBAC Active</h3>
                        <p className="text-xs text-gray-400 mt-1">Middlewares & Inertia Shared Props enforcing access control.</p>
                    </div>
                </div>
            )}

            {user.role === 'receptionist' && (
                <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="glass-card rounded-2xl p-6 border border-blue-500/30 bg-blue-900/10">
                        <span className="text-xs font-bold uppercase text-blue-400 tracking-wider">Front Desk</span>
                        <h3 className="text-xl font-bold text-white mt-1">Patient Check-In Queue</h3>
                        <p className="text-xs text-gray-400 mt-1">8 patients scheduled for today's intake.</p>
                    </div>
                    <div className="glass-card rounded-2xl p-6 border border-indigo-500/30 bg-indigo-900/10">
                        <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">Appointments</span>
                        <h3 className="text-xl font-bold text-white mt-1">Scheduling Active</h3>
                        <p className="text-xs text-gray-400 mt-1">Book or reschedule chiropractic sessions.</p>
                    </div>
                    <div className="glass-card rounded-2xl p-6 border border-purple-500/30 bg-purple-900/10">
                        <span className="text-xs font-bold uppercase text-purple-400 tracking-wider">Status</span>
                        <h3 className="text-xl font-bold text-white mt-1">Reception Desk Open</h3>
                        <p className="text-xs text-gray-400 mt-1">Ready for incoming patient registrations.</p>
                    </div>
                </div>
            )}

            {user.role === 'chiropractor' && (
                <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-emerald-900/10">
                        <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">Clinical Care</span>
                        <h3 className="text-xl font-bold text-white mt-1">Chiropractic Treatments</h3>
                        <p className="text-xs text-gray-400 mt-1">Spinal adjustments, therapy sessions, and rehab plans.</p>
                    </div>
                    <div className="glass-card rounded-2xl p-6 border border-purple-500/30 bg-purple-900/10">
                        <span className="text-xs font-bold uppercase text-purple-400 tracking-wider">Clinical Notes</span>
                        <h3 className="text-xl font-bold text-white mt-1">Write SOAP Notes</h3>
                        <p className="text-xs text-gray-400 mt-1">Record patient adjustments & medical progression.</p>
                    </div>
                    <div className="glass-card rounded-2xl p-6 border border-indigo-500/30 bg-indigo-900/10">
                        <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">Today's Cases</span>
                        <h3 className="text-xl font-bold text-white mt-1">5 Treatment Sessions</h3>
                        <p className="text-xs text-gray-400 mt-1">Next session in 25 minutes.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Post Announcement / Chirp Box */}
                    <div className="glass-card rounded-3xl p-6 shadow-xl border border-white/10">
                        <form onSubmit={handlePostChirp} className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white shrink-0">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder={`Share an update as ${user.role}...`}
                                        rows={3}
                                        className="w-full bg-[#0b0f19]/80 text-white rounded-2xl p-4 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none resize-none transition-all placeholder:text-gray-500 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pl-15">
                                <div className="flex items-center gap-4 text-purple-400">
                                    <span className="text-xs text-gray-500">{280 - message.length} chars</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-600/25 active:scale-95"
                                >
                                    Post Announcement
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Timeline Feed List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-lg font-bold text-white">Staff Updates & Announcements</h2>
                            <span className="text-xs text-purple-400 font-medium bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                                Live Feed
                            </span>
                        </div>

                        {chirps.map((chirp) => (
                            <div
                                key={chirp.id}
                                className="glass-card rounded-3xl p-6 border border-white/10 hover:border-purple-500/30 transition-all space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={chirp.avatar}
                                            alt={chirp.user}
                                            className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/30"
                                        />
                                        <div>
                                            <span className="font-bold text-gray-100 text-sm block">
                                                {chirp.user}
                                            </span>
                                            <span className="text-xs text-gray-400">{chirp.handle}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">{chirp.time}</span>
                                </div>

                                <p className="text-gray-200 text-sm leading-relaxed">{chirp.content}</p>

                                <div className="flex items-center gap-8 pt-2 text-xs text-gray-400 border-t border-white/5">
                                    <button
                                        onClick={() => toggleLike(chirp.id)}
                                        className={`flex items-center gap-2 transition-colors ${
                                            chirp.liked ? 'text-red-400 font-bold' : 'hover:text-red-400'
                                        }`}
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill={chirp.liked ? 'currentColor' : 'none'}
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                            />
                                        </svg>
                                        <span>{chirp.likes} Likes</span>
                                    </button>

                                    <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                            />
                                        </svg>
                                        <span>{chirp.reposts} Reposts</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Permissions & Info */}
                <div className="space-y-6">
                    {/* Active Permissions Card */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center justify-between">
                            <span>Your Permissions</span>
                            <span className="text-xs text-purple-400 font-mono">{user.permissions.length} total</span>
                        </h3>
                        <div className="flex flex-wrap gap-2 pt-1">
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

                    {/* Quick Demo Switcher */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-3">
                        <h3 className="text-base font-bold text-white">Role Demo Accounts</h3>
                        <p className="text-xs text-gray-400">Log out and test different roles using these credentials:</p>
                        <div className="space-y-2 text-xs">
                            <div className="p-3 rounded-xl bg-white/[0.03] border border-purple-500/20">
                                <span className="font-bold text-purple-300 block">Admin</span>
                                <span className="text-gray-400">admin@chirper.com / password</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.03] border border-blue-500/20">
                                <span className="font-bold text-blue-300 block">Receptionist</span>
                                <span className="text-gray-400">receptionist@chirper.com / password</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.03] border border-emerald-500/20">
                                <span className="font-bold text-emerald-300 block">Chiropractor</span>
                                <span className="text-gray-400">chiropractor@chirper.com / password</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
