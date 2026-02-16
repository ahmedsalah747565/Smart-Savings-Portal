import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, User, Package, Settings, LogOut, ExternalLink } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    profileImageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export default function Profile() {
    const { user, updateProfile, isUpdating, logout } = useAuth();
    const { data: orders, isLoading: ordersLoading } = useOrders();
    const { t, language } = useTranslation();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            profileImageUrl: user?.profileImageUrl || "",
        },
    });

    async function onSubmit(values: z.infer<typeof profileSchema>) {
        try {
            await updateProfile(values);
            toast({ title: "Profile updated", description: "Your changes have been saved." });
        } catch (error: any) {
            toast({
                title: "Update failed",
                description: error.message,
                variant: "destructive",
            });
        }
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-muted/10 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 space-y-4">
                        <Card className="border-border/50 shadow-sm overflow-hidden">
                            <div className="h-24 bg-primary/10 flex items-center justify-center">
                                {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt={user.firstName || ""} className="w-20 h-20 rounded-full border-4 border-white object-cover translate-y-8 shadow-md" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full border-4 border-white bg-primary/20 flex items-center justify-center translate-y-8 shadow-md">
                                        <User className="w-10 h-10 text-primary" />
                                    </div>
                                )}
                            </div>
                            <CardContent className="pt-12 pb-6 text-center">
                                <h2 className="font-heading font-bold text-xl">{user.firstName} {user.lastName}</h2>
                                <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
                                <Badge variant="secondary" className="uppercase text-[10px] tracking-widest">{user.role}</Badge>

                                <div className="mt-6 pt-6 border-t border-border flex flex-col gap-2">
                                    <Button variant="ghost" size="sm" className="justify-start gap-2" onClick={() => logout()}>
                                        <LogOut className="w-4 h-4 text-destructive" />
                                        <span className="text-destructive">Sign Out</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow">
                        <Tabs defaultValue="orders" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white border border-border/50">
                                <TabsTrigger value="orders" className="gap-2">
                                    <Package className="w-4 h-4" /> My Orders
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="gap-2">
                                    <Settings className="w-4 h-4" /> Profile Settings
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="orders">
                                <Card className="border-border/50 shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Order History</CardTitle>
                                        <CardDescription>View and track your previous purchases</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {ordersLoading ? (
                                            <div className="py-10 text-center"><Loader2 className="animate-spin w-8 h-8 mx-auto text-primary/50" /></div>
                                        ) : orders && orders.length > 0 ? (
                                            <div className="space-y-6">
                                                {orders.map((order: any) => (
                                                    <div key={order.id} className="border border-border/50 rounded-lg overflow-hidden bg-white">
                                                        <div className="bg-muted/30 p-4 border-b border-border/50 flex justify-between items-center flex-wrap gap-4">
                                                            <div className="flex gap-8">
                                                                <div>
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Order Placed</p>
                                                                    <p className="text-sm font-medium">{format(new Date(order.createdAt), "MMM d, yyyy")}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Total</p>
                                                                    <p className="text-sm font-bold text-primary">${Number(order.total).toFixed(2)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Payment</p>
                                                                    <Badge variant="outline" className="text-[10px] h-5">{order.paymentMethod || "Cash"}</Badge>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Order #</p>
                                                                <p className="text-sm font-mono text-muted-foreground">WS-{order.id.toString().padStart(5, '0')}</p>
                                                            </div>
                                                        </div>
                                                        <div className="p-4 space-y-4">
                                                            {order.items.map((item: any) => (
                                                                <div key={item.id} className="flex gap-4 items-center">
                                                                    <img src={item.product.imageUrl} alt={item.product.nameEn} className="w-16 h-16 rounded object-cover border border-border" />
                                                                    <div className="flex-grow">
                                                                        <h4 className="font-bold text-sm">{language === "ar" ? item.product.nameAr : item.product.nameEn}</h4>
                                                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-bold text-sm">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="p-4 bg-muted/10 border-t border-border/50 flex justify-between items-center">
                                                            <Badge className={order.status === 'delivered' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-blue-100 text-blue-700 hover:bg-blue-100"}>
                                                                {order.status.toUpperCase()}
                                                            </Badge>
                                                            <Button variant="outline" size="sm" className="gap-2">
                                                                <ExternalLink className="w-3 h-3" /> View Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
                                                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                                <h3 className="text-lg font-bold mb-1">No orders yet</h3>
                                                <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
                                                <Button asChild><a href="/products">Browse Products</a></Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="settings">
                                <Card className="border-border/50 shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Profile Settings</CardTitle>
                                        <CardDescription>Update your personal information and profile picture</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="firstName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>First Name</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="John" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="lastName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Last Name</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Doe" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <FormField
                                                    control={form.control}
                                                    name="profileImageUrl"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Profile Picture URL</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="https://example.com/avatar.jpg" {...field} />
                                                            </FormControl>
                                                            <CardDescription className="text-xs pt-1">
                                                                Paste a URL to an image to update your profile photo.
                                                            </CardDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="pt-4 flex justify-end">
                                                    <Button type="submit" disabled={isUpdating} className="w-full md:w-auto px-8 h-12">
                                                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Save Changes
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
