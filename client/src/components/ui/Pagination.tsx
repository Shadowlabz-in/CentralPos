interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <span className="text-gray-500">{total} total items</span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let p: number;
          if (totalPages <= 5) p = i + 1;
          else if (page <= 3) p = i + 1;
          else if (page >= totalPages - 2) p = totalPages - 4 + i;
          else p = page - 2 + i;

          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-3 py-1.5 rounded border ${
                p === page ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          );
        })}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
