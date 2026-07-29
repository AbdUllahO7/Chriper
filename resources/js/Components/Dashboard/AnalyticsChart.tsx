import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartOptions,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface ChartData {
    labels: string[];
    datasets: any[];
}

interface AnalyticsChartProps {
    type: 'bar' | 'line';
    data: ChartData;
    title: string;
    subtitle?: string;
}

export default function AnalyticsChart({ type, data, title, subtitle }: AnalyticsChartProps) {
    const options: ChartOptions<'bar' | 'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#9ca3af',
                    font: {
                        family: 'Plus Jakarta Sans',
                        size: 12,
                    },
                    usePointStyle: true,
                    boxWidth: 8,
                },
            },
            tooltip: {
                backgroundColor: '#111827',
                titleColor: '#f3f4f6',
                bodyColor: '#e5e7eb',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 12,
                displayColors: true,
            },
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: '#9ca3af',
                    font: {
                        family: 'Plus Jakarta Sans',
                        size: 11,
                    },
                },
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: '#9ca3af',
                    font: {
                        family: 'Plus Jakarta Sans',
                        size: 11,
                    },
                },
            },
        },
    };

    return (
        <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col h-full">
            <div className="mb-4">
                <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex-1 min-h-[260px] relative">
                {type === 'bar' ? (
                    <Bar options={options as any} data={data} />
                ) : (
                    <Line options={options as any} data={data} />
                )}
            </div>
        </div>
    );
}
