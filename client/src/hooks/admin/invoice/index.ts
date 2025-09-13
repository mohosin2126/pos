import { useCallback, useEffect, useState } from "react";
import useApi from "@/hooks/use-api";
import {TInvoice, TInvoiceResponse} from "@/interface/common";


export function useInvoices() {
  const [invoices, setInvoices] = useState<TInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get<TInvoiceResponse>(
        "/v1/admin/invoice/all"
      );
      setInvoices(data?.data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, loading, refetch: fetchInvoices };
}
