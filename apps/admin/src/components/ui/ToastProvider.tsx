import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastOptions {
    title?: string;
    description: string;
    variant?: ToastVariant;
    duration?: number;
}

interface ToastRecord extends ToastOptions {
    id: number;
}

interface ToastContextValue {
    showToast: (options: ToastOptions) => number;
    dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const variantStyles: Record<ToastVariant, string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    info: 'border-slate-200 bg-white text-slate-900',
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<ToastRecord[]>([]);
    const timeouts = useRef<Record<number, number>>({});

    const dismissToast = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        const timeoutId = timeouts.current[id];
        if (timeoutId) {
            window.clearTimeout(timeoutId);
            delete timeouts.current[id];
        }
    }, []);

    const showToast = useCallback((options: ToastOptions) => {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        const toast: ToastRecord = {
            id,
            variant: options.variant ?? 'info',
            duration: options.duration ?? 4500,
            ...options,
        };

        setToasts((current) => [...current, toast]);

        timeouts.current[id] = window.setTimeout(() => {
            dismissToast(id);
        }, toast.duration);

        return id;
    }, [dismissToast]);

    const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-full max-w-md flex-col gap-3 px-4">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto rounded-2xl border p-4 shadow-lg shadow-slate-900/10 transition ${variantStyles[toast.variant ?? 'info']}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
                                <p className="text-sm text-slate-600">{toast.description}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => dismissToast(toast.id)}
                                className="text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
