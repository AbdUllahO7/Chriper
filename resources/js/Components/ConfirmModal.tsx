import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onClose: () => void;
}

export default function ConfirmModal({
    isOpen,
    title = 'Confirm Action',
    message,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    onConfirm,
    onClose,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-red-500/30 shadow-2xl space-y-6 text-center">
                {/* Warning Glow Icon */}
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 shadow-lg shadow-red-500/20">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>

                <div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight">{title}</h3>
                    <p className="text-sm text-gray-300 mt-2 leading-relaxed">{message}</p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-1/2 px-5 py-3 rounded-2xl glass-card text-gray-300 hover:text-white font-semibold text-xs border border-white/10 hover:bg-white/10 transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="w-1/2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs hover:from-red-500 hover:to-rose-500 transition-all shadow-lg shadow-red-600/30 active:scale-95"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
