export const localStorageHelper = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return null
      return JSON.parse(item) as T
    } catch {
      localStorage.removeItem(key)
      return null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.log(error)
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.log(error)
    }
  },

  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.log(error)
    }
  }
}

export const LS_KEYS = {
  PROJECTS: 'projects',
  TASKS: 'tasks',
  VIEW_MODE: 'view_mode',
  TABLE_SETTINGS: 'table_settings',
  HAS_SEEDED_PROJECTS: 'has_seeded_projects',
  HAS_SEEDED_TASKS: 'has_seeded_tasks'
} as const

export const createPersistence = <T>(
  key: string,
  getState: () => T,
  setState?: (state: T) => void
) => {
  const initialize = () => {
    const stored = localStorageHelper.get<T>(key)
    if (stored && setState) {
      setState(stored)
      return true
    }
    return false
  }

  const save = () => {
    localStorageHelper.set(key, getState())
  }

  return {
    initialize,
    save
  }
}
