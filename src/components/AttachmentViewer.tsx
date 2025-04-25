
import { Attachment } from "@/types";
import { Card } from "@/components/ui/card";
import { Image, FileVideo, File } from "lucide-react";

interface AttachmentViewerProps {
  attachments: Attachment[];
}

export const AttachmentViewer = ({ attachments }: AttachmentViewerProps) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const renderAttachment = (attachment: Attachment) => {
    switch (attachment.type) {
      case 'image':
        return (
          <div className="relative">
            <img 
              src={attachment.url} 
              alt={attachment.name} 
              className="rounded-md w-full h-auto object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-xs truncate">
              {attachment.name}
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="relative bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center h-24">
            <FileVideo className="h-8 w-8 text-gray-500" />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-xs truncate">
              {attachment.name}
            </div>
          </div>
        );
      case 'document':
        return (
          <div className="relative bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center h-24">
            <File className="h-8 w-8 text-gray-500" />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-xs truncate">
              {attachment.name}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
        Attachments ({attachments.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {attachments.map((attachment) => (
          <Card key={attachment.id} className="overflow-hidden">
            {renderAttachment(attachment)}
          </Card>
        ))}
      </div>
    </div>
  );
};
