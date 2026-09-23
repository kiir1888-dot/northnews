import { CalendarIcon, ClockIcon, PinIcon, PencilIcon, TrashIcon } from './Icons';
import { formatDate, formatDateRange } from '../utils';

export default function ContentCard({ kind, item, onEdit, onDelete }) {
  const isEvent = kind === 'event';

  return (
    <div className="group relative overflow-hidden rounded-lg border border-ink-200 bg-white p-5 pl-6 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/5">
      <span className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-brand-400 to-brand-600" aria-hidden="true" />
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-sans text-base font-semibold leading-snug text-ink-900">{item.title}</h3>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.title}`}
            className="rounded-md p-1.5 text-ink-400 transition hover:bg-brand-50 hover:text-brand-600"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            aria-label={`Delete ${item.title}`}
            className="rounded-md p-1.5 text-ink-400 transition hover:bg-danger-50 hover:text-danger-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <CalendarIcon className="h-3.5 w-3.5 text-ink-400" />
          {isEvent ? formatDateRange(item.startDate, item.endDate) : formatDate(item.date)}
        </span>
        {!isEvent && item.category && (
          <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-brand-700">
            {item.category}
          </span>
        )}
        {isEvent && item.time && (
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="h-3.5 w-3.5 text-ink-400" />
            {item.time}
          </span>
        )}
        {isEvent && item.location && (
          <span className="inline-flex items-center gap-1.5">
            <PinIcon className="h-3.5 w-3.5 text-ink-400" />
            {item.location}
          </span>
        )}
      </div>

      {item.description && (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-600">{item.description}</p>
      )}

      {item.imagePath && (
        <img
          src={item.imagePath}
          alt=""
          className="mt-3 h-32 w-full rounded-md border border-ink-100 object-cover"
        />
      )}
    </div>
  );
}
