import React, { useEffect, useState } from 'react'
import { Brain, Loader2, AlertCircle, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react'
import { useToastHelper } from '@/hooks/useToastHelper'
import { agentsService } from '@/services/api/agents'
import clsx from 'clsx'

interface ScreenplaySummaryStatusIconProps {
  screenplayId: string
  screenplayTitle?: string
  onShowSummaryDetail?: (summaryData: any) => void
}

const SIZE = 44 // px, adjust if you want slightly larger/smaller

const ScreenplaySummaryStatusIcon: React.FC<ScreenplaySummaryStatusIconProps> = ({
  screenplayId,
  screenplayTitle,
  onShowSummaryDetail
}) => {
  const { showLoading, updateToast, showError } = useToastHelper()
  const [summaryStatus, setSummaryStatus] = useState<'loading' | 'exists' | 'none' | 'error'>('loading')
  const [isGenerating, setIsGenerating] = useState(false)
  const [summaryData, setSummaryData] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    checkSummaryStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenplayId])

  async function checkSummaryStatus() {
    try {
      setSummaryStatus('loading')
      const result = await agentsService.getSummaryStatus(screenplayId)
      if (result?.hasExistingSummary) {
        setSummaryStatus('exists')
        setSummaryData(result.summary)
        if (result.summary?.data?.summary?.updated_at) {
          setLastUpdated(result.summary.data.summary.updated_at)
        } else {
          setLastUpdated(new Date().toISOString())
        }
      } else {
        setSummaryStatus('none')
        setSummaryData(null)
        setLastUpdated(null)
      }
    } catch (err) {
      console.error('checkSummaryStatus error', err)
      setSummaryStatus('error')
      setSummaryData(null)
      setLastUpdated(null)
    }
  }

  async function generateSummary(forceRefresh = false) {
    if (isGenerating) return
    setIsGenerating(true)
    const toastId = showLoading(forceRefresh ? 'Regenerating summary…' : 'Generating summary…', undefined, { minimal: true, persistent: true })

    try {
      const response = await agentsService.summarizeScreenplay(screenplayId, forceRefresh)
      if (response?.success) {
        updateToast(toastId, {
          type: 'success',
          title: 'Summary ready',
          minimal: true,
          persistent: false,
          duration: 3000
        })
        // After generation, wait briefly and pull the latest summary from the API
        // This ensures we reflect server-side finalized data rather than a stale/local snapshot
        await new Promise((resolve) => setTimeout(resolve, 1000))
        try {
          const latest = await agentsService.getSummaryStatus(screenplayId)
          if (latest?.hasExistingSummary) {
            setSummaryStatus('exists')
            setSummaryData(latest.summary)
            if (latest.summary?.data?.summary?.updated_at) {
              setLastUpdated(latest.summary.data.summary.updated_at)
            } else {
              setLastUpdated(new Date().toISOString())
            }
            // open panel automatically after generation using latest server data
            onShowSummaryDetail?.(latest.summary)
          } else {
            setSummaryStatus('none')
            setSummaryData(null)
            setLastUpdated(null)
          }
        } catch (refreshErr) {
          // If refresh fails, fallback to local response but still mark as exists
          console.warn('Summary refresh after generation failed, using local response', refreshErr)
          setSummaryStatus('exists')
          setSummaryData(response)
          setLastUpdated(new Date().toISOString())
          onShowSummaryDetail?.(response)
        }
      } else {
        throw new Error(response?.message || 'Failed')
      }
    } catch (err: any) {
      console.error('generateSummary error', err)
      updateToast(toastId, {
        type: 'error',
        title: 'Summary failed',
        minimal: true,
        persistent: false,
        duration: 4000
      })
      showError?.(err?.message || 'Failed to generate summary')
      setSummaryStatus(prev => (prev === 'loading' ? 'error' : prev))
    } finally {
      setIsGenerating(false)
    }
  }

  const onActivate = () => {
    // click or keyboard activation
    if (summaryStatus === 'exists') {
      onShowSummaryDetail?.(summaryData)
    } else if (summaryStatus === 'none') {
      generateSummary(false)
    } else if (summaryStatus === 'error') {
      checkSummaryStatus()
    }
    // loading -> ignore
  }

  const formatLastUpdated = (dateString?: string | null) => {
    if (!dateString) return ''
    try {
      const d = new Date(dateString)
      return d.toLocaleString()
    } catch {
      return dateString
    }
  }

  // Visual states
  const isBusy = summaryStatus === 'loading' || isGenerating
  const title =
    summaryStatus === 'exists'
      ? (lastUpdated ? `AI summary available — updated ${formatLastUpdated(lastUpdated)}` : 'AI summary available')
      : summaryStatus === 'none'
      ? 'No summary — click to generate'
      : summaryStatus === 'error'
      ? 'Error fetching summary — click to retry'
      : 'Checking summary…'

  return (
    <div className="inline-flex items-center">
      <button
        aria-label={title}
        title={title}
        onClick={onActivate}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onActivate()
          }
        }}
        className={clsx(
          'flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
          // size
          `h-[${SIZE}px] w-[${SIZE}px}]`,
          // pointer cursor except when loading
          { 'cursor-not-allowed opacity-80': isBusy } as any
        )}
        style={{
          // ensure consistent background for Electron & web (no translucency)
          background: 'transparent'
        }}
      >
        {/* circle background (subtle) */}
        <span
          className={clsx(
            'flex items-center justify-center rounded-full shadow-sm',
            // color variants
            summaryStatus === 'exists' && '',
            summaryStatus === 'none' && '',
            summaryStatus === 'error' && '',
            summaryStatus === 'loading' && ''
          )}
          style={{ width: SIZE - 8, height: SIZE - 8 }}
        >
          {/* icon */}
          {summaryStatus === 'loading' || isGenerating ? (
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          ) : summaryStatus === 'exists' ? (
            <Sparkles className="h-5 w-5 text-green-600" />
          ) : summaryStatus === 'none' ? (
            <Brain className="h-5 w-5 text-gray-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
        </span>
      </button>

      {/* optional small regen / status action icon (only visible on hover) */}
      <button
        onClick={() => (summaryStatus === 'exists' ? generateSummary(true) : checkSummaryStatus())}
        title={summaryStatus === 'exists' ? 'Regenerate summary' : 'Retry check'}
        aria-label={summaryStatus === 'exists' ? 'Regenerate summary' : 'Retry check'}
        className="ml-2 hidden group-hover:inline-flex text-muted-foreground hover:text-primary"
        style={{ display: 'none' }} // default hidden, you can toggle with a wrapper group if you want
      >
        <RefreshCw className="h-4 w-4" />
      </button>
    </div>
  )
}

export default ScreenplaySummaryStatusIcon
