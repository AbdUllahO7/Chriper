import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export type NotificationType =
    | 'appointment_reminder'
    | 'payment_reminder'
    | 'birthday_reminder'
    | 'followup_reminder';

export interface NotificationItem {
    id: number;
    user_id: number | null;
    patient_id: number | null;
    type: NotificationType;
    title: string;
    message: string;
    scheduled_at: string;
    read_at: string | null;
    is_read: boolean;
    action_url: string | null;
    patient?: { id: number; first_name: string; last_name: string; email: string };
}

interface IndexProps {
    notifications: NotificationItem[];
    unreadCount: number;
    patients: Array<{ id: number; first_name: string; last_name: string }>;
    filters: { type: string; status: string };
}

export default function Index({ notifications, unreadCount, patients, filters }: IndexProps) {
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [deletingNotif, setDeletingNotif] = useState<NotificationItem | null>(null);

    // Manual Reminder Form
    const sendForm = useForm({
        patient_id: patients[0]?.id || '',
        type: 'appointment_reminder' as NotificationType,
        title: '',
        message: '',
    });

    const handleFilterChange = (type: string, status: string) => {
        setTypeFilter(type);
        setStatusFilter(status);
        router.get(route('notifications.index'), { type, status }, { preserveState: true });
    };

    const handleMarkAsRead = (id: number) => {
        router.patch(route('notifications.mark-read', id), {}, { preserveState: true });
    };

    const handleMarkAllAsRead = () => {
        router.post(route('notifications.mark-all-read'), {}, { preserveState: true });
    };

    const handleSendReminderSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendForm.post(route('notifications.send-reminder'), {
            onSuccess: () => {
                sendForm.reset();
                setIsSendModalOpen(false);
            },
        });
    };

    const confirmDeleteNotification = () => {
        if (deletingNotif) {
            router.delete(route('notifications.destroy', deletingNotif.id));
        }
    };

    const getTypeBadge = (type: NotificationType) => {
        switch (type) {
            case 'appointment_reminder':
                return { icon: '📅', text: 'Appointment Reminder', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
            case 'payment_reminder':
                return { icon: '💳', text: 'Payment Reminder', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
            case 'birthday_reminder':
                return { icon: '🎂', text: 'Birthday Greeting', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' };
            case 'followup_reminder':
                return { icon: '🩺', text: 'Follow-up Check', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                            <span>Clinical <span className="gradient-text">Notifications</span></span>
                            {unreadCount > 0 && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white shadow-md animate-pulse">
                                    {unreadCount} Unread
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Appointment reminders, payment due alerts, birthday greetings, and treatment follow-ups.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="px-4 py-2.5 rounded-xl bg-white/5 text-purple-300 hover:bg-purple-600/20 text-xs font-bold border border-white/10 transition-all"
                            >
                                ✓ Mark All Read
                            </button>
                        )}
                        <button
                            onClick={() => setIsSendModalOpen(true)}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2"
                        >
                            <span>+ Dispatch Patient Reminder</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Clinical Notifications & Reminders" />

            {/* Category Tabs & Status Filter */}
            <div className="glass-card rounded-2xl p-4 mb-6 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                    {[
                        { key: '', label: 'All Reminders' },
                        { key: 'appointment_reminder', label: '📅 Appointment' },
                        { key: 'payment_reminder', label: '💳 Payment' },
                        { key: 'birthday_reminder', label: '🎂 Birthday' },
                        { key: 'followup_reminder', label: '🩺 Follow-up' },
                    ].map((t) => (
                        <button
                            key={t.key}
                            onClick={() => handleFilterChange(t.key, statusFilter)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                typeFilter === t.key
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleFilterChange(typeFilter, '')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            statusFilter === '' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => handleFilterChange(typeFilter, 'unread')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            statusFilter === 'unread' ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Unread Only
                    </button>
                </div>
            </div>

            {/* Notifications Feed */}
            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 text-center text-gray-500 border border-white/10">
                        No notifications found matching your filter criteria.
                    </div>
                ) : (
                    notifications.map((notif) => {
                        const badge = getTypeBadge(notif.type);
                        return (
                            <div
                                key={notif.id}
                                className={`glass-card rounded-3xl p-6 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                                    !notif.is_read
                                        ? 'border-purple-500/40 bg-purple-500/[0.03] shadow-lg shadow-purple-500/5'
                                        : 'border-white/10 opacity-75 hover:opacity-100'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-3xl shrink-0 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                                        {badge.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.color}`}>
                                                {badge.text}
                                            </span>
                                            {!notif.is_read && (
                                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                                            )}
                                        </div>
                                        <h3 className="font-extrabold text-white text-base">{notif.title}</h3>
                                        <p className="text-sm text-gray-300 leading-relaxed">{notif.message}</p>
                                        <span className="text-[11px] text-gray-400 font-mono block pt-1">
                                            {notif.patient ? `Patient: ${notif.patient.first_name} ${notif.patient.last_name} • ` : ''}
                                            Scheduled: {new Date(notif.scheduled_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                                    {notif.action_url && (
                                        <Link
                                            href={notif.action_url}
                                            className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 text-xs font-bold transition-colors"
                                        >
                                            Open Action →
                                        </Link>
                                    )}
                                    {!notif.is_read && (
                                        <button
                                            onClick={() => handleMarkAsRead(notif.id)}
                                            className="px-3 py-1.5 rounded-xl bg-white/5 text-gray-300 hover:text-white text-xs font-semibold transition-colors"
                                        >
                                            Mark Read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setDeletingNotif(notif)}
                                        className="p-1.5 rounded-xl text-gray-500 hover:text-red-400 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Custom Confirm Delete Modal */}
            <ConfirmModal
                isOpen={!!deletingNotif}
                title="Delete Notification"
                message="Are you sure you want to delete this notification reminder?"
                confirmText="Delete"
                onConfirm={confirmDeleteNotification}
                onClose={() => setDeletingNotif(null)}
            />

            {/* Dispatch Patient Reminder Modal */}
            {isSendModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/10 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white">Dispatch Patient Reminder</h3>
                            <button onClick={() => setIsSendModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleSendReminderSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Target Patient *</label>
                                <select
                                    value={sendForm.data.patient_id}
                                    onChange={(e) => sendForm.setData('patient_id', Number(e.target.value))}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                >
                                    {patients.map((p) => (
                                        <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Reminder Category *</label>
                                <select
                                    value={sendForm.data.type}
                                    onChange={(e) => sendForm.setData('type', e.target.value as NotificationType)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm font-bold"
                                >
                                    <option value="appointment_reminder">📅 Appointment Reminder</option>
                                    <option value="payment_reminder">💳 Payment Due Reminder</option>
                                    <option value="birthday_reminder">🎂 Birthday Greeting</option>
                                    <option value="followup_reminder">🩺 Post-Treatment Follow-up Check</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Reminder Subject / Title *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Appointment Tomorrow at 10:00 AM"
                                    value={sendForm.data.title}
                                    onChange={(e) => sendForm.setData('title', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Reminder Details Message *</label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Enter detailed message to notify patient..."
                                    value={sendForm.data.message}
                                    onChange={(e) => sendForm.setData('message', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsSendModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30"
                                >
                                    Dispatch Reminder
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
