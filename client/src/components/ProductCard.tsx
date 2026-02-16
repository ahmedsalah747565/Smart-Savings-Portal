import * as React from "react";
import { ProductWithDetails } from "@shared/schema";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye, Calendar } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n";

interface ProductCardProps {
  product: ProductWithDetails;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { language, t } = useTranslation();

  const name = language === "ar" ? product.nameAr : product.nameEn;
  const description = language === "ar" ? product.descriptionAr : product.descriptionEn;

  const savings = Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Badge className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground font-bold shadow-md">
            -{savings}% OFF
          </Badge>
          {product.expiryDate && (
            <Badge variant="secondary" className="absolute top-3 right-3 z-10 bg-white/90 text-xs gap-1">
              <Calendar className="w-3 h-3" />
              Exp: {format(new Date(product.expiryDate), "MM/yy")}
            </Badge>
          )}
          <img
            src={product.imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Link href={`/product/${product.id}`}>
              <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white text-black font-medium">
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            </Link>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/30"
              onClick={() => addItem(product)}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.stock === 0 ? t("product.out_of_stock") : t("product.add_to_cart")}
            </Button>
          </div>
        </div>

        <CardContent className="p-4 flex-grow">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-heading font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
              {name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {description}
          </p>
          <div className="text-xs font-semibold flex items-center gap-1">
            <span className={product.stock > 0 ? "text-green-600" : "text-destructive"}>
              {t("product.stock")}: {product.stock}
            </span>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between items-end border-t border-border/40 mt-auto bg-muted/20">
          <div className="flex flex-col pt-3">
            <span className="text-xs text-muted-foreground line-through">Retail: ${Number(product.originalPrice).toFixed(2)}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-primary">$</span>
              <span className="text-xl font-bold text-foreground">{Number(product.price).toFixed(2)}</span>
            </div>
          </div>
          <div className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
            Direct Savings
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
