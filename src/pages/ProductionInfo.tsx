import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductionInfoEditor } from '@/hooks/useProductionInfo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, X, Edit, ArrowLeft } from 'lucide-react';
import { useToastHelper } from '@/hooks/useToastHelper';
import { Production_info } from '@/components/screenplay/Production_info';
import { ProductionInfoViewer } from '@/components/screenplay/ProductionInfoViewer';

// Page header component
import PageHeader from '@/components/layout/PageHeader';

const ProductionInfoPage: React.FC = () => {
  const { screenplayId } = useParams<{ screenplayId: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastHelper();
  
  const {
    productionInfo,
    isLoading,
    isSaving,
    error,
    success,
    isEditing,
    startEditing,
    cancelEditing,
    saveChanges,
  } = useProductionInfoEditor(screenplayId || '');

  // Handle errors and success messages
  useEffect(() => {
    if (error) {
      showError(error);
    }
    if (success) {
      showSuccess(success);
    }
  }, [error, success, showError, showSuccess]);

  // Handle save action
  const handleSave = async () => {
    const saved = await saveChanges();
    if (saved) {
      showSuccess('Production information saved successfully!');
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(`/script`);
  };

  // Handle toggle sidebar
  const handleToggleSidebar = () => {
    // This would be implemented in the parent component
  };

  if (!screenplayId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="p-6">
            <p>No screenplay selected. Please select a screenplay first.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Page Header */}
      <PageHeader
        title="Production Information"
        subtitle={productionInfo?.title || 'Manage production details'}
        screenplayId={screenplayId}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading production information...</span>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Action buttons */}
            <div className="flex justify-between mb-6">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Script
              </Button>
              
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={cancelEditing}
                      className="flex items-center gap-2"
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      className="flex items-center gap-2"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={startEditing}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Information
                  </Button>
                )}
              </div>
            </div>

            {/* Tabs for View/Edit modes */}
            <Tabs defaultValue={isEditing ? "edit" : "view"} value={isEditing ? "edit" : "view"}>
              <TabsList className="mb-4">
                <TabsTrigger value="view" disabled={isEditing}>View</TabsTrigger>
                <TabsTrigger value="edit" disabled={!isEditing}>Edit</TabsTrigger>
              </TabsList>
              
              <TabsContent value="view" className="space-y-4">
                {productionInfo && (
                  <ProductionInfoViewer productionInfo={productionInfo} />
                )}
              </TabsContent>
              
              <TabsContent value="edit">
                <Production_info 
                  screenplayId={screenplayId} 
                  onSave={handleSave}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionInfoPage;