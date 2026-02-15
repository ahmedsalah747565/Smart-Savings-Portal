import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateOrderRequest, type OrderWithItems } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      const res = await fetch(api.orders.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to create order");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast({
        title: "Order Placed!",
        description: "Your factory-direct order has been received.",
      });
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: error.message === "Unauthorized" 
          ? "Please log in to place an order." 
          : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });
}

export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch orders");
      return await res.json() as OrderWithItems[];
    },
  });
}
