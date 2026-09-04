export function getApiUrl(path) {
  const envBase = import.meta.env.VITE_API_BASE_URL;
  if (envBase) {
    return `${envBase.replace(/\/$/, '')}${path}`;
  }
  
  // If running on a standalone frontend host, fallback to unified backend host
  if (typeof window !== 'undefined' && window.location.hostname.includes('jan-suvidha-web')) {
    return `https://jan-suvidha-app.vercel.app${path}`;
  }

  // Standard relative route for unified Vercel / local deployment
  return path;
}
