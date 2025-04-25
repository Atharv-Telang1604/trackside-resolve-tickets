import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSupport } from "@/contexts/support/SupportContext";
import { Navbar } from "@/components/Navbar";
import { initiateTwilioCall } from "@/services/twilio";
import { useToast } from "@/components/ui/use-toast";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HelpCircle, 
  Phone,
  Mail, 
  BookOpen,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Help = () => {
  const { currentUser, logout } = useAuth();
  const { getFAQs, getEmergencyContacts } = useSupport();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCallLoading, setIsCallLoading] = useState<string | null>(null);
  
  const faqs = getFAQs();
  const emergencyContacts = getEmergencyContacts();
  
  const faqsByCategory = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, typeof faqs>);
  
  const categories = Object.keys(faqsByCategory);

  const handleEmergencyCall = async (phoneNumber: string, contactName: string) => {
    setIsCallLoading(phoneNumber);
    const success = await initiateTwilioCall(phoneNumber);
    setIsCallLoading(null);

    if (success) {
      toast({
        title: "Call Initiated",
        description: `Connecting you with ${contactName}...`,
      });
    } else {
      toast({
        title: "Call Failed",
        description: "Unable to connect the call. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar userRole={currentUser?.role || "customer"} onLogout={logout} />
      
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Help & Support</h1>
        
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Emergency Contacts
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about our railway complaint system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {categories.map((category, idx) => (
                    <div key={idx} className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">{category}</h3>
                      {faqsByCategory[category].map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pt-2 flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <p>{faq.answer}</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </div>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="emergency">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contacts</CardTitle>
                <CardDescription>
                  Important contacts for emergency situations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {emergencyContacts.map((contact) => (
                    <Card key={contact.id} className="bg-white dark:bg-gray-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{contact.name}</CardTitle>
                        <CardDescription>{contact.role} - {contact.department}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-blue-500" />
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50"
                              onClick={() => handleEmergencyCall(contact.phoneNumber, contact.name)}
                              disabled={!!isCallLoading}
                            >
                              {isCallLoading === contact.phoneNumber ? 
                                "Connecting..." : 
                                <>
                                  <Phone className="h-4 w-4 mr-2" />
                                  Call {contact.phoneNumber}
                                </>
                              }
                            </Button>
                          </div>
                          
                          {contact.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-blue-500" />
                              <a 
                                href={`mailto:${contact.email}`} 
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {contact.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center">
          <BookOpen className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <h2 className="text-xl font-semibold mb-2">Need more help?</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            If you couldn't find what you were looking for, please contact our customer support team or submit a complaint through the dashboard.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <button 
              className="text-blue-600 hover:underline flex items-center gap-1"
              onClick={() => navigate(currentUser ? "/dashboard" : "/login-customer")}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Help;
