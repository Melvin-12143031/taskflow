
const ConfirmDialog = ({
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    isDangerous = false,
    isLoading = false,
    loadingLabel = 'Processing...',
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
                className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
            >
                <h2
                    id="confirm-dialog-title"
                    className="text-xl font-bold text-white"
                >
                    {title}
                </h2>

                <p
                    id="confirm-dialog-description"
                    className="mt-3 text-sm leading-6 text-slate-400"
                >
                    {message}
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${isDangerous
                                ? 'bg-red-500 hover:bg-red-400'
                                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                            }`}
                    >
                        {isLoading ? loadingLabel : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog
