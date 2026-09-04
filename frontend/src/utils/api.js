export function getApiUrl(path) {
  const envBase = import.meta.env.VITE_API_BASE_URL;
  if (envBase) {
    return `${envBase.replace(/\/$/, '')}${path}`;
  }

  // Default to relative route for unified Vercel deployment and local dev proxy
  return path;
}
