
"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User as UserIcon, Bot, Loader2 } from "lucide-react";
import type { ChatMessage, User } from "@/types";
import { handleChatInteraction } from "@/lib/actions";
import { authStore } from "@/lib/authStore";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  currentUser: User;
}

export function ChatInterface({ currentUser }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load chat history from localStorage
    const storedMessages = authStore.getChatHistory(currentUser.id);
    setMessages(storedMessages);
  }, [currentUser.id]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: Date.now(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const questionnaireString = authStore.getQuestionnaireString(currentUser.id);
      const chatHistoryString = newMessages.slice(0, -1) // Exclude current user message for history
        .map(msg => `${msg.sender}: ${msg.text}`).join('\n');

      const result = await handleChatInteraction(
        currentUser.id,
        userMessage.text,
        questionnaireString,
        chatHistoryString
      );

      if (result.success && result.aiResponse) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: result.aiResponse,
          sender: "ai",
          timestamp: Date.now(),
        };
        const finalMessages = [...newMessages, aiMessage];
        setMessages(finalMessages);
        authStore.saveChatHistory(currentUser.id, finalMessages); // Save updated history
      } else {
        // Handle error, maybe add an error message to chat
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: result.message || "Sorry, I couldn't process that. Please try again.",
          sender: "ai",
          timestamp: Date.now(),
        };
        setMessages([...newMessages, errorMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "An unexpected error occurred. Please try again.",
          sender: "ai",
          timestamp: Date.now(),
        };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Chat with Therapie</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-end space-x-2",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot size={18} /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] rounded-xl px-4 py-2 shadow",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                {message.sender === "user" && (
                  <Avatar className="h-8 w-8">
                     <AvatarFallback><UserIcon size={18} /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length -1]?.sender === 'user' && (
              <div className="flex items-end space-x-2 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback><Bot size={18}/></AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] rounded-xl px-4 py-2 shadow bg-muted text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

// Minimal Card components for structure - assuming Card, CardHeader etc. are globally available or replace with divs
const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => <div className={cn("rounded-lg border bg-card text-card-foreground", className)}>{children}</div>;
const CardHeader = ({ children }: { children: React.ReactNode }) => <div className="flex flex-col space-y-1.5 p-4">{children}</div>;
const CardTitle = ({ className, children }: { className?: string; children: React.ReactNode }) => <h3 className={cn("font-semibold leading-none tracking-tight", className)}>{children}</h3>;
const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => <div className={cn("flex-grow", className)}>{children}</div>;
const CardFooter = ({ className, children }: { className?: string; children: React.ReactNode }) => <div className={cn(className)}>{children}</div>;

