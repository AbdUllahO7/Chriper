import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    // Interactive Demo Chirps State
    const [demoChirps, setDemoChirps] = useState([
        {
            id: 1,
            user: 'Sarah Connor',
            handle: '@sarah_c',
            time: '2m ago',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            content: 'Just deployed my first Laravel + React Inertia app! The developer experience is unmatched. 🚀🔥',
            likes: 14,
            reposts: 3,
        },
        {
            id: 2,
            user: 'Alex Rivera',
            handle: '@arivera',
            time: '15m ago',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            content: 'Chirper makes micro-blogging effortless. Love the smooth glassmorphism design! ✨',
            likes: 29,
            reposts: 7,
        },
    ]);

    const [newChirp, setNewChirp] = useState('');

    const handleDemoPost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChirp.trim()) return;

        setDemoChirps([
            {
                id: Date.now(),
                user: auth.user ? auth.user.name : 'You (Visitor)',
                handle: auth.user ? `@${auth.user.name.toLowerCase().replace(/\s+/g, '')}` : '@guest',
                time: 'Just now',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                content: newChirp,
                likes: 0,
                reposts: 0,
            },
            ...demoChirps,
        ]);
        setNewChirp('');
    };

    return (
        <>
            <Head title="Chirper - Modern Micro-Blogging" />

            <div className="min-h-screen bg-[#0b0f19] text-gray-100 relative overflow-hidden font-sans selection:bg-purple-500 selection:text-white">
                {/* Background Ambient Glow Orbs */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse-slow"></div>
                <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse-slow"></div>
                <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>

                {/* Navbar */}
                <header className="sticky top-0 z-50 glass-nav">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
                                <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                    </svg>
                                </div>
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight">
                                Chirp<span className="gradient-text">er</span>
                            </span>
                        </div>

                        {/* Navigation Actions */}
                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-95"
                                >
                                    Dashboard →
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-95"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
                    <div className="text-center max-w-3xl mx-auto space-y-6">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-purple-500/30 text-purple-300 text-sm font-medium shadow-inner">
                            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-ping"></span>
                            <span>Powered by Laravel 12 + Inertia React</span>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
                            Share your thoughts in{' '}
                            <span className="gradient-text">real time</span>.
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl text-gray-400 font-normal leading-relaxed max-w-2xl mx-auto">
                            Experience the future of micro-blogging. Built with sleek glassmorphism, instant reactivity, and seamless Laravel backend integration.
                        </p>

                        {/* Action Buttons */}
                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={auth.user ? route('dashboard') : route('register')}
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-lg hover:opacity-95 transition-all shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {auth.user ? 'Go to Your Feed' : 'Start Chirping Free'}
                            </Link>
                            <a
                                href="#demo"
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-card text-gray-300 hover:text-white font-semibold text-lg hover:bg-white/10 transition-all border border-white/10"
                            >
                                Try Live Demo
                            </a>
                        </div>
                    </div>

                    {/* Live Demo Feed Container */}
                    <div id="demo" className="mt-20 max-w-2xl mx-auto">
                        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 relative">
                            <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="ml-2 text-xs font-mono text-gray-400">Live Interactive Preview</span>
                                </div>
                                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-medium">React State Feed</span>
                            </div>

                            {/* Create Chirp Demo Form */}
                            <form onSubmit={handleDemoPost} className="space-y-4 mb-8">
                                <div className="flex gap-4">
                                    <img
                                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                                        alt="Avatar"
                                        className="w-11 h-11 rounded-full ring-2 ring-purple-500/50 shrink-0"
                                    />
                                    <div className="flex-1">
                                        <textarea
                                            value={newChirp}
                                            onChange={(e) => setNewChirp(e.target.value)}
                                            placeholder="What's happening?"
                                            rows={2}
                                            className="w-full bg-slate-900/60 text-white rounded-2xl p-4 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none resize-none transition-all placeholder:text-gray-500 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pl-15">
                                    <div className="flex items-center gap-3 text-gray-400 text-xs">
                                        <span>{280 - newChirp.length} chars remaining</span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!newChirp.trim()}
                                        className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-600/20"
                                    >
                                        Chirp Demo
                                    </button>
                                </div>
                            </form>

                            {/* Feed List */}
                            <div className="space-y-4">
                                {demoChirps.map((chirp) => (
                                    <div
                                        key={chirp.id}
                                        className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition-all space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={chirp.avatar}
                                                    alt={chirp.user}
                                                    className="w-10 h-10 rounded-full object-cover ring-1 ring-white/20"
                                                />
                                                <div>
                                                    <span className="font-semibold text-sm text-gray-200 block">
                                                        {chirp.user}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{chirp.handle}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">{chirp.time}</span>
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed">{chirp.content}</p>
                                        <div className="flex items-center gap-6 pt-2 text-xs text-gray-400">
                                            <button className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                                </svg>
                                                <span>{chirp.likes}</span>
                                            </button>
                                            <button className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                                </svg>
                                                <span>{chirp.reposts}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="glass-card rounded-3xl p-8 hover:border-purple-500/40 transition-all group">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Instant Inertia Reactivity</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Feel the speed of a Single Page Application (SPA) powered by React components without standard API boilerplate.
                            </p>
                        </div>

                        <div className="glass-card rounded-3xl p-8 hover:border-indigo-500/40 transition-all group">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Laravel 12 Engine</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Robust backend architecture with Eloquent ORM, secure authentication, validation, and database migrations.
                            </p>
                        </div>

                        <div className="glass-card rounded-3xl p-8 hover:border-blue-500/40 transition-all group">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Modern Glass Aesthetics</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Handcrafted dark mode aesthetic with backdrop filters, vibrant HSL gradients, and responsive layouts.
                            </p>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-white/10 py-10 relative z-10">
                    <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p>© {new Date().getFullYear()} Chirper. Built with Laravel v{laravelVersion} (PHP v{phpVersion}).</p>
                        <div className="flex items-center gap-6">
                            <a href="https://laravel.com" target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors">Laravel Docs</a>
                            <a href="https://inertiajs.com" target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors">Inertia.js</a>
                            <a href="https://react.dev" target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors">React</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
