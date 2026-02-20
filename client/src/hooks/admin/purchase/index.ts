import { useCallback, useEffect, useState } from "react";
import {TPurchasePayload} from "@/interface/common";
import useApi from "@/hooks/use-api";


// Get all purchases
export function usePurchases() {
  const [purchases, setPurchases] = useState<TPurchasePayload[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get<{ data: TPurchasePayload[] }>(
        "/v1/admin/purchase/all"
      );
      setPurchases(data?.data || []);
    } catch (error: any) {
      console.error("Error fetching purchases:", error);
      console.error("API response:", error?.response?.data);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return { purchases, loading, refetch: fetchPurchases };
}

// Get single purchase by ID
export function usePurchase(id: string | undefined) {
  const [purchase, setPurchase] = useState<TPurchasePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPurchase = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get<{ data: TPurchasePayload }>(
        `/v1/admin/purchase/${id}`
      );
      setPurchase(data?.data || null);
    } catch (error: any) {
      console.error("Error fetching purchase:", error);
      console.error("API response:", error?.response?.data);
      setPurchase(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPurchase();
    }
  }, [fetchPurchase, id]);

  return { purchase, loading, refetch: fetchPurchase };
}

// Create new purchase
export function useCreatePurchase() {
  const [error, setError] = useState<string[]>([]);

  const createPurchase = async (data: Partial<TPurchasePayload>) => {
    try {
      console.log("Creating purchase with data:", data);
      const { data: result } = await useApi.post<{ data: TPurchasePayload }>(
        "/v1/admin/purchase/create",
        data
      );
      console.log("Purchase created successfully:", result.data);
      return result.data;
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "An unexpected error occurred.";
      setError([errorMsg]);
      console.error("Error creating purchase:", errorMsg);
      console.error("Full error response:", error?.response?.data);
      throw error;
    }
  };

  return { createPurchase, error };
}

// Update purchase
export function useUpdatePurchase() {
  const [error, setError] = useState<string[]>([]);

  const updatePurchase = async (
    id: string | undefined,
    data: Partial<TPurchasePayload>
  ) => {
    try {
      const { data: result } = await useApi.put<{ data: TPurchasePayload }>(
        `/v1/admin/purchase/update/${id}`,
        data
      );
      return result.data;
    } catch (error: any) {
      setError([
        error?.response?.data?.message || "An unexpected error occurred.",
      ]);
      console.error("Error updating purchase:", error);
    }
  };

  return { updatePurchase, error };
}

// Delete purchase
export function useDeletePurchase() {
  const deletePurchase = async (id: string) => {
    try {
      const { data } = await useApi.delete<{ data: { success: boolean } }>(
        `/v1/admin/purchase/delete/${id}`
      );
      return data.data;
    } catch (error) {
      console.error("Error deleting purchase:", error);
    }
  };

  return { deletePurchase };
}
