
import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Complaint, ComplaintStatus, ComplaintType } from "@/types";
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

  // Get complaints for a specific user
  const getUserComplaints = (userId: string): Complaint[] => {
    return complaints.filter(complaint => complaint.userId === userId);
  };

  // Get all complaints (for admin)
  const getAllComplaints = (): Complaint[] => {
    return complaints;
  };

  // Get a specific complaint by ID
  const getComplaintById = (complaintId: string): Complaint | undefined => {
    return complaints.find(complaint => complaint.id === complaintId);
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
