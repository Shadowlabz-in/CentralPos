import { Dialog } from './Dialog';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  loading,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 mb-5">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm rounded-lg text-white ${
            variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'
          } disabled:opacity-50`}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
