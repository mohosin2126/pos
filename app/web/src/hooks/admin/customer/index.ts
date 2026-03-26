import { useCallback, useEffect, useState } from "react";
import useApi from "../../use-api";
import {TCustomer, TCustomerResponse} from "@/interface/common";

export function useCustomers() {
  const [customers, setCustomers] = useState<TCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get<TCustomerResponse>(
        "/v1/admin/customer/all"
      );
      setCustomers(data?.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, loading, refetch: fetchCustomers };
}
