import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Screenplay } from '@/services/api/screenplayService';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  screenplay: Screenplay | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  screenplay,
  onClose,
  onConfirm,
  isDeleting
}) => {
  if (!screenplay) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] gap-0 p-0">
        {/* Red accent strip at top */}
        <div className="h-1 bg-destructive w-full rounded-t-lg" />
        
        <div className="p-6 space-y-5">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                Delete Screenplay?
              </DialogTitle>
            </div>
            <DialogDescription className="text-base leading-relaxed pt-1">
              You're about to permanently delete{' '}
              <span className="font-semibold text-foreground">"{screenplay.filename}"</span>.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {/* Warning box with improved styling */}
          <div className="flex gap-3 p-4 bg-destructive/5 rounded-lg border-l-4 border-destructive">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="text-sm font-semibold text-destructive">
                What will be deleted:
              </p>
              <ul className="text-sm text-muted-foreground space-y-0.5">
                <li>• {screenplay.scene_count} scene{screenplay.scene_count !== 1 ? 's' : ''}</li>
                <li>• All associated breakdowns and data</li>
                <li>• Original screenplay file</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/30 flex-row justify-end gap-3 rounded-b-lg">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="min-w-[140px] gap-2"
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Permanently
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
