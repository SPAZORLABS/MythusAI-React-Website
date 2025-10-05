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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Screenplay
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>"{screenplay.filename}"</strong>? 
            This action cannot be undone and will permanently remove the screenplay and all associated data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-destructive">Warning</p>
            <p className="text-muted-foreground">
              This will delete {screenplay.scene_count} scene{screenplay.scene_count !== 1 ? 's' : ''} and all related content.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-2 hover:bg-amber-200"
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