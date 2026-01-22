export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://pet-manager-api.geia.vip',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
} as const
