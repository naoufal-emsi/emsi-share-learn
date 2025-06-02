import React from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import RoomResourceUploadWrapper from './RoomResourceUploadWrapper';

interface AddResourceDialogProps {
  onResourceAdded?: (resource: any) => void;
  roomId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: React.ReactNode;
  onUpload?: (formData: FormData) => Promise<void>;
}

const AddResourceDialog: React.FC<AddResourceDialogProps> = ({
  onResourceAdded,
  roomId,
  open,
  onOpenChange,
  triggerButton,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const handleSuccess = () => {
    if (onResourceAdded) {
      // Since we don't have direct access to the resource object,
      // we'll just trigger the callback to refresh the resources list
      onResourceAdded({});
    }
  };

  return (
    <RoomResourceUploadWrapper
      roomId={roomId || ''}
      onSuccess={handleSuccess}
      open={open ?? internalOpen}
      onOpenChange={onOpenChange ?? setInternalOpen}
      triggerButton={triggerButton}
    />
  );
};

export default AddResourceDialog;