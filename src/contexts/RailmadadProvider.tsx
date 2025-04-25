
import { ReactNode } from "react";
import { ComplaintsProvider } from "./complaints/ComplaintsContext";
import { NotificationsProvider } from "./notifications/NotificationsContext";
import { MessagesProvider } from "./messages/MessagesContext";
import { SupportProvider } from "./support/SupportContext";

export function RailmadadProvider({ children }: { children: ReactNode }) {
  return (
    <ComplaintsProvider>
      <NotificationsProvider>
        <MessagesProvider>
          <SupportProvider>
            {children}
          </SupportProvider>
        </MessagesProvider>
      </NotificationsProvider>
    </ComplaintsProvider>
  );
}
