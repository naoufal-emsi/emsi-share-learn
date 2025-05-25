import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { resourcesAPI } from '@/services/api';

interface AddResourceDialogProps {
  onResourceAdded: (resource: any) => void;
  roomId: string;
}

const AddResourceDialog: React.FC<AddResourceDialogProps> = ({ onResourceAdded, roomId }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('');
    setFile(null);
  };

  const handleAddResource = async () => {
    // Validate required fields
    if (!title.trim() || !type.trim() || !file) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description || '');
      formData.append('type', type);
      formData.append('file', file);
      formData.append('room', roomId);

      // Send POST request to backend
      const newResource = await resourcesAPI.uploadResource(formData);

      if (!newResource || !newResource.id) {
        throw new Error('Invalid response from server');
      }

      onResourceAdded(newResource);
      toast({
        title: "Success!",
        description: "Resource has been successfully uploaded",
      });

      resetForm();
      setOpen(false);
    } catch (error: any) {
      console.error('Resource upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error?.message || "Failed to upload resource. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Resource</DialogTitle>
          <DialogDescription>
            Upload a new resource for students to access. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Resource title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={type} onValueChange={setType} disabled={isUploading}>
              <SelectTrigger>
                <SelectValue placeholder="Select resource type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="doc">Word Document</SelectItem>
                <SelectItem value="ppt">PowerPoint</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="zip">ZIP Archive</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Resource description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file">File *</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.mp4,.mp3,.avi,.mov,.jpg,.jpeg,.png,.gif"
              disabled={isUploading}
            />
            {file && (
              <div className="text-sm text-muted-foreground">
                <p>Selected file: {file.name}</p>
                <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleAddResource}
            disabled={isUploading || !title || !type || !file}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Resource'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddResourceDialog;