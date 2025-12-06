import { useState, useRef, useEffect } from "react";
import Message from "./Message";
import { Button } from "@/components/ui/button";
import { Send, Leaf, Menu } from "lucide-react";

interface Message {
  id: string | number;
  role: "user" | "assistant";
  text: string;
  sources?: Array<{ id: string; score: number }>;
}

interface ChatWindowProps {
  onAddToHistory?: (question: string, answer: string, messages: Message[]) => void;
  onOpenMenu?: () => void;
  initialMessages?: Message[] | null;
}

export default function ChatWindow({ onAddToHistory, onOpenMenu, initialMessages }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    // If initialMessages is provided, use it
    if (initialMessages) {
      return initialMessages;
    }
    // Otherwise, load from localStorage
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update messages when initialMessages changes
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: question,
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/rag/qa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: question, topK: 5 }),
      });

      const data = await res.json();

      if (res.ok) {
        const assistantMessage: Message = {
          id: Date.now() + 1,
          role: "assistant",
          text: data.answer,
          sources: data.sources,
        };
        const finalMessages = [...newMessages, assistantMessage];
        setMessages(finalMessages);
        
        if (onAddToHistory) {
          onAddToHistory(question, data.answer, finalMessages);
        }
      } else {
        const errorMessage: Message = {
          id: Date.now() + 1,
          role: "assistant",
          text: `Error: ${data.message || data.error || "Failed to get response"}`,
        };
        const finalMessages = [...newMessages, errorMessage];
        setMessages(finalMessages);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: `Error: ${err instanceof Error ? err.message : String(err)}`,
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ask(e as any);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background via-background to-muted/10 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center gap-3 px-4 py-3.5 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMenu}
          className="flex-shrink-0 hover:bg-accent/80"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-primary/10">
            <Leaf className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-base font-semibold">Farm Assistant</h1>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center min-h-full px-4 py-12">
            <div className="text-center max-w-3xl w-full animate-in fade-in duration-700">
              {/* Hero Section */}
              <div className="mb-10 flex justify-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 blur-3xl rounded-full animate-pulse"></div>
                  <div className="relative p-6 rounded-3xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border-2 border-primary/30 shadow-2xl backdrop-blur-sm">
                    <Leaf className="h-16 w-16 sm:h-20 sm:w-20 text-primary drop-shadow-lg" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold mb-5 bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent leading-tight">
                Welcome to Farm Assistant
              </h1>
              
              <p className="text-muted-foreground text-lg sm:text-xl mb-12 leading-relaxed max-w-2xl mx-auto">
                Your intelligent companion for modern agriculture. Get expert advice on crops, pest control, disease management, and sustainable farming practices.
              </p>
              
              {/* Feature Cards - Hidden on mobile */}
              <div className="hidden sm:grid grid-cols-2 gap-3 mb-8 max-w-xl mx-auto">
                {[
                  { icon: "🍅", title: "Crop Management", text: "How do I prevent tomato blight?" },
                  { icon: "🌾", title: "Planting Guide", text: "Best time to plant wheat?" },
                  { icon: "🐛", title: "Pest Control", text: "Natural pest control methods" },
                  { icon: "🌱", title: "Soil Health", text: "Soil preparation tips" }
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt.text)}
                    className="group relative p-3.5 text-left rounded-xl border border-border/50 hover:border-primary/50 bg-gradient-to-br from-card to-card/50 hover:from-primary/5 hover:to-primary/10 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">{prompt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-xs mb-1 text-foreground/90 group-hover:text-primary transition-colors">
                          {prompt.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-snug line-clamp-1">
                          {prompt.text}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.map((msg, index) => (
              <div 
                key={msg.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Message msg={msg} />
              </div>
            ))}
            {isLoading && (
              <div className="py-6 animate-in fade-in duration-300">
                <div className="flex gap-3 items-center">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Leaf className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:py-5">
          <form onSubmit={ask} className="relative">
            <div className="flex items-end gap-2 rounded-2xl border-2 border-border/50 bg-background shadow-lg focus-within:border-primary/40 focus-within:shadow-xl transition-all duration-200">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about crops, pests, diseases..."
                className="flex-1 resize-none bg-transparent px-4 py-3.5 text-sm focus:outline-none max-h-[200px] min-h-[52px] placeholder:text-muted-foreground/50"
                disabled={isLoading}
                rows={1}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="icon"
                className="m-2 rounded-xl flex-shrink-0 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <p className="text-xs text-muted-foreground/70 text-center mt-3.5 leading-relaxed">
            💡 AI responses are for reference only. Always consult agricultural experts for critical farming decisions.
          </p>
        </div>
      </div>
    </div>
  );
}