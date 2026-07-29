import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { UserRole } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

interface StaffUser {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    permissions: string[];
    created_at: string;
}

interface Props {
    users: StaffUser[];
    filters: { search: string; role: string };
    roles: UserRole[];
}

export default function Index({ users, filters, roles }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState(filters.role || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
    const [deletingUser, setDeletingUser] = useState<StaffUser | null>(null);

    // Create User Form
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'receptionist' as UserRole,
    });

    // Edit User Form
    const editForm = useForm({
        name: '',
        email: '',
        role: 'receptionist' as UserRole,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search, role: selectedRoleFilter }, { preserveState: true });
    };

    const handleRoleFilterChange = (role: string) => {
        setSelectedRoleFilter(role);
        router.get(route('admin.users.index'), { search, role }, { preserveState: true });
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('admin.users.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const openEditModal = (user: StaffUser) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            role: user.role,
        });
    };

    const handleUpdateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        editForm.put(route('admin.users.update', editingUser.id), {
            onSuccess: () => {
                setEditingUser(null);
            },
        });
    };

    const confirmDeleteUser = () => {
        if (deletingUser) {
            router.delete(route('admin.users.destroy', deletingUser.id));
        }
    };

    const getRoleBadge = (role: UserRole) => {
        switch (role) {
            case 'admin':
                return (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Admin
                    </span>
                );
            case 'chiropractor':
                return (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Chiropractor
                    </span>
                );
            case 'receptionist':
            default:
                return (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Receptionist
                    </span>
                );
        }
    };

    const countByRole = (roleName: UserRole) => users.filter((u) => u.role === roleName).length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            User Management & <span className="gradient-text">Roles</span>
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Assign roles (Admin, Receptionist, Chiropractor) and manage staff permissions.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/25 active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add New Staff</span>
                    </button>
                </div>
            }
        >
            <Head title="User Management" />

            {/* Role Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
                <div className="glass-card rounded-2xl p-5 border border-white/10">
                    <span className="text-xs text-gray-400 uppercase font-semibold">Total Staff</span>
                    <span className="text-3xl font-extrabold text-white block mt-1">{users.length}</span>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-purple-500/20">
                    <span className="text-xs text-purple-400 uppercase font-semibold">Admins</span>
                    <span className="text-3xl font-extrabold text-purple-300 block mt-1">{countByRole('admin')}</span>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-blue-500/20">
                    <span className="text-xs text-blue-400 uppercase font-semibold">Receptionists</span>
                    <span className="text-3xl font-extrabold text-blue-300 block mt-1">{countByRole('receptionist')}</span>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-emerald-500/20">
                    <span className="text-xs text-emerald-400 uppercase font-semibold">Chiropractors</span>
                    <span className="text-3xl font-extrabold text-emerald-300 block mt-1">{countByRole('chiropractor')}</span>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="glass-card rounded-2xl p-4 mb-6 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearch} className="w-full md:w-96 flex items-center gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full bg-[#0b0f19]/80 text-white text-sm rounded-xl px-4 py-2.5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
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
                        onClick={() => handleRoleFilterChange('')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                            selectedRoleFilter === ''
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                    >
                        All Roles
                    </button>
                    {roles.map((r) => (
                        <button
                            key={r}
                            onClick={() => handleRoleFilterChange(r)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                                selectedRoleFilter === r
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* User List Table */}
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-white/[0.03] text-xs uppercase font-semibold text-gray-400 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Assigned Permissions</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No users found matching your search query.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/10">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-white block">{user.name}</span>
                                                    <span className="text-xs text-gray-400">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                {user.permissions.slice(0, 3).map((perm) => (
                                                    <span
                                                        key={perm}
                                                        className="px-2 py-0.5 rounded bg-white/5 text-[11px] font-mono text-gray-300 border border-white/5"
                                                    >
                                                        {perm}
                                                    </span>
                                                ))}
                                                {user.permissions.length > 3 && (
                                                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-[11px] font-mono text-purple-300">
                                                        +{user.permissions.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-xs">{user.created_at}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-purple-300 hover:bg-purple-600/20 text-xs font-semibold transition-colors"
                                                >
                                                    Edit Role
                                                </button>
                                                <button
                                                    onClick={() => setDeletingUser(user)}
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

            {/* Custom Confirm Modal for User Deletion */}
            <ConfirmModal
                isOpen={!!deletingUser}
                title="Delete Staff Account"
                message={`Are you sure you want to remove staff member "${deletingUser?.name}"? They will lose all access to the system.`}
                confirmText="Remove Staff"
                onConfirm={confirmDeleteUser}
                onClose={() => setDeletingUser(null)}
            />

            {/* Create Staff Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/10 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white">Create Staff Member</h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="e.g. Dr. Jane Doe"
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    placeholder="e.g. jane@clinic.com"
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={createForm.data.password}
                                    onChange={(e) => createForm.setData('password', e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Select Role</label>
                                <select
                                    value={createForm.data.role}
                                    onChange={(e) => createForm.setData('role', e.target.value as UserRole)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm capitalize"
                                >
                                    <option value="receptionist">Receptionist (Intake & Scheduling)</option>
                                    <option value="chiropractor">Chiropractor (Treatments & Clinical Notes)</option>
                                    <option value="admin">Admin (Full System Access)</option>
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
                                    className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30"
                                >
                                    Save Staff User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Staff Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/10 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white">Edit Staff Role & Details</h3>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Assigned Role</label>
                                <select
                                    value={editForm.data.role}
                                    onChange={(e) => editForm.setData('role', e.target.value as UserRole)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm capitalize"
                                >
                                    <option value="receptionist">Receptionist</option>
                                    <option value="chiropractor">Chiropractor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30"
                                >
                                    Update Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
