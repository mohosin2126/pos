import { useCallback, useEffect, useState } from "react";
import { TPurchaseReturn } from "@/interface/common";
import useApi from "@/hooks/use-api";

// Get all purchase returns
export function usePurchaseReturns() {
  const [returns, setReturns] = useState<TPurchaseReturn[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get<{ data: TPurchaseReturn[] }>(
        "/v1/admin/purchase-return/all"
      );
      setReturns(data?.data || []);
    } catch (error: any) {
      console.error("Error fetching returns:", error);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  return { returns, loading, refetch: fetchReturns };
}

// Get single return by ID
export function usePurchaseReturn(id: string | undefined) {
  const [purchaseReturn, setPurchaseReturn] = useState<TPurchaseReturn | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchReturn = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get<{ data: TPurchaseReturn }>(
        `/v1/admin/purchase-return/${id}`
      );
      setPurchaseReturn(data?.data || null);
    } catch (error: any) {
      console.error("Error fetching return:", error);
      setPurchaseReturn(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchReturn();
    }
  }, [fetchReturn, id]);

  return { purchaseReturn, loading, refetch: fetchReturn };
}

// Update return
export function useUpdateReturn() {
  const [error, setError] = useState<string>("");

  const updateReturn = async (
    id: string | undefined,
    data: Partial<TPurchaseReturn>
  ): Promise<TPurchaseReturn | null> => {
    try {
      const { data: result } = await useApi.put<{ data: TPurchaseReturn }>(
        `/v1/admin/purchase-return/${id}`,
        data
      );
      return result.data;
    } catch (error: any) {
      setError(error?.response?.data?.message || "An error occurred");
      console.error("Error updating return:", error);
      return null;
    }
  };

  return { updateReturn, error };
}

// Delete return
export function useDeleteReturn() {
  const deleteReturn = async (id: string) => {
    try {
      const { data } = await useApi.delete<{ data: { success: boolean } }>(
        `/v1/admin/purchase-return/${id}`
      );
      return data.data;
    } catch (error) {
      console.error("Error deleting return:", error);
      return null;
    }
  };

  return { deleteReturn };
}

// Approve return
export function useApproveReturn() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const approveReturn = async (
    id: string,
    data: { refundAmount?: number; restockingDisposition?: string }
  ): Promise<TPurchaseReturn | null> => {
    setLoading(true);
    setError("");
    try {
      const { data: result } = await useApi.post<{ data: TPurchaseReturn }>(
        `/v1/admin/purchase-return/${id}/approve`,
        data
      );
      return result?.data || null;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Error approving return";
      setError(errorMsg);
      console.error("Error approving return:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { approveReturn, loading, error };
}

// Process refund
export function useProcessRefund() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const processRefund = async (id: string): Promise<TPurchaseReturn | null> => {
    setLoading(true);
    setError("");
    try {
      const { data } = await useApi.post<{ data: TPurchaseReturn }>(
        `/v1/admin/purchase-return/${id}/process-refund`,
        {}
      );
      return data?.data || null;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Error processing refund";
      setError(errorMsg);
      console.error("Error processing refund:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { processRefund, loading, error };
}

// Reject return
export function useRejectReturn() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const rejectReturn = async (id: string, notes?: string): Promise<TPurchaseReturn | null> => {
    setLoading(true);
    setError("");
    try {
      const { data } = await useApi.post<{ data: TPurchaseReturn }>(
        `/v1/admin/purchase-return/${id}/reject`,
        { notes }
      );
      return data?.data || null;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Error rejecting return";
      setError(errorMsg);
      console.error("Error rejecting return:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { rejectReturn, loading, error };
}
