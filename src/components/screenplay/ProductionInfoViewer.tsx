import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Film, 
  Building2, 
  Users, 
  Calendar, 
  PlayCircle,
  Clock
} from 'lucide-react'
import { ProductionInfo } from '@/types'
import { cn } from '@/lib/utils'

interface ProductionInfoViewerProps {
  productionInfo: ProductionInfo
  className?: string
  showHeader?: boolean
}

export const ProductionInfoViewer: React.FC<ProductionInfoViewerProps> = ({ 
  productionInfo, 
  className,
  showHeader = true
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const formatArray = (array: string[] | undefined) => {
    if (!array || array.length === 0) return 'Not specified'
    return array.join(', ')
  }

  const hasAnyData = () => {
    return Object.values(productionInfo).some(value => 
      value && (Array.isArray(value) ? value.length > 0 : true)
    )
  }

  if (!hasAnyData()) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No production information available</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add production details to get started
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {showHeader && (
        <div className="flex items-center space-x-3">
          <Film className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold">Production Information</h3>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Basic Information */}
        {productionInfo.title && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Film className="h-4 w-4" />
                Title
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{productionInfo.title}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.company_name && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4" />
                Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{productionInfo.company_name}</p>
              {productionInfo.company_address && (
                <p className="text-xs text-muted-foreground mt-1">{productionInfo.company_address}</p>
              )}
            </CardContent>
          </Card>
        )}

        {productionInfo.production_number && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <PlayCircle className="h-4 w-4" />
                Production #
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium font-mono">{productionInfo.production_number}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.genre && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Film className="h-4 w-4" />
                Genre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">{productionInfo.genre}</Badge>
            </CardContent>
          </Card>
        )}

        {productionInfo.production_status && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <PlayCircle className="h-4 w-4" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge 
                variant={productionInfo.production_status.toLowerCase().includes('production') ? 'default' : 'secondary'}
              >
                {productionInfo.production_status}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Key Personnel */}
        {productionInfo.director_name && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Director
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{productionInfo.director_name}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.producer_names && productionInfo.producer_names.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Producers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{formatArray(productionInfo.producer_names)}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.writer_names && productionInfo.writer_names.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Writers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{formatArray(productionInfo.writer_names)}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.line_producer_name && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Line Producer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{productionInfo.line_producer_name}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.unit_production_manager && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                UPM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{productionInfo.unit_production_manager}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.assistant_directors && productionInfo.assistant_directors.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Assistant Directors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{formatArray(productionInfo.assistant_directors)}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.executive_producer && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Executive Producer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{productionInfo.executive_producer}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.production_accountant && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Production Accountant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{productionInfo.production_accountant}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.director_of_photography && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Director of Photography
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{productionInfo.director_of_photography}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.production_designer && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Production Designer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{productionInfo.production_designer}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.art_director && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Art Director
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{productionInfo.art_director}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.gaffer && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Gaffer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{productionInfo.gaffer}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.wardrobe_department && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Wardrobe Department
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{productionInfo.wardrobe_department}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.makeup_hair_department && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Makeup & Hair
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{productionInfo.makeup_hair_department}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.action_director && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Action Director
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{productionInfo.action_director}</p>
            </CardContent>
          </Card>
        )}

        {/* Production Schedule */}
        {productionInfo.shoot_start_date && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                Shoot Start
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{formatDate(productionInfo.shoot_start_date)}</p>
            </CardContent>
          </Card>
        )}

        {productionInfo.shoot_end_date && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                Shoot End
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{formatDate(productionInfo.shoot_end_date)}</p>
            </CardContent>
          </Card>
        )}

        {/* Production Duration */}
        {productionInfo.shoot_start_date && productionInfo.shoot_end_date && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                {(() => {
                  try {
                    const start = new Date(productionInfo.shoot_start_date)
                    const end = new Date(productionInfo.shoot_end_date)
                    const diffTime = Math.abs(end.getTime() - start.getTime())
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
                  } catch {
                    return 'Calculating...'
                  }
                })()}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 