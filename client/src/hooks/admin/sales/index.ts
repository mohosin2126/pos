import { useCallback, useEffect, useState } from "react";
import { TSaleProps } from "@/interface/common";
import useApi from "@/hooks/use-api";
import { message } from "antd";

export function useSales() {
  const [sales, setSales] = useState<TSaleProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get("/v1/admin/sale/all");
      setSales(data?.data || []);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return { sales, loading, refetch: fetchSales };
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
