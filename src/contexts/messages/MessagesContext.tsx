
import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/types";
import { db } from "@/services/db";

interface MessagesContextType {
  getComplaintMessages: (complaintId: string) => Message[];
  addMessage: (complaintId: string, senderId: string, content: string) => Promise<Message>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addMessageMutation = useMutation({
    mutationFn: (data: { complaintId: string; senderId: string; content: string }) => 
      db.createMessage(data.complaintId, data.senderId, data.content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    },
  });

  return (
    <MessagesContext.Provider 
      value={{
        getComplaintMessages: (complaintId: string) => {
          const { data: messages = [] } = useQuery({
            queryKey: ['messages', complaintId],
            queryFn: () => db.getMessagesByComplaintId(complaintId),
          });
          return messages;
        },
        addMessage: (complaintId, senderId, content) => 
          addMessageMutation.mutateAsync({ complaintId, senderId, content }),
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
}
