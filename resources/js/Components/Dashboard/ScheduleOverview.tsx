import React from 'react';

interface ScheduleItem {
    id: number;
    time: string;
    patientName: string;
    service: string;
    status: 'Completed' | 'In Progress' | 'Scheduled';
}

const mockSchedule: ScheduleItem[] = [
    {
        id: 1,
        time: '09:00',
        patientName: 'Robert Martinez',
        service: 'Spinal Adjustment & Decompression',
        status: 'Completed',
    },
    {
        id: 2,
        time: '10:30',
        patientName: 'Emily Watson',
        service: 'Initial Chiropractic Consultation',
        status: 'In Progress',
    },
    {
        id: 3,
        time: '14:00',
        patientName: 'Michael Chang',
        service: 'Postural Rehab & Physical Therapy',
        status: 'Scheduled',
    },
];

export default function ScheduleOverview() {
    const getStatusBadge = (status: ScheduleItem['status']) => {
        switch (status) {
            case 'Completed':
                return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            case 'In Progress':
                return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            case 'Scheduled':
            default:
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        }
    };

    return (
        <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Today's Schedule Overview</h3>
                <span className="text-xs text-purple-400 font-mono">18 total appointments</span>
            </div>

            <div className="space-y-3">
                {mockSchedule.map((item) => (
                    <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-sm">
                                {item.time}
                            </div>
                            <div>
                                <span className="font-semibold text-white text-sm block">
                                    {item.patientName}
                                </span>
                                <span className="text-xs text-gray-400">{item.service}</span>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(item.status)}`}>
                            {item.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
