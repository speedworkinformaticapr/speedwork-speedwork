const CACHE_PREFIX = 'sw_cache_'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

export function getCachedData<T>(key: string, ttl: number): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() - entry.timestamp > ttl) return null
    return entry.data
  } catch {
    return null
  }
}

export function setCachedData<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
  } catch {
    // ignore storage errors
  }
}

export function clearCachedData(key: string): void {
  try {
    localStorage.removeItem(CACHE_PREFIX + key)
  } catch {
    // ignore
  }
}
