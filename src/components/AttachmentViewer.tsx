
import { useState } from "react";
import { Attachment } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileIcon, ImageIcon, FileVideo2 } from "lucide-react";

interface AttachmentViewerProps {
  attachments: Attachment[];
}

export const AttachmentViewer = ({ attachments }: AttachmentViewerProps) => {
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  
  if (!attachments || attachments.length === 0) {
    return null;
  }
  
  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "video":
        return <FileVideo2 className="h-4 w-4" />;
      default:
        return <FileIcon className="h-4 w-4" />;
    }
  };
  
  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Attachments ({attachments.length})</h4>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <Dialog key={attachment.id}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-xs"
                onClick={() => setSelectedAttachment(attachment)}
              >
                {getAttachmentIcon(attachment.type)}
                <span className="truncate max-w-[100px]">{attachment.name}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{attachment.name}</DialogTitle>
                <DialogDescription>
                  Added on {new Date(attachment.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4">
                {attachment.type === "image" ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="max-h-[500px] w-auto mx-auto object-contain rounded-md"
                  />
                ) : attachment.type === "video" ? (
                  <video
                    src={attachment.url}
                    controls
                    className="max-h-[500px] w-auto mx-auto object-contain rounded-md"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <FileIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-center mb-4">{attachment.name}</p>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm"
                    >
                      Download Document
                    </a>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};
