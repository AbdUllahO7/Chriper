import React from 'react';

export interface MetricCardData {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'warning';
    description: string;
}

interface MetricCardProps {
    card: MetricCardData;
    icon: React.ReactNode;
    colorScheme?: 'purple' | 'blue' | 'indigo' | 'emerald' | 'amber';
}

export default function MetricCard({ card, icon, colorScheme = 'purple' }: MetricCardProps) {
    const colorClasses = {
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-purple-500/10 hover:border-purple-500/40',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/10 hover:border-blue-500/40',
        indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/10 hover:border-indigo-500/40',
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10 hover:border-emerald-500/40',
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10 hover:border-amber-500/40',
    }[colorScheme];

    const trendBadgeClass = card.trend === 'warning'
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

    return (
        <div className={`glass-card rounded-3xl p-5 border border-white/10 shadow-xl transition-all flex flex-col justify-between group overflow-hidden ${colorClasses}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate mr-2">
                    {card.title}
                </span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110">
                    {icon}
                </div>
            </div>

            <div className="mt-2">
                <div className="text-2xl xl:text-3xl font-black text-white tracking-tight truncate">
                    {card.value}
                </div>
                <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/5">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border shrink-0 ${trendBadgeClass}`}>
                        {card.change}
                    </span>
                    <span className="text-[11px] text-gray-400 truncate text-right">
                        {card.description}
                    </span>
                </div>
            </div>
        </div>
    );
}
