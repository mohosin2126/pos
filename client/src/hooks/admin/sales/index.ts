import { useCallback, useEffect, useState } from "react";
import {TSaleProps} from "@/interface/common";
import useApi from "@/hooks/use-api";


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
