import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { I18nProvider } from "./lib/i18n";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import ProductList from "@/pages/ProductList";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import About from "@/pages/About";

import VendorDashboard from "@/pages/VendorDashboard";
import AuthPage from "@/pages/AuthPage";
import Profile from "@/pages/Profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/products" component={ProductList} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/about" component={About} />
      <Route path="/factories" component={() => <div>Factories List Coming Soon</div>} />
      <Route path="/profile" component={Profile} />
      <Route path="/vendor/dashboard" component={VendorDashboard} />
      <Route path="/factory/inventory" component={VendorDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <I18nProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <div className="min-h-screen flex flex-col font-sans text-foreground bg-background">
                <Navigation />
                <main className="flex-grow">
                  <Router />
                </main>
                <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800">
                  <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                      <h3 className="text-white font-heading font-bold text-lg mb-4">Win-Store</h3>
                      <p className="text-sm">Direct from Source. Honest to your Wallet.</p>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-4">Shop</h4>
                      <ul className="space-y-2 text-sm">
                        <li>All Products</li>
                        <li>Factories</li>
                        <li>New Arrivals</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-4">Company</h4>
                      <ul className="space-y-2 text-sm">
                        <li>About Us</li>
                        <li>Transparency</li>
                        <li>Careers</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-4">Support</h4>
                      <ul className="space-y-2 text-sm">
                        <li>FAQ</li>
                        <li>Shipping</li>
                        <li>Returns</li>
                      </ul>
                    </div>
                  </div>
                  <div className="container mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-xs">
                    © 2024 Win-Store Inc. All rights reserved.
                  </div>
                </footer>
              </div>
            </TooltipProvider>
          </CartProvider>
        </I18nProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
