import { HTMLAttributes } from 'react';

export default function ApplicationLogo(props: HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props} className={`flex items-center gap-3 ${props.className || ''}`}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 p-0.5 shadow-lg shadow-purple-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Chirp<span className="gradient-text">er</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Spine
                </span>
            </span>
        </div>
    );
}
