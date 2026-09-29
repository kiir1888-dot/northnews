/** Fetch helpers for the public website's forms (no login needed). */

async function parse(res) {
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;
  if (!res.ok) {
    throw new Error(data?.message || 'Something went wrong. Please try again.');
  }
  return data;
}

export async function getJson(path) {
  return parse(await fetch(`/api${path}`));
}

export async function postJson(path, body) {
  return parse(
    await fetch(`/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

export async function postForm(path, formData) {
  return parse(await fetch(`/api${path}`, { method: 'POST', body: formData }));
}

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;

/**
 * Emails a copy of a form to the newsroom inbox through Web3Forms.
 * Runs after the message is already saved in the dashboard, so a failure
 * here is logged but never shown to the reader. Resolves to true on success.
 */
export async function emailNewsroom({ subject, name, email, fields }) {
  if (!WEB3FORMS_KEY) {
    // eslint-disable-next-line no-console
    console.warn('[northi] VITE_WEB3FORMS_KEY is missing from this build; newsroom email not sent.');
    return false;
  }
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `[North i] ${subject}`,
        from_name: 'North i website',
        name,
        email,
        replyto: email,
        ...fields,
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.success === false) throw new Error(data?.message || `HTTP ${res.status}`);
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[northi] Web3Forms email failed:', err.message);
    return false;
  }
}
