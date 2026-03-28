import { useToast } from 'vue-toastification'
import { useAppStore } from '../store'

type ToastOptions = Parameters<ReturnType<typeof useToast>['error']>[1]

export interface HandleErrorOptions {
  /** Custom message to show in toast. If not provided, a generic message will be used */
  message?: string
  /** Whether to also set error in appStore for global error state */
  setGlobalError?: boolean
  /** Toast options to pass to vue-toastification */
  toastOptions?: ToastOptions
}

/**
 * Unified error handler that shows toast notification and optionally sets global error state
 * @param error - The error to handle
 * @param options - Configuration options
 */
export const handleError = (error: unknown, options: HandleErrorOptions = {}): void => {
  const toast = useToast()
  const appStore = useAppStore()

  const { message, setGlobalError = false, toastOptions } = options

  // Extract error message
  let errorMessage: string
  if (message) {
    errorMessage = message
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else if (typeof error === 'string') {
    errorMessage = error
  } else {
    errorMessage = 'Сталася помилка. Спробуйте ще раз.'
  }

  // Show toast notification
  toast.error(errorMessage, toastOptions)

  // Set global error if requested
  if (setGlobalError) {
    appStore.setError(errorMessage)
  }

  // Log to console for debugging
  console.error(error)
}

/**
 * Handle error with default message - useful for consistent error messages across the app
 * @param error - The error to handle
 * @param defaultMessage - Default message to show if error doesn't have one
 * @param options - Additional configuration options
 */
export const handleErrorWithDefault = (
  error: unknown,
  defaultMessage: string,
  options: Omit<HandleErrorOptions, 'message'> = {}
): void => {
  const message = error instanceof Error ? error.message : defaultMessage
  handleError(error, { ...options, message })
}
