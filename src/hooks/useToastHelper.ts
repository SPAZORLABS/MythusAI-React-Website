import { useToast } from '@/components/ui/toast'

export const useToastHelper = () => {
  const { addToast, updateToast, removeToast } = useToast()

  const showSuccess = (title: string, description?: string) => {
    return addToast({ type: 'success', title, description })
  }

  const showError = (title: string, description?: string) => {
    return addToast({ type: 'error', title, description })
  }

  const showInfo = (title: string, description?: string) => {
    return addToast({ type: 'info', title, description })
  }

  const showLoading = (title: string, description?: string, options?: { minimal?: boolean; persistent?: boolean }) => {
    return addToast({ type: 'loading', title, description, ...options })
  }

  return {
    showSuccess,
    showError,
    showInfo,
    showLoading,
    updateToast,
    removeToast,
    addToast
  }
} 