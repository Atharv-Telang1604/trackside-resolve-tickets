
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
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

// Attachment Types
export type AttachmentType = 'image' | 'video' | 'document';

export interface Attachment {
  id: string;
  complaintId: string;
  type: AttachmentType;
  url: string;
  name: string;
  createdAt: string;
}

// Emergency Contact Types
export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phoneNumber: string;
  email?: string;
  department: string;
}

// FAQ Types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}
