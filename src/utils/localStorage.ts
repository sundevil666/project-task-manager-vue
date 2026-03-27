/**
 * LocalStorage utility functions with error handling
 */

export const localStorageHelper = {
  /**
   * Get data from LocalStorage
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return null
      return JSON.parse(item) as T
    } catch {
      // Remove corrupted data
      localStorage.removeItem(key)
      return null
    }
  },

  /**
   * Set data to LocalStorage
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Silent fail for LocalStorage set errors
    }
  },

  /**
   * Remove data from LocalStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch {
      // Silent fail for LocalStorage remove errors
    }
  },

  /**
   * Clear all data
   */
  clear(): void {
    try {
      localStorage.clear()
    } catch {
      // Silent fail for LocalStorage clear errors
    }
  }
}

// LocalStorage keys
export const LS_KEYS = {
  PROJECTS: 'projects',
  TASKS: 'tasks',
  VIEW_MODE: 'view_mode',
  TABLE_SETTINGS: 'table_settings',
  HAS_SEEDED_PROJECTS: 'has_seeded_projects',
  HAS_SEEDED_TASKS: 'has_seeded_tasks'
} as const

/**
 * Create a persistence function for Pinia stores
 * This function automatically saves state to LocalStorage when it changes
 */
export const createPersistence = <T>(
  key: string,
  getState: () => T,
  setState?: (state: T) => void
) => {
  // Initialize from LocalStorage
  const initialize = () => {
    const stored = localStorageHelper.get<T>(key)
    if (stored && setState) {
      setState(stored)
      return true
    }
    return false
  }

  // Save to LocalStorage
  const save = () => {
    localStorageHelper.set(key, getState())
  }

  return {
    initialize,
    save
  }
}
