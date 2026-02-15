import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useCreateOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user, isLoading: authLoading } = useAuth();
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  if (authLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin w-8 h-8 mx-auto" /></div>;

  if (!user) {
    // Redirect logic handled in component but for simplicity showing message
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
         <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
         <p className="mb-6 text-muted-foreground">You need to be logged in to complete your purchase.</p>
         <Button asChild><a href="/api/login">Log In with Replit</a></Button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate processing
    try {
      await createOrder.mutateAsync({
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      });
      clearCart();
      setLocation("/profile"); // Redirect to orders page
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <div className="min-h-screen bg-muted/10 py-12">
      <div className="container px-4 max-w-5xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/30 rounded border border-border text-center">
                  <p className="text-sm text-muted-foreground">This is a mock checkout. No payment will be processed.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
             <Card className="sticky top-24">
               <CardHeader>
                 <CardTitle>Order Summary</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-2">
                   {items.map(item => (
                     <div key={item.product.id} className="flex justify-between text-sm">
                       <span className="truncate w-2/3">{item.product.name} x {item.quantity}</span>
                       <span>${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                     </div>
                   ))}
                 </div>
                 <Separator />
                 <div className="flex justify-between font-bold text-lg">
                   <span>Total</span>
                   <span>${total.toFixed(2)}</span>
                 </div>
                 <Button 
                   type="submit" 
                   form="checkout-form" 
                   className="w-full bg-primary hover:bg-primary/90 text-white mt-4"
                   disabled={createOrder.isPending}
                 >
                   {createOrder.isPending ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                     </>
                   ) : "Place Order"}
                 </Button>
               </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
