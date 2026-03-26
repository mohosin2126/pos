
import { useCallback, useEffect, useState } from "react";
import {TProductPayload} from "@/interface/common";
import useApi from "@/hooks/use-api";
import {useDelete} from "@/hooks/common";


// Hooks
export function useProducts() {
  const [products, setProducts] = useState<TProductPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get("/v1/admin/product/all");
      setProducts(data?.data || []);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { products, loading, refetch: fetchStudents };
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<TProductPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get(`/v1/admin/product/${id}`);
      setProduct(data?.data || null);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, refetch: fetchProduct };
}

export function useCreateProduct() {
  const [error, setError] = useState<string[]>([]);

  const createProduct = async (data: TProductPayload) => {
    try {
      const { data: result } = await useApi.post(
        "/v1/admin/product/create",
        data
      );
      return result;
    } catch (error: any) {
      setError([
        error?.response?.data?.message || "An unexpected error occurred.",
      ]);
      console.error("Error creating product:", error?.response?.data?.message);
    }
  };

  return { createProduct, error };
}

export function useUpdateProduct() {
  const [error, setError] = useState<string[]>([]);

  const updateProduct = async (
    id: string | undefined,
    data: Partial<TProductPayload>
  ) => {
    try {
      const { data: result } = await useApi.put(
        `/v1/admin/product/update/${id}`,
        data
      );
      return result;
    } catch (error: any) {
      setError([
        error?.response?.data?.message || "An unexpected error occurred.",
      ]);
      console.error("Error updating product:", error);
    }
  };

  return { updateProduct, error };
}

// export function useDeleteProduct() {
//   const deleteProduct = async (id: string) => {
//     try {
//       const { data } = await useApi.delete(`/v1/admin/product/delete/${id}`);
//       return data;
//     } catch (error) {
//       console.error("Error deleting Product:", error);
//     }
//   };

//   return { deleteProduct };
// }

export function useDeleteProduct() {
  return useDelete("/v1/admin/product/delete");
}
