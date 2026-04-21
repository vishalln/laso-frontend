// ─────────────────────────────────────────────────────────────────────────────
// Orders.tsx — Unified ecommerce + pharmacy orders page
//
// Data source: useMockData().forPatient(patientId)  → orders, refill
//              useMockData().forAdmin().catalog       → shop catalog
//
// Tabs:
//   My Orders    — order history (shadcn Table) + refill card
//   Shop         — OTC supplements / devices / lab tests (week-aware grid)
//   Prescriptions— Rx-gated medications
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo } from "react";
import {
  Package, Truck, Clock, Thermometer, RefreshCw,
  ShoppingCart, Plus, Minus, Trash2, Star,
  FlaskConical, Shield, ChevronRight, Smartphone,
  CreditCard, Building2, Banknote, CheckCircle, Lock,
  Sparkles, Info, Pill,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { PrescriptionBanner } from "@/components/shared/PrescriptionBanner";
import { useMockData } from "@/contexts/MockDataContext";
import { useApp, type PaymentMethod } from "@/contexts/AppContext";
import { useUser } from "@/contexts/UserContext";
import type { CatalogItem, Order, RefillStatus } from "@/data/mockDB";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const PROGRESS_PCT: Record<string, number> = {
  prescription_received: 10, pharmacist_review: 20, safety_check: 30, dispensed: 40,
  packed: 50, cold_chain_verified: 60, dispatched: 70, in_transit: 80,
  out_for_delivery: 90, delivered: 100, processing: 15, cancelled: 0,
};
const STATUS_LABEL: Record<string, string> = {
  prescription_received: "Rx Received", pharmacist_review: "Pharmacist Review",
  safety_check: "Safety Check", dispensed: "Dispensed", packed: "Packed",
  cold_chain_verified: "Cold-Chain Verified", dispatched: "Dispatched",
  in_transit: "In Transit", out_for_delivery: "Out for Delivery",
  delivered: "Delivered", processing: "Processing", cancelled: "Cancelled",
  confirmed: "Confirmed",
};

const STATUS_BADGE_CLS: Record<string, string> = {
  delivered:  "bg-success/10 text-success border-success/20",
  dispatched: "bg-primary/10 text-primary border-primary/20",
  confirmed:  "bg-primary/10 text-primary border-primary/20",
  cancelled:  "bg-destructive/10 text-destructive border-destructive/20",
};

type CategoryKey = CatalogItem["category"];
const CATEGORY_META: Record<CategoryKey, { label: string; emoji: string }> = {
  rx_medication: { label: "Rx Medication",   emoji: "💊" },
  protein:       { label: "Protein",          emoji: "🥤" },
  vitamins:      { label: "Vitamins",         emoji: "🌿" },
  fibre_gut:     { label: "Fibre & Gut",      emoji: "🫙" },
  devices:       { label: "Device",           emoji: "📱" },
  lab_test:      { label: "Lab Test",         emoji: "🔬" },
};

const PAYMENT_OPTIONS: Array<{ id: PaymentMethod; label: string; sublabel: string; icon: React.ReactNode }> = [
  { id: "upi",        label: "UPI",              sublabel: "PhonePe, GPay, Paytm, BHIM",    icon: <Smartphone  className="h-5 w-5" /> },
  { id: "card",       label: "Card",             sublabel: "Visa, Mastercard, RuPay",        icon: <CreditCard  className="h-5 w-5" /> },
  { id: "netbanking", label: "Net Banking",      sublabel: "SBI, HDFC, ICICI, Axis, Kotak",  icon: <Building2   className="h-5 w-5" /> },
  { id: "cod",        label: "Cash on Delivery", sublabel: "Pay at your door, ₹0 fee",       icon: <Banknote    className="h-5 w-5" /> },
];

// ─── Micro-components ─────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
      <span>({count.toLocaleString()})</span>
    </span>
  );
}

function ColdChainBadge({ intact }: { intact: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium",
      intact ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
      <Thermometer className="h-3 w-3" />
      {intact ? "✓ Cold-chain intact" : "⚠ Cold-chain excursion"}
    </span>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  item: CatalogItem;
  onAdd: (item: CatalogItem) => void;
  inCart: boolean;
  locked?: boolean;
  onInfoClick: (item: CatalogItem) => void;
}

function ProductCard({ item, onAdd, inCart, locked, onInfoClick }: ProductCardProps) {
  const catMeta = CATEGORY_META[item.category];
  return (
    <Card className={cn("flex flex-col hover:shadow-md transition-shadow", !item.inStock && "opacity-60", locked && "border-dashed")}>
      <CardContent className="p-4 flex flex-col h-full gap-3">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-2xl flex-shrink-0">{item.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <p className="text-sm font-semibold leading-tight">{item.name}</p>
              <button onClick={() => onInfoClick(item)} className="text-muted-foreground hover:text-foreground flex-shrink-0 ml-1" aria-label="Clinical rationale">
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{item.brand}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[10px] gap-1"><span>{catMeta.emoji}</span>{catMeta.label}</Badge>
          <StarRating rating={item.rating} count={item.reviewCount} />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed flex-1">{item.tagline}</p>
        <p className="text-[11px] text-muted-foreground">{item.unit}</p>
        {item.requiresPrescription && (
          <div className={cn("flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg",
            locked ? "bg-muted text-muted-foreground" : "bg-teal-50 text-teal-700 border border-teal-200")}>
            {locked ? <Lock className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
            {locked ? "Prescription required" : "✓ Verified prescription"}
          </div>
        )}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div>
            <p className="text-base font-bold">₹{item.priceInr.toLocaleString()}</p>
            {item.category === "lab_test" && <p className="text-[10px] text-muted-foreground">incl. home collection</p>}
          </div>
          <Button size="sm" variant={inCart ? "secondary" : "default"} disabled={!item.inStock || locked} onClick={() => onAdd(item)} className="gap-1.5">
            {inCart ? <><CheckCircle className="h-3.5 w-3.5" /> Added</>
              : locked ? <><Lock className="h-3.5 w-3.5" /> Rx Required</>
              : item.category === "lab_test" ? <><Plus className="h-3.5 w-3.5" /> Book</>
              : <><Plus className="h-3.5 w-3.5" /> Add</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Clinical Rationale Dialog ────────────────────────────────────────────────

function RationaleDialog({ item, open, onClose }: { item: CatalogItem | null; open: boolean; onClose: () => void }) {
  if (!item) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><span className="text-xl">{item.emoji}</span>{item.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{CATEGORY_META[item.category].label}</Badge>
            <StarRating rating={item.rating} count={item.reviewCount} />
          </div>
          <Separator />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <FlaskConical className="h-3.5 w-3.5" /> Clinical Rationale
            </p>
            <p className="text-sm leading-relaxed">{item.clinicalRationale}</p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground">{item.unit}</p>
              <p className="text-lg font-bold">₹{item.priceInr.toLocaleString()}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: Week {item.recommendedWeeks[0]}–{item.recommendedWeeks[1]}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Cart Sheet ───────────────────────────────────────────────────────────────

function CartSheet({ open, onClose, onCheckout }: { open: boolean; onClose: () => void; onCheckout: () => void }) {
  const { cart, cartTotal, updateQty, removeFromCart, cartCount } = useApp();
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />Cart
            {cartCount > 0 && <span className="h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">{cartCount}</span>}
          </SheetTitle>
        </SheetHeader>
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground px-5">
            <ShoppingCart className="h-10 w-10 opacity-30" />
            <p className="text-sm">Your cart is empty</p>
            <Button variant="outline" size="sm" onClick={onClose}>Browse products</Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-5">
              <div className="py-4 space-y-4">
                {cart.map(({ item, qty, prescriptionId }) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-xl flex-shrink-0">{item.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.unit}</p>
                      {prescriptionId && (
                        <p className="text-[10px] text-teal-600 flex items-center gap-1 mt-0.5">
                          <Shield className="h-2.5 w-2.5" /> Rx {prescriptionId}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 border rounded-lg">
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => updateQty(item.id, qty - 1)}><Minus className="h-3 w-3" /></Button>
                          <span className="text-sm font-medium w-5 text-center">{qty}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => updateQty(item.id, qty + 1)}><Plus className="h-3 w-3" /></Button>
                        </div>
                        <p className="text-sm font-semibold">₹{(item.priceInr * qty).toLocaleString()}</p>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive self-start mt-0.5">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="flex-col gap-3 px-5 py-4 border-t bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Subtotal ({cartCount} items)</p>
                  <p className="text-xl font-bold">₹{cartTotal.toLocaleString()}</p>
                </div>
                <p className="text-xs text-muted-foreground text-right">Free delivery<br />on all orders</p>
              </div>
              <Button className="w-full gap-2" size="lg" onClick={onCheckout}>
                Proceed to Checkout <ChevronRight className="h-4 w-4" />
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Checkout Sheet ───────────────────────────────────────────────────────────

type CheckoutStep = "payment" | "processing" | "confirmed";

function CheckoutSheet({ open, onClose, onBack }: { open: boolean; onClose: () => void; onBack: () => void }) {
  const { cart, cartTotal, cartCount, placeOrder } = useApp();
  const [step, setStep]               = useState<CheckoutStep>("payment");
  const [payMethod, setPayMethod]     = useState<PaymentMethod>("upi");
  const [upiId, setUpiId]             = useState("");
  const [confirmed, setConfirmed]     = useState<{ id: string; total: number } | null>(null);

  const handlePlaceOrder = useCallback(() => {
    setStep("processing");
    setTimeout(() => { const o = placeOrder(payMethod); setConfirmed({ id: o.id, total: o.totalInr }); setStep("confirmed"); }, 1800);
  }, [placeOrder, payMethod]);

  const handleClose = useCallback(() => {
    if (step === "confirmed") { setStep("payment"); setConfirmed(null); }
    onClose();
  }, [step, onClose]);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            {step === "confirmed" ? <><CheckCircle className="h-5 w-5 text-success" /> Order Confirmed</>
              : step === "processing" ? <><RefreshCw className="h-5 w-5 animate-spin" /> Processing…</>
              : <>Checkout</>}
          </SheetTitle>
        </SheetHeader>

        {step === "payment" && (
          <>
            <ScrollArea className="flex-1 px-5">
              <div className="py-4 space-y-6">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Order Summary ({cartCount} items)</p>
                  {cart.map(({ item, qty }) => (
                    <div key={item.id} className="flex justify-between text-sm py-0.5">
                      <span className="text-muted-foreground truncate max-w-[200px]">{item.emoji} {item.name} ×{qty}</span>
                      <span className="font-medium ml-2">₹{(item.priceInr * qty).toLocaleString()}</span>
                    </div>
                  ))}
                  <Separator className="mt-3 mb-2" />
                  <div className="flex justify-between text-sm font-semibold"><span>Delivery</span><span className="text-success">Free</span></div>
                  <div className="flex justify-between text-base font-bold mt-1"><span>Total</span><span>₹{cartTotal.toLocaleString()}</span></div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Payment Method</p>
                  <div className="space-y-2">
                    {PAYMENT_OPTIONS.map(opt => (
                      <button key={opt.id} onClick={() => setPayMethod(opt.id)}
                        className={cn("w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                          payMethod === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
                          payMethod === opt.id ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>{opt.icon}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.sublabel}</p>
                        </div>
                        <div className={cn("h-4 w-4 rounded-full border-2 flex-shrink-0",
                          payMethod === opt.id ? "border-primary bg-primary" : "border-muted-foreground/40")}>
                          {payMethod === opt.id && <div className="h-2 w-2 rounded-full bg-white m-auto mt-0.5" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  {payMethod === "upi" && (
                    <div className="mt-3 space-y-1.5">
                      <Label htmlFor="upi-id" className="text-xs">UPI ID <span className="text-destructive">*</span></Label>
                      <Input id="upi-id" placeholder="e.g. priya@paytm" value={upiId} onChange={e => setUpiId(e.target.value)} className="h-9 text-sm" />
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
            <SheetFooter className="flex-col gap-2 px-5 py-4 border-t">
              <Button className="w-full gap-2" size="lg" disabled={payMethod === "upi" && !upiId.trim()} onClick={handlePlaceOrder}>
                Pay ₹{cartTotal.toLocaleString()} <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="w-full" onClick={onBack}>← Back to cart</Button>
            </SheetFooter>
          </>
        )}

        {step === "processing" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-semibold">Processing payment…</p>
              <p className="text-sm text-muted-foreground mt-1">Please do not close this window</p>
            </div>
          </div>
        )}

        {step === "confirmed" && confirmed && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-5 text-center">
            <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <div>
              <p className="text-xl font-bold">Order Placed!</p>
              <p className="text-sm text-muted-foreground mt-1">{confirmed.id}</p>
              <p className="text-lg font-semibold mt-2">₹{confirmed.total.toLocaleString()} paid</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 w-full text-sm text-left space-y-2">
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /><span>Estimated delivery: <strong>3–5 business days</strong></span></div>
              <div className="flex items-center gap-2"><Thermometer className="h-4 w-4 text-primary" /><span>Cold-chain items packed separately</span></div>
              <div className="flex items-center gap-2"><Pill className="h-4 w-4 text-primary" /><span>Rx items dispatched after pharmacy verification</span></div>
            </div>
            <Button className="w-full" onClick={handleClose}>Done</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── My Orders tab ────────────────────────────────────────────────────────────

function RefillCard({ refill }: { refill: RefillStatus }) {
  const pct   = Math.round((refill.currentSupply / refill.totalSupply) * 100);
  const isLow = refill.status === "low" || refill.status === "critical";
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><RefreshCw className="h-4 w-4 text-primary" />Auto-Refill Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between py-2">
          <div className="flex-1 mr-4">
            <p className="font-medium text-sm">{refill.medicationName}</p>
            <p className="text-xs text-muted-foreground">
              Supply: {refill.currentSupply}/{refill.totalSupply} tabs · Runs out {refill.estimatedRunOut}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Auto-refill: {refill.autoRefillScheduled}</p>
            <Progress value={pct} className={cn("h-1.5 mt-2", isLow && "[&>div]:bg-destructive")} />
          </div>
          <Badge className={isLow ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-success/10 text-success border-success/20"}>
            {refill.status === "low" ? "Low supply" : refill.status === "critical" ? "Critical" : "OK"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function OrdersHistoryTable({
  orders,
  catalog,
  onReorder,
}: {
  orders: Order[];
  catalog: CatalogItem[];
  onReorder: (order: Order) => void;
}) {

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl text-muted-foreground">
        <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No orders yet</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="w-16">Qty</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-24">Refill</TableHead>
              <TableHead className="w-28">Date</TableHead>
              <TableHead className="w-24 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map(order => {
              const firstItem  = order.items[0];
              const cat        = catalog.find(c => firstItem?.name?.toLowerCase().includes(c.name.toLowerCase().split(" ")[0]));
              const isActive   = order.status !== "delivered" && order.status !== "cancelled";
              const statusCls  = STATUS_BADGE_CLS[order.status] ?? "bg-muted text-muted-foreground";
              return (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {cat && <span className="text-lg">{cat.emoji}</span>}
                      <div>
                        <p className="font-medium text-sm">{firstItem?.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{order.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{firstItem?.quantity ?? "1"}</TableCell>
                  <TableCell>
                    <Badge className={cn("text-[10px]", statusCls)}>
                      {isActive && <Clock className="h-2.5 w-2.5 mr-1" />}
                      {STATUS_LABEL[order.status] ?? order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 gap-1">
                      <RefreshCw className="h-2.5 w-2.5" />Auto
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{order.date}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onReorder(order)}>
                      <RefreshCw className="h-3 w-3" />Reorder
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ActiveOrderTracker({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const progress = PROGRESS_PCT[order.status] ?? 15;
  const label    = STATUS_LABEL[order.status] ?? order.status;

  return (
    <Card className="border-primary/30 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{order.items[0]?.name ?? "Medication"}</p>
              <p className="text-sm text-muted-foreground">Qty: {order.items[0]?.quantity} · Order #{order.id}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Ordered {order.date}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              <Clock className="h-3.5 w-3.5" />{label}
            </span>
            <p className="text-sm font-bold mt-1">₹{order.total.toLocaleString()}</p>
          </div>
        </div>
        <Progress value={progress} className="h-2 mb-3" />
        {order.delivery && (
          <>
            <div className="mb-3"><ColdChainBadge intact={order.delivery.coldChainIntact} /></div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <Truck className="h-3.5 w-3.5 inline mr-1" />
                {order.delivery.carrier} · {order.delivery.trackingId}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setExpanded(v => !v)}>{expanded ? "Less" : "Track"}</Button>
            </div>
          </>
        )}
        {expanded && order.trackingSteps && order.trackingSteps.length > 0 && (
          <div className="mt-4 pt-4 border-t space-y-1">
            {order.trackingSteps.map((step, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="flex flex-col items-center gap-1">
                  <div className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", step.completed ? "bg-primary" : "bg-muted-foreground/30")} />
                  {i < order.trackingSteps.length - 1 && <div className="w-px h-4 bg-border" />}
                </div>
                <div className="pb-2">
                  <p className={cn("text-xs font-medium", step.completed ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                  {step.timestamp && <p className="text-xs text-muted-foreground">{step.timestamp}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
        {order.pharmacy && (
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            <span className="font-medium">Pharmacy:</span> {order.pharmacy.name} · Lic: {order.pharmacy.license}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Shop tab ─────────────────────────────────────────────────────────────────

const OTC_CATEGORIES: CategoryKey[] = ["protein", "vitamins", "fibre_gut", "devices", "lab_test"];

function ShopTab({ catalog, onAdd, isInCart, onInfo }: {
  catalog: CatalogItem[];
  onAdd: (item: CatalogItem) => void;
  isInCart: (id: string) => boolean;
  onInfo: (item: CatalogItem) => void;
}) {
  const [filter, setFilter] = useState<"all" | CategoryKey>("all");

  const otcItems = useMemo(() => catalog.filter(c => OTC_CATEGORIES.includes(c.category)), [catalog]);
  const visible  = useMemo(() => filter === "all" ? otcItems : otcItems.filter(c => c.category === filter), [otcItems, filter]);

  const tabs: Array<{ id: "all" | CategoryKey; label: string; count: number }> = [
    { id: "all",       label: "All",         count: otcItems.length },
    ...OTC_CATEGORIES.map(c => ({ id: c as "all" | CategoryKey, label: CATEGORY_META[c].label, count: otcItems.filter(i => i.category === c).length })).filter(t => t.count > 0),
  ];

  return (
    <div className="space-y-5">
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-primary">Recommended for Week 8 of your programme</p>
          <p className="text-xs text-muted-foreground">Products below are curated for your current phase of GLP-1 therapy</p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            className={cn("px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
              filter === t.id ? "border-primary bg-primary text-white" : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground")}>
            {t.label} <span className="ml-0.5 opacity-60">({t.count})</span>
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map(item => (
          <ProductCard key={item.id} item={item} onAdd={onAdd} inCart={isInCart(item.id)} onInfoClick={onInfo} />
        ))}
      </div>
    </div>
  );
}

// ─── Prescriptions tab ────────────────────────────────────────────────────────

function PrescriptionsTab({ catalog, prescription, onAdd, isInCart, onInfo, onCartOpen }: {
  catalog: CatalogItem[];
  prescription: { itemId: string; prescriptionId: string } | undefined;
  onAdd: (item: CatalogItem) => void;
  isInCart: (id: string) => boolean;
  onInfo: (item: CatalogItem) => void;
  onCartOpen: () => void;
}) {
  const rxItems = useMemo(() => catalog.filter(c => c.category === "rx_medication"), [catalog]);
  const rxSet   = useMemo(() => {
    if (!prescription?.itemId) return new Set<string>();
    const drugNameLower = prescription.itemId.toLowerCase();
    return new Set(rxItems.filter(i => drugNameLower.includes(i.name.toLowerCase().split(" ")[0])).map(i => i.id));
  }, [prescription, rxItems]);

  return (
    <div className="space-y-5">
      <PrescriptionBanner onCartOpen={onCartOpen} />
      <div className="grid sm:grid-cols-2 gap-4">
        {rxItems.map(item => (
          <ProductCard key={item.id} item={item} onAdd={onAdd} inCart={isInCart(item.id)} locked={!rxSet.has(item.id)} onInfoClick={onInfo} />
        ))}
      </div>
      <div className="text-center py-4 border border-dashed rounded-xl">
        <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Need a prescription?{" "}
          <a href="/consult" className="text-primary font-medium hover:underline">Book a consultation →</a>
        </p>
      </div>
    </div>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function Orders() {
  const { user }                           = useUser();
  const patientId                          = user?.patientId ?? "patient_001";
  const { forPatient, forAdmin }           = useMockData();
  const patientView                        = forPatient(patientId);
  const { catalog }                        = forAdmin();
  const orders                             = patientView?.orders   ?? [];
  const refill                             = patientView?.refill;
  const prescription                       = patientView?.prescription;

  const { addToCart, isInCart, cartCount } = useApp();
  const [cartOpen, setCartOpen]            = useState(false);
  const [checkoutOpen, setCheckoutOpen]    = useState(false);
  const [rationaleItem, setRationaleItem]  = useState<CatalogItem | null>(null);

  const activeOrder   = orders.find(o => o.status !== "delivered" && o.status !== "cancelled");
  const historyOrders = orders;


  const handleAdd = useCallback((item: CatalogItem) => {
    const rxPrescId = prescription?.medications.some(m => m.drug.toLowerCase().includes(item.name.toLowerCase().split(" ")[0]))
      ? prescription.id
      : undefined;
    addToCart(item, rxPrescId);
  }, [addToCart, prescription]);

  const handleReorder = useCallback((order: Order) => {
    const firstName = order.items[0]?.name ?? "";
    const cat = catalog.find(c => firstName.toLowerCase().includes(c.name.toLowerCase().split(" ")[0]));
    if (cat) { addToCart(cat); setCartOpen(true); }
  }, [addToCart, catalog]);

  const openCheckout = useCallback(() => { setCartOpen(false); setTimeout(() => setCheckoutOpen(true), 200); }, []);
  const backToCart   = useCallback(() => { setCheckoutOpen(false); setTimeout(() => setCartOpen(true), 200); }, []);

  const rxPrescription = prescription
    ? { itemId: prescription.medications[0]?.drug ?? "", prescriptionId: prescription.id }
    : undefined;

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <PageHeader
          title="Orders & Shop"
          subtitle="Track prescriptions, shop clinically-curated supplements, and manage lab tests"
          actions={
            <Button size="sm" className="gap-2 relative" onClick={() => setCartOpen(true)}>
              <ShoppingCart className="h-4 w-4" />Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white text-[10px] flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          }
        />

        <Tabs defaultValue="orders">
          <TabsList className="mb-6">
            <TabsTrigger value="orders">
              My Orders
              {historyOrders.length > 0 && (
                <span className="ml-2 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                  {historyOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="shop">
              Supplements &amp; Devices
              <Badge variant="secondary" className="ml-2 text-[10px]">
                {catalog.filter(c => OTC_CATEGORIES.includes(c.category)).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rx">
              Prescriptions
              <Badge variant="secondary" className="ml-2 text-[10px]">Rx</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {refill && <RefillCard refill={refill} />}

            {activeOrder && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Active Order</h3>
                <ActiveOrderTracker order={activeOrder} />
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Order History</h3>
              <OrdersHistoryTable orders={historyOrders} catalog={catalog} onReorder={handleReorder} />
            </div>
          </TabsContent>

          <TabsContent value="shop">
            <ShopTab catalog={catalog} onAdd={handleAdd} isInCart={isInCart} onInfo={setRationaleItem} />
          </TabsContent>

          <TabsContent value="rx">
            <PrescriptionsTab
              catalog={catalog}
              prescription={rxPrescription}
              onAdd={handleAdd}
              isInCart={isInCart}
              onInfo={setRationaleItem}
              onCartOpen={() => setCartOpen(true)}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={openCheckout} />
      <CheckoutSheet open={checkoutOpen} onClose={() => setCheckoutOpen(false)} onBack={backToCart} />
      <RationaleDialog item={rationaleItem} open={rationaleItem !== null} onClose={() => setRationaleItem(null)} />
    </TooltipProvider>
  );
}
