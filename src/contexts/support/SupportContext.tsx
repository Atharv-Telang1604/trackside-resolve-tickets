
import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmergencyContact, FAQ } from "@/types";
import { db } from "@/services/db";

interface SupportContextType {
  getEmergencyContacts: () => EmergencyContact[];
  getFAQs: () => FAQ[];
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export function SupportProvider({ children }: { children: ReactNode }) {
  const { data: emergencyContacts = [] } = useQuery({
    queryKey: ['emergencyContacts'],
    queryFn: () => db.getEmergencyContacts(),
  });

  const { data: faqs = [] } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => db.getFAQs(),
  });

  return (
    <SupportContext.Provider 
      value={{
        getEmergencyContacts: () => emergencyContacts,
        getFAQs: () => faqs,
      }}
    >
      {children}
    </SupportContext.Provider>
  );
}

export function useSupport() {
  const context = useContext(SupportContext);
  if (context === undefined) {
    throw new Error("useSupport must be used within a SupportProvider");
  }
  return context;
}
