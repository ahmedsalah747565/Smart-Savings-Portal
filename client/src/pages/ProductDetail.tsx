import * as React from "react";
import { useParams } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Check, Truck, ShieldCheck, ArrowLeft, Calendar } from "lucide-react";
import { PriceTransparencyWidget } from "@/components/PriceTransparencyWidget";
import { Link } from "wouter";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n";

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(Number(id));
  const { addItem } = useCart();
  const { language, t } = useTranslation();

  if (isLoading) {
    return (
      <div className="container px-4 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="h-[500px] w-full rounded-xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div>Product not found</div>;

  const name = language === "ar" ? product.nameAr : product.nameEn;
  const description = language === "ar" ? product.descriptionAr : product.descriptionEn;
  const factoryName = language === "ar" ? product.factory?.nameAr : product.factory?.nameEn;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Breadcrumb / Back */}
      <div className="border-b border-border">
        <div className="container px-4 py-4 max-w-7xl mx-auto">
          <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("nav.shop")}
          </Link>
        </div>
      </div>

      <div className="container px-4 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted border border-border">
              <img
                src={product.imageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              {product.factory && (
                <Link href={`/factories/${product.factory.id}`} className="text-sm font-semibold text-primary uppercase tracking-wider hover:underline">
                  Made by {factoryName}
                </Link>
              )}
              {product.expiryDate && (
                <Badge variant="outline" className="text-muted-foreground gap-1 border-muted">
                  <Calendar className="w-3 h-3" />
                  Expires: {format(new Date(product.expiryDate), "PPP")}
                </Badge>
              )}
            </div>

            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">{name}</h1>

            <div className="flex items-end gap-4 mb-6">
              <div>
                <span className="text-3xl font-bold text-foreground">${Number(product.price).toFixed(2)}</span>
              </div>
              <div className="flex flex-col pb-1">
                <span className="text-sm text-muted-foreground line-through">Retail: ${Number(product.originalPrice).toFixed(2)}</span>
                <span className="text-sm font-bold text-green-600">Save ${Number(Number(product.originalPrice) - Number(product.price)).toFixed(2)}</span>
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {description}
            </p>

            <div className="mb-4">
              <span className={product.stock > 0 ? "text-green-600 font-semibold" : "text-destructive font-semibold"}>
                {t("product.stock")}: {product.stock}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                size="lg"
                className="flex-1 h-14 text-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
                onClick={() => addItem(product)}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.stock === 0 ? t("product.out_of_stock") : t("product.add_to_cart")}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="w-5 h-5 text-foreground" />
                <span>Free shipping over $100</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-foreground" />
                <span>30-day money back guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-5 h-5 text-foreground" />
                <span>Ethically sourced</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-5 h-5 text-foreground" />
                <span>Quality verified</span>
              </div>
            </div>

            {/* Price Transparency Widget */}
            <div className="mt-auto">
              <PriceTransparencyWidget
                originalPrice={Number(product.originalPrice)}
                ourPrice={Number(product.price)}
                productName={name}
              />
            </div>
          </div>
        </div>

        {/* Details Tabs */}
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start border-b border-border bg-transparent h-auto p-0 rounded-none space-x-8">
              <TabsTrigger
                value="details"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 py-4 font-heading font-semibold text-lg"
              >
                Product Details
              </TabsTrigger>
              {product.factory && (
                <TabsTrigger
                  value="factory"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 py-4 font-heading font-semibold text-lg"
                >
                  Factory Story
                </TabsTrigger>
              )}
              <TabsTrigger
                value="reviews"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 py-4 font-heading font-semibold text-lg"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="py-8 space-y-4">
              <h3 className="text-xl font-bold mb-4">Specifications</h3>
              <div className="prose prose-slate max-w-none text-muted-foreground">
                <p>{description}</p>
              </div>
            </TabsContent>

            {product.factory && (
              <TabsContent value="factory" className="py-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-1/3 aspect-video rounded-xl overflow-hidden bg-muted">
                    <img src={product.factory.imageUrl} alt={factoryName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{factoryName}</h3>
                    <p className="text-muted-foreground mb-4">Location: {language === "ar" ? product.factory.locationAr : product.factory.locationEn}</p>
                    <p className="leading-relaxed text-foreground/80 mb-6">{language === "ar" ? product.factory.originStoryAr : product.factory.originStoryEn}</p>
                    <Link href={`/factories/${product.factory.id}`}>
                      <Button variant="outline">View Full Factory Profile</Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>
            )}

            <TabsContent value="reviews" className="py-8">
              <div className="text-center py-12 bg-muted/20 rounded-xl">
                <p className="text-muted-foreground">Reviews coming soon for this product.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
