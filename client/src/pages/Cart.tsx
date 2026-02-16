import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Cart() {
  const { items, removeItem, updateQuantity, total, savings, itemCount } = useCart();
  const { t, language } = useTranslation();

  if (itemCount === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Trash2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold font-heading mb-2">{t("cart.empty")}</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't found your wins yet.</p>
        <Link href="/products">
          <Button size="lg" className="bg-primary text-white">{t("nav.shop")}</Button>
        </Link>
      </div>
    );
  }

  const isMoqMet = itemCount >= 30;

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container px-4 py-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-8">{t("nav.cart")} ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h1>

        {!isMoqMet && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Minimum Order Quantity</AlertTitle>
            <AlertDescription>
              {t("cart.moq_error")} (Current: {itemCount}/30)
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="flex-grow space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-border flex gap-4">
                <div className="h-24 w-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                  <img src={product.imageUrl} alt={language === "ar" ? product.nameAr : product.nameEn} className="h-full w-full object-cover" />
                </div>

                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{language === "ar" ? product.nameAr : product.nameEn}</h3>
                      <p className="text-sm text-muted-foreground">{language === "ar" ? product.category.nameAr : product.category.nameEn}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{t("common.currency")} {(Number(product.price) * quantity).toFixed(2)}</div>
                      <div className="text-xs text-green-600 font-medium">
                        Saved {t("common.currency")} {(Number(Number(product.originalPrice) - Number(product.price)) * quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center border border-border rounded-md">
                      <button
                        className="px-3 py-1 hover:bg-muted transition-colors"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                      <button
                        className="px-3 py-1 hover:bg-muted transition-colors"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-sm text-muted-foreground hover:text-destructive flex items-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="w-full lg:w-[350px] flex-shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-border sticky top-24">
              <h2 className="text-xl font-bold font-heading mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{t("common.currency")} {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between items-center text-sm bg-green-50 p-2 rounded text-green-700">
                  <span>Total Savings</span>
                  <span className="font-bold">-{t("common.currency")} {savings.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{t("common.currency")} {total.toFixed(2)}</span>
                </div>
              </div>

              <Link href={isMoqMet ? "/checkout" : "#"}>
                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-md"
                  disabled={!isMoqMet}
                >
                  {t("cart.checkout")} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>

              {!isMoqMet && (
                <p className="text-[10px] text-destructive font-medium mt-2 text-center">
                  * Needs at least 30 items
                </p>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-3 h-3" />
                Secure Checkout powered by Stripe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
