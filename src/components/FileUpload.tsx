
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AttachmentType } from "@/types";
import { UploadCloud, Image, FileVideo, File } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/services/db";

interface FileUploadProps {
  complaintId: string;
  onFileUpload: (file: File, fileType: AttachmentType) => Promise<void>;
}

export const FileUpload = ({ complaintId, onFileUpload }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<AttachmentType>("image");
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Determine file type based on MIME type
      if (file.type.startsWith("image/")) {
        setFileType("image");
      } else if (file.type.startsWith("video/")) {
        setFileType("video");
      } else {
        setFileType("document");
      }
      
      setSelectedFile(file);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // Simulate progress (in a real app, we'd get this from Firebase)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Upload file to Firebase Storage
      const filePath = `attachments/${complaintId}/${selectedFile.name}`;
      const downloadUrl = await db.uploadFile(selectedFile, filePath);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Call the passed onFileUpload function with the Firebase URL
      await onFileUpload(selectedFile, fileType);
      
      toast({
        title: "File uploaded successfully",
        description: "Your file has been attached to the complaint",
      });
      
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
      console.error("File upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 transition-colors hover:border-primary/50">
        {!selectedFile ? (
          <>
            <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Drag and drop your file here, or click to browse
            </p>
            <Label htmlFor="file-upload" className="button">
              <span className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm">
                Select File
              </span>
            </Label>
            <input 
              id="file-upload" 
              type="file" 
              className="sr-only" 
              onChange={handleFileChange}
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />
          </>
        ) : (
          <div className="w-full">
            <div className="flex items-center gap-3 mb-4">
              {fileType === "image" && <Image className="h-6 w-6 text-blue-500" />}
              {fileType === "video" && <FileVideo className="h-6 w-6 text-purple-500" />}
              {fileType === "document" && <File className="h-6 w-6 text-yellow-500" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            {isUploading && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={handleUpload} 
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedFile(null)}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
