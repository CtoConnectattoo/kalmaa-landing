import type { APIRoute } from 'astro';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const clean = (value: FormDataEntryValue | null, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, { error: 'Formulario no válido.' });
  }

  // Campo trampa para bots: si viene relleno, respondemos OK sin guardar.
  if (clean(form.get('website'), 200)) return json(200, { ok: true });

  const email = clean(form.get('email'), 254).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(400, { error: 'Revisa tu email.' });
  if (form.get('consent') !== 'yes') return json(400, { error: 'Necesitamos tu permiso para escribirte.' });

  const instagram = clean(form.get('instagram'), 60).replace(/^@+/, '');
  const url = import.meta.env.SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return json(503, { error: 'La lista de espera aún no está activa. Vuelve en un rato.' });

  const res = await fetch(`${url}/rest/v1/waitlist`, {
    method: 'POST',
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
      prefer: 'return=minimal,resolution=ignore-duplicates',
    },
    body: JSON.stringify({
      email,
      instagram: instagram || null,
      template: clean(form.get('template'), 40) || null,
      source: clean(form.get('source'), 200) || null,
      consent: true,
    }),
  });

  if (!res.ok && res.status !== 409) {
    console.error('waitlist insert failed', res.status, await res.text());
    return json(502, { error: 'No hemos podido apuntarte. Inténtalo de nuevo en un momento.' });
  }
  return json(200, { ok: true });
};
