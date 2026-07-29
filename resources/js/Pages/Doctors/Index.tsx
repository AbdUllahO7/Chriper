import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export type AvailabilityStatus = 'available' | 'busy' | 'off_duty';

export interface Doctor {
    id: number;
    name: string;
    specialty: string;
    phone: string;
    email: string;
    working_hours: string;
    room_number: string;
    is_available: boolean;
    availability_status: AvailabilityStatus;
    created_at: string;
}

interface IndexProps {
    doctors: Doctor[];
    filters: { search: string; status: string };
    statuses: AvailabilityStatus[];
}

export default function Index({ doctors, filters, statuses }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
    const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);

    // Create Form
    const createForm = useForm({
        name: '',
        specialty: '',
        phone: '',
        email: '',
        working_hours: '08:00 AM - 04:00 PM',
        room_number: 'Suite 101',
        availability_status: 'available' as AvailabilityStatus,
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        specialty: '',
        phone: '',
        email: '',
        working_hours: '',
        room_number: '',
        availability_status: 'available' as AvailabilityStatus,
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('doctors.index'), { search, status: statusFilter }, { preserveState: true });
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        router.get(route('doctors.index'), { search, status }, { preserveState: true });
    };

    const handleToggleAvailability = (doctor: Doctor, newStatus: AvailabilityStatus) => {
        router.patch(
            route('doctors.toggle-availability', doctor.id),
            { availability_status: newStatus },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleCreateDoctor = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('doctors.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const openEditModal = (doctor: Doctor) => {
        setEditingDoctor(doctor);
        editForm.setData({
            name: doctor.name,
            specialty: doctor.specialty,
            phone: doctor.phone,
            email: doctor.email,
            working_hours: doctor.working_hours,
            room_number: doctor.room_number,
            availability_status: doctor.availability_status,
        });
    };

    const handleUpdateDoctor = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDoctor) return;

        editForm.put(route('doctors.update', editingDoctor.id), {
            onSuccess: () => {
                setEditingDoctor(null);
            },
        });
    };

    const confirmDeleteDoctor = () => {
        if (deletingDoctor) {
            router.delete(route('doctors.destroy', deletingDoctor.id));
        }
    };

    const getAvailabilityBadge = (status: AvailabilityStatus) => {
        switch (status) {
            case 'available':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Available
                    </span>
                );
            case 'busy':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        In Treatment (Busy)
                    </span>
                );
            case 'off_duty':
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                        <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                        Off-Duty
                    </span>
                );
        }
    };

    const countByStatus = (st: AvailabilityStatus) => doctors.filter((d) => d.availability_status === st).length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Doctor <span className="gradient-text">Management</span>
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Chiropractor profiles, specialties, working hours, room assignments & live availability status.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/25 active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add New Doctor</span>
                    </button>
                </div>
            }
        >
            <Head title="Doctor Management" />

            {/* Summary Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
                <div className="glass-card rounded-2xl p-5 border border-white/10">
                    <span className="text-xs text-gray-400 uppercase font-semibold">Total Chiropractors</span>
                    <span className="text-3xl font-extrabold text-white block mt-1">{doctors.length}</span>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-emerald-500/20">
                    <span className="text-xs text-emerald-400 uppercase font-semibold">Available Now</span>
                    <span className="text-3xl font-extrabold text-emerald-300 block mt-1">{countByStatus('available')}</span>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-amber-500/20">
                    <span className="text-xs text-amber-400 uppercase font-semibold">Busy in Treatment</span>
                    <span className="text-3xl font-extrabold text-amber-300 block mt-1">{countByStatus('busy')}</span>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-gray-500/20">
                    <span className="text-xs text-gray-400 uppercase font-semibold">Off-Duty</span>
                    <span className="text-3xl font-extrabold text-gray-300 block mt-1">{countByStatus('off_duty')}</span>
                </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="glass-card rounded-2xl p-4 mb-6 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex items-center gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by doctor name, specialty, room..."
                        className="w-full bg-[#0b0f19]/80 text-white text-sm rounded-xl px-4 py-2.5 border border-white/10 focus:border-purple-500 outline-none"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors"
                    >
                        Search
                    </button>
                </form>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                    <button
                        onClick={() => handleStatusFilterChange('')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                            statusFilter === ''
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                    >
                        All Statuses
                    </button>
                    {statuses.map((st) => (
                        <button
                            key={st}
                            onClick={() => handleStatusFilterChange(st)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                                statusFilter === st
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                        >
                            {st.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Doctor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {doctors.length === 0 ? (
                    <div className="col-span-full glass-card rounded-3xl p-12 text-center text-gray-500 border border-white/10">
                        No doctors found matching your query.
                    </div>
                ) : (
                    doctors.map((doctor) => (
                        <div
                            key={doctor.id}
                            className="glass-card rounded-3xl p-6 border border-white/10 shadow-2xl hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-5 group"
                        >
                            {/* Card Top */}
                            <div>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg ring-2 ring-white/10">
                                            {doctor.name.replace('Dr. ', '').charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-white text-base block group-hover:text-purple-300 transition-colors">
                                                {doctor.name}
                                            </h3>
                                            <span className="text-xs text-purple-400 font-mono block">
                                                {doctor.email}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[11px] font-bold text-gray-300 border border-white/5 shrink-0">
                                        🚪 {doctor.room_number}
                                    </span>
                                </div>

                                {/* Specialty & Working Hours */}
                                <div className="space-y-2 pt-2">
                                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                                        <span className="text-[11px] text-gray-400 block font-semibold uppercase">Specialty</span>
                                        <span className="text-xs text-gray-200 font-medium block mt-0.5">{doctor.specialty}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-400 px-1 pt-1">
                                        <span>⏰ Hours: <strong className="text-gray-300 font-normal">{doctor.working_hours}</strong></span>
                                        <span>📞 <strong className="text-gray-300 font-normal">{doctor.phone}</strong></span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Bottom / Interactive Availability Switcher */}
                            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                                <div>
                                    <span className="text-[10px] text-gray-400 block uppercase font-semibold mb-1">
                                        Status Toggle:
                                    </span>
                                    <select
                                        value={doctor.availability_status}
                                        onChange={(e) => handleToggleAvailability(doctor, e.target.value as AvailabilityStatus)}
                                        className="bg-[#0b0f19] text-white text-xs font-semibold rounded-xl px-2.5 py-1.5 border border-white/10 focus:border-purple-500 outline-none capitalize cursor-pointer"
                                    >
                                        <option value="available">🟢 Available</option>
                                        <option value="busy">🟡 In Treatment (Busy)</option>
                                        <option value="off_duty">⚪ Off-Duty</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditModal(doctor)}
                                        className="px-3 py-2 rounded-xl bg-white/5 text-blue-300 hover:bg-blue-600/20 text-xs font-semibold transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeletingDoctor(doctor)}
                                        className="px-3 py-2 rounded-xl bg-white/5 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deletingDoctor}
                title="Remove Doctor Profile"
                message={`Are you sure you want to delete profile for "${deletingDoctor?.name}"?`}
                confirmText="Delete Doctor"
                onConfirm={confirmDeleteDoctor}
                onClose={() => setDeletingDoctor(null)}
            />

            {/* Create Doctor Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/10 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white">Add New Chiropractor / Doctor</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateDoctor} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Doctor Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="e.g. Dr. Marcus Wright"
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Specialty *</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.specialty}
                                    onChange={(e) => createForm.setData('specialty', e.target.value)}
                                    placeholder="e.g. Spinal Decompression & Postural Rehab"
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        placeholder="doctor@clinic.com"
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number *</label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.data.phone}
                                        onChange={(e) => createForm.setData('phone', e.target.value)}
                                        placeholder="555-0199"
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Working Hours *</label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.data.working_hours}
                                        onChange={(e) => createForm.setData('working_hours', e.target.value)}
                                        placeholder="08:00 AM - 04:00 PM"
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Room Number *</label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.data.room_number}
                                        onChange={(e) => createForm.setData('room_number', e.target.value)}
                                        placeholder="Suite 204"
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Initial Availability Status</label>
                                <select
                                    value={createForm.data.availability_status}
                                    onChange={(e) => createForm.setData('availability_status', e.target.value as AvailabilityStatus)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm capitalize"
                                >
                                    <option value="available">🟢 Available</option>
                                    <option value="busy">🟡 Busy (In Treatment)</option>
                                    <option value="off_duty">⚪ Off-Duty</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30"
                                >
                                    Save Doctor Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Doctor Modal */}
            {editingDoctor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/10 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white">Edit Doctor Profile</h3>
                            <button onClick={() => setEditingDoctor(null)} className="text-gray-400 hover:text-white">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateDoctor} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Doctor Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Specialty *</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.specialty}
                                    onChange={(e) => editForm.setData('specialty', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Phone *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.data.phone}
                                        onChange={(e) => editForm.setData('phone', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Working Hours *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.data.working_hours}
                                        onChange={(e) => editForm.setData('working_hours', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Room Number *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.data.room_number}
                                        onChange={(e) => editForm.setData('room_number', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setEditingDoctor(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30"
                                >
                                    Update Doctor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
