import { env } from '../config/env'

/**
 * Retorna a URL absoluta da foto para exibição.
 * Se a API retornar caminho relativo, faz o prepend da base da API.
 */
export const getPhotoDisplayUrl = (url: string | undefined | null): string => {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  const base = env.apiBaseUrl.replace(/\/$/, '')
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${base}${path}`
}
