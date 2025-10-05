import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Production_info } from '@/components/screenplay/Production_info'
import { ProductionInfo } from '@/types'

interface ProductionInfoStepProps {
  screenplayId: string | null
  productionInfo: ProductionInfo
  hasProductionInfo: boolean
  onSave: (info: ProductionInfo) => Promise<void>
  onContinue: () => void
}

const ProductionInfoStep: React.FC<ProductionInfoStepProps> = ({
  screenplayId,
  hasProductionInfo,
  onSave,
  onContinue
}) => {
  return (
    <Card className="poppins-text bg-white border border-border rounded-2xl">
      <CardContent className="poppins-text bg-white">
        <Production_info
          screenplayId={screenplayId || 'temp-setup'}
          onSave={onSave}
        />
        
        {hasProductionInfo && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border poppins-text">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Production information saved
                </span>
              </div>
              <Button
                onClick={onContinue}
                className="gap-2"
              >
                Continue to Upload
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ProductionInfoStep