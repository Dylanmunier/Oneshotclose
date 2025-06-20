// Utilitaire pour requêtes vers le backend Render
export async function fetchFromAPI(path, options = {}) {
  const res = await fetch(`https://oneshotclose.onrender.com/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
