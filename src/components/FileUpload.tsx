
import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { AttachmentType } from "@/types";
import { Image, FileVideo, File, X, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadProps {
  complaintId: string;
  onFileUpload: (file: File, type: AttachmentType) => Promise<void>;
}

export const FileUpload = ({ complaintId, onFileUpload }: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    
    try {
      let fileType: AttachmentType;
      
      if (selectedFile.type.startsWith('image/')) {
        fileType = 'image';
      } else if (selectedFile.type.startsWith('video/')) {
        fileType = 'video';
      } else {
        fileType = 'document';
      }
      
      await onFileUpload(selectedFile, fileType);
      
      // Reset state after successful upload
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "File Uploaded",
        description: "Your file has been successfully attached to the complaint.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;
    
    if (selectedFile.type.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    } else if (selectedFile.type.startsWith('video/')) {
      return <FileVideo className="h-5 w-5" />;
    } else {
      return <File className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"
        />
        <Button 
          type="button" 
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          Select File
        </Button>
        {selectedFile && (
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-md flex-1">
            {getFileIcon()}
            <span className="text-sm truncate">{selectedFile.name}</span>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              className="h-6 w-6 p-0 rounded-full"
              onClick={clearSelectedFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {previewUrl && (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="max-h-40 rounded-md object-contain"
          />
          <Button 
            type="button" 
            variant="destructive" 
            size="sm"
            className="absolute top-0 right-0 h-6 w-6 p-0 rounded-full"
            onClick={clearSelectedFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {selectedFile && (
        <Button 
          type="button" 
          onClick={handleUpload} 
          disabled={uploading}
          className="w-full"
        >
          {uploading ? "Uploading..." : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </>
          )}
        </Button>
      )}
    </div>
  );
};
