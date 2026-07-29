import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/25 flex items-center justify-center">
                <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
                    <svg className="w-7 h-7 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                </div>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
                Chirp<span className="gradient-text">er</span>
            </span>
        </div>
    );
}
