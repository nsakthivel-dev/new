import { User, Leaf, FileText } from "lucide-react";

interface MessageProps {
  msg: {
    id: string | number;
    role: "user" | "assistant";
    text: string;
    sources?: Array<{ id: string; score: number }>;
  };
}

export default function Message({ msg }: MessageProps) {
  return (
    <div className={`group py-6 px-4 -mx-4 rounded-xl transition-colors ${
      msg.role === "assistant" ? "bg-muted/20 hover:bg-muted/30" : "hover:bg-accent/20"
    }`}>
      <div className="flex gap-3 sm:gap-4 items-start">
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${
          msg.role === "user" 
            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground" 
            : "bg-gradient-to-br from-primary/10 to-primary/5 text-primary border border-primary/20"
        }`}>
          {msg.role === "user" ? (
            <User className="h-4 w-4" />
          ) : (
            <Leaf className="h-4 w-4" />
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 space-y-3 min-w-0 pt-1">
          <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words text-foreground/90">
            {msg.text}
          </div>
          
          {msg.sources && msg.sources.length > 0 && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-accent/40 border border-border/40 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-1 rounded bg-primary/10">
                <FileText className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground/80">Sources: </span>
                <span className="opacity-80">
                  {msg.sources
                    .map((s) => `${s.id}${s.score ? ` (${s.score.toFixed(2)})` : ""}`)
                    .join(", ")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}