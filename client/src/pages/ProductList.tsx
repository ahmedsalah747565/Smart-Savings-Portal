import { useState } from "react";
import { useProducts, useCategories } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductList() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [sort, setSort] = useState<string>("newest");

  const { data: products, isLoading } = useProducts({ search, category, sort });
  const { data: categories } = useCategories();

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-16 z-30">
        <div className="container px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Shop All</h1>
              <p className="text-muted-foreground">Factory direct prices on premium goods.</p>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-sm text-muted-foreground font-medium">
                 {products?.length || 0} Products
               </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-9 bg-muted/20 border-border focus:border-primary focus:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[250px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-muted inline-flex p-4 rounded-full mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            <Button 
              variant="ghost" 
              onClick={() => { setSearch(""); setCategory(""); }}
              className="mt-4 text-primary hover:text-primary/80 underline"
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
