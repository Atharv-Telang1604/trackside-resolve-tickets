import { ref, set, get, push, update, remove, query, orderByChild, equalTo } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from "@/services/firebase";
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
    try {
      const complaintsRef = ref(database, 'complaints');
      const snapshot = await get(complaintsRef);
      
      if (snapshot.exists()) {
        const complaintsData = snapshot.val();
        const complaints: Complaint[] = await Promise.all(
          Object.entries(complaintsData).map(async ([id, data]: [string, any]) => {
            const attachmentsSnapshot = await get(ref(database, `attachments/${id}`));
            const attachments: Attachment[] = [];
            
            if (attachmentsSnapshot.exists()) {
              const attachmentsData = attachmentsSnapshot.val();
              Object.entries(attachmentsData).forEach(([attachId, attachData]: [string, any]) => {
                attachments.push({
                  id: attachId,
                  complaintId: id,
                  type: attachData.type,
                  url: attachData.url,
                  name: attachData.name,
                  createdAt: attachData.createdAt,
                });
              });
            }
            
            return {
              id,
              userId: data.userId,
              type: data.type,
              location: data.location,
              description: data.description,
              status: data.status,
              department: data.department,
              attachments,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };
          })
        );
        return complaints;
      }
      return [];
    } catch (error) {
      console.error("Error getting complaints:", error);
      return [];
    }
  }

  async getComplaintsByUser(userId: string): Promise<Complaint[]> {
    try {
      const complaintsRef = query(
        ref(database, 'complaints'),
        orderByChild('userId'),
        equalTo(userId)
      );
      const snapshot = await get(complaintsRef);
      
      if (snapshot.exists()) {
        const complaintsData = snapshot.val();
        const complaints: Complaint[] = await Promise.all(
          Object.entries(complaintsData).map(async ([id, data]: [string, any]) => {
            const attachmentsSnapshot = await get(ref(database, `attachments/${id}`));
            const attachments: Attachment[] = [];
            
            if (attachmentsSnapshot.exists()) {
              const attachmentsData = attachmentsSnapshot.val();
              Object.entries(attachmentsData).forEach(([attachId, attachData]: [string, any]) => {
                attachments.push({
                  id: attachId,
                  complaintId: id,
                  type: attachData.type,
                  url: attachData.url,
                  name: attachData.name,
                  createdAt: attachData.createdAt,
                });
              });
            }
            
            return {
              id,
              userId: data.userId,
              type: data.type,
              location: data.location,
              description: data.description,
              status: data.status,
              department: data.department,
              attachments,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };
          })
        );
        return complaints;
      }
      return [];
    } catch (error) {
      console.error("Error getting complaints by user:", error);
      return [];
    }
  }

  async getComplaintsByDepartment(department: string): Promise<Complaint[]> {
    try {
      const complaintsRef = query(
        ref(database, 'complaints'),
        orderByChild('department'),
        equalTo(department)
      );
      const snapshot = await get(complaintsRef);
      
      if (snapshot.exists()) {
        const complaintsData = snapshot.val();
        const complaints: Complaint[] = await Promise.all(
          Object.entries(complaintsData).map(async ([id, data]: [string, any]) => {
            const attachmentsSnapshot = await get(ref(database, `attachments/${id}`));
            const attachments: Attachment[] = [];
            
            if (attachmentsSnapshot.exists()) {
              const attachmentsData = attachmentsSnapshot.val();
              Object.entries(attachmentsData).forEach(([attachId, attachData]: [string, any]) => {
                attachments.push({
                  id: attachId,
                  complaintId: id,
                  type: attachData.type,
                  url: attachData.url,
                  name: attachData.name,
                  createdAt: attachData.createdAt,
                });
              });
            }
            
            return {
              id,
              userId: data.userId,
              type: data.type,
              location: data.location,
              description: data.description,
              status: data.status,
              department: data.department,
              attachments,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };
          })
        );
        return complaints;
      }
      return [];
    } catch (error) {
      console.error("Error getting complaints by department:", error);
      return [];
    }
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
    
    const newComplaintRef = push(ref(database, 'complaints'));
    const complaintId = newComplaintRef.key!;
    
    const newComplaint: Omit<Complaint, 'id' | 'attachments'> = {
      userId,
      type,
      location,
      description,
      status: "pending",
      department,
      createdAt: now,
      updatedAt: now,
    };
    
    await set(newComplaintRef, newComplaint);

    await this.createMessage(
      complaintId,
      'system',
      `Your complaint has been received and assigned to the ${department} department. We aim to respond within ${this.departmentSLAs.find(sla => sla.department === department)?.responseTimeHours} hours.`,
      true
    );

    await this.createNotification(
      userId,
      "Complaint Submitted",
      `Your ${type} complaint has been received and assigned to the ${department} department.`
    );

    return {
      id: complaintId,
      ...newComplaint,
      attachments: []
    };
  }

  async updateComplaintStatus(
    complaintId: string,
    status: ComplaintStatus,
    department?: string
  ): Promise<Complaint | null> {
    try {
      const complaintRef = ref(database, `complaints/${complaintId}`);
      const snapshot = await get(complaintRef);
      
      if (!snapshot.exists()) return null;
      
      const complaintData = snapshot.val();
      const updatedAt = new Date().toISOString();
      
      await update(complaintRef, {
        status,
        department: department || complaintData.department,
        updatedAt
      });

      await this.createNotification(
        complaintData.userId,
        "Complaint Status Updated",
        `Your complaint status has been updated to ${status}.`
      );

      await this.createMessage(
        complaintId,
        'system',
        `Complaint status updated to: ${status}`,
        true
      );

      const updatedSnap = await get(complaintRef);
      const updated = updatedSnap.val();
      const attachments = await this.getAttachmentsByComplaintId(complaintId);
      
      return {
        id: complaintId,
        ...updated,
        attachments
      };
    } catch (error) {
      console.error("Error updating complaint status:", error);
      return null;
    }
  }

  async getComplaintById(id: string): Promise<Complaint | null> {
    try {
      const complaintRef = ref(database, `complaints/${id}`);
      const snapshot = await get(complaintRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const attachments = await this.getAttachmentsByComplaintId(id);
        
        return {
          id,
          ...data,
          attachments
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting complaint by id:", error);
      return null;
    }
  }

  async addAttachment(
    complaintId: string, 
    type: AttachmentType, 
    url: string, 
    name: string
  ): Promise<Attachment> {
    try {
      const now = new Date().toISOString();
      
      let finalUrl = url;
      if (url.startsWith('blob:')) {
        finalUrl = `https://firebasestorage.googleapis.com/v0/b/railmadad-229be.appspot.com/o/attachments%2F${complaintId}%2F${name}?alt=media`;
      }
      
      const newAttachmentRef = push(ref(database, `attachments/${complaintId}`));
      const attachmentId = newAttachmentRef.key!;
      
      const newAttachment: Omit<Attachment, 'id'> = {
        complaintId,
        type,
        url: finalUrl,
        name,
        createdAt: now
      };
      
      await set(newAttachmentRef, newAttachment);
      
      const complaintRef = ref(database, `complaints/${complaintId}`);
      const complaintSnapshot = await get(complaintRef);
      if (complaintSnapshot.exists()) {
        await update(complaintRef, { updatedAt: now });
      }
      
      return {
        id: attachmentId,
        ...newAttachment
      };
    } catch (error) {
      console.error("Error adding attachment:", error);
      throw error;
    }
  }

  async getAttachmentsByComplaintId(complaintId: string): Promise<Attachment[]> {
    try {
      const attachmentsRef = ref(database, `attachments/${complaintId}`);
      const snapshot = await get(attachmentsRef);
      
      if (snapshot.exists()) {
        const attachmentsData = snapshot.val();
        return Object.entries(attachmentsData).map(([id, data]: [string, any]) => ({
          id,
          complaintId,
          type: data.type,
          url: data.url,
          name: data.name,
          createdAt: data.createdAt,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error getting attachments:", error);
      return [];
    }
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
    try {
      const now = new Date().toISOString();
      const newNotifRef = push(ref(database, `notifications/${userId}`));
      const notificationId = newNotifRef.key!;
      
      const notification: Omit<Notification, 'id'> = {
        userId,
        title,
        message,
        read: false,
        createdAt: now
      };
      
      await set(newNotifRef, notification);
      
      return {
        id: notificationId,
        ...notification
      };
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const notificationsRef = ref(database, `notifications/${userId}`);
      const snapshot = await get(notificationsRef);
      
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        return Object.entries(notificationsData).map(([id, data]: [string, any]) => ({
          id,
          userId,
          title: data.title,
          message: data.message,
          read: data.read,
          createdAt: data.createdAt,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const allNotificationsRef = ref(database, 'notifications');
      const snapshot = await get(allNotificationsRef);
      
      if (snapshot.exists()) {
        const allNotifications = snapshot.val();
        
        for (const userId in allNotifications) {
          if (notificationId in allNotifications[userId]) {
            await update(ref(database, `notifications/${userId}/${notificationId}`), {
              read: true
            });
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async createMessage(
    complaintId: string,
    senderId: string,
    content: string,
    isAutoResponse = false
  ): Promise<Message> {
    try {
      const now = new Date().toISOString();
      const newMessageRef = push(ref(database, `messages/${complaintId}`));
      const messageId = newMessageRef.key!;
      
      const message: Omit<Message, 'id'> = {
        complaintId,
        senderId,
        content,
        isAutoResponse,
        createdAt: now
      };
      
      await set(newMessageRef, message);
      
      return {
        id: messageId,
        ...message
      };
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }

  async getMessagesByComplaintId(complaintId: string): Promise<Message[]> {
    try {
      const messagesRef = ref(database, `messages/${complaintId}`);
      const snapshot = await get(messagesRef);
      
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        return Object.entries(messagesData)
          .map(([id, data]: [string, any]) => ({
            id,
            complaintId,
            senderId: data.senderId,
            content: data.content,
            isAutoResponse: data.isAutoResponse,
            createdAt: data.createdAt,
          }))
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      return [];
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
  }

  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const fileRef = storageRef(storage, path);
      await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }
}

export const db = new DB();
