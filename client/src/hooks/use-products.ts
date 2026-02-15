import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ProductWithDetails } from "@shared/routes";

export function useProducts(filters?: { category?: string; search?: string; sort?: string }) {
  const queryKey = filters 
    ? [api.products.list.path, filters.category, filters.search, filters.sort]
    : [api.products.list.path];

  // Construct query string manually since fetch doesn't handle objects in GET body
  const queryParams = new URLSearchParams();
  if (filters?.category) queryParams.append("category", filters.category);
  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.sort) queryParams.append("sort", filters.sort);

  const url = `${api.products.list.path}?${queryParams.toString()}`;

  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      // The API returns ProductWithDetails[] which matches our typed response
      return await res.json() as ProductWithDetails[]; 
    },
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [api.products.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.products.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch product");
      return await res.json() as ProductWithDetails;
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: [api.categories.list.path],
    queryFn: async () => {
      const res = await fetch(api.categories.list.path);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return await res.json();
    },
  });
}

export function useFactories() {
  return useQuery({
    queryKey: [api.factories.list.path],
    queryFn: async () => {
      const res = await fetch(api.factories.list.path);
      if (!res.ok) throw new Error("Failed to fetch factories");
      return await res.json();
    },
  });
}

export function useFactory(id: number) {
  return useQuery({
    queryKey: [api.factories.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.factories.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch factory");
      return await res.json();
    },
    enabled: !!id,
  });
}
