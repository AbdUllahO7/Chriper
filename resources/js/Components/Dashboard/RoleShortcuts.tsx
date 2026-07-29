import React from 'react';

export default function RoleShortcuts() {
    return (
        <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Role Shortcuts</h3>

            <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                    <span className="font-bold text-purple-300 text-sm block">🛡️ Admin Actions</span>
                    <p className="text-xs text-gray-400 mt-1">Manage staff roles, inspect permissions & user logs.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-blue-500/20 hover:border-blue-500/40 transition-colors">
                    <span className="font-bold text-blue-300 text-sm block">📋 Receptionist Desk</span>
                    <p className="text-xs text-gray-400 mt-1">Process patient check-ins and collect pending payments.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
                    <span className="font-bold text-emerald-300 text-sm block">🩺 Chiropractor Suite</span>
                    <p className="text-xs text-gray-400 mt-1">Access patient care plans, write clinical SOAP notes.</p>
                </div>
            </div>
        </div>
    );
}
