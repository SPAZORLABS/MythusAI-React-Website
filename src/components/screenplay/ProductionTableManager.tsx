import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Trash2, 
  Database, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Settings
} from 'lucide-react'
import { productionService } from '@/services/api/production'
import { cn } from '@/lib/utils'

interface ProductionTableManagerProps {
  className?: string
}

export const ProductionTableManager: React.FC<ProductionTableManagerProps> = ({ 
  className 
}) => {
  const [columns, setColumns] = useState<string[]>([])
  const [totalColumns, setTotalColumns] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // New column form
  const [newColumnName, setNewColumnName] = useState('')
  const [newColumnType, setNewColumnType] = useState('TEXT')
  const [newColumnDefault, setNewColumnDefault] = useState('')

  // Load existing columns
  useEffect(() => {
    loadColumns()
  }, [])

  const loadColumns = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await productionService.listColumns()
      if (response.success && response.data) {
        setColumns(response.data.columns || [])
        setTotalColumns(response.data.total_columns || 0)
      }
    } catch (err: any) {
      setError('Failed to load table columns')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) {
      setError('Column name is required')
      return
    }

    setIsAdding(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await productionService.addColumn({
        column_name: newColumnName.trim(),
        column_type: newColumnType,
        default_value: newColumnDefault.trim() || undefined
      })

      if (response.success) {
        setSuccess(`Column "${newColumnName}" added successfully!`)
        setNewColumnName('')
        setNewColumnType('TEXT')
        setNewColumnDefault('')
        await loadColumns() // Refresh the list
      } else {
        setError(response.message || 'Failed to add column')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding column')
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveColumn = async (columnName: string) => {
    if (!confirm(`Are you sure you want to remove the column "${columnName}"? This action cannot be undone.`)) {
      return
    }

    setIsRemoving(columnName)
    setError(null)
    setSuccess(null)

    try {
      const response = await productionService.removeColumn(columnName)
      if (response.success) {
        setSuccess(`Column "${columnName}" removed successfully!`)
        await loadColumns() // Refresh the list
      } else {
        setError(response.message || 'Failed to remove column')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while removing column')
    } finally {
      setIsRemoving(null)
    }
  }

  const columnTypes = [
    'TEXT',
    'VARCHAR(255)',
    'INTEGER',
    'REAL',
    'BOOLEAN',
    'DATE',
    'DATETIME',
    'BLOB'
  ]

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading table structure...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Production Table Manager</h2>
          <Badge variant="outline" className="ml-2">
            {totalColumns} columns
          </Badge>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Add New Column */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Column
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Column Name</label>
              <Input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="e.g., budget, location_type"
                onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Type</label>
              <select
                value={newColumnType}
                onChange={(e) => setNewColumnType(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {columnTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Default Value (optional)</label>
              <Input
                value={newColumnDefault}
                onChange={(e) => setNewColumnDefault(e.target.value)}
                placeholder="e.g., 0, 'Unknown'"
                onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button
                onClick={handleAddColumn}
                disabled={isAdding || !newColumnName.trim()}
                className="w-full gap-2"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Column
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Columns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Existing Columns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {columns.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No custom columns found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add columns above to customize your production information
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {columns.map((column, index) => (
                <div
                  key={column}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{column}</span>
                  </div>
                  
                  <Button
                    onClick={() => handleRemoveColumn(column)}
                    disabled={isRemoving === column}
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {isRemoving === column ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warning */}
      <Alert className="border-amber-200 bg-amber-50 text-amber-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Warning:</strong> Removing columns will permanently delete that data from all productions. 
          Make sure to backup any important information before removing columns.
        </AlertDescription>
      </Alert>
    </div>
  )
} 