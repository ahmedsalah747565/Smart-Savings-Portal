import * as React from "react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useCreateOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Loader2, CreditCard, Banknote, ShieldCheck } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslation } from "@/lib/i18n";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user, isLoading: authLoading } = useAuth();
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = React.useState<"cash" | "visa">("cash");
  const { t, language } = useTranslation();

  if (authLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin w-8 h-8 mx-auto" /></div>;

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
        <p className="mb-6 text-muted-foreground">You need to be logged in to complete your purchase.</p>
        <Button asChild><Link href="/auth">Go to Login</Link></Button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createOrder.mutateAsync({
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        paymentMethod
      });
      clearCart();
      setLocation("/profile"); // Redirect to orders page
    } catch (err: any) {
      toast({
        title: "Checkout Error",
        description: err.message || "Failed to place order. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/10 py-12">
      <div className="container px-4 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-heading font-bold">Checkout</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white px-3 py-1 rounded-full border border-border shadow-sm">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>Secure 256-bit SSL encrypted checkout</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Where should we send your wins?</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue={user.firstName || ""} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue={user.lastName || ""} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="123 Main St" required />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" required />
                    </div>
                    <div className="col-span-1 space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" required />
                    </div>
                    <div className="col-span-1 space-y-2">
                      <Label htmlFor="zip">ZIP</Label>
                      <Input id="zip" required />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select how you'd like to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  defaultValue="cash"
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val as "cash" | "visa")}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                    <Label
                      htmlFor="cash"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <Banknote className="mb-3 h-6 w-6" />
                      <span className="font-semibold">Cash on Delivery</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="visa" id="visa" className="peer sr-only" />
                    <Label
                      htmlFor="visa"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <CreditCard className="mb-3 h-6 w-6" />
                      <span className="font-semibold">Visa / Mastercard</span>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "visa" && (
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label htmlFor="cardNo">Card Number</Label>
                      <Input id="cardNo" placeholder="0000 0000 0000 0000" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border flex gap-3 items-start">
                  <div className="mt-1">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your payment information is processed securely. We do not store credit card details nor have access to your credit card information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-24 border-border/50 shadow-lg overflow-hidden">
              <div className="bg-primary px-6 py-4 text-white">
                <CardTitle className="text-white">Order Summary</CardTitle>
              </div>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="truncate w-2/3 text-muted-foreground">{language === "ar" ? item.product.nameAr : item.product.nameEn} x {item.quantity}</span>
                      <span className="font-medium">{t("common.currency")} {(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{t("common.currency")} {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-xl py-2">
                    <span>Total</span>
                    <span>{t("common.currency")} {total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  form="checkout-form"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : paymentMethod === "cash" ? `Place Order (${t("common.currency")} ${total.toFixed(2)})` : "Pay & Place Order"}
                </Button>

                <p className="text-[10px] text-center text-muted-foreground">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
