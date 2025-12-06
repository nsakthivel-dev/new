import { useState, useEffect } from "react";
import ChatWindow from "@/components/ChatWindow";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Trash2, Plus, Menu, Leaf } from "lucide-react";

interface ChatHistoryItem {
  id: string;
  timestamp: number;
  title: string;
  preview: string;
  // Add conversation data
  messages: Array<{
    id: string | number;
    role: "user" | "assistant";
    text: string;
    sources?: Array<{ id: string; score: number }>;
  }>;
}

export default function RagAssistant() {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // Add state for currently loaded conversation
  const [currentConversation, setCurrentConversation] = useState<Array<{
    id: string | number;
    role: "user" | "assistant";
    text: string;
    sources?: Array<{ id: string; score: number }>;
  }> | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  const addToHistory = (question: string, answer: string, messages: Array<{
    id: string | number;
    role: "user" | "assistant";
    text: string;
    sources?: Array<{ id: string; score: number }>;
  }>) => {
    const newEntry: ChatHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      title: question.length > 50 ? question.substring(0, 50) + "..." : question,
      preview: answer.length > 50 ? answer.substring(0, 50) + "..." : answer,
      messages: messages
    };

    const updatedHistory = [newEntry, ...chatHistory.slice(0, 19)];
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
  };

  const clearAllHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('chatMessages');
    setIsSheetOpen(false);
  };

  // Function to load a conversation
  const loadConversation = (conversation: ChatHistoryItem) => {
    setCurrentConversation(conversation.messages);
    setIsSheetOpen(false);
    // Store in localStorage so ChatWindow can access it
    localStorage.setItem('chatMessages', JSON.stringify(conversation.messages));
  };

  const HistorySidebar = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-background via-background to-muted/10">
      {/* Header with branding */}
      <div className="p-4 border-b border-border/50 bg-card/30">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-foreground">Farm Assistant</h2>
            <p className="text-xs text-muted-foreground">AI Agriculture Helper</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-center gap-2 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all shadow-sm font-medium"
          onClick={() => {
            localStorage.removeItem('chatMessages');
            setCurrentConversation(null);
            window.location.reload();
          }}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* History List */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {chatHistory.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="mb-4 inline-flex p-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/30">
                <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-sm font-semibold mb-2 text-foreground/80">No Conversations Yet</h3>
              <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-[200px] mx-auto">
                Your chat history will appear here once you start a conversation
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="px-2 py-1.5">
                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Recent Chats</p>
              </div>
              {chatHistory.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl px-3 py-3 hover:bg-accent/70 cursor-pointer transition-all duration-200 hover:shadow-md border border-transparent hover:border-primary/20 bg-card/30"
                  onClick={() => loadConversation(item)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all group-hover:scale-110 shadow-sm">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2 leading-snug text-foreground/90 group-hover:text-primary transition-colors mb-1.5">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                        <span className="inline-block w-1 h-1 rounded-full bg-primary/40"></span>
                        <span>{new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer with Clear Button */}
      {chatHistory.length > 0 && (
        <div className="p-4 border-t border-border/50 bg-gradient-to-t from-muted/20 to-transparent">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all font-medium"
            onClick={clearAllHistory}
          >
            <Trash2 className="h-4 w-4" />
            Clear All Chats
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-shrink-0 border-r border-border/50">
        <HistorySidebar />
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Chat History</SheetTitle>
          </SheetHeader>
          <HistorySidebar />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow 
          onAddToHistory={addToHistory} 
          onOpenMenu={() => setIsSheetOpen(true)}
          initialMessages={currentConversation}
        />
      </div>
    </div>
  );
}