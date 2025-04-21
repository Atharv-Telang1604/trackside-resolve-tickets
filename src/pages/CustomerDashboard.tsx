
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useComplaints } from "@/contexts/ComplaintContext";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Complaint, ComplaintType } from "@/types";
import { PlusCircle, ClipboardList } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const CustomerDashboard = () => {
  const { currentUser, logout } = useAuth();
  const { getUserComplaints, submitComplaint } = useComplaints();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redirect if not authenticated
  if (!currentUser) {
    navigate("/login-customer");
    return null;
  }

  const userComplaints = getUserComplaints(currentUser.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar userRole="customer" onLogout={logout} />
      
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Customer Dashboard</h1>
        
        <Tabs defaultValue="track" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="track" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Track Complaints
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New Complaint
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="track">
            <TrackComplaints complaints={userComplaints} />
          </TabsContent>
          
          <TabsContent value="new">
            <NewComplaintForm userId={currentUser.id} submitComplaint={submitComplaint} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Track Complaints Component
const TrackComplaints = ({ complaints }: { complaints: Complaint[] }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "routed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "in-progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">My Complaints</h2>
      
      {complaints.length === 0 ? (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">
            You haven't submitted any complaints yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {complaints.map((complaint) => (
            <Card key={complaint.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="capitalize text-lg">{complaint.type} Issue</CardTitle>
                  <Badge className={getStatusColor(complaint.status)}>
                    {complaint.status.replace("-", " ")}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  Submitted on {formatDate(complaint.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Location:
                    </span>
                    <p className="mt-1">{complaint.location}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Description:
                    </span>
                    <p className="mt-1 text-sm">{complaint.description}</p>
                  </div>
                  {complaint.department && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Assigned to:
                      </span>
                      <p className="mt-1">{complaint.department}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// New Complaint Form Component
interface NewComplaintFormProps {
  userId: string;
  submitComplaint: (
    userId: string,
    type: ComplaintType,
    location: string,
    description: string
  ) => Promise<Complaint>;
}

const NewComplaintForm = ({ userId, submitComplaint }: NewComplaintFormProps) => {
  const [type, setType] = useState<ComplaintType>("electrical");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitComplaint(userId, type, location, description);
      toast({
        title: "Complaint Submitted",
        description: "Your complaint has been successfully submitted and is being processed.",
        variant: "default",
      });
      // Clear form
      setType("electrical");
      setLocation("");
      setDescription("");
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your complaint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Submit a New Complaint</CardTitle>
          <CardDescription>
            Please provide details about the issue you experienced.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Issue Type</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as ComplaintType)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="cleanliness">Cleanliness</SelectItem>
                  <SelectItem value="wifi">WiFi</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Coach B3, Train 42"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in detail..."
                rows={5}
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-railway-600 hover:bg-railway-700 mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDashboard;
