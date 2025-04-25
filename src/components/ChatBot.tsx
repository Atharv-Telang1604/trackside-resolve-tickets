
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { detectIntent } from "@/services/dialogflow";

interface Message {
  text: string;
  isBot: boolean;
}

export const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setIsLoading(true);

    try {
      const response = await detectIntent(userMessage);
      setMessages(prev => [...prev, { text: response, isBot: true }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble right now. Please try again later.", 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="flex flex-row items-center space-x-2">
        <MessageSquare className="h-5 w-5" />
        <CardTitle className="text-lg">Chat Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4 mb-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.isBot
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-3 py-2 bg-secondary text-secondary-foreground">
                  Typing...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
