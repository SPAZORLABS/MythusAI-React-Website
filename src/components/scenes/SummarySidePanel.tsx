import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { X, Brain, Users, MapPin, Package, BookOpen, Calendar, User } from 'lucide-react'

interface SummarySidePanelProps {
  summaryData: any
  onClose: () => void
  className?: string
}

const SummarySidePanel: React.FC<SummarySidePanelProps> = ({
  summaryData,
  onClose,
  className = ''
}) => {
  const summary = summaryData

  if (!summary) {
    return (
      <div className={`bg-background border-l ${className}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Summary Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 text-center text-muted-foreground">
          No summary data available
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Unknown'
    }
  }

  return (
    <div className={`bg-background border-l ${className}`}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">AI Summary</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-full pb-4">
        {/* Global Summary */}
        <Card className="m-4 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              Story Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {summary.global_summary}
            </p>
          </CardContent>
        </Card>

        {/* Characters */}
        <Card className="m-4 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Characters ({Object.keys(summary.characters || {}).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(summary.characters || {}).map(([name, description]) => (
              <div key={name} className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <h4 className="font-medium text-sm">{name}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                  {description as string}
                </p>
                {Object.keys(summary.characters).indexOf(name) < Object.keys(summary.characters).length - 1 && (
                  <Separator className="mt-3" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sets/Locations */}
        <Card className="m-4 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Sets & Locations ({(summary.sets || []).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(summary.sets || []).map((set: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {set}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recurring Objects */}
        <Card className="m-4 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Recurring Objects ({(summary.recurring_objects || []).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(summary.recurring_objects || []).map((object: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {object}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="m-4 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Summary Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Screenplay ID:</span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {summary.screenplay_id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Created:</span>
                <span className="text-xs">
                  {summary.created_at ? formatDate(summary.created_at) : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="text-xs">
                  {summary.updated_at ? formatDate(summary.updated_at) : 'Unknown'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        {summaryData?.next_steps && summaryData.next_steps.length > 0 && (
          <Card className="m-4 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-4 w-4" />
                Recommended Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {summaryData.next_steps.map((step: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-600 font-bold text-xs mt-1">•</span>
                    {step}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default SummarySidePanel 