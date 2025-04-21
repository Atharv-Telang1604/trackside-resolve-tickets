
import { createContext, useContext, useState, ReactNode } from "react";
import { Complaint, ComplaintStatus, ComplaintType } from "@/types";

// Sample initial complaints for demonstration
const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: "comp-1",
    userId: "customer-1",
    type: "electrical",
    location: "Coach B3, Train 42",
    description: "Electrical socket not working in my seat",
    status: "pending",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "comp-2",
    userId: "customer-1",
    type: "cleanliness",
    location: "Bathroom in Coach A2, Train 37",
    description: "Bathroom is not clean",
    status: "routed",
    department: "Maintenance",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "comp-3",
    userId: "customer-1",
    type: "wifi",
    location: "Entire Train 29",
    description: "WiFi not working throughout journey",
    status: "resolved",
    department: "IT Services",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

interface ComplaintContextType {
  complaints: Complaint[];
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
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);

  // Submit a new complaint
  const submitComplaint = async (
    userId: string,
    type: ComplaintType,
    location: string,
    description: string
  ): Promise<Complaint> => {
    const now = new Date().toISOString();
    
    const newComplaint: Complaint = {
      id: `comp-${complaints.length + 1}`,
      userId,
      type,
      location,
      description,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    setComplaints([...complaints, newComplaint]);
    return newComplaint;
  };

  // Update complaint status
  const updateComplaintStatus = async (
    complaintId: string,
    status: ComplaintStatus,
    department?: string
  ): Promise<Complaint | null> => {
    const now = new Date().toISOString();
    
    const updatedComplaints = complaints.map(complaint => {
      if (complaint.id === complaintId) {
        return {
          ...complaint,
          status,
          department: department || complaint.department,
          updatedAt: now,
        };
      }
      return complaint;
    });

    setComplaints(updatedComplaints);
    return updatedComplaints.find(complaint => complaint.id === complaintId) || null;
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
