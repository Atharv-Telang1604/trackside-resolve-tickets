
// User Types
export interface User {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  name?: string;
  phoneNumber?: string;
}

// Complaint Types
export type ComplaintStatus = 'pending' | 'routed' | 'in-progress' | 'resolved';
export type ComplaintType = 'electrical' | 'cleanliness' | 'wifi' | 'safety' | 'other';

export interface Complaint {
  id: string;
  userId: string;
  type: ComplaintType;
  location: string;
  description: string;
  status: ComplaintStatus;
  department?: string;
  createdAt: string;
  updatedAt: string;
}
