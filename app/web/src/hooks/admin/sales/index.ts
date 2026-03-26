import { useCallback, useEffect, useState } from "react";
import { TPagination, TSaleProps, TSalesApiResponse } from "@/interface/common";
import useApi from "@/hooks/use-api";
import { message } from "antd";

const DEFAULT_PAGINATION: TPagination = {
  page: 1,
  limit: 20,
  total: 0,
  pages: 1,
  hasPrev: false,
  hasNext: false,
};

interface TUseSalesParams {
  page?: number;
  limit?: number;
  search?: string;
  invoiceStatus?: "issued" | "paid" | "void";
}

export function useSales(params: TUseSalesParams = {}) {
  const [sales, setSales] = useState<TSaleProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<TPagination>(DEFAULT_PAGINATION);
  const { page = 1, limit = 20, search, invoiceStatus } = params;

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get<TSalesApiResponse>("/v1/admin/sale/all", {
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(invoiceStatus ? { invoiceStatus } : {}),
        },
      });
      setSales(data?.data || []);
      setPagination(data?.pagination || DEFAULT_PAGINATION);
    } catch (error) {
      console.error("Error fetching sales:", error);
      setSales([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, [invoiceStatus, limit, page, search]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return { sales, loading, pagination, refetch: fetchSales };
}

export function useSale(id: string | undefined) {
  const [sale, setSale] = useState<TSaleProps | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSale = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get(`/v1/admin/sale/${id}`);
      setSale(data?.data || null);
    } catch (error) {
      console.error("Error fetching sale:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSale();
  }, [fetchSale]);

  return { sale, loading, refetch: fetchSale };
}

export function useCreateSale() {
  const [error, setError] = useState<string[]>([]);

  const createSale = async (data: any) => {
    try {
      const { data: result } = await useApi.post("/v1/admin/sale/create", data);
      return result;
    } catch (error: any) {
      setError([
        error?.response?.data?.message || "An unexpected error occurred.",
      ]);
      message.error(error?.response?.data?.message || "something went wrong!");
      console.error("Error creating sale:", error?.response?.data?.message);
    }
  };

  return { createSale, error };
}
