// Shim: shadcn toaster components import from "@/hooks/use-toast"
// We delegate to sonner via a simple toast wrapper so no separate state is needed.
import { toast } from "sonner";

export { toast };

export function useToast() {
  return { toast, toasts: [] as never[] };
}
