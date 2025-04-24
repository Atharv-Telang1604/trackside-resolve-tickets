import { 
  Complaint, 
  ComplaintStatus, 
  ComplaintType, 
  Attachment, 
  EmergencyContact, 
  FAQ, 
  AttachmentType,
  Notification,
  Message,
  DepartmentSLA
} from "@/types";

class DB {
  private complaints: Complaint[] = [];
  private attachments: Attachment[] = [];
  private emergencyContacts: EmergencyContact[] = [
    {
      id: "ec-1",
      name: "Railway Police",
      role: "Security",
      phoneNumber: "100",
      department: "Safety & Security",
    },
    {
      id: "ec-2",
      name: "Medical Emergency",
      role: "Medical",
      phoneNumber: "102",
      email: "medical@railway.com",
      department: "Medical Services",
    },
    {
      id: "ec-3",
      name: "Technical Support",
      role: "Technical",
      phoneNumber: "1800-111-139",
      email: "technical@railway.com",
      department: "IT Services",
    }
  ];
  private faqs: FAQ[] = [
    {
      id: "faq-1",
      question: "How do I submit a complaint?",
      answer: "Navigate to the Customer Dashboard and use the 'New Complaint' tab to submit your complaint with all the required details.",
      category: "General",
    },
    {
      id: "faq-2",
      question: "How long does it take to resolve a complaint?",
      answer: "Most complaints are resolved within 48 hours. Complex issues might take longer.",
      category: "General",
    },
    {
      id: "faq-3",
      question: "Can I track the status of my complaint?",
      answer: "Yes, you can track the status of your complaint in the 'Track Complaints' tab of your Customer Dashboard.",
      category: "Tracking",
    },
    {
      id: "faq-4",
      question: "What information should I include in my complaint?",
      answer: "Include the type of issue, specific location, detailed description, and if possible, attach relevant images or videos.",
      category: "Submission",
    },
    {
      id: "faq-5",
      question: "How do I contact the department directly?",
      answer: "You can find emergency contact information in the 'Emergency Contacts' section of the app.",
      category: "Contacts",
    }
  ];
  private notifications: Notification[] = [];
  private messages: Message[] = [];
  private departmentSLAs: DepartmentSLA[] = [
    {
      department: "Electrical",
      responseTimeHours: 2,
      resolutionTimeHours: 24
    },
    {
      department: "IT Services",
      responseTimeHours: 1,
      resolutionTimeHours: 12
    },
    {
      department: "Safety & Security",
      responseTimeHours: 0.5,
      resolutionTimeHours: 4
    },
    {
      department: "Cleanliness",
      responseTimeHours: 3,
      resolutionTimeHours: 24
    }
  ];

  async getComplaints(): Promise<Complaint[]> {
    return this.complaints;
  }

  async getComplaintsByUser(userId: string): Promise<Complaint[]> {
    return this.complaints.filter(c => c.userId === userId);
  }

  async getComplaintsByDepartment(department: string): Promise<Complaint[]> {
    return this.complaints.filter(c => c.department === department);
  }

  private getAppropiateDepartment(type: ComplaintType): string {
    const departmentMap: Record<ComplaintType, string> = {
      'electrical': 'Electrical',
      'wifi': 'IT Services',
      'safety': 'Safety & Security',
      'cleanliness': 'Cleanliness',
      'other': 'Customer Service'
    };
    return departmentMap[type];
  }

  async addComplaint(
    userId: string,
    type: ComplaintType,
    location: string,
    description: string
  ): Promise<Complaint> {
    const now = new Date().toISOString();
    const department = this.getAppropiateDepartment(type);
    
    const newComplaint: Complaint = {
      id: `comp-${this.complaints.length + 1}`,
      userId,
      type,
      location,
      description,
      status: "pending",
      department,
      createdAt: now,
      updatedAt: now,
      attachments: []
    };
    
    this.complaints.push(newComplaint);

    // Create auto-response message
    await this.createMessage(
      newComplaint.id,
      'system',
      `Your complaint has been received and assigned to the ${department} department. We aim to respond within ${this.departmentSLAs.find(sla => sla.department === department)?.responseTimeHours} hours.`,
      true
    );

    // Create notification for user
    await this.createNotification(
      userId,
      "Complaint Submitted",
      `Your ${type} complaint has been received and assigned to the ${department} department.`
    );

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

    // Create notification for status update
    await this.createNotification(
      complaint.userId,
      "Complaint Status Updated",
      `Your complaint status has been updated to ${status}.`
    );

    // Add status update message
    await this.createMessage(
      complaintId,
      'system',
      `Complaint status updated to: ${status}`,
      true
    );

    return updatedComplaint;
  }

  async getComplaintById(id: string): Promise<Complaint | null> {
    return this.complaints.find(c => c.id === id) || null;
  }

  async addAttachment(
    complaintId: string, 
    type: AttachmentType, 
    url: string, 
    name: string
  ): Promise<Attachment> {
    const now = new Date().toISOString();
    const newAttachment: Attachment = {
      id: `att-${this.attachments.length + 1}`,
      complaintId,
      type,
      url,
      name,
      createdAt: now
    };
    
    this.attachments.push(newAttachment);
    
    // Update the complaint with the attachment
    const complaint = this.complaints.find(c => c.id === complaintId);
    if (complaint) {
      complaint.attachments = complaint.attachments ? 
        [...complaint.attachments, newAttachment] : [newAttachment];
    }
    
    return newAttachment;
  }

  async getAttachmentsByComplaintId(complaintId: string): Promise<Attachment[]> {
    return this.attachments.filter(a => a.complaintId === complaintId);
  }

  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    return this.emergencyContacts;
  }

  async getFAQs(): Promise<FAQ[]> {
    return this.faqs;
  }

  async getFAQsByCategory(category: string): Promise<FAQ[]> {
    return this.faqs.filter(faq => faq.category === category);
  }

  async createNotification(
    userId: string,
    title: string,
    message: string
  ): Promise<Notification> {
    const notification: Notification = {
      id: `notif-${this.notifications.length + 1}`,
      userId,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.push(notification);
    return notification;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notifications.filter(n => n.userId === userId);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  async createMessage(
    complaintId: string,
    senderId: string,
    content: string,
    isAutoResponse = false
  ): Promise<Message> {
    const message: Message = {
      id: `msg-${this.messages.length + 1}`,
      complaintId,
      senderId,
      content,
      isAutoResponse,
      createdAt: new Date().toISOString()
    };
    this.messages.push(message);
    return message;
  }

  async getMessagesByComplaintId(complaintId: string): Promise<Message[]> {
    return this.messages.filter(m => m.complaintId === complaintId);
  }
}

export const db = new DB();
