import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Code, Video, Image as ImageIcon, FileArchive, File, Clock, RefreshCw, Download, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { resourcesAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import ResourceDetailDialog from '@/components/resources/ResourceDetailDialog';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  file_name: string;
  file_size: number;
  bookmark_count: number;
  status: string;
  uploaded_at: string;
  uploaded_by: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    profile_picture_data?: string;
  };
  category: number | null;
  category_name: string | null;
  rejection_reason?: string;
}

const MyPendingResourcesSection: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [confirmRejectDialogOpen, setConfirmRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const isAdmin = user?.role === 'admin' || user?.role === 'administration';

  useEffect(() => {
    fetchPendingResources();
  }, []);

  const fetchPendingResources = async () => {
    setLoading(true);
    try {
      // For admin, fetch all pending resources, for students fetch only their own
      let response;
      if (isAdmin) {
        response = await resourcesAPI.getAllPendingResources();
      } else {
        // For students, get their own resources with status=pending
        response = await resourcesAPI.getResources({ status: 'pending', uploaded_by: user?.id });
      }
      
      console.log('API Response for pending resources:', response);

      // Ensure response is an array, default to empty array if null/undefined
      const fetchedResources = Array.isArray(response) ? response : (response?.results || []);
      console.log('Fetched resources (after null/undefined check):', fetchedResources);
      
      setResources(fetchedResources);
    } catch (error) {
      console.error('Failed to fetch pending resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (resourceId: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent card click event
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourcesAPI.deleteResource(String(resourceId));
        setResources(prev => prev.filter(resource => resource.id !== resourceId));
        toast.success('Resource deleted successfully');
      } catch (error) {
        console.error(`Failed to delete resource ${resourceId}:`, error);
        toast.error('Failed to delete resource');
      }
    }
  };

  const handleDownloadResource = async (resourceId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    try {
      const blob = await resourcesAPI.downloadResource(resourceId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resources.find(r => r.id === resourceId)?.file_name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (error) {
      console.error('Failed to download resource:', error);
      toast.error('Failed to download resource');
    }
  };

  const handleApproveResource = async (resourceId: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent card click event
    try {
      await resourcesAPI.approveResource(resourceId);
      setResources(prev => prev.filter(resource => resource.id !== resourceId));
      toast.success('Resource approved successfully');
    } catch (error) {
      console.error('Failed to approve resource:', error);
      toast.error('Failed to approve resource');
    }
  };

  const handleRejectResource = async () => {
    if (!selectedResource || !rejectionReason.trim()) return;
    
    setProcessingId(selectedResource.id);
    try {
      await resourcesAPI.rejectResource(selectedResource.id, rejectionReason);
      toast.success(`Resource "${selectedResource.title}" rejected`);
      setResources(resources.filter(r => r.id !== selectedResource.id));
      setRejectDialogOpen(false);
      setConfirmRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedResource(null);
    } catch (error) {
      console.error('Failed to reject resource:', error);
      toast.error('Failed to reject resource');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (resource: Resource) => {
    setSelectedResource(resource);
    setRejectDialogOpen(true);
  };

  const openConfirmRejectDialog = () => {
    if (!selectedResource || !rejectionReason.trim()) return;
    setConfirmRejectDialogOpen(true);
  };

  const getResourceIcon = (type: string, fileName: string) => {
    if (type.includes('pdf') || fileName.endsWith('.pdf')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (type.includes('code') || fileName.match(/\.(js|ts|py|java|html|css|php|c|cpp|h|rb|go|xml|yaml|yml)$/i)) {
      return <Code className="h-5 w-5 text-green-500" />;
    } else if (type.includes('video') || fileName.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
      return <Video className="h-5 w-5 text-red-500" />;
    } else if (type.includes('image') || fileName.match(/\.(jpe?g|png|gif|bmp|webp|svg)$/i)) {
      return <ImageIcon className="h-5 w-5 text-purple-500" />;
    } else if (type.includes('zip') || fileName.match(/\.(zip|rar|tar|gz|7z)$/i)) {
      return <FileArchive className="h-5 w-5 text-orange-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    setIsDetailDialogOpen(true);
  };

  // Show for both students and admins
  if (resources.length === 0 && !loading) {
    return (
      <div className="space-y-6 mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            {isAdmin ? 'Pending Resources' : 'My Pending Resources'}
          </h2>
          <Button variant="outline" size="sm" onClick={fetchPendingResources}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No pending resources found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          {isAdmin ? 'Pending Resources' : 'My Pending Resources'}
        </h2>
        <Button variant="outline" size="sm" onClick={fetchPendingResources}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading resources...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(resource => (
            <Card 
              key={resource.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleResourceClick(resource)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getResourceIcon(resource.type, resource.file_name)}
                    <CardTitle className="text-base">{resource.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      Pending
                    </Badge>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveResource(resource.id);
                            }}
                            className="text-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              openRejectDialog(resource);
                            }}
                            className="text-amber-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                <CardDescription className="flex justify-between">
                  <span>{resource.type.toUpperCase()}</span>
                  <span>{formatFileSize(resource.file_size)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resource.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{resource.description}</p>
                )}
                
                {resource.category_name && (
                  <p className="text-xs text-muted-foreground mb-2">Category: {resource.category_name}</p>
                )}
                
                <p className="text-xs text-muted-foreground mb-3">
                  Submitted by: {resource.uploaded_by.first_name} {resource.uploaded_by.last_name}
                </p>
                
                <p className="text-xs text-muted-foreground mb-3">
                  Submitted {formatDistanceToNow(new Date(resource.uploaded_at), { addSuffix: true })}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => handleDownloadResource(resource.id, e)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteResource(resource.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ResourceDetailDialog
        resource={selectedResource}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        onDelete={(resourceId) => handleDeleteResource(resourceId)}
      />

      {/* Rejection reason input dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Resource</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this resource. This will be sent to the student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={openConfirmRejectDialog}
              disabled={!rejectionReason.trim() || processingId !== null}
            >
              {processingId !== null && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Reject Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog */}
      <AlertDialog open={confirmRejectDialogOpen} onOpenChange={setConfirmRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Rejection
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedResource && (
                <div className="space-y-4">
                  <p>Are you sure you want to reject the resource <span className="font-medium">"{selectedResource.title}"</span>?</p>
                  <div className="bg-muted p-3 rounded-md border">
                    <p className="font-medium mb-1">Rejection reason:</p>
                    <p className="text-sm whitespace-pre-wrap">{rejectionReason}</p>
                  </div>
                  <p>This action cannot be undone and the student will be notified.</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmRejectDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRejectResource}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={processingId !== null}
            >
              {processingId !== null && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyPendingResourcesSection;