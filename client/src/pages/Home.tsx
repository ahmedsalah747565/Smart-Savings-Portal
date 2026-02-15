import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, BadgeDollarSign, Star, TrendingUp } from "lucide-react";
import { useProducts, useFactories } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

// Simple "Savings Counter" mock animation
const SavingsCounter = () => {
  return (
    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white text-sm font-medium animate-pulse">
      <TrendingUp className="w-4 h-4 text-accent" />
      <span>Community Savings: <span className="text-accent font-bold">$1,240,592</span></span>
    </div>
  );
};

export default function Home() {
  const { data: featuredProducts, isLoading: loadingProducts } = useProducts({ sort: 'newest' });
  const { data: factories, isLoading: loadingFactories } = useFactories();

  // Take only first 4 for featured
  const displayProducts = featuredProducts?.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          {/* Unsplash image: Manufacturing/Quality/Industrial but aesthetic */}
          {/* warehouse aesthetic dark */}
          <img 
            src="https://pixabay.com/get/gd34f79bec1b83d4c6fe9d3e848a54735781e4797e0c1f667fbc3271d58a8ebbd9c0be9b8a29e5e8f678454b5c3056c5158e8440684055e7d14e18929dc24d800_1280.jpg" 
            alt="Factory Floor" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-900/80 to-slate-900/40" />
        </div>

        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <SavingsCounter />
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white tracking-tight leading-tight">
              Direct from the Source.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">
                Honest to your Wallet.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              We've eliminated the middlemen to bring you premium quality goods directly from the world's best factories at unbeatable prices.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/products">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/25 hover:scale-105 transition-all">
                  Start Saving Now
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm">
                  How it Works
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: BadgeDollarSign,
                title: "Unbeatable Savings",
                desc: "By removing retailers and distributors, we pass 100% of the savings directly to you."
              },
              {
                icon: ShieldCheck,
                title: "Verified Quality",
                desc: "Every product comes from the same factories producing for top luxury brands."
              },
              {
                icon: Truck,
                title: "Transparent Origin",
                desc: "Know exactly where your product was made, who made it, and what it cost to produce."
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-white border border-border/50 shadow-sm hover:shadow-md transition-all"
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-heading">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-2">Trending Now</h2>
              <p className="text-muted-foreground">Top factory-direct picks this week.</p>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FACTORY SPOTLIGHT */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        
        <div className="container px-4 relative z-10">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2 space-y-6">
              <div className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-widest rounded-sm">
                Factory Spotlight
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold leading-tight">
                Meet the Makers Behind the Brands
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                We partner with the world's elite manufacturers. The same hands that craft $500 designer bags are making ours—but you pay for the quality, not the logo.
              </p>
              <div className="pt-4">
                <Link href="/factories">
                  <Button className="bg-white text-slate-900 hover:bg-gray-100 font-semibold h-12 px-8 rounded-full">
                    Explore Our Factories
                  </Button>
                </Link>
              </div>
            </div>

            <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
              {/* Unsplash images: craftsman, workshop */}
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop" 
                alt="Craftsman" 
                className="rounded-2xl shadow-2xl transform translate-y-8 object-cover h-64 w-full"
              />
              <img 
                src="https://images.unsplash.com/photo-1605218427368-35b81a3dd64c?w=800&auto=format&fit=crop" 
                alt="Leather Workshop" 
                className="rounded-2xl shadow-2xl transform -translate-y-8 object-cover h-64 w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-background">
        <div className="container px-4 text-center">
          <h2 className="text-3xl font-heading font-bold mb-12">Join the Retail Rebellion</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "I was skeptical about the price difference, but the quality is actually BETTER than my designer gear.",
                author: "Sarah J.",
                role: "Verified Buyer"
              },
              {
                text: "Finally, a brand that's honest about where my money goes. The transparency breakdown is genius.",
                author: "Michael T.",
                role: "Smart Shopper"
              },
              {
                text: "Fast shipping, incredible packaging, and a product that feels like pure luxury. I'm never going back.",
                author: "Elena R.",
                role: "Verified Buyer"
              }
            ].map((review, idx) => (
              <Card key={idx} className="border-none shadow-lg bg-white p-6">
                <div className="flex justify-center mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-6">"{review.text}"</p>
                <Separator className="mb-4" />
                <div className="font-bold">{review.author}</div>
                <div className="text-xs text-primary uppercase font-bold tracking-wider">{review.role}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
