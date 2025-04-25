import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useComplaints } from "@/contexts/complaints/ComplaintsContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttachmentViewer } from "@/components/AttachmentViewer";
import { Complaint, ComplaintStatus, ComplaintType } from "@/types";
import { 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  CheckSquare,
  CalendarClock,
  LayoutDashboard,
  Folder,
  FolderOpen
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Available departments
const DEPARTMENTS = [
  "Electrical Maintenance",
  "Housekeeping",
  "IT Services",
  "Safety & Security",
  "General Services",
];

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const { getAllComplaints, updateComplaintStatus } = useComplaints();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // States for filtering
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ComplaintType | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [view, setView] = useState<"list" | "department">("list");
  
  // Redirect if not authenticated as admin
  if (!currentUser || currentUser.role !== "admin") {
    navigate("/login-admin");
    return null;
  }

  // Get all complaints
  const allComplaints = getAllComplaints();
  
  // Filter complaints
  useEffect(() => {
    let result = allComplaints;
    
    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(complaint => complaint.status === statusFilter);
    }
    
    // Filter by type
    if (typeFilter !== "all") {
      result = result.filter(complaint => complaint.type === typeFilter);
    }
    
    // Filter by department
    if (departmentFilter !== "all") {
      result = result.filter(complaint => complaint.department === departmentFilter);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        complaint =>
          complaint.description.toLowerCase().includes(term) ||
          complaint.location.toLowerCase().includes(term)
      );
    }
    
    setFilteredComplaints(result);
  }, [allComplaints, statusFilter, typeFilter, departmentFilter, searchTerm]);
  
  // Handle status update
  const handleStatusUpdate = async (complaintId: string, status: ComplaintStatus, department?: string) => {
    try {
      await updateComplaintStatus(complaintId, status, department);
      toast({
        title: "Status Updated",
        description: `Complaint status has been updated to "${status}".`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update the complaint status.",
        variant: "destructive",
      });
    }
  };

  // Stats for the dashboard
  const stats = {
    total: allComplaints.length,
    pending: allComplaints.filter(c => c.status === "pending").length,
    inProgress: allComplaints.filter(c => c.status === "in-progress" || c.status === "routed").length,
    resolved: allComplaints.filter(c => c.status === "resolved").length,
  };

  // Group complaints by department
  const complaintsByDepartment = DEPARTMENTS.reduce<Record<string, Complaint[]>>((acc, dept) => {
    acc[dept] = allComplaints.filter(c => c.department === dept);
    return acc;
  }, {});
  
  // Unassigned complaints
  const unassignedComplaints = allComplaints.filter(c => !c.department);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar userRole="admin" onLogout={logout} />
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage and resolve customer complaints
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("list")}
              className="flex items-center gap-1"
            >
              <LayoutDashboard className="h-4 w-4" />
              List View
            </Button>
            <Button
              variant={view === "department" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("department")}
              className="flex items-center gap-1"
            >
              <Folder className="h-4 w-4" />
              Department View
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Complaints"
            value={stats.total}
            icon={<LayoutDashboard className="h-5 w-5 text-gray-500" />}
            className="bg-white dark:bg-gray-800"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={<Clock className="h-5 w-5 text-yellow-500" />}
            className="bg-yellow-50 dark:bg-yellow-900/20"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={<AlertTriangle className="h-5 w-5 text-blue-500" />}
            className="bg-blue-50 dark:bg-blue-900/20"
          />
          <StatsCard
            title="Resolved"
            value={stats.resolved}
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            className="bg-green-50 dark:bg-green-900/20"
          />
        </div>
        
        {view === "list" ? (
          <ListViewComplaints 
            filteredComplaints={filteredComplaints}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleStatusUpdate={handleStatusUpdate}
          />
        ) : (
          <DepartmentViewComplaints 
            complaintsByDepartment={complaintsByDepartment}
            unassignedComplaints={unassignedComplaints}
            handleStatusUpdate={handleStatusUpdate}
          />
        )}
      </main>
    </div>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
}

const StatsCard = ({ title, value, icon, className }: StatsCardProps) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <h3 className="text-3xl font-bold mt-1">{value}</h3>
          </div>
          <div className="rounded-full p-3 bg-gray-100 dark:bg-gray-700">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// List View Component
interface ListViewComplaintsProps {
  filteredComplaints: Complaint[];
  statusFilter: ComplaintStatus | "all";
  setStatusFilter: (status: ComplaintStatus | "all") => void;
  typeFilter: ComplaintType | "all";
  setTypeFilter: (type: ComplaintType | "all") => void;
  departmentFilter: string | "all";
  setDepartmentFilter: (department: string | "all") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleStatusUpdate: (complaintId: string, status: ComplaintStatus, department?: string) => void;
}

const ListViewComplaints = ({
  filteredComplaints,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  departmentFilter,
  setDepartmentFilter,
  searchTerm,
  setSearchTerm,
  handleStatusUpdate
}: ListViewComplaintsProps) => {
  return (
    <>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Complaints</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="routed">Routed</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by location or description..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 md:gap-4">
              <div className="w-full sm:w-auto flex items-center gap-2">
                <Filter size={18} className="text-gray-500" />
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as ComplaintStatus | "all")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="routed">Routed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-auto flex items-center gap-2">
                <CalendarClock size={18} className="text-gray-500" />
                <Select
                  value={typeFilter}
                  onValueChange={(value) => setTypeFilter(value as ComplaintType | "all")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="cleanliness">Cleanliness</SelectItem>
                    <SelectItem value="wifi">WiFi</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-auto flex items-center gap-2">
                <FolderOpen size={18} className="text-gray-500" />
                <Select
                  value={departmentFilter}
                  onValueChange={(value) => setDepartmentFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        <TabsContent value="all">
          <ComplaintsList 
            complaints={filteredComplaints} 
            onStatusUpdate={handleStatusUpdate} 
          />
        </TabsContent>
        
        <TabsContent value="pending">
          <ComplaintsList 
            complaints={filteredComplaints.filter(c => c.status === "pending")} 
            onStatusUpdate={handleStatusUpdate} 
          />
        </TabsContent>
        
        <TabsContent value="routed">
          <ComplaintsList 
            complaints={filteredComplaints.filter(c => 
              c.status === "routed" || c.status === "in-progress"
            )} 
            onStatusUpdate={handleStatusUpdate} 
          />
        </TabsContent>
        
        <TabsContent value="resolved">
          <ComplaintsList 
            complaints={filteredComplaints.filter(c => c.status === "resolved")} 
            onStatusUpdate={handleStatusUpdate} 
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

// Department View Component
interface DepartmentViewComplaintsProps {
  complaintsByDepartment: Record<string, Complaint[]>;
  unassignedComplaints: Complaint[];
  handleStatusUpdate: (complaintId: string, status: ComplaintStatus, department?: string) => void;
}

const DepartmentViewComplaints = ({
  complaintsByDepartment,
  unassignedComplaints,
  handleStatusUpdate
}: DepartmentViewComplaintsProps) => {
  return (
    <div className="space-y-8">
      {/* Unassigned Complaints */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-lg font-semibold">Unassigned Complaints ({unassignedComplaints.length})</h2>
        </div>
        
        {unassignedComplaints.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No unassigned complaints at the moment.
            </CardContent>
          </Card>
        ) : (
          <ComplaintsList 
            complaints={unassignedComplaints} 
            onStatusUpdate={handleStatusUpdate} 
          />
        )}
      </div>
      
      {/* Department-wise Complaints */}
      {DEPARTMENTS.map((department) => (
        <div key={department}>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
              <Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold">
              {department} ({complaintsByDepartment[department]?.length || 0})
            </h2>
          </div>
          
          {!complaintsByDepartment[department] || complaintsByDepartment[department].length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No complaints assigned to this department.
              </CardContent>
            </Card>
          ) : (
            <ComplaintsList 
              complaints={complaintsByDepartment[department]} 
              onStatusUpdate={handleStatusUpdate} 
            />
          )}
          
          <Separator className="my-8" />
        </div>
      ))}
    </div>
  );
};

// Complaints List Component
interface ComplaintsListProps {
  complaints: Complaint[];
  onStatusUpdate: (complaintId: string, status: ComplaintStatus, department?: string) => void;
}

const ComplaintsList = ({ complaints, onStatusUpdate }: ComplaintsListProps) => {
  const { users } = useAuth();
  
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

  // Get user details by ID
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || user?.email || "Unknown User";
  };

  // Assign department based on complaint type
  const getDepartmentForType = (type: ComplaintType) => {
    switch (type) {
      case "electrical":
        return "Electrical Maintenance";
      case "cleanliness":
        return "Housekeeping";
      case "wifi":
        return "IT Services";
      case "safety":
        return "Safety & Security";
      default:
        return "General Services";
    }
  };

  if (complaints.length === 0) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">
          No complaints found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <Card key={complaint.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="capitalize">{complaint.type} Issue</CardTitle>
                  <Badge className={getStatusColor(complaint.status)}>
                    {complaint.status.replace("-", " ")}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Submitted by: {getUserName(complaint.userId)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Location: {complaint.location}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Date: {formatDate(complaint.createdAt)}
                </div>
                
                {complaint.attachments && complaint.attachments.length > 0 && (
                  <div className="mt-3">
                    <AttachmentViewer attachments={complaint.attachments} />
                  </div>
                )}
              </div>
              
              <div className="md:col-span-1 flex flex-col gap-2">
                {complaint.status === "pending" && (
                  <div className="space-y-2">
                    <Label htmlFor={`department-${complaint.id}`}>Assign Department</Label>
                    <Select
                      defaultValue={getDepartmentForType(complaint.type)}
                      onValueChange={(department) => {
                        onStatusUpdate(complaint.id, "routed", department);
                      }}
                    >
                      <SelectTrigger id={`department-${complaint.id}`}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electrical Maintenance">Electrical Maintenance</SelectItem>
                        <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                        <SelectItem value="IT Services">IT Services</SelectItem>
                        <SelectItem value="Safety & Security">Safety & Security</SelectItem>
                        <SelectItem value="General Services">General Services</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      onClick={() => onStatusUpdate(
                        complaint.id, 
                        "routed", 
                        complaint.department || getDepartmentForType(complaint.type)
                      )}
                      variant="outline"
                      className="w-full"
                    >
                      Confirm & Route
                    </Button>
                  </div>
                )}
                
                {(complaint.status === "routed" || complaint.status === "in-progress") && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Assigned to: {complaint.department || getDepartmentForType(complaint.type)}
                    </p>
                    
                    <Button 
                      onClick={() => onStatusUpdate(complaint.id, "in-progress")}
                      variant="outline"
                      className="w-full"
                      disabled={complaint.status === "in-progress"}
                    >
                      Mark In Progress
                    </Button>
                    
                    <Button 
                      onClick={() => onStatusUpdate(complaint.id, "resolved")}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Mark as Resolved
                    </Button>
                  </div>
                )}
                
                {complaint.status === "resolved" && (
                  <div className="flex flex-col h-full justify-center items-center p-4">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      This complaint has been resolved
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Description:
              </Label>
              <p className="mt-1">{complaint.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminDashboard;
