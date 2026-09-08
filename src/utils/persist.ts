import { watch, type Ref } from 'vue'

const PREFIX = 'nammotors_'

export function loadPersisted<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    // ignore malformed/legacy data and fall back to seed
  }
  return fallback
}

export function persist<T>(key: string, source: Ref<T>) {
  watch(
    source,
    (value) => {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    },
    { deep: true },
  )
}

/** After loading persisted rows, resume the id counter above the highest existing numeric suffix. */
export function computeNextId(items: { id: string }[], prefix: string): number {
  let max = 0
  const re = new RegExp(`^${prefix}(\\d+)$`)
  for (const item of items) {
    const match = re.exec(item.id)
    if (match?.[1]) max = Math.max(max, parseInt(match[1], 10))
  }
  return max + 1
}
