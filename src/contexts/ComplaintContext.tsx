
import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Complaint, 
  ComplaintStatus, 
  ComplaintType, 
  Attachment, 
  AttachmentType, 
  EmergencyContact,
  FAQ
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
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export function ComplaintProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all complaints
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: () => db.getComplaints(),
  });
  
  // Fetch emergency contacts
  const { data: emergencyContacts = [] } = useQuery({
    queryKey: ['emergencyContacts'],
    queryFn: () => db.getEmergencyContacts(),
  });
  
  // Fetch FAQs
  const { data: faqs = [] } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => db.getFAQs(),
  });

  // Submit complaint mutation
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

  // Update complaint status mutation
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
  
  // Add attachment mutation
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

  // Submit a new complaint
  const submitComplaint = async (
    userId: string,
    type: ComplaintType,
    location: string,
    description: string
  ): Promise<Complaint> => {
    return submitMutation.mutateAsync({ userId, type, location, description });
  };

  // Update complaint status
  const updateComplaintStatus = async (
    complaintId: string,
    status: ComplaintStatus,
    department?: string
  ): Promise<Complaint | null> => {
    return updateStatusMutation.mutateAsync({ complaintId, status, department });
  };
  
  // Add attachment to a complaint
  const addAttachment = async (
    complaintId: string,
    type: AttachmentType,
    url: string,
    name: string
  ): Promise<Attachment> => {
    return addAttachmentMutation.mutateAsync({ complaintId, type, url, name });
  };

  // Get complaints for a specific user
  const getUserComplaints = (userId: string): Complaint[] => {
    return complaints.filter(complaint => complaint.userId === userId);
  };

  // Get all complaints (for admin)
  const getAllComplaints = (): Complaint[] => {
    return complaints;
  };

  // Get complaints by department
  const getComplaintsByDepartment = (department: string): Complaint[] => {
    return complaints.filter(complaint => complaint.department === department);
  };

  // Get a specific complaint by ID
  const getComplaintById = (complaintId: string): Complaint | undefined => {
    return complaints.find(complaint => complaint.id === complaintId);
  };
  
  // Get emergency contacts
  const getEmergencyContacts = (): EmergencyContact[] => {
    return emergencyContacts;
  };
  
  // Get FAQs
  const getFAQs = (): FAQ[] => {
    return faqs;
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
