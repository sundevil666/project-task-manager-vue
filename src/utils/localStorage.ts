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
    } catch (error) {
      console.error(`Error parsing LocalStorage key "${key}":`, error)
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
    } catch (error) {
      console.error(`Error setting LocalStorage key "${key}":`, error)
    }
  },

  /**
   * Remove data from LocalStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing LocalStorage key "${key}":`, error)
    }
  },

  /**
   * Clear all data
   */
  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing LocalStorage:', error)
    }
  }
}

// LocalStorage keys
export const LS_KEYS = {
  PROJECTS: 'projects',
  TASKS: 'tasks',
  VIEW_MODE: 'view_mode'
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
