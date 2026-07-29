import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Glow Orbs */}
            <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none"></div>

            <div className="relative z-10 mb-8">
                <Link href="/">
                    <ApplicationLogo />
                </Link>
            </div>

            <div className="relative z-10 w-full sm:max-w-md glass-card rounded-3xl p-8 shadow-2xl border border-white/10">
                {children}
            </div>
        </div>
    );
}
