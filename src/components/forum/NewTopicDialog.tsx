import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forumsAPI } from '@/services/api';
import { toast } from 'sonner';
import RichTextEditor from './RichTextEditor';
import FileUploader from './FileUploader';
import { Search, X, AlertCircle } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface NewTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId?: string;
}

const NewTopicDialog: React.FC<NewTopicDialogProps> = ({ open, onOpenChange, roomId }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ file: File; base64: string } | null>(null);
  const navigate = useNavigate();

  // Fetch categories when dialog opens or when user starts typing in search
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch categories from API
        const response = await forumsAPI.getCategories();
        if (response.results && response.results.length > 0) {
          setCategories(response.results);
          console.log('Fetched categories:', response.results);
        } else {
          console.error('No categories returned from API');
          toast.error('No forum categories available. Please try again later.');
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('Failed to load forum categories. Please try again later.');
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Filter categories based on search
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleCategorySelect = (id: string, name: string) => {
    setCategoryId(id);
    setCategorySearch(name);
    setShowCategoryDropdown(false);
  };

  const handleFileSelect = (file: File, base64Data: string) => {
    setSelectedFile({ file, base64: base64Data });
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure we have a valid category ID
      const selectedCategory = categories.find(c => c.id.toString() === categoryId);
      if (!selectedCategory) {
        toast.error('Please select a valid category');
        setIsSubmitting(false);
        return;
      }
      
      const topicData = {
        title: title.trim(),
        content: content.trim(),
        category_id: selectedCategory.id,
        tags: tags.trim(),
        attachment_base64: selectedFile?.base64 || null,
        attachment_name: selectedFile?.file.name || null,
        attachment_type: selectedFile?.file.type || null,
        attachment_size: selectedFile?.file.size || null,
        ...(roomId ? { room: parseInt(roomId) } : {})
      };
      
      console.log('Creating new topic with data:', {
        ...topicData,
        attachment_base64: topicData.attachment_base64 ? '[base64 data]' : null
      });
      
      const response = await forumsAPI.createTopic(topicData);
      
      if (!response || !response.id) {
        throw new Error('Invalid response from server');
      }
      
      // Reset form fields after successful submission
      setTitle('');
      setContent('');
      setCategoryId('');
      setCategorySearch('');
      setTags('');
      setSelectedFile(null);
      
      onOpenChange(false);
      navigate(`/forum/${response.id}`);
      toast.success('Discussion created successfully!');
    } catch (error) {
      console.error('Failed to create topic:', error);
      toast.error('Failed to create discussion. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Discussion</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <div className="relative">
              <div className="flex items-center border rounded-md">
                <Search className="h-4 w-4 ml-3 text-muted-foreground" />
                <Input
                  id="category-search"
                  value={categorySearch}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setShowCategoryDropdown(true);
                    if (!e.target.value) {
                      setCategoryId('');
                    }
                  }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  placeholder="Type to search for a category"
                  className="border-0 focus-visible:ring-0"
                  autoComplete="off"
                />
                {categorySearch && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 mr-1"
                    onClick={() => {
                      setCategorySearch('');
                      setCategoryId('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {showCategoryDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map(category => (
                      <div
                        key={category.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleCategorySelect(category.id.toString(), category.name)}
                      >
                        {category.name}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      {categorySearch ? 'No categories found' : 'Start typing to search for categories'}
                    </div>
                  )}
                </div>
              )}
              
              {/* Removed the list of categories - users will search instead */}
            </div>
            {categoryId && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected category: {categories.find(c => c.id.toString() === categoryId)?.name}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Describe your question or discussion topic"
              minHeight="150px"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment (optional)</Label>
            <FileUploader
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFile={selectedFile}
              maxSizeMB={10}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. React, Database, Security"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Discussion'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTopicDialog;