interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDanger?: boolean;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog = ({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isDanger = false,
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    {description && <p className="text-sm text-slate-500">{description}</p>}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${
                            isDanger
                                ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                        }`}
                    >
                        {isLoading ? 'Processing...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
