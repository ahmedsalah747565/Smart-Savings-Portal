import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, OrderWithItems, Product, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Shield, Users, ShoppingBag, Box, ExternalLink, Check, Plus, Edit, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const productSchema = z.object({
    nameEn: z.string().min(3),
    nameAr: z.string().min(3),
    descriptionEn: z.string().min(10),
    descriptionAr: z.string().min(10),
    price: z.string().transform((val) => val.toString()),
    originalPrice: z.string().transform((val) => val.toString()),
    stock: z.number().min(0),
    categoryId: z.number(),
    imageUrl: z.string().url(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AdminDashboard() {
    const { user } = useAuth();
    const { t, language } = useTranslation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Queries
    const { data: adminUsers, isLoading: usersLoading } = useQuery<User[]>({
        queryKey: ["/api/admin/users"],
    });

    const { data: adminOrders, isLoading: ordersLoading } = useQuery<OrderWithItems[]>({
        queryKey: ["/api/admin/orders"],
    });

    const { data: allProducts, isLoading: productsLoading } = useQuery<Product[]>({
        queryKey: ["/api/products"],
    });

    const { data: categories } = useQuery<Category[]>({
        queryKey: ["/api/categories"],
    });

    // Mutations
    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete user");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "User deleted successfully" });
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: async (productId: number) => {
            const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete product");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Product deleted successfully" });
        },
    });

    const updateOrderStatusMutation = useMutation({
        mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
            const url = `/api/admin/orders/${orderId}/status`;
            const res = await fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) {
                const status = res.status;
                const statusText = res.statusText;
                let errorDetails = "";
                try {
                    const errorData = await res.clone().json();
                    errorDetails = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    errorDetails = await res.text().catch(() => "No response body");
                }
                throw new Error(`[${status} ${statusText}] ${errorDetails.substring(0, 100)}`);
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
            toast({ title: "Order status updated successfully" });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to update order status",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const productMutation = useMutation({
        mutationFn: async (data: ProductFormData) => {
            const url = editingProduct
                ? `/api/vendor/products/${editingProduct.id}`
                : "/api/vendor/products";
            const method = editingProduct ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to save product");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            setIsDialogOpen(false);
            setEditingProduct(null);
            toast({ title: "Product saved successfully" });
        },
        onError: (error: Error) => {
            toast({ title: error.message, variant: "destructive" });
        }
    });

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
    });

    const onSubmit = (data: ProductFormData) => {
        productMutation.mutate(data);
    };

    const openAddDialog = () => {
        setEditingProduct(null);
        reset({
            nameEn: "",
            nameAr: "",
            descriptionEn: "",
            descriptionAr: "",
            price: "",
            originalPrice: "",
            stock: 0,
            categoryId: categories?.[0]?.id || 0,
            imageUrl: "",
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (product: Product) => {
        setEditingProduct(product);
        reset({
            nameEn: product.nameEn,
            nameAr: product.nameAr,
            descriptionEn: product.descriptionEn,
            descriptionAr: product.descriptionAr,
            price: product.price.toString(),
            originalPrice: product.originalPrice.toString(),
            stock: product.stock,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl,
        });
        setIsDialogOpen(true);
    };

    if (user?.role !== "admin") {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Access Denied
                        </CardTitle>
                        <CardDescription>
                            You do not have administrative privileges to access this area.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/">Return Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-heading flex items-center gap-3">
                        <Shield className="h-10 w-10 text-primary" />
                        Admin Command Center
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor and manage all system activity from one premium dashboard.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/vendor-dashboard">Go to Vendor View</Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Users</p>
                                <h3 className="text-3xl font-bold mt-1">{adminUsers?.length || 0}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-chart-2/5 border-chart-2/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Orders</p>
                                <h3 className="text-3xl font-bold mt-1">{adminOrders?.length || 0}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-chart-2/10 flex items-center justify-center">
                                <ShoppingBag className="h-6 w-6 text-chart-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-chart-1/5 border-chart-1/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Products</p>
                                <h3 className="text-3xl font-bold mt-1">{allProducts?.length || 0}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-chart-1/10 flex items-center justify-center">
                                <Box className="h-6 w-6 text-chart-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="users" className="space-y-6">
                <TabsList className="grid grid-cols-3 w-full max-w-lg mb-8">
                    <TabsTrigger value="users" className="gap-2">
                        <Users className="h-4 w-4" /> Users
                    </TabsTrigger>
                    <TabsTrigger value="products" className="gap-2">
                        <Box className="h-4 w-4" /> Products
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="gap-2">
                        <ShoppingBag className="h-4 w-4" /> Orders
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>Control user access and roles system-wide.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {usersLoading ? (
                                <Loader2 className="h-8 w-8 animate-spin mx-auto m-8" />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {adminUsers?.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell className="font-medium">
                                                    {u.firstName} {u.lastName}
                                                </TableCell>
                                                <TableCell>{u.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={u.role === "admin" ? "destructive" : u.role === "vendor" ? "default" : "secondary"}>
                                                        {u.role.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{new Date(u.createdAt!).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    {u.id !== user.id && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:bg-destructive/10"
                                                            onClick={() => deleteUserMutation.mutate(u.id)}
                                                            disabled={deleteUserMutation.isPending}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="products">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Product Oversight</CardTitle>
                                <CardDescription>Monitor and moderate all listed items.</CardDescription>
                            </div>
                            <Button onClick={openAddDialog} size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                {t("vendor.add_product")}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {productsLoading ? (
                                <Loader2 className="h-8 w-8 animate-spin mx-auto m-8" />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Preview</TableHead>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allProducts?.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell>
                                                    <img src={p.imageUrl} alt="" className="h-10 w-10 object-cover rounded border" />
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {language === "ar" ? p.nameAr : p.nameEn}
                                                </TableCell>
                                                <TableCell>{t("common.currency")} {Number(p.price).toFixed(2)}</TableCell>
                                                <TableCell>{p.stock}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(p)}>
                                                            <Edit className="h-4 w-4 text-primary" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/product/${p.id}`}>
                                                                <ExternalLink className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:bg-destructive/10"
                                                            onClick={() => deleteProductMutation.mutate(p.id)}
                                                            disabled={deleteProductMutation.isPending}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Order Monitoring</CardTitle>
                            <CardDescription>Real-time view of all transaction data.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {ordersLoading ? (
                                <Loader2 className="h-8 w-8 animate-spin mx-auto m-8" />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Items</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {adminOrders?.map((o) => (
                                            <TableRow key={o.id}>
                                                <TableCell className="font-mono">ORD-{o.id.toString().padStart(5, '0')}</TableCell>
                                                <TableCell>
                                                    {(o as any).user?.firstName} {(o as any).user?.lastName}
                                                    <div className="text-xs text-muted-foreground">{(o as any).user?.email}</div>
                                                </TableCell>
                                                <TableCell className="font-bold">{t("common.currency")} {Number(o.total).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={o.status === "approved" || o.status === "completed" ? "default" : "secondary"}>
                                                        {o.status.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{new Date(o.createdAt!).toLocaleDateString()}</TableCell>
                                                <TableCell>{o.items.length} items</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={cn(
                                                            "h-8 gap-2 transition-all",
                                                            o.status === "pending"
                                                                ? "border-primary/50 text-primary hover:bg-primary/10"
                                                                : "border-green-200 text-green-600 bg-green-50"
                                                        )}
                                                        onClick={() => {
                                                            const orderId = Number(o.id);
                                                            updateOrderStatusMutation.mutate({ orderId, status: "approved" });
                                                        }}
                                                        disabled={o.status !== "pending" || updateOrderStatusMutation.isPending}
                                                    >
                                                        {updateOrderStatusMutation.isPending ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Check className={cn("h-3 w-3", o.status === "approved" && "text-green-600")} />
                                                        )}
                                                        {o.status === "pending" ? "Approve" : "Approved"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProduct ? t("vendor.edit_product") : t("vendor.add_product")}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nameEn">{t("vendor.title_en")}</Label>
                                <Input id="nameEn" {...register("nameEn")} />
                                {errors.nameEn && <p className="text-xs text-destructive">{errors.nameEn.message}</p>}
                            </div>
                            <div className="space-y-2" dir="rtl">
                                <Label htmlFor="nameAr">{t("vendor.title_ar")}</Label>
                                <Input id="nameAr" {...register("nameAr")} />
                                {errors.nameAr && <p className="text-xs text-destructive">{errors.nameAr.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="descriptionEn">{t("vendor.desc_en")}</Label>
                                <Textarea id="descriptionEn" {...register("descriptionEn")} />
                                {errors.descriptionEn && <p className="text-xs text-destructive">{errors.descriptionEn.message}</p>}
                            </div>
                            <div className="space-y-2" dir="rtl">
                                <Label htmlFor="descriptionAr">{t("vendor.desc_ar")}</Label>
                                <Textarea id="descriptionAr" {...register("descriptionAr")} />
                                {errors.descriptionAr && <p className="text-xs text-destructive">{errors.descriptionAr.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">{t("vendor.price")}</Label>
                                <Input id="price" {...register("price")} type="number" step="0.01" />
                                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="originalPrice">Original Price (Retail)</Label>
                                <Input id="originalPrice" {...register("originalPrice")} type="number" step="0.01" />
                                {errors.originalPrice && <p className="text-xs text-destructive">{errors.originalPrice.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">{t("vendor.stock")}</Label>
                                <Input id="stock" {...register("stock", { valueAsNumber: true })} type="number" />
                                {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoryId">{t("vendor.category")}</Label>
                            <Select
                                value={watch("categoryId")?.toString()}
                                onValueChange={(val) => setValue("categoryId", parseInt(val))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {language === "ar" ? cat.nameAr : cat.nameEn}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">{t("vendor.image_url")}</Label>
                            <Input id="imageUrl" {...register("imageUrl")} />
                            {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
                        </div>

                        <Button type="submit" className="w-full" disabled={productMutation.isPending}>
                            {productMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t("vendor.save")}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
