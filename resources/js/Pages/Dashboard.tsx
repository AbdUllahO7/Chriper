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
            content: 'Just launched our new React + Laravel Inertia stack! Micro-blogging has never felt this responsive. 🎉✨',
            likes: 18,
            liked: false,
            reposts: 5,
        },
        {
            id: 2,
            user: 'David Chen',
            handle: '@davidchen',
            time: '1h ago',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            content: 'The new glassmorphism dark theme on Chirper is top tier. 🚀',
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
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Welcome back, <span className="gradient-text">{user.name}</span> 👋
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Here is what's happening on your feed today.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Feed" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Chirp Composer Box */}
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
                                        placeholder="What's on your mind?"
                                        rows={3}
                                        className="w-full bg-[#0b0f19]/80 text-white rounded-2xl p-4 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none resize-none transition-all placeholder:text-gray-500 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pl-15">
                                <div className="flex items-center gap-4 text-purple-400">
                                    <button type="button" className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                    <button type="button" className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </button>
                                    <span className="text-xs text-gray-500 ml-2">{280 - message.length} chars</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-600/25 active:scale-95"
                                >
                                    Chirp
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Timeline Feed List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-lg font-bold text-white">Latest Chirps</h2>
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

                {/* Sidebar Stats & Trending Column */}
                <div className="space-y-6">
                    {/* Stats Widget */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
                        <h3 className="text-base font-bold text-white">Your Overview</h3>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                                <span className="text-xs text-gray-400 block">Total Chirps</span>
                                <span className="text-2xl font-extrabold text-purple-400 mt-1 block">12</span>
                            </div>
                            <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                                <span className="text-xs text-gray-400 block">Impressions</span>
                                <span className="text-2xl font-extrabold text-indigo-400 mt-1 block">1.4k</span>
                            </div>
                        </div>
                    </div>

                    {/* Trending Topics */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
                        <h3 className="text-base font-bold text-white">Trending on Chirper</h3>
                        <div className="space-y-3">
                            <div className="p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer">
                                <span className="text-xs text-purple-400 font-medium">#Laravel12</span>
                                <p className="text-sm font-bold text-gray-200 mt-0.5">Inertia React v2 released</p>
                                <span className="text-xs text-gray-500">4.2k Chirps</span>
                            </div>
                            <div className="p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer">
                                <span className="text-xs text-indigo-400 font-medium">#TailwindCSS</span>
                                <p className="text-sm font-bold text-gray-200 mt-0.5">Glassmorphic UI trends</p>
                                <span className="text-xs text-gray-500">2.8k Chirps</span>
                            </div>
                            <div className="p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer">
                                <span className="text-xs text-blue-400 font-medium">#WebDev</span>
                                <p className="text-sm font-bold text-gray-200 mt-0.5">Building reactive apps</p>
                                <span className="text-xs text-gray-500">1.5k Chirps</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
