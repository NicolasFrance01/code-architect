import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, X, Send, Loader2, Sparkles, Mic } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useVoiceRecorder, useVoiceStream } from "../../replit_integrations/audio";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Voice integration
  const recorder = useVoiceRecorder();
  const [currentTranscript, setCurrentTranscript] = useState("");

  const { streamVoiceResponse } = useVoiceStream({
    onUserTranscript: (text) => {
      setMessages(prev => [...prev, { role: "user", content: text }]);
    },
    onTranscript: (_, full) => {
      setCurrentTranscript(full);
    },
    onComplete: (full) => {
      setMessages(prev => [...prev, { role: "assistant", content: full }]);
      setCurrentTranscript("");
      setIsLoading(false);
    },
    onError: () => setIsLoading(false)
  });

  // Init conversation on mount
  useEffect(() => {
    if (isOpen && !conversationId) {
      fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Construction Assistant" }),
      })
      .then(res => res.json())
      .then(data => setConversationId(data.id));
    }
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentTranscript]);

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMsg }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantMsg = "";
      
      // Temporary placeholder message that we update
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              assistantMsg += data.content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantMsg;
                return newMessages;
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoice = async () => {
    if (!conversationId) return;
    
    if (recorder.state === "recording") {
      setIsLoading(true);
      const blob = await recorder.stopRecording();
      await streamVoiceResponse(`/api/conversations/${conversationId}/messages`, blob);
    } else {
      await recorder.startRecording();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground z-50 animate-in zoom-in duration-300"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-background border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="h-14 bg-primary px-4 flex items-center justify-between text-primary-foreground">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-display font-bold">Site Assistant</span>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary-foreground/20 text-primary-foreground" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-20">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>How can I help you today?</p>
            <p className="text-sm opacity-70">Ask about projects, inventory, or schedules.</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm",
              msg.role === "user" 
                ? "bg-primary text-primary-foreground rounded-br-sm" 
                : "bg-white text-foreground border border-border rounded-bl-sm"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {currentTranscript && (
           <div className="flex w-full justify-start">
             <div className="max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm bg-white text-foreground border border-border rounded-bl-sm animate-pulse">
               {currentTranscript}
             </div>
           </div>
        )}

        {isLoading && !currentTranscript && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl border border-border rounded-bl-sm">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-background border-t border-border">
        <div className="flex gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask anything..."
            className="flex-1"
          />
          <Button 
            size="icon" 
            variant={recorder.state === "recording" ? "destructive" : "secondary"}
            onClick={handleVoice}
            className="shrink-0"
          >
            <Mic className={cn("h-4 w-4", recorder.state === "recording" && "animate-pulse")} />
          </Button>
          <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
