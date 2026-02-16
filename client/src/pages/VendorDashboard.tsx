import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Loader2, Package } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useToast } from "@/hooks/use-toast";

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

export default function VendorDashboard() {
    const { user } = useAuth();
    const { t, language } = useTranslation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
        queryKey: ["/api/vendor/products"],
    });

    const { data: categories } = useQuery<Category[]>({
        queryKey: ["/api/categories"],
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
            queryClient.invalidateQueries({ queryKey: ["/api/vendor/products"] });
            setIsDialogOpen(false);
            setEditingProduct(null);
            toast({ title: t("vendor.save_success") || "Product saved successfully" });
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

    if (productsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-heading">{t("nav.vendor_dashboard")}</h1>
                    <p className="text-muted-foreground">{user?.firstName} {user?.lastName}</p>
                </div>
                <Button onClick={openAddDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("vendor.add_product")}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products?.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                        <div className="aspect-video relative overflow-hidden bg-muted">
                            <img
                                src={product.imageUrl}
                                className="object-cover w-full h-full"
                                alt={language === "ar" ? product.nameAr : product.nameEn}
                            />
                        </div>
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">
                                {language === "ar" ? product.nameAr : product.nameEn}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-primary font-bold">{t("common.currency")} {Number(product.price).toFixed(2)}</div>
                                <div className="text-sm flex items-center gap-1">
                                    <Package className="h-4 w-4" />
                                    {product.stock}
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => openEditDialog(product)}>
                                <Edit className="h-4 w-4" />
                                {t("vendor.edit_product")}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

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
