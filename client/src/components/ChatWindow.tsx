import { useState, useRef, useEffect } from "react";
import Message from "./Message";

interface Message {
  id: string | number;
  role: "user" | "assistant";
  text: string;
  sources?: Array<{ id: string; score: number }>;
}

interface ChatWindowProps {
  onAddToHistory?: (question: string, answer: string) => void;
}

export default function ChatWindow({ onAddToHistory }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load messages from localStorage on component mount
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputFormRef = useRef<HTMLFormElement>(null);
  const lastUserMessageRef = useRef<string>("");

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      // Scroll to show the last message with some padding
      const container = messagesContainerRef.current;
      const lastMessage = container.lastElementChild;
      if (lastMessage && lastMessage instanceof HTMLElement) {
        const scrollPosition = lastMessage.offsetTop - container.offsetTop - 100;
        container.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: "smooth"
        });
      }
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    // Auto-focus the input when component mounts
    if (inputFormRef.current) {
      const inputElement = inputFormRef.current.querySelector('input');
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, []);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    lastUserMessageRef.current = question;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: question,
    };
    
    setMessages((prev) => [...prev, userMessage]);
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
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Add to history if callback is provided
        if (onAddToHistory) {
          onAddToHistory(question, data.answer);
        }
      } else {
        const errorMessage: Message = {
          id: Date.now() + 1,
          role: "assistant",
          text: `Error: ${data.message || data.error || "Failed to get response"}`,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: `Error: ${err instanceof Error ? err.message : String(err)}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  const clearChat = () => {
    setMessages([]);
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-[70vh] flex flex-col border">
      {/* Header with action buttons */}
      <div className="border-b p-3 flex justify-between items-center bg-muted/50">
        <h3 className="font-semibold text-lg">AI Assistant</h3>
        <div className="flex gap-2">
          <button
            onClick={clearChat}
            className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
            title="Clear current chat"
          >
            Clear Chat
          </button>
          <button
            onClick={clearHistory}
            className="text-xs px-2 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 transition-colors"
            title="Clear chat history"
          >
            Clear History
          </button>
        </div>
      </div>
      
      <div 
        ref={messagesContainerRef}
        className="overflow-y-auto mb-4 flex-1 p-4 space-y-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground max-w-md">
              <h3 className="text-lg font-semibold mb-2">Welcome to AI Assistant</h3>
              <p className="mb-3">Ask questions about crops, pests, diseases, or your agricultural documents</p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3 text-left">
                <p className="text-sm text-yellow-700">
                  <span className="font-medium">Note:</span> Responses are for reference only. AI-generated answers may not be completely accurate. Always consult with agricultural experts for critical decisions.
                </p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => <Message key={msg.id} msg={msg} />)
        )}
        {isLoading && (
          <div className="text-left">
            <div className="inline-block p-4 rounded-lg bg-muted">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <form 
        ref={inputFormRef}
        onSubmit={ask} 
        className="border-t p-4 flex gap-2 sticky bottom-0 bg-white"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about crops, pests, diseases, or your documents..."
          className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          {isLoading ? "Thinking..." : "Ask"}
        </button>
      </form>
    </div>
  );
}