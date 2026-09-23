export default function Placeholder({ title, subtitle }) {
  return (
    <div className="p-8">
      <div className="mx-auto flex max-w-lg flex-col items-center rounded-lg border-2 border-dashed border-brand-200 bg-brand-50/30 px-8 py-16 text-center">
        <h1 className="font-sans text-xl font-semibold text-ink-900">{title}</h1>
        <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
        <p className="mt-6 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
          Coming soon
        </p>
      </div>
    </div>
  );
}
