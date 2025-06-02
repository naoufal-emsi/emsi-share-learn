import React from 'react';
import ResourceUploadDialog from '../resources/ResourceUploadDialog';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface RoomResourceUploadWrapperProps {
  roomId: string;
  onSuccess?: (resource: any) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: React.ReactNode;
}

/**
 * A wrapper component that uses the ResourceUploadDialog component for rooms
 * This allows reusing the same upload component in both resource page and rooms
 */
const RoomResourceUploadWrapper: React.FC<RoomResourceUploadWrapperProps> = ({
  roomId,
  onSuccess,
  open,
  onOpenChange,
  triggerButton
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const handleSuccess = (resource: any) => {
    if (onSuccess) {
      onSuccess(resource);
    }
  };

  return (
    <>
      {!open && triggerButton && (
        <div onClick={() => setInternalOpen(true)}>
          {triggerButton}
        </div>
      )}
      
      {!open && !triggerButton && (
        <Button onClick={() => setInternalOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      )}
      
      <ResourceUploadDialog
        open={open ?? internalOpen}
        onOpenChange={onOpenChange ?? setInternalOpen}
        roomId={roomId}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default RoomResourceUploadWrapper;