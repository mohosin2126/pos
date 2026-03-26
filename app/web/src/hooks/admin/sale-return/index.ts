import { useCallback, useEffect, useState } from "react";
import {
  TPagination,
  TSaleReturnCreatePayload,
  TSaleReturn,
  TSaleReturnsApiResponse,
} from "@/interface/common";
import useApi from "@/hooks/use-api";

const DEFAULT_PAGINATION: TPagination = {
  page: 1,
  limit: 20,
  total: 0,
  pages: 1,
  hasPrev: false,
  hasNext: false,
};

interface TUseSaleReturnsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "pending" | "approved" | "refunded" | "rejected";
}

export function useSaleReturns(params: TUseSaleReturnsParams = {}) {
  const [returns, setReturns] = useState<TSaleReturn[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TPagination>(DEFAULT_PAGINATION);
  const { page = 1, limit = 20, search, status } = params;

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get<TSaleReturnsApiResponse>("/v1/admin/sale-return/all", {
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
        },
      });
      setReturns(data?.data || []);
      setPagination(data?.pagination || DEFAULT_PAGINATION);
    } catch (error) {
      console.error("Error fetching sale returns:", error);
      setReturns([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, [limit, page, search, status]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  return { returns, loading, pagination, refetch: fetchReturns };
}

export function useCreateSaleReturn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const createSaleReturn = async (
    data: TSaleReturnCreatePayload
  ): Promise<TSaleReturn | null> => {
    setLoading(true);
    setError("");
    try {
      const { data: result } = await useApi.post<{ data: TSaleReturn }>(
        "/v1/admin/sale-return/create",
        data
      );
      return result?.data || null;
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Error creating sale return";
      setError(errorMsg);
      console.error("Error creating sale return:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createSaleReturn, loading, error };
}

export function useApproveSaleReturn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const approveSaleReturn = async (
    id: string,
    data: { refundAmount?: number; restockingDisposition?: string; notes?: string }
  ): Promise<TSaleReturn | null> => {
    setLoading(true);
    setError("");
    try {
      const { data: result } = await useApi.post<{ data: TSaleReturn }>(
        `/v1/admin/sale-return/${id}/approve`,
        data
      );
      return result?.data || null;
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Error approving sale return";
      setError(errorMsg);
      console.error("Error approving sale return:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { approveSaleReturn, loading, error };
}

export function useProcessSaleRefund() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const processSaleRefund = async (id: string): Promise<TSaleReturn | null> => {
    setLoading(true);
    setError("");
    try {
      const { data: result } = await useApi.post<{ data: TSaleReturn }>(
        `/v1/admin/sale-return/${id}/process-refund`,
        {}
      );
      return result?.data || null;
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Error processing sale refund";
      setError(errorMsg);
      console.error("Error processing sale refund:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { processSaleRefund, loading, error };
}

export function useRejectSaleReturn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const rejectSaleReturn = async (
    id: string,
    notes?: string
  ): Promise<TSaleReturn | null> => {
    setLoading(true);
    setError("");
    try {
      const { data: result } = await useApi.post<{ data: TSaleReturn }>(
        `/v1/admin/sale-return/${id}/reject`,
        { notes }
      );
      return result?.data || null;
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Error rejecting sale return";
      setError(errorMsg);
      console.error("Error rejecting sale return:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { rejectSaleReturn, loading, error };
}

export function useDeleteSaleReturn() {
  const deleteSaleReturn = async (id: string) => {
    try {
      const { data } = await useApi.delete(`/v1/admin/sale-return/${id}`);
      return data?.data || null;
    } catch (error) {
      console.error("Error deleting sale return:", error);
      return null;
    }
  };

  return { deleteSaleReturn };
}
