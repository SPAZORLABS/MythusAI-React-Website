import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'loading'
  title: string
  description?: string
  duration?: number
  minimal?: boolean
  persistent?: boolean
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  updateToast: (id: string, updates: Partial<Toast>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    setToasts(prev => [...prev, newToast])

    if (toast.type !== 'loading' && !toast.persistent) {
      const duration = toast.duration || 4000
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [removeToast])

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts(prev => prev.map(toast =>
      toast.id === id ? { ...toast, ...updates } : toast
    ))

    // Auto-close if updated to success/error/info
    if (['success', 'error', 'info'].includes(updates.type || '')) {
      setTimeout(() => removeToast(id), updates.duration || 2000)
    }
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

const ToastContainer: React.FC = () => {
  const { toasts } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToast()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => removeToast(toast.id), 150)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'loading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800'
      case 'error':
        return 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800'
      case 'loading':
        return 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800'
    }
  }

  return (
    <div
      className={cn(
        'transform transition-all duration-300 ease-out z-50',
        isVisible ? 'translate-x-0' : 'translate-x-full',
        toast.minimal ? 'p-2 rounded-md border shadow-sm max-w-xs' : 'p-4 rounded-lg border shadow-lg max-w-sm',
        getBgColor()
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-medium text-gray-900 dark:text-gray-100",
            toast.minimal ? "text-xs" : "text-sm"
          )}>
            {toast.title}
          </div>
          {toast.description && !toast.minimal && (
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {toast.description}
            </div>
          )}
        </div>
        {toast.type !== 'loading' && !toast.persistent && (
          <button
            onClick={handleRemove}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className={cn("h-4 w-4", toast.minimal && "h-3 w-3")} />
          </button>
        )}
      </div>
    </div>
  )
}

// Utility functions for easy toast usage
export const toast = {
  success: (title: string, description?: string) => {
    const context = useToast()
    return context.addToast({ type: 'success', title, description })
  },
  error: (title: string, description?: string) => {
    const context = useToast()
    return context.addToast({ type: 'error', title, description })
  },
  info: (title: string, description?: string) => {
    const context = useToast()
    return context.addToast({ type: 'info', title, description })
  },
  loading: (title: string, description?: string) => {
    const context = useToast()
    return context.addToast({ type: 'loading', title, description })
  }
} 