import { PencilIcon, TrashIcon } from './Icons';

export default function TeamMemberCard({ item, onEdit, onDelete }) {
  return (
    <div className="group relative flex items-center gap-4 overflow-hidden rounded-lg border border-ink-200 bg-white p-4 pl-6 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/5">
      <span className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-brand-400 to-brand-600" aria-hidden="true" />
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-brand-100 bg-brand-50">
        {item.imagePath ? (
          <img src={item.imagePath} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-brand-500">
            {item.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-sans text-base font-semibold text-ink-900">{item.name}</h3>
        {item.role && (
          <p className="mt-0.5 truncate font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-600">
            {item.role}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(item)}
          aria-label={`Edit ${item.name}`}
          className="rounded-md p-1.5 text-ink-400 transition hover:bg-brand-50 hover:text-brand-600"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(item)}
          aria-label={`Delete ${item.name}`}
          className="rounded-md p-1.5 text-ink-400 transition hover:bg-danger-50 hover:text-danger-600"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
