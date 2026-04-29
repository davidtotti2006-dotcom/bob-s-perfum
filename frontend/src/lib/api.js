const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function getPerfumes(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  );
  const qs = new URLSearchParams(clean).toString();
  const res = await fetch(`${API_URL}/api/perfumes${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Erreur de récupération des parfums');
  return res.json();
}

export async function getPerfume(slug) {
  const res = await fetch(`${API_URL}/api/perfumes/${slug}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Parfum introuvable');
  return res.json();
}
