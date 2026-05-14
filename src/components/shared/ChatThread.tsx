import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { messageService } from "@/services/messageService";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";

interface ChatThreadProps {
  conversationId: string;
  currentUserId: string;
  currentUserRole: string;
  currentUserName: string;
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  const ts = new Date(message.sent_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
        isOwn ? "bg-primary text-white rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm",
      )}>
        {!isOwn && (
          <p className="text-[10px] font-semibold mb-0.5 opacity-70 capitalize">{message.sender_role}</p>
        )}
        <p>{message.content}</p>
        <p className={cn("text-[10px] mt-1", isOwn ? "text-white/60 text-right" : "text-muted-foreground")}>{ts}</p>
      </div>
    </div>
  );
}

export function ChatThread({ conversationId, currentUserId, currentUserRole, currentUserName }: ChatThreadProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => messageService.getMessages(conversationId),
    refetchInterval: 5000,
    enabled: !!conversationId,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => messageService.send(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMutation.mutate(text);
    setInput("");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[480px] p-4 space-y-3">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-10 w-1/2 ml-auto" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[480px]">
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {messages?.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === currentUserId} />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1"
          disabled={sendMutation.isPending}
        />
        <Button size="icon" onClick={handleSend} disabled={!input.trim() || sendMutation.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
