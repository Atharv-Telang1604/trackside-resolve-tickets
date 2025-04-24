import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Complaint, 
  ComplaintStatus, 
  ComplaintType, 
  Attachment, 
  AttachmentType, 
  EmergencyContact,
  FAQ,
  Notification,
  Message
} from "@/types";
import { db } from "@/services/db";
import { useToast } from "@/components/ui/use-toast";

interface ComplaintContextType {
  complaints: Complaint[];
  isLoading: boolean;
  submitComplaint: (
    userId: string,
    type: ComplaintType,
    location: string,
    description: string
  ) => Promise<Complaint>;
  updateComplaintStatus: (
    complaintId: string,
    status: ComplaintStatus,
    department?: string
  ) => Promise<Complaint | null>;
  getUserComplaints: (userId: string) => Complaint[];
  getAllComplaints: () => Complaint[];
  getComplaintById: (complaintId: string) => Complaint | undefined;
  getComplaintsByDepartment: (department: string) => Complaint[];
  addAttachment: (
    complaintId: string,
    type: AttachmentType,
    url: string,
    name: string
  ) => Promise<Attachment>;
  getEmergencyContacts: () => EmergencyContact[];
  getFAQs: () => FAQ[];
  notifications: Notification[];
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  getComplaintMessages: (complaintId: string) => Message[];
  addMessage: (complaintId: string, senderId: string, content: string) => Promise<Message>;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export function ComplaintProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: () => db.getComplaints(),
  });

  const { data: emergencyContacts = [] } = useQuery({
    queryKey: ['emergencyContacts'],
    queryFn: () => db.getEmergencyContacts(),
  });

  const { data: faqs = [] } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => db.getFAQs(),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => db.getNotifications(currentUser?.id || ''),
  });

  const submitMutation = useMutation({
    mutationFn: (data: { 
      userId: string; 
      type: ComplaintType; 
      location: string; 
      description: string; 
    }) => db.addComplaint(data.userId, data.type, data.location, data.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast({
        title: "Success",
        description: "Complaint submitted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit complaint",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { 
      complaintId: string; 
      status: ComplaintStatus; 
      department?: string; 
    }) => db.updateComplaintStatus(data.complaintId, data.status, data.department),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast({
        title: "Success",
        description: "Complaint status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update complaint status",
        variant: "destructive",
      });
    },
  });

  const addAttachmentMutation = useMutation({
    mutationFn: (data: {
      complaintId: string;
      type: AttachmentType;
      url: string;
      name: string;
    }) => db.addAttachment(data.complaintId, data.type, data.url, data.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast({
        title: "Success",
        description: "Attachment added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add attachment",
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => db.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

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

  const submitComplaint = async (
    userId: string,
    type: ComplaintType,
    location: string,
    description: string
  ): Promise<Complaint> => {
    return submitMutation.mutateAsync({ userId, type, location, description });
  };

  const updateComplaintStatus = async (
    complaintId: string,
    status: ComplaintStatus,
    department?: string
  ): Promise<Complaint | null> => {
    return updateStatusMutation.mutateAsync({ complaintId, status, department });
  };

  const addAttachment = async (
    complaintId: string,
    type: AttachmentType,
    url: string,
    name: string
  ): Promise<Attachment> => {
    return addAttachmentMutation.mutateAsync({ complaintId, type, url, name });
  };

  const getUserComplaints = (userId: string): Complaint[] => {
    return complaints.filter(complaint => complaint.userId === userId);
  };

  const getAllComplaints = (): Complaint[] => {
    return complaints;
  };

  const getComplaintsByDepartment = (department: string): Complaint[] => {
    return complaints.filter(complaint => complaint.department === department);
  };

  const getComplaintById = (complaintId: string): Complaint | undefined => {
    return complaints.find(complaint => complaint.id === complaintId);
  };

  const getEmergencyContacts = (): EmergencyContact[] => {
    return emergencyContacts;
  };

  const getFAQs = (): FAQ[] => {
    return faqs;
  };

  const getComplaintMessages = (complaintId: string): Message[] => {
    const { data: messages = [] } = useQuery({
      queryKey: ['messages', complaintId],
      queryFn: () => db.getMessagesByComplaintId(complaintId),
    });
    return messages;
  };

  const addMessage = async (
    complaintId: string,
    senderId: string,
    content: string
  ): Promise<Message> => {
    return addMessageMutation.mutateAsync({ complaintId, senderId, content });
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        isLoading,
        submitComplaint,
        updateComplaintStatus,
        getUserComplaints,
        getAllComplaints,
        getComplaintById,
        getComplaintsByDepartment,
        addAttachment,
        getEmergencyContacts,
        getFAQs,
        notifications,
        markNotificationAsRead: (id: string) => markAsReadMutation.mutateAsync(id),
        getComplaintMessages,
        addMessage,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (context === undefined) {
    throw new Error("useComplaints must be used within a ComplaintProvider");
  }
  return context;
}
