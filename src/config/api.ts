const testingFrontendHost = 'testing-storybrand-frontend.bakano.ec'
const testingApiUrl = 'https://serum-backapp.vercel.app/api'

export function getApiBaseUrl() {
  if (window.location.hostname === testingFrontendHost) return testingApiUrl

  return (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8101/api').replace(/\/+$/, '')
}
