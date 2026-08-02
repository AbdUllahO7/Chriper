import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    date_of_birth: string | null;
    gender: 'male' | 'female' | 'other' | null;
    email: string;
    phone: string | null;
    address: string | null;
    emergency_contact: string | null;
    insurance: string | null;
    notes: string | null;
    status: 'active' | 'inactive';
    profile_photo_path: string | null;
    profile_photo_url: string;
    created_at: string;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface IndexProps {
    patients: PaginatedData<Patient>;
    filters: { search: string; gender: string; status: string };
}

export default function Index({ patients, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [genderFilter, setGenderFilter] = useState(filters.gender || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Inertia Form for Creating Patient
    const createForm = useForm({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: 'male',
        email: '',
        phone: '',
        address: '',
        emergency_contact: '',
        insurance: '',
        notes: '',
        referral_source: 'walk_in',
        referred_by_name: '',
        status: 'active',
        profile_photo: null as File | null,
    });

    // Inertia Form for Editing Patient
    const editForm = useForm({
        _method: 'PUT',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: 'male',
        email: '',
        phone: '',
        address: '',
        emergency_contact: '',
        insurance: '',
        notes: '',
        status: 'active',
        profile_photo: null as File | null,
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('patients.index'),
            { search, gender: genderFilter, status: statusFilter },
            { preserveState: true }
        );
    };

    const handleFilterChange = (newGender: string, newStatus: string) => {
        setGenderFilter(newGender);
        setStatusFilter(newStatus);
        router.get(
            route('patients.index'),
            { search, gender: newGender, status: newStatus },
            { preserveState: true }
        );
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
        const file = e.target.files?.[0];
        if (file) {
            if (isEdit) {
                editForm.setData('profile_photo', file);
            } else {
                createForm.setData('profile_photo', file);
            }
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleCreatePatient = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('patients.store'), {
            onSuccess: () => {
                createForm.reset();
                setPhotoPreview(null);
                setIsCreateModalOpen(false);
            },
        });
    };

    const openEditModal = (patient: Patient) => {
        setEditingPatient(patient);
        setPhotoPreview(patient.profile_photo_url);
        editForm.setData({
            _method: 'PUT',
            first_name: patient.first_name,
            last_name: patient.last_name,
            date_of_birth: patient.date_of_birth || '',
            gender: patient.gender || 'male',
            email: patient.email,
            phone: patient.phone || '',
            address: patient.address || '',
            emergency_contact: patient.emergency_contact || '',
            insurance: patient.insurance || '',
            notes: patient.notes || '',
            status: patient.status,
            profile_photo: null,
        });
    };

    const handleUpdatePatient = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPatient) return;

        editForm.post(route('patients.update', editingPatient.id), {
            onSuccess: () => {
                setEditingPatient(null);
                setPhotoPreview(null);
            },
        });
    };

    const confirmDeletePatient = () => {
        if (deletingPatient) {
            router.delete(route('patients.destroy', deletingPatient.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Patient <span className="gradient-text">Directory</span>
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Comprehensive patient medical records, insurance info, and care status.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setPhotoPreview(null);
                            setIsCreateModalOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/25 active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>+ Add New Patient</span>
                    </button>
                </div>
            }
        >
            <Head title="Patients Directory" />

            {/* Search & Filter Toolbar */}
            <div className="glass-card rounded-2xl p-4 mb-6 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex items-center gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or phone..."
                        className="w-full bg-[#0b0f19]/80 text-white text-sm rounded-xl px-4 py-2.5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors"
                    >
                        Search
                    </button>
                </form>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={genderFilter}
                        onChange={(e) => handleFilterChange(e.target.value, statusFilter)}
                        className="bg-[#0b0f19]/80 text-white text-xs font-semibold rounded-xl px-3 py-2.5 border border-white/10 focus:border-purple-500 outline-none capitalize"
                    >
                        <option value="">All Genders</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => handleFilterChange(genderFilter, e.target.value)}
                        className="bg-[#0b0f19]/80 text-white text-xs font-semibold rounded-xl px-3 py-2.5 border border-white/10 focus:border-purple-500 outline-none capitalize"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active Care</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Patients Table */}
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-white/[0.03] text-xs uppercase font-semibold text-gray-400 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Gender & DOB</th>
                                <th className="px-6 py-4">Phone / Contact</th>
                                <th className="px-6 py-4">Insurance</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {patients.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        No patient records found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                patients.data.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={patient.profile_photo_url}
                                                    alt={patient.full_name}
                                                    className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/30 shrink-0"
                                                />
                                                <div>
                                                    <Link
                                                        href={route('patients.show', patient.id)}
                                                        className="font-bold text-white hover:text-purple-300 transition-colors block text-sm"
                                                    >
                                                        {patient.full_name}
                                                    </Link>
                                                    <span className="text-xs text-gray-400">{patient.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize font-medium text-gray-200 block text-xs">
                                                {patient.gender || 'Unspecified'}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                DOB: {patient.date_of_birth || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-gray-200 block">
                                                {patient.phone || 'No phone'}
                                            </span>
                                            {patient.emergency_contact && (
                                                <span className="text-[11px] text-gray-400 truncate max-w-xs block">
                                                    ICE: {patient.emergency_contact}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-purple-300 font-medium bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                                                {patient.insurance || 'Self Pay'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    patient.status === 'active'
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                }`}
                                            >
                                                {patient.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('patients.show', patient.id)}
                                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-purple-300 hover:bg-purple-600/20 text-xs font-semibold transition-colors"
                                                >
                                                    View Profile
                                                </Link>
                                                <button
                                                    onClick={() => openEditModal(patient)}
                                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-blue-300 hover:bg-blue-600/20 text-xs font-semibold transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeletingPatient(patient)}
                                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {patients.links.length > 3 && (
                <div className="flex items-center justify-between glass-card rounded-2xl p-4 border border-white/10">
                    <span className="text-xs text-gray-400">
                        Showing page {patients.current_page} of {patients.last_page} ({patients.total} total patients)
                    </span>
                    <div className="flex items-center gap-1.5">
                        {patients.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    link.active
                                        ? 'bg-purple-600 text-white'
                                        : link.url
                                        ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                                        : 'opacity-40 pointer-events-none text-gray-500'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Modern Custom Confirm Deletion Modal */}
            <ConfirmModal
                isOpen={!!deletingPatient}
                title="Delete Patient Record"
                message={`Are you sure you want to delete patient "${deletingPatient?.full_name}"? This action will permanently remove their medical dossier.`}
                confirmText="Delete Record"
                onConfirm={confirmDeletePatient}
                onClose={() => setDeletingPatient(null)}
            />

            {/* Create Patient Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/10 shadow-2xl my-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white">Register New Patient</h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreatePatient} className="space-y-5">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                                <img
                                    src={photoPreview || 'https://ui-avatars.com/api/?name=New+Patient&background=8b5cf6&color=fff'}
                                    alt="Preview"
                                    className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-500/50 shrink-0"
                                />
                                <div>
                                    <label className="block text-xs font-semibold text-purple-300 mb-1 cursor-pointer hover:underline">
                                        Upload Profile Photo
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handlePhotoChange(e, false)}
                                        className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">First Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.data.first_name}
                                        onChange={(e) => createForm.setData('first_name', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Last Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.data.last_name}
                                        onChange={(e) => createForm.setData('last_name', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={createForm.data.date_of_birth}
                                        onChange={(e) => createForm.setData('date_of_birth', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Gender</label>
                                    <select
                                        value={createForm.data.gender}
                                        onChange={(e) => createForm.setData('gender', e.target.value as any)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm capitalize"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={createForm.data.phone}
                                        onChange={(e) => createForm.setData('phone', e.target.value)}
                                        placeholder="555-0192"
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Emergency Contact</label>
                                <input
                                    type="text"
                                    value={createForm.data.emergency_contact}
                                    onChange={(e) => createForm.setData('emergency_contact', e.target.value)}
                                    placeholder="e.g. Maria Martinez (Spouse) - 555-0193"
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Insurance Provider & Policy #</label>
                                <input
                                    type="text"
                                    value={createForm.data.insurance}
                                    onChange={(e) => createForm.setData('insurance', e.target.value)}
                                    placeholder="e.g. BlueCross #BC-94820"
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Medical Notes & History</label>
                                <textarea
                                    rows={3}
                                    value={createForm.data.notes}
                                    onChange={(e) => createForm.setData('notes', e.target.value)}
                                    placeholder="Spinal adjustments history, allergies, care plans..."
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm resize-none"
                                />
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
                                    Save Patient Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Patient Modal */}
            {editingPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/10 shadow-2xl my-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white">Edit Patient Record</h3>
                            <button onClick={() => setEditingPatient(null)} className="text-gray-400 hover:text-white">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdatePatient} className="space-y-5">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                                <img
                                    src={photoPreview || editingPatient.profile_photo_url}
                                    alt="Preview"
                                    className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-500/50 shrink-0"
                                />
                                <div>
                                    <label className="block text-xs font-semibold text-purple-300 mb-1 cursor-pointer hover:underline">
                                        Update Profile Photo
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handlePhotoChange(e, true)}
                                        className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">First Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.data.first_name}
                                        onChange={(e) => editForm.setData('first_name', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Last Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.data.last_name}
                                        onChange={(e) => editForm.setData('last_name', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
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
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={editForm.data.phone}
                                        onChange={(e) => editForm.setData('phone', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Insurance Provider</label>
                                <input
                                    type="text"
                                    value={editForm.data.insurance}
                                    onChange={(e) => editForm.setData('insurance', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Medical Notes</label>
                                <textarea
                                    rows={3}
                                    value={editForm.data.notes}
                                    onChange={(e) => editForm.setData('notes', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setEditingPatient(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30"
                                >
                                    Update Patient
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
