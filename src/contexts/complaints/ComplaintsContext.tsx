
import { createContext, useContext, ReactNode, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Complaint, ComplaintStatus, ComplaintType, Attachment, AttachmentType } from "@/types";
import { db } from "@/services/db";

interface ComplaintsContextType {
  complaints: Complaint[];
  isLoading: boolean;
  submitComplaint: (userId: string, type: ComplaintType, location: string, description: string) => Promise<Complaint>;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus, department?: string) => Promise<Complaint | null>;
  getUserComplaints: (userId: string) => Complaint[];
  getAllComplaints: () => Complaint[];
  getComplaintById: (complaintId: string) => Complaint | undefined;
  getComplaintsByDepartment: (department: string) => Complaint[];
  addAttachment: (complaintId: string, type: AttachmentType, url: string, name: string) => Promise<Attachment>;
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

export function ComplaintsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const { data: complaintsData = [], isLoading: isLoadingComplaints } = useQuery({
    queryKey: ['complaints'],
    queryFn: () => db.getComplaints(),
    select: (data) => {
      setComplaints(data);
      return data;
    }
  });

  const submitMutation = useMutation({
    mutationFn: (data: { userId: string; type: ComplaintType; location: string; description: string; }) => 
      db.addComplaint(data.userId, data.type, data.location, data.description),
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
    mutationFn: (data: { complaintId: string; status: ComplaintStatus; department?: string; }) => 
      db.updateComplaintStatus(data.complaintId, data.status, data.department),
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
    mutationFn: (data: { complaintId: string; type: AttachmentType; url: string; name: string; }) => 
      db.addAttachment(data.complaintId, data.type, data.url, data.name),
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

  const contextValue: ComplaintsContextType = {
    complaints,
    isLoading: isLoadingComplaints,
    submitComplaint: (userId, type, location, description) => 
      submitMutation.mutateAsync({ userId, type, location, description }),
    updateComplaintStatus: (complaintId, status, department) => 
      updateStatusMutation.mutateAsync({ complaintId, status, department }),
    addAttachment: (complaintId, type, url, name) => 
      addAttachmentMutation.mutateAsync({ complaintId, type, url, name }),
    getUserComplaints: (userId) => complaints.filter(complaint => complaint.userId === userId),
    getAllComplaints: () => complaints,
    getComplaintById: (complaintId) => complaints.find(complaint => complaint.id === complaintId),
    getComplaintsByDepartment: (department) => complaints.filter(complaint => complaint.department === department),
  };

  return (
    <ComplaintsContext.Provider value={contextValue}>
      {children}
    </ComplaintsContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintsContext);
  if (context === undefined) {
    throw new Error("useComplaints must be used within a ComplaintsProvider");
  }
  return context;
}
