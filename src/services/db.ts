
import { Complaint, ComplaintStatus, ComplaintType, User } from "@/types";

// This is a mock SQLite implementation for demonstration
// In a real app, you would use better-sqlite3 or similar
class DB {
  private complaints: Complaint[] = [];

  async getComplaints(): Promise<Complaint[]> {
    return this.complaints;
  }

  async getComplaintsByUser(userId: string): Promise<Complaint[]> {
    return this.complaints.filter(c => c.userId === userId);
  }

  async addComplaint(
    userId: string,
    type: ComplaintType,
    location: string,
    description: string
  ): Promise<Complaint> {
    const now = new Date().toISOString();
    const newComplaint: Complaint = {
      id: `comp-${this.complaints.length + 1}`,
      userId,
      type,
      location,
      description,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    
    this.complaints.push(newComplaint);
    return newComplaint;
  }

  async updateComplaintStatus(
    complaintId: string,
    status: ComplaintStatus,
    department?: string
  ): Promise<Complaint | null> {
    const complaint = this.complaints.find(c => c.id === complaintId);
    if (!complaint) return null;

    const updatedComplaint = {
      ...complaint,
      status,
      department: department || complaint.department,
      updatedAt: new Date().toISOString(),
    };

    this.complaints = this.complaints.map(c => 
      c.id === complaintId ? updatedComplaint : c
    );

    return updatedComplaint;
  }

  async getComplaintById(id: string): Promise<Complaint | null> {
    return this.complaints.find(c => c.id === id) || null;
  }
}

export const db = new DB();
