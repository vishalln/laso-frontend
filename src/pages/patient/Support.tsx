import { useQuery } from "@tanstack/react-query";
import { MessageCircle, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatThread } from "@/components/shared/ChatThread";
import { useUser } from "@/contexts/UserContext";
import { messageService } from "@/services/messageService";
import { faqs } from "@/data/faq";

const SUPPORT_OPTIONS = [
  { icon: "tel", label: "Call us", detail: "+91 98765 43210", sub: "Mon-Sat, 9 AM-7 PM IST" },
  { icon: "mail", label: "Email support", detail: "care@laso.health", sub: "Reply within 24 hours" },
  { icon: "sos", label: "Emergency", detail: "1800-XXX-XXXX", sub: "24/7 helpline" },
];

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

export default function Support() {
  const { user } = useUser();
  const patientId = user?.id ?? "";

  const { data: conversation, isLoading: convLoading } = useQuery({
    queryKey: ["conversation", patientId],
    queryFn: () => messageService.getConversationForPatient(patientId),
    enabled: !!patientId,
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Support</h1>
      <p className="text-sm text-muted-foreground mb-6">Chat with your care team or browse frequently asked questions</p>

      {/* Contact options */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {SUPPORT_OPTIONS.map((opt) => (
          <Card key={opt.label} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 text-center">
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
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Care coordinator online
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {convLoading ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-10 w-3/4" />
                  <Skeleton className="h-10 w-1/2 ml-auto" />
                  <Skeleton className="h-10 w-2/3" />
                </div>
              ) : conversation ? (
                <ChatThread
                  conversationId={conversation.id}
                  currentUserId={user!.id}
                  currentUserRole={user!.role}
                  currentUserName={user!.name}
                />
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Unable to load chat. Please try again later.
                </div>
              )}
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
