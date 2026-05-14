import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { protocolService } from "@/services/protocolService";
import { programService } from "@/services/programService";
import { toast } from "@/hooks/use-toast";

type FlowState = "info" | "processing" | "success";

export default function StartProgramme() {
  const navigate = useNavigate();
  const [flowState, setFlowState] = useState<FlowState>("info");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["protocols", "published"],
    queryFn: () => protocolService.getPublished(),
  });

  const createMutation = useMutation({
    mutationFn: (templateId: string) => programService.create(templateId),
    onMutate: () => setFlowState("processing"),
    onSuccess: () => {
      // Simulate payment processing delay
      setTimeout(() => {
        setFlowState("success");
        toast.success("Programme started successfully!");
        setTimeout(() => navigate("/programme"), 1500);
      }, 1500);
    },
    onError: () => {
      setFlowState("info");
      toast.error("Failed to start programme. Please try again.");
    },
  });

  const handleStart = () => {
    if (!selectedTemplate) return;
    createMutation.mutate(selectedTemplate);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Success state
  if (flowState === "success") {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">You're all set!</h2>
        <p className="text-sm text-muted-foreground">Your programme has been created. Redirecting to your timeline...</p>
      </div>
    );
  }

  // Processing state
  if (flowState === "processing") {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Setting up your programme...</h2>
        <p className="text-sm text-muted-foreground">Processing payment and creating your personalised plan.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Start Your Programme</h1>
      <p className="text-muted-foreground mb-6">Choose a programme template to begin your personalised journey.</p>

      <div className="space-y-4">
        {templates?.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all ${
              selectedTemplate === template.id ? "ring-2 ring-primary" : "hover:shadow-md"
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {template.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {template.description && (
                <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {template.steps.length} steps &middot; Version {template.version}
              </p>
            </CardContent>
          </Card>
        ))}

        {templates?.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No programme templates available at this time.
          </p>
        )}
      </div>

      <div className="mt-8">
        <Button
          size="lg"
          className="w-full sm:w-auto"
          disabled={!selectedTemplate}
          onClick={handleStart}
        >
          Confirm & Start Programme
        </Button>
      </div>
    </div>
  );
}
