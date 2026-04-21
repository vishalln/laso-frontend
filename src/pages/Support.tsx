// ─────────────────────────────────────────────────────────────────────────────
// Support.tsx — Live chat + FAQ page
//
// Data source: useMockData().forPatient(patientId).messages
//              src/data/faq.ts (static FAQ content — not deleted)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, MessageCircle, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { useMockData } from "@/contexts/MockDataContext";
import { useUser } from "@/contexts/UserContext";
import { faqs } from "@/data/faq";
import type { ChatMessage } from "@/data/mockDB";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTO_REPLIES: Array<{ keywords: string[]; response: string }> = [
  { keywords: ["nausea", "sick", "vomit"], response: "Nausea is a common side effect in the first 4–8 weeks. Take your dose with food and stay well-hydrated. If symptoms are severe, contact your doctor." },
  { keywords: ["dose", "dosage", "injection"], response: "Your current prescription details are in the Dashboard. Never adjust your dose without consulting Dr. Sharma first." },
  { keywords: ["refill", "supply", "running out"], response: "You can request a refill on the Orders page. Auto-refill is scheduled based on your supply level — check the Refill card there." },
  { keywords: ["appointment", "consult", "consultation"], response: "You can book or view consultations on the ConsultHub page. Your next scheduled check-in appears on your Dashboard." },
  { keywords: ["weight", "plateau"], response: "A plateau in weeks 8–12 is normal. The Plateau Buster protocol on your Dashboard has targeted recommendations." },
];

function getAutoReply(text: string): string {
  const lower = text.toLowerCase();
  for (const ar of AUTO_REPLIES) {
    if (ar.keywords.some((k) => lower.includes(k))) return ar.response;
  }
  return "Thanks for your message. A Laso care coordinator will follow up within 30 minutes during business hours.";
}

const SUPPORT_OPTIONS = [
  { icon: "📞", label: "Call us",        detail: "+91 98765 43210", sub: "Mon–Sat, 9 AM–7 PM IST" },
  { icon: "✉️", label: "Email support",  detail: "care@laso.health",  sub: "Reply within 24 hours"  },
  { icon: "🏥", label: "Emergency",      detail: "1800-XXX-XXXX",     sub: "24/7 helpline"           },
];

// ─── Chat Bubble ──────────────────────────────────────────────────────────────

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isPatient = msg.sender === "patient";
  const ts = new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return (
    <div className={cn("flex", isPatient ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
        isPatient ? "bg-primary text-white rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm",
      )}>
        {!isPatient && <p className="text-[10px] font-semibold mb-0.5 opacity-70 capitalize">{msg.sender}</p>}
        <p>{msg.text}</p>
        <p className={cn("text-[10px] mt-1", isPatient ? "text-white/60 text-right" : "text-muted-foreground")}>{ts}</p>
      </div>
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────

function ChatPanel({ seedMessages, patientId }: { seedMessages: ChatMessage[]; patientId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [input, setInput]       = useState("");
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const now = new Date().toISOString();
    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`, patientId,
      sender: "patient", senderName: "You", text, timestamp: now,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `msg-b-${Date.now()}`, patientId,
        sender: "coordinator", senderName: "Care Coordinator", text: getAutoReply(text),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 900);
  }, [input, patientId]);

  return (
    <div className="flex flex-col h-[520px]">
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {messages.map((m) => <ChatBubble key={m.id} msg={m} />)}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <div className="border-t border-border p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          onKeyDown={(e) => e.key === "Enter" && send()}
          className="flex-1"
        />
        <Button size="icon" onClick={send} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── FAQ Panel ────────────────────────────────────────────────────────────────

function FaqPanel() {
  return (
    <Accordion type="single" collapsible className="space-y-2">
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id} className="border border-border rounded-xl px-4 overflow-hidden">
          <AccordionTrigger className="text-sm font-medium py-4 hover:no-underline">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function Support() {
  const { user } = useUser();
  const { forPatient } = useMockData();
  const patientId = user?.patientId ?? "patient_001";
  const messages = forPatient(patientId)?.messages ?? [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <PageHeader title="Support" subtitle="Chat with your care team or browse frequently asked questions" />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {SUPPORT_OPTIONS.map((opt) => (
          <Card key={opt.label} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 text-center">
              <p className="text-2xl mb-2">{opt.icon}</p>
              <p className="font-semibold text-sm">{opt.label}</p>
              <p className="text-xs text-primary font-medium mt-0.5">{opt.detail}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="chat">
        <TabsList className="mb-6">
          <TabsTrigger value="chat"><MessageCircle className="h-4 w-4 mr-2" />Live Chat</TabsTrigger>
          <TabsTrigger value="faq"><ChevronDown className="h-4 w-4 mr-2" />FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Care coordinator online
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ChatPanel seedMessages={messages} patientId={patientId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <FaqPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
