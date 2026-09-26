/**
 * A hidden field real visitors never see or fill in. Spam bots usually fill
 * every field, so the server quietly ignores submissions where it has a value.
 */
export default function Honeypot({ value, onChange }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={onChange} />
      </label>
    </div>
  );
}
