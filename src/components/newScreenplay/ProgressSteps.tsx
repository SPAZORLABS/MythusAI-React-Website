import React from 'react'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: number
  title: string
  description: string
}

interface ProgressStepsProps {
  steps: Step[]
  currentStep: number
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="mt-6" aria-label="Progress steps">
      {/* Mobile: vertical stepper */}
      <ol className="md:hidden space-y-4" role="list">
        {steps.map((step, index) => {
          const isDone = currentStep > step.id
          const isActive = currentStep === step.id
          const circleClasses = cn(
            'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
            isDone || isActive
              ? 'border-primary bg-primary text-white'
              : 'border-muted-foreground text-muted-foreground'
          )
          const connectorClasses = cn(
            'w-px flex-1',
            isDone ? 'bg-primary' : 'bg-black'
          )

          return (
            <li key={step.id} className="relative flex gap-3" role="listitem" aria-current={isActive ? 'step' : undefined}>
              <div className="flex flex-col items-center">
                <div className={circleClasses} aria-hidden>
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-medium">{step.id}</span>}
                </div>
                {index < steps.length - 1 && <div className={connectorClasses} aria-hidden />}
              </div>

              <div className="pt-0.5 min-w-0">
                <p className={cn(
                  'text-sm font-medium',
                  isDone || isActive ? 'text-foreground' : 'text-white',
                  'line-clamp-1'
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-white line-clamp-2">
                  {step.description}
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      {/* Desktop: horizontal stepper */}
      <div className="hidden md:flex items-center justify-between overflow-x-visible">
        {steps.map((step, index) => {
          const isDone = currentStep > step.id
          const isActive = currentStep === step.id
          const circleClasses = cn(
            'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
            isDone || isActive
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-muted-foreground text-muted-foreground'
          )

          return (
            <div key={step.id} className="flex items-center min-w-0" aria-current={isActive ? 'step' : undefined}>
              <div className={circleClasses} aria-hidden>
                {isDone ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-medium">{step.id}</span>}
              </div>

              <div className="ml-3 min-w-0">
                <p className={cn('text-sm font-medium truncate', isDone || isActive ? 'text-foreground' : 'text-white')}>
                  {step.title}
                </p>
                <p className="text-xs text-white line-clamp-2">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <ArrowRight
                  className={cn('mx-4 h-4 w-4 flex-shrink-0', isDone ? 'text-primary' : 'text-white')}
                  aria-hidden
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProgressSteps
